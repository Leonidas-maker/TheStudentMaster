from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi_cdn_host import monkey_patch_for_docs_ui
# from fastapi_utils.tasks import repeat_every
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio
import json

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import engine

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db, get_db
from middleware.general import create_address
from middleware.ical import update_all_ical_dhbw_mannheim
from middleware.canteen import (
    create_canteen,
    canteen_menu_to_db,
    create_canteens,
    update_canteen_menus,
)

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
        with open("./utils/canteen/canteen_addresses.json", "r") as file:
            canteens = json.load(file)
        for canteen_obj in canteens:
            # create address
            address_new = s_general.AddressCreate(
                address1=canteen_obj["address1"],
                address2=canteen_obj["address2"] if "address2" in canteen_obj else None,
                district=canteen_obj["district"],
                postal_code=canteen_obj["postal_code"],
                city=canteen_obj["city"],
                country=canteen_obj["country"],
            )
            address_new = create_address(db, address_new)
            # create canteen
            canteen_new = m_canteen.Canteen(
                canteen_name=canteen_obj["name"],
                canteen_short_name=(
                    canteen_obj["short_name"] if "short_name" in canteen_obj else None
                ),
                address_id=address_new.address_id,
            )
            create_canteen(db, canteen_new)
        db.commit()

    # update all canteen menus
    async with get_async_db() as db:
        canteens = db.query(m_canteen.Canteen).all()
        for canteen_obj in canteens:
            # TODO loading bar
            for i in range(3):
                canteen_menu_to_db(
                    db=db, canteen_id=canteen_obj.canteen_id, week_offset=i
                )
        db.commit()
    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #

    # ~~~~~~~~ End of code to run on shutdown ~~~~~~~~ #
    pass


app = FastAPI(lifespan=lifespan, swagger_ui_parameters={"operationsSorter": "tag"})
monkey_patch_for_docs_ui(app)


# ======================================================== #
# ==================== Repeated Tasks ==================== #
# ======================================================== #


# @repeat_every(seconds=60 * 15)  # 15 minutes
# def update_Data(db: Session = Depends(get_db)):
#     update_all_ical_dhbw_mannheim(db)
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

app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
