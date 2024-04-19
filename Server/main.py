from fastapi import FastAPI, Depends, BackgroundTasks
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio
from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db

# from middleware.general import create_address
from middleware.calendar import prepareCalendarTables, update_active_native_calendars, update_all_native_calendars
from middleware.canteen import create_canteens, update_canteen_menus

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_general, m_canteen

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen

m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_calendar.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)

# ======================================================== #
# ===================== Repeated Task ==================== #
# ======================================================== #


async def create_task(task_function, progress, task_id):
    # New db session for each task
    async with get_async_db() as db:
        await asyncio.to_thread(task_function, db, progress, task_id)


async def repeated_task():
    await asyncio.sleep(2)  # Wait for the app to start
    while True:
        with Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[bold green]{task.completed}/{task.total}[reset]"),
            TimeRemainingColumn(),
        ) as progress:
            progress_id_ical_Update_Mannheim = progress.add_task(
                "[bold green]iCal-DHBWMannheim[/bold green] Update iCal...", total=None
            )
            
            # progress_id_ical_Update_Custom = progress.add_task(
            #     "[bold green]iCal-Custom[/bold green] Update iCal...", total=None
            # )

            # progress_id_canteen_menu_ = progress.add_task(
            #     "[bold green]Canteen[/bold green] Update Canteen Menus...", total=None
            # )

            # All tasks that should be executed
            tasks = [
                create_task(update_active_native_calendars, progress, progress_id_ical_Update_Mannheim),
                # create_task(update_ical_custom, progress, progress_id_ical_Update_Custom),
                # create_task(update_canteen_menus, progress, progress_id_canteen_menu_),
            ]

            await asyncio.gather(*tasks, return_exceptions=True)

            progress.stop()
        await asyncio.sleep(60 * 15)  # 15 minutes wait


# ======================================================== #
# ================= Startup/Shutdown Code ================ #
# ======================================================== #


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ~~~~~~~~~ Code to run on startup ~~~~~~~~ #

    async with get_async_db() as db:
        await asyncio.to_thread(create_canteens, db)

    async with get_async_db() as db:
        await asyncio.to_thread(prepareCalendarTables, db)

    # Start the repeated tasks
    task = asyncio.create_task(repeated_task())

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #
    # Cancel the repeated task
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    # ~~~~~~~~ End of code to run on shutdown ~~~~~~~~ #


app = FastAPI(lifespan=lifespan, swagger_ui_parameters={"operationsSorter": "tag"})


# ======================================================== #
# ======================= Test-API ======================= #
# ======================================================== #
@app.get("/")
async def root(db: Session = Depends(get_db)):
    with Progress(
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[bold green]{task.completed}/{task.total}[reset]"),
        TimeRemainingColumn(),
    ) as progress:

        progress_id_ical_Update_Mannheim = progress.add_task(
            "[bold green]iCal-DHBWMannheim[/bold green] Update iCal...", total=None
        )
        update_all_native_calendars(db, progress, progress_id_ical_Update_Mannheim)
        
    return {"message": "Hello World"}


# ======================================================== #
# ======================== Router ======================== #
# ======================================================== #

app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
