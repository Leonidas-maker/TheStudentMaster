from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
import datetime
from rich.progress import Progress
from typing import Optional, Callable, List
import asyncio
import inspect

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db


class TaskScheduler:
    def __init__(self, max_block_time: int = 4, verbose: bool = False):
        self.scheduler = AsyncIOScheduler()
        self.task_blocked_by = {}
        self.running_tasks = []
        self.MAX_BLOCK_TIME = max_block_time
        self.verbose = verbose
        self.startup_tasks = []

        self.progress = Progress()

    def add_task(
        self,
        task_id: str,
        func: Callable,
        start_time: datetime.datetime | int = None,
        end_time: datetime.datetime | int = None,
        interval_seconds: int = 60,
        blocked_by: List[str] = None,
        on_startup: bool = False,
        with_progress: bool = True,
        args: List = [],
        kwargs: dict = {},
    ):

        self.task_blocked_by[task_id] = blocked_by or []

        async def task_wrapper(*args, **kwargs):
            block_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=self.MAX_BLOCK_TIME)
            block_time = block_time.timestamp()

            for block_task in self.task_blocked_by[task_id]:
                job = self.scheduler.get_job(block_task)
                if job is None:
                    continue

                if block_task in self.running_tasks or job.next_run_time.timestamp() < block_time:
                    if self.verbose:
                        self.progress.log(f"[cyan][Scheduler] [red]Task {task_id} blocked by {block_task}")
                    return

            if self.verbose:
                self.progress.log(f"[cyan][Scheduler] [purple]Task {task_id} starting...")

            self.running_tasks.append(task_id)
            self.progress.start()
            if with_progress:
                task = self.progress.add_task(f"[cyan][Scheduler] [yellow]Task {task_id} starting...", total=None)
                kwargs["task_id"] = task
                kwargs["progress"] = self.progress
            try:
                async with get_async_db() as db:
                    if inspect.iscoroutinefunction(func):
                        await func(db, *args, **kwargs)
                    else:
                        await asyncio.to_thread(func, db, *args, **kwargs)
            finally:
                if with_progress:
                    self.progress.remove_task(task)
                if len(self.running_tasks) == 0:
                    self.progress.stop()
                self.running_tasks.remove(task_id)
                if self.verbose:
                    self.progress.log(f"[cyan][Scheduler] [green]Task {task_id} finished!")

        if isinstance(start_time, int) and isinstance(end_time, int):
            interval_hours = interval_seconds // 3600
            interval_seconds = interval_seconds % 3600
            interval_minutes = interval_seconds // 60
            interval_seconds = interval_seconds % 60

            trigger = CronTrigger(
                hour=(
                    f"{start_time}-{end_time - 1}/{interval_hours}"
                    if interval_hours > 0
                    else f"{start_time}-{end_time - 1}"
                ),
                minute=f"*/{interval_minutes}" if interval_minutes > 0 else None,
                second=f"*/{interval_seconds}" if interval_seconds > 0 else None,
            )
        elif isinstance(start_time, datetime.datetime) and isinstance(end_time, datetime.datetime):
            trigger = IntervalTrigger(seconds=interval_seconds, start_date=start_time, end_date=end_time)
        else:
            trigger = IntervalTrigger(seconds=interval_seconds)

        self.scheduler.add_job(task_wrapper, trigger=trigger, id=task_id, args=args, kwargs=kwargs)

        if on_startup:
            self.startup_tasks.append(task_id)

    def run_startup_tasks(self):
        for task_id in self.startup_tasks:
            self.scheduler.get_job(task_id).modify(next_run_time=datetime.datetime.now())

    def start(self, run_startup_tasks: bool = True):
        self.progress.start()
        self.scheduler.start()
        if run_startup_tasks:
            self.run_startup_tasks()

    def stop(self):
        self.progress.stop()
        self.scheduler.shutdown()
