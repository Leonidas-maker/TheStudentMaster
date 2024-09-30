from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.cron import CronTrigger
import datetime
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.console import Console
from typing import Optional, Callable, List, Union
import asyncio
import inspect

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db


class TaskScheduler:
    """
    A task scheduler that manages and executes asynchronous tasks based on specified triggers.
    Utilizes APScheduler for scheduling, Rich for console logging and progress display.

    Attributes:
        MAX_BLOCK_TIME (int): Maximum block time in seconds to prevent task conflicts.
        verbose (bool): Enables verbose logging if set to True.
    """

    def __init__(self, max_block_time: int = 4, verbose: bool = False):
        """
        Initializes the TaskScheduler with optional maximum block time and verbosity.

        Args:
            max_block_time (int, optional): Maximum block time in seconds. Defaults to 4.
            verbose (bool, optional): Enables verbose logging if set to True. Defaults to False.
        """
        self.scheduler = AsyncIOScheduler()
        self.task_blocked_by: dict[str, List[str]] = {}
        self.running_tasks: List[str] = []
        self.MAX_BLOCK_TIME = max_block_time
        self.verbose = verbose
        self.startup_tasks: List[str] = []
        self.console = Console()
        self.progress = Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TimeElapsedColumn(),
            console=self.console,
            transient=True  # Progress bar disappears when completed
        )

    def __log(self, message: str, level: str = "info"):
        """
        Logs messages to the console with different severity levels using Rich.

        Args:
            message (str): The message to log.
            level (str, optional): The severity level of the log. Defaults to "info".
                                   Accepted values: "info", "warning", "error", "success", "debug".
        """
        if level == "info":
            self.console.log(f"[blue][INFO][/blue] {message}")
        elif level == "warning":
            self.console.log(f"[yellow][WARNING][/yellow] {message}")
        elif level == "error":
            self.console.log(f"[red][ERROR][/red] {message}")
        elif level == "success":
            self.console.log(f"[green][SUCCESS][/green] {message}")
        elif level == "debug" and self.verbose:
            self.console.log(f"[purple][DEBUG][/purple] {message}")

    def add_task(
        self,
        task_id: str,
        func: Callable,
        interval_seconds: int = None,
        cron: str = None,
        run_date: Union[int, datetime.datetime] = None,
        blocked_by: List[str] = None,
        on_startup: bool = False,
        with_progress: bool = True,
        with_console: bool = False,
        args: list = None,
        kwargs: dict = None,
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
        :param args: Positional arguments to pass to the task
        :param kwargs: Keyword arguments to pass to the task

        :raises ValueError: If more than one of 'interval_seconds', 'cron', or 'run_date' is specified.
        :raises ValueError: If a task with the same task_id already exists.
        :raises ValueError: If no trigger is specified for the task.
        """
        if interval_seconds and cron and run_date:
            raise ValueError("Only one of 'interval_seconds', 'cron', or 'run_date' can be specified.")


        args = args or []
        kwargs = kwargs or {}
        self.task_blocked_by[task_id] = blocked_by or []

        # Check for duplicate task_id
        if self.scheduler.get_job(task_id):
            raise ValueError(f"A task with task_id '{task_id}' already exists.")

        # Log the task addition
        self.__log(f"Adding task '{task_id}'", level="info")

        async def task_wrapper(*wrapper_args, **wrapper_kwargs):
            """
            Wrapper function to handle task execution, including blocking logic, progress display, and logging.

            Args:
                *wrapper_args: Positional arguments.
                **wrapper_kwargs: Keyword arguments.
            """
            block_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=self.MAX_BLOCK_TIME)
            block_timestamp = block_time.timestamp()

            # Check if any blocking tasks are running or scheduled to run soon
            for block_task in self.task_blocked_by[task_id]:
                job = self.scheduler.get_job(block_task)
                if job is None:
                    continue

                # Check if blocking task is running
                if block_task in self.running_tasks:
                    if self.verbose:
                        self.__log(f"Task '{task_id}' is blocked by running task '{block_task}'", level="warning")
                    return

                # Check if blocking task is scheduled to run within MAX_BLOCK_TIME
                next_run = job.next_run_time
                if next_run and next_run.timestamp() < block_timestamp:
                    if self.verbose:
                        self.__log(
                            f"Task '{task_id}' is blocked by task '{block_task}' scheduled to run at {next_run}",
                            level="warning"
                        )
                    return

            # Log task start
            if self.verbose:
                self.__log(f"Task '{task_id}' is starting...", level="info")

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
                async with get_async_db() as db:
                    if inspect.iscoroutinefunction(func):
                        await func(db, *wrapper_args, **kwargs)
                    else:
                        # Run blocking functions in a separate thread to avoid blocking the event loop
                        await asyncio.to_thread(func, db, *wrapper_args, **kwargs)
                self.__log(f"Task '{task_id}' finished successfully.", level="success")
            except Exception as e:
                self.__log(f"Task '{task_id}' failed with error: {str(e)}", level="error")
            finally:
                if with_progress and task_progress is not None:
                    self.progress.remove_task(task_progress)
                if len(self.running_tasks) == 0 and self.progress:
                    self.progress.stop()
                if task_id in self.running_tasks:
                    self.running_tasks.remove(task_id)

        # Create the trigger based on the provided parameters
        trigger = None
        if cron:
            trigger = CronTrigger.from_crontab(cron)
            self.__log(f"Task '{task_id}' scheduled with cron expression '{cron}'.", level="info")
        elif interval_seconds:
            trigger = IntervalTrigger(seconds=interval_seconds)
            self.__log(f"Task '{task_id}' scheduled with interval of {interval_seconds} seconds.", level="info")
        elif run_date:
            trigger = DateTrigger(run_date)
            self.__log(f"Task '{task_id}' scheduled to run at {run_date}.", level="info")
        
        if not trigger:
            raise ValueError("No trigger specified for the task.")

        # Add the job to the scheduler
        self.scheduler.add_job(
            task_wrapper,
            trigger=trigger,
            id=task_id,
            args=args,
            kwargs=kwargs,
            replace_existing=False  # Prevent replacing existing jobs with the same ID
        )

        if on_startup:
            self.startup_tasks.append(task_id)
            self.__log(f"Task '{task_id}' scheduled to run on startup.", level="info")

    def __run_startup_tasks(self):
        """
        Executes all tasks marked to run on scheduler startup by setting their next run time to now.
        """
        for task_id in self.startup_tasks:
            job = self.scheduler.get_job(task_id)
            if job:
                job.modify(next_run_time=datetime.datetime.now())
                self.__log(f"Startup task '{task_id}' has been triggered to run immediately.", level="info")

    def start(self, run_startup_tasks: bool = True):
        """
        Starts the task scheduler and optionally runs tasks designated to run on startup.

        Args:
            run_startup_tasks (bool, optional): If True, runs tasks scheduled for startup. Defaults to True.
        """
        self.__log("Starting the task scheduler...", level="info")
        self.progress.start()
        self.scheduler.start()
        if run_startup_tasks:
            self.__run_startup_tasks()
        self.__log("Task scheduler started.", level="success")

    def stop(self):
        """
        Stops the task scheduler and halts all scheduled tasks.
        """
        self.__log("Stopping the task scheduler...", level="info")
        self.progress.stop()
        self.scheduler.shutdown()
        self.__log("Task scheduler stopped.", level="success")