from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi_cdn_host import monkey_patch_for_docs_ui
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio

from tqdm import tqdm

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db

# from middleware.general import create_address
from middleware.ical import update_all_ical_dhbw_mannheim
from middleware.canteen import canteen_menu_to_db, create_canteens, update_canteen_menus

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general


# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_ical, m_general, m_canteen

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen

m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_ical.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)


# ======================================================== #
# ================= Startup/Shutdown Code ================ #
# ======================================================== #


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ~~~~~~~~~ Code to run on startup ~~~~~~~~ #

    async with get_async_db() as db:
        await asyncio.to_thread(create_canteens, db)

    # update all canteen menus for this and the following 2 weeks
    async with get_async_db() as db:
        canteens = db.query(m_canteen.Canteen).all()
        progress = tqdm(
            canteens, leave=False, total=len(canteens) * 3, ascii=" ▖▘▝▗▚▞█"
        )
        for canteen_obj in canteens:
            progress.set_description(f"[Canteen] Update {canteen_obj.canteen_name}")
            for i in range(3):
                canteen_menu_to_db(
                    db=db, canteen_id=canteen_obj.canteen_id, week_offset=i
                )
                progress.update(1)
        progress.close()
        db.commit()

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #

    # ~~~~~~~~ Repeated Tasks ~~~~~~~~ #
    async def repeated_task():
        while True:
            async with get_async_db() as db:
                # Update iCal
                await asyncio.to_thread(update_all_ical_dhbw_mannheim, db)

                # Update canteen menu this week
                await asyncio.to_thread(update_canteen_menus, db)
            await asyncio.sleep(60 * 15)  # 15 minutes wait

    task = asyncio.create_task(repeated_task())

    # ~~~~~~~ End of Repeated Task ~~~~~~~~ #

    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #
    # cancel the repeated task
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    # ~~~~~~~~ End of code to run on shutdown ~~~~~~~~ #
    pass


app = FastAPI(lifespan=lifespan, swagger_ui_parameters={"operationsSorter": "tag"})
monkey_patch_for_docs_ui(app)


# ======================================================== #
# ======================= Test-API ======================= #
# ======================================================== #
@app.get("/")
async def root(db: Session = Depends(get_db)):
    update_all_ical_dhbw_mannheim(db)
    return {"message": "Hello World"}


# ======================================================== #
# ======================== Router ======================== #
# ======================================================== #

app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
