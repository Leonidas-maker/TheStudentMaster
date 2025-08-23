import os
import threading
import datetime
import time
import asyncio
from typing import Optional, Callable, List, Union

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.console import Console
from rich.table import Table
import redis
import redis.typing as redis_typing

from core.database import get_async_session


class TaskSchedulerRedis:
    """A task scheduler that manages and executes asynchronous tasks based on specified triggers.
    Utilizes APScheduler for scheduling, Rich for console logging and progress display.

    Beim Start werden alle geplanten Aufgaben in einer Tabelle ausgegeben,
    wobei u.a. die Scheduler-Prozess-ID (PID) und der Scheduler-Thread (bzw. dessen ID) angezeigt werden.
    """

    def __init__(
        self,
        redis_host: str = "localhost",
        redis_port: int = 6379,
        redis_password: str = "root",
        redis_db: int = 0,
        min_task_running_time: int = 1,
        max_task_block_time: int = 4,
        verbose: bool = False,
        max_redis_connection_tries: int = 5,
    ):
        """Initializes the TaskScheduler with the specified parameters.

        :param redis_host: The hostname of the Redis server, defaults to "localhost"
        :param redis_port: The port number of the Redis server, defaults to 6379
        :param redis_passwort: The password for the Redis server, defaults to "root"
        :param redis_db: The database number to use in the Redis server, defaults to 0
        :param min_task_running_time: The minimum time in seconds a task should run for to prevent other schedulers from running it, defaults to 1
        :param max_task_block_time: The maximum time in seconds a task can be blocked by another task, defaults to 4
        :param verbose: Enables verbose logging if set to True, defaults to False
        """
        self.jobstores = {
            "default": MemoryJobStore(),
        }

        self.scheduler = AsyncIOScheduler(jobstores=self.jobstores)
        self.task_blocked_by: dict[str, List[str]] = {}
        self.running_tasks: List[str] = []
        self.MIN_TASK_RUNNING_TIME = min_task_running_time
        self.MAX_TASK_BLOCK_TIME = max_task_block_time
        self.verbose = verbose
        self.startup_tasks: List[str] = []
        self.console = Console()
        self.progress = Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TimeElapsedColumn(),
            console=self.console,
            transient=True,  # Progress bar disappears when completed
        )

        self.redis_client = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password=redis_password)

        for attempt in range(1, max_redis_connection_tries + 1):
            try:
                self.redis_client.ping()
                break
            except redis.ConnectionError:
                self.console.log(
                    f"Redis connection failed, retrying... (attempt {attempt}/{max_redis_connection_tries})"
                )
                if attempt == max_redis_connection_tries:
                    raise RuntimeError("Failed to connect to Redis server.")

    def _log(self, message: str, level: str = "info"):
        """
        Logs messages to the console with different severity levels using Rich.

        :param message: The message to log.
        :param level: The severity level of the log (info, warning, error, success, debug).
        """
        if level == "info":
            self.console.log(f"[blue][INFO][/blue]\t\t{message}")
        elif level == "warning":
            self.console.log(f"[yellow][WARNING][/yellow]\t{message}")
        elif level == "error":
            self.console.log(f"[red][ERROR][/red]\t\t{message}")
        elif level == "success":
            self.console.log(f"[green][SUCCESS][/green]\t{message}")
        elif level == "debug" and self.verbose:
            self.console.log(f"[purple][DEBUG][/purple]\t{message}")

    def acquire_lock(self, task_id: str) -> redis_typing.ResponseT:
        """Try to acquire a lock for the task."""
        lock_key = f"task_lock:{task_id}"
        return self.redis_client.set(lock_key, "locked", nx=True, ex=self.MAX_TASK_BLOCK_TIME)

    def release_lock(self, task_id: str):
        """Release the lock for the task."""
        lock_key = f"task_lock:{task_id}"
        self.redis_client.delete(lock_key)

    def lock_exists(self, task_id: str) -> redis_typing.ResponseT:
        """Check if the lock exists for the task."""
        lock_key = f"task_lock:{task_id}"
        return self.redis_client.exists(lock_key)

    def add_task(
        self,
        task_id: str,
        func: Callable,
        interval_seconds: Optional[int] = None,
        cron: Optional[str] = None,
        run_date: Optional[Union[int, datetime.datetime]] = None,
        blocked_by: Optional[List[str]] = None,
        on_startup: bool = False,
        with_progress: bool = False,
        with_console: bool = False,
        args: Optional[list] = None,
        kwargs: Optional[dict] = None,
    ):
        """
        Adds a task to the scheduler with the specified parameters.

        :param task_id: The unique identifier for the task.
        :param func: The function to be executed by the task.
        :param interval_seconds: The interval in seconds at which the task should run.
        :param cron: The cron expression for the task schedule.
        :param run_date: The date and time when the task should run.
        :param blocked_by: A list of task names that this task is blocked by.
        :param on_startup: If True, the task will run on scheduler startup.
        :param with_progress: If True, a progress bar will be displayed for the task.
        :param with_console: If True, the task will have access to the console for logging.
        :param args: Positional arguments to pass to the task.
        :param kwargs: Keyword arguments to pass to the task.
        """
        trigger_params = [interval_seconds, cron, run_date]
        if sum(param is not None for param in trigger_params) != 1:
            raise ValueError("Exactly one of 'interval_seconds', 'cron', or 'run_date' must be specified.")

        if run_date and isinstance(run_date, datetime.datetime):
            run_date = run_date.astimezone(datetime.timezone.utc)

        args = args or []
        kwargs = kwargs or {}
        self.task_blocked_by[task_id] = blocked_by or []

        # Check for duplicate task_id
        if self.scheduler.get_job(task_id):
            raise ValueError(f"A task with task_id '{task_id}' already exists.")

        async def task_wrapper(*wrapper_args, **wrapper_kwargs):
            """
            Wrapper function to handle task execution, including:
              - Acquiring a Redis lock to avoid duplicate execution across instances
              - Blocking checks
              - Progress display and logging
            """
            # Acquire lock for the task
            if not self.acquire_lock(task_id):
                self._log(f"Task '{task_id}' is blocked by another scheduler instance.", level="debug")
                return

            block_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
                seconds=self.MAX_TASK_BLOCK_TIME
            )
            block_timestamp = block_time.timestamp()

            # Check if any blocking tasks are running or scheduled to run soon
            for block_task in self.task_blocked_by[task_id]:
                job = self.scheduler.get_job(block_task)
                if job is None:
                    continue

                # Check if blocking task is running or has a lock
                if block_task in self.running_tasks or self.lock_exists(block_task):
                    if self.verbose:
                        self._log(f"Task '{task_id}' is blocked by running task '{block_task}'", level="warning")
                    self.release_lock(task_id)
                    return

                # Check if blocking task is scheduled to run within MAX_TASK_BLOCK_TIME
                next_run = job.next_run_time
                if next_run and next_run.timestamp() < block_timestamp:
                    if self.verbose:
                        self._log(
                            f"Task '{task_id}' is blocked by task '{block_task}' scheduled to run at {next_run}",
                            level="warning",
                        )
                    self.release_lock(task_id)
                    return

            self._log(f"Task '{task_id}' is starting...", level="debug")
            self.running_tasks.append(task_id)
            self.progress.start()

            task_progress = None
            if with_progress:
                task_progress = self.progress.add_task(f"Task '{task_id}' in progress...", total=None)
                kwargs["task_id"] = task_progress
                kwargs["progress"] = self.progress
            if with_console:
                kwargs["console"] = self.console

            try:
                start_time = time.time()
                async with get_async_session() as db:
                    result = await func(*wrapper_args, **kwargs, db=db)

                elapsed_time = time.time() - start_time
                if elapsed_time < self.MIN_TASK_RUNNING_TIME:
                    await asyncio.sleep(self.MIN_TASK_RUNNING_TIME - elapsed_time)

                if result:
                    self._log(f"Task '{task_id}' finished successfully.", level="success")
                else:
                    self._log(f"Task '{task_id}' failed.", level="error")
            except Exception as e:
                self._log(f"Task '{task_id}' failed with error: {str(e)}", level="error")
            finally:
                if with_progress and task_progress is not None:
                    self.progress.remove_task(task_progress)
                if task_id in self.running_tasks:
                    self.running_tasks.remove(task_id)
                self.release_lock(task_id)
                if not self.running_tasks and self.progress:
                    self.progress.stop()

        # Create trigger
        if cron:
            trigger = CronTrigger.from_crontab(cron)
        elif interval_seconds:
            trigger = IntervalTrigger(seconds=interval_seconds)
        elif run_date:
            trigger = DateTrigger(run_date)
        else:
            raise ValueError("No trigger specified for the task.")

        # Add the job to the scheduler
        self.scheduler.add_job(
            task_wrapper,
            trigger=trigger,
            id=task_id,
            args=args,
            kwargs=kwargs,
            replace_existing=False,
        )

        if on_startup:
            self.startup_tasks.append(task_id)

    def print_tasks_info(self, pid: str, thread_id: str):
        """Prints a table with meta-information of all scheduled tasks including scheduler PID and thread ID."""

        table = Table(
            title=f"[bold underline]Scheduler Tasks Info[/bold underline] (PID: [cyan]{pid}[/cyan], Thread ID: [cyan]{thread_id}[/cyan])"
        )
        table.add_column("Task ID", style="cyan", no_wrap=True)
        table.add_column("Trigger Type", style="magenta")
        table.add_column("Next Run Time", style="green")
        table.add_column("Blocked By", style="yellow")
        table.add_column("Run on Startup", style="blue")

        for job in self.scheduler.get_jobs():
            trigger_type = type(job.trigger).__name__
            next_run = job.next_run_time.strftime("%Y-%m-%d %H:%M:%S") if job.next_run_time else "N/A"
            table.add_row(
                job.id,
                trigger_type,
                next_run,
                ", ".join(self.task_blocked_by[job.id]),
                str(job.id in self.startup_tasks),
            )

        self.console.log(table)

    def __run_startup_tasks(self):
        """
        Executes all tasks marked to run on scheduler startup by setting their next run time to now.
        """
        for task_id in self.startup_tasks:
            job = self.scheduler.get_job(task_id)
            if job and not any(blocked_task in self.startup_tasks for blocked_task in self.task_blocked_by[task_id]):
                job.modify(next_run_time=datetime.datetime.now(datetime.timezone.utc))

    def start(self, run_startup_tasks: bool = True):
        """
        Starts the task scheduler and prints at startup a table with tasks meta-information.

        :param run_startup_tasks: If True, runs tasks scheduled for startup.
        """
        pid = str(os.getpid())
        thread_id = str(threading.get_ident())
        self._log(f"Starting the task scheduler (PID: {pid}, Thread ID: {thread_id})...", level="info")

        self.scheduler.start()
        self.print_tasks_info(pid, thread_id)

        if run_startup_tasks:
            self.__run_startup_tasks()
        self._log(f"Task scheduler (PID: {pid}, Thread ID: {thread_id}) started.", level="success")

    def stop(self):
        """
        Stops the task scheduler and halts all scheduled tasks.
        """
        self._log("Stopping the task scheduler...", level="info")
        self.progress.stop()
        self.scheduler.shutdown()
        self._log("Task scheduler stopped.", level="success")
