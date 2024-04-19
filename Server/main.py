from fastapi import FastAPI, Depends, BackgroundTasks
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio
from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn
import datetime

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db

# from middleware.general import create_address
from middleware.calendar import (
    prepareCalendarTables,
    update_active_native_calendars,
    update_all_native_calendars,
    update_custom_calendars,
)
from middleware.canteen import create_canteens, update_canteen_menus

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_calendar

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_general, m_canteen

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen, calendar

m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_calendar.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)

# ======================================================== #
# ===================== Repeated Task ==================== #
# ======================================================== #


async def create_task(task_function, progress, task_id, *args, **kwargs):
    # New db session for each task
    async with get_async_db() as db:
        await asyncio.to_thread(task_function, db, progress, task_id, *args, **kwargs)


async def repeated_task():
    try:
        await asyncio.sleep(2)  # Wait for the app to start

        native_calender_loops = 0
        while True:
            current_time = datetime.datetime.now()

            async with get_async_db() as db:
                backends = db.query(m_calendar.CalendarBackend).all()

            with Progress(
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TextColumn("[bold green]{task.completed}/{task.total}[reset]"),
                TimeRemainingColumn(),
            ) as progress:
                tasks = []
               

                # Native Calendar updates only between 6:00 and 18:00
                if current_time.hour > 6 and current_time.hour > 18:
                    progress_id_update_calendar_dhbw_mannheim = progress.add_task(
                        "[bold green]Native-Calendar-DHBWMannheim[/bold green] Updating...", total=None
                    )
                    native_calender_loops += 1

                    # Update every 1 hours all calendars, otherwise only the active ones (user has subscribed to it) 
                    if native_calender_loops % 4 == 0:
                        native_calender_loops = 0
                        tasks.append(create_task(update_all_native_calendars, progress, progress_id_update_calendar_dhbw_mannheim))
                    else:
                        tasks.append(
                            create_task(update_active_native_calendars, progress, progress_id_update_calendar_dhbw_mannheim)
                        )
                else:
                    native_calender_loops = 0

                progress_ids_update_custom = []
                for backend in backends:
                    progress_ids_update_custom.append(
                        (
                            progress.add_task(
                                f"[bold green]CalendarCustom-{backend.name}[/bold green] Updating...", total=None
                            ),
                            backend,
                        )
                    )
                for progress_id_Update_Custom in progress_ids_update_custom:
                    tasks.append(
                        create_task(
                            update_custom_calendars,
                            progress,
                            progress_id_Update_Custom[0],
                            progress_id_Update_Custom[1],
                        )
                    )


                # TODO @xxchillkroetexx: Update every 15 minutes necessary?
                progress_id_canteen_menu = progress.add_task(
                    "[bold green]Canteen[/bold green] Update Canteen Menus...", total=None
                )
                tasks.append(create_task(update_canteen_menus, progress, progress_id_canteen_menu))
                #await asyncio.gather(*tasks, return_exceptions=True)

                progress.stop()
            await asyncio.sleep(60 * 15)  # 15 minutes wait
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(e)


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
    repeated_task1 = asyncio.create_task(repeated_task())

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #
    try:
        # Cancel the repeated task
        repeated_task1.cancel()
        await repeated_task1
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
app.include_router(calendar.calendar_router, prefix="/calendar", tags=["calendar"])