import json
from fastapi import FastAPI, Depends
from fastapi_cdn_host import monkey_patch_for_docs_ui

# from fastapi_restful.tasks import repeat_every
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

from models.pydantic_schemas import s_general
from models.sql_models import m_user, m_ical, m_general, m_canteen
from config.database import engine
from routes import user, auth, canteen
from data.email import send_with_template, EmailSchema
from middleware.database import get_async_db, get_db
from middleware.general import create_address
from middleware.ical import update_all_ical_dhbw_mannheim
from middleware.canteen import create_canteen, canteen_menu_to_db


m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_ical.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ----- Code to run on startup -----
    # # create all canteens
    async with get_async_db() as db:
        with open("./utils/canteen/canteen_addresses.json", "r") as file:
            canteens = json.load(file)
        for canteen_obj in canteens:
            # print(canteen_obj)
            address_new = s_general.AddressCreate(
                address1=canteen_obj["address1"],
                address2=canteen_obj["address2"] if "address2" in canteen_obj else None,
                district=canteen_obj["district"],
                postal_code=canteen_obj["postal_code"],
                city=canteen_obj["city"],
                country=canteen_obj["country"]
            )
            address_new = create_address(db, address_new)
            # print(address_new.address_id)
            # create canteen
            canteen_new = m_canteen.Canteen(
                canteen_name=canteen_obj["name"],
                canteen_short_name=(
                    canteen_obj["short_name"] if "short_name" in canteen_obj else None
                ),
                address_id=address_new.address_id,
            )
            # print(canteen_new.address)
            create_canteen(db, canteen_new)
        db.commit()

    # # update all canteen menus
    # # async def update_canteen_menus():
    # async with get_async_db() as db:
    #     canteens = db.query(m_canteen.Canteen).all()
    #     for canteen_obj in canteens:
    #         # TODO loading bar
    #         canteen_menu_to_db(db=db, canteen_id=canteen_obj.canteen_id)
    #     db.commit()
    # ----- End of code to run on startup -----
    yield
    # ----- Code to run on shutdown -----

    # ----- End of code to run on shutdown -----


app = FastAPI(lifespan=lifespan)
monkey_patch_for_docs_ui(app)


@app.get("/")
async def root(db: Session = Depends(get_db)):
    update_all_ical_dhbw_mannheim(db)
    return {"message": "Hello World"}


# TODO: add support to update mensa every 15 minutes
# @repeat_every(seconds=60 * 60 // 60) # every 15 minutes
# async def update_canteen_menus():
#     async with get_async_db() as db:
#         canteens = db.query(m_canteen.Canteen).all()
#         for canteen_obj in canteens:
#             canteen_menu_to_db(canteen_obj.canteen_short_name, db)
#         db.commit()

app.include_router(user.users_router, prefix="/user")
app.include_router(auth.auth_router, prefix="/auth")
app.include_router(canteen.canteen_router, prefix="/canteen")
