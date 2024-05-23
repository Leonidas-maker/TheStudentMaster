# ~~~~~~~~~~~~ External Modules ~~~~~~~~~~~ #
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio
from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn
import datetime
from fastapi_cdn_host import monkey_patch

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db

from middleware.general import clean_address
from middleware.calendar import (
    prepareCalendarTables,
    update_active_native_calendars,
    update_all_native_calendars,
    update_custom_calendars,
    clean_custom_calendars,
)
from middleware.canteen import create_canteens, update_canteen_menus

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_general, m_canteen, m_calendar, m_auth

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen, calendar

from utils.scheduler.task_scheduler import TaskScheduler

m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_auth.Base.metadata.create_all(bind=engine)
m_calendar.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)

# ======================================================== #
# ================= Startup/Shutdown Code ================ #
# ======================================================== #
task_scheduler = TaskScheduler(verbose=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ~~~~~~~~~ Code to run on startup ~~~~~~~~ #
    async with get_async_db() as db:
        await asyncio.to_thread(create_canteens, db)

    async with get_async_db() as db:
        await asyncio.to_thread(prepareCalendarTables, db)

    async with get_async_db() as db:
        backends = db.query(m_calendar.CalendarBackend).all()

    task_scheduler.add_task(
        "canteen",
        update_canteen_menus,
        interval_seconds=60 * 15,  # 15 minutes
        start_time=6,
        end_time=18,
        blocked_by=[],
        on_startup=True,
    )

    task_scheduler.add_task(
        "calendar_native_all",
        update_all_native_calendars,
        interval_seconds=60 * 60 * 2,  # 2 hour
        start_time=6,
        end_time=18,
        blocked_by=[],
        on_startup=True,
    )

    task_scheduler.add_task(
        "calendar_native_active",
        update_active_native_calendars,
        interval_seconds=60 * 15,  # 15 minutes
        start_time=6,
        end_time=18,
        blocked_by=["calendar_native_all"],
    )

    for backend in backends:
        task_scheduler.add_task(
            f"calendar_custom_{backend.backend_name}",
            update_custom_calendars,
            interval_seconds=60 * 15,  # 15 minutes
            start_time=6,
            end_time=18,
            blocked_by=[],
            on_startup=True,
            kwargs={"backend": backend},
        )

    # ~~~~~~~~~~~~~~~~ Cleaners ~~~~~~~~~~~~~~~ #
    task_scheduler.add_task(
        "calendar_custom_clean",
        clean_custom_calendars,
        interval_seconds=60 * 60 * 6,  # 6 hours
        start_time=6,
        end_time=18,
        blocked_by=[],
    )

    task_scheduler.add_task(
        "address_clean",
        clean_address,
        interval_seconds=60 * 60 * 6,  # 6 hours
        start_time=6,
        end_time=18,
        blocked_by=[],
    )

    task_scheduler.start(run_startup_tasks=True)

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #
    task_scheduler.stop()

    # ~~~~~~~~ End of code to run on shutdown ~~~~~~~~ #


app = FastAPI(lifespan=lifespan, swagger_ui_parameters={"operationsSorter": "tag"}, root_path="/api")
monkey_patch(app)


# ======================================================== #
# ======================= Test-API ======================= #
# ======================================================== #
@app.get("/")
async def root():
    return {"message": "Hello World"}


# ======================================================== #
# ======================== Router ======================== #
# ======================================================== #

app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
app.include_router(calendar.calendar_router, prefix="/calendar", tags=["calendar"])
