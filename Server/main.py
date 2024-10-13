# ~~~~~~~~~~~~ External Modules ~~~~~~~~~~~ #
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
import asyncio
from fastapi_cdn_host import monkey_patch

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.globals import globals
from config.database import engine
from config.general import Config, ENVIRONMENT

server_config = Config()

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db
from middleware.stats import init_stats

from middleware.general import clean_address
from middleware.calendar import (
    prepareCalendarTables,
    update_custom_calendars,
    clean_custom_calendars,
    refresh_all_dhbw_calendars,
    update_all_dhbw_calendars,
)
from middleware.canteen import create_canteens, update_canteen_menus, clean_canteen_menus

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_stats

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_general, m_canteen, m_calendar, m_auth, m_stats

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen, calendar, static, stats

from utils.scheduler.task_scheduler import TaskScheduler

m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_auth.Base.metadata.create_all(bind=engine)
m_calendar.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)
m_stats.Base.metadata.create_all(bind=engine)


# ======================================================== #
# ================= Startup/Shutdown Code ================ #
# ======================================================== #
task_scheduler = TaskScheduler(verbose=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ~~~~~~~~~ Code to run on startup ~~~~~~~~ #
    # Init FastAPICache
    FastAPICache.init(InMemoryBackend())

    async with get_async_db() as db:
        await asyncio.to_thread(create_canteens, db)

    async with get_async_db() as db:
        print("Preparing calendar tables...")
        await prepareCalendarTables(db)
        print("Preparing stats...")
        await init_stats(db)

        backends = db.query(m_calendar.CalendarBackend).all()

    # task_scheduler.add_task(
    #     "canteen",
    #     update_canteen_menus,
    #     cron="*/20 6-18 * * 1-5",  # Every 15 minutes from 6am to 6pm on weekdays
    #     blocked_by=[],
    #     on_startup=True,
    #     with_progress=True,
    # )

    task_scheduler.add_task(
        "calendar_dhbw_refresh",
        refresh_all_dhbw_calendars,
        cron="0 12 * * Sat",  # Every 7 days
        on_startup=True,
        with_console=True,
    )

    task_scheduler.add_task(
        "calendar_dhbw_update",
        update_all_dhbw_calendars,
        cron="*/20 * * * *",  # Every 20 minutes
        blocked_by=["calendar_dhbw_refresh"],
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

    # task_scheduler.add_task(
    #     "canteen_clean_menus",
    #     clean_canteen_menus,
    #     interval_seconds=60 * 60 * 12,  # 12 hours
    #     # start_time=6,
    #     # end_time=18,
    #     blocked_by=["canteen"],
    #     with_progress=False,
    # )

    task_scheduler.start(run_startup_tasks=True)

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #
    task_scheduler.stop()

    # ~~~~~~~~ End of code to run on shutdown ~~~~~~~~ #


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
# ======================= Analytics ====================== #
# ======================================================== #
# TODO Implement the analytics middleware


# ======================================================== #
# ======================== Router ======================== #
# ======================================================== #


@app.middleware("http")
async def check_route_availability(request: Request, call_next):
    base_path = request.url.path.replace("/api", "").strip("/").split("/")[0]
    route_status = globals.server_stats_cache.get(base_path, {})

    if route_status.get("status", "online") != "online" or route_status.get("maintenance", False):
        headers = {"Retry-After": "1800"}
        return JSONResponse(status_code=503, headers=headers, content={"message": "Service temporarily unavailable"})

    response = await call_next(request)
    return response


static.configure_static(app)
app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
app.include_router(calendar.calendar_router, prefix="/calendar", tags=["calendar"])
app.include_router(stats.stats_router, prefix="/stats", tags=["stats"])
