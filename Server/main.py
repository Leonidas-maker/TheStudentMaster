from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi_cdn_host import monkey_patch_for_docs_ui
from fastapi_utils.tasks import repeat_every
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db
from middleware.general import create_address
from middleware.ical import update_all_ical_dhbw_mannheim
from middleware.canteen import create_canteen, canteen_menu_to_db, create_canteens, update_canteen_menus

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
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #


app = FastAPI(lifespan=lifespan)
monkey_patch_for_docs_ui(app)


# ======================================================== #
# ==================== Repeated Tasks ==================== #
# ======================================================== #


@repeat_every(seconds=60 * 15)  # 15 minutes
def update_Data(db: Session = Depends(get_db)):
    update_all_ical_dhbw_mannheim(db)
    # update_canteen_menus(db)


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

app.include_router(user.users_router, prefix="/user")
app.include_router(auth.auth_router, prefix="/auth")
app.include_router(canteen.canteen_router, prefix="/canteen")
