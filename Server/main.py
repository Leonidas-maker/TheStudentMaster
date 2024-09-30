# ~~~~~~~~~~~~ External Modules ~~~~~~~~~~~ #
from fastapi import FastAPI
from contextlib import asynccontextmanager

import asyncio
from fastapi_cdn_host import monkey_patch

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db

from middleware.general import clean_address
from middleware.calendar import (
    prepareCalendarTables,
    update_custom_calendars,
    clean_custom_calendars,
    refresh_all_dhbw_calendars,
    update_all_dhbw_calendars,
)
from middleware.canteen import create_canteens, update_canteen_menus

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_general, m_canteen, m_calendar, m_auth

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen, calendar, static

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
        cron="*/15 6-18 * * 1-5",  # Every 15 minutes from 6am to 6pm on weekdays
        blocked_by=[],
        on_startup=False,
    )

    task_scheduler.add_task(
        "calendar_dhbw_refresh",
        refresh_all_dhbw_calendars,
        cron="0 0 */7 * *",  # Every 7 days
        on_startup=True,
        with_console=True,
    )

    task_scheduler.add_task(
        "calendar_dhbw_update",
        update_all_dhbw_calendars,
        cron="*/20 * * * *",  # Every 20 minutes
        blocked_by=["calendar_dhbw_refresh"],
        on_startup=True,
        with_console=True,
    )

    for backend in backends:
        if backend.backend_name != "DHBW.APP":
            task_scheduler.add_task(
                f"calendar_custom_{backend.backend_name}",
                update_custom_calendars,
                cron="*/20 * * * *",  # Every 20 minutes
                blocked_by=[],
                on_startup=True,
                kwargs={"backend": backend},
            )

    # ~~~~~~~~~~~~~~~~ Cleaners ~~~~~~~~~~~~~~~ #
    task_scheduler.add_task(
        "calendar_custom_clean",
        clean_custom_calendars,
        cron="0 0 * * *",  # Every day at midnight
        blocked_by=[],
        with_progress=False,
    )

    task_scheduler.add_task(
        "address_clean",
        clean_address,
        cron="0 0 * * *",  # Every day at midnight
        blocked_by=[],
        with_progress=False,
    )

    task_scheduler.start(run_startup_tasks=False)

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #
    task_scheduler.stop()

    # ~~~~~~~~ End of code to run on shutdown ~~~~~~~~ #


from fastapi import FastAPI

with open("app_description.md", "r", encoding="utf-8") as file:
    description_content = file.read()
app = FastAPI(
    lifespan=lifespan,
    swagger_ui_parameters={"operationsSorter": "tag"},
    root_path="/api",
    title="🎓 TheStudentMaster API",
    description=description_content,
    version="1.3.0",
    contact={
        "name": "TheStudentMaster Support",
        "email": "support@thestudentmaster.de",
    },
)

# Your routes and middleware would be added here

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
static.configure_static(app)
app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
app.include_router(calendar.calendar_router, prefix="/calendar", tags=["calendar"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", workers=4, host="0.0.0.0", port=8000, reload=True)
