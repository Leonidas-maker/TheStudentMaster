from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta


# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas.s_canteen import (
    ResGetCanteen,
    ResGetCanteenAddress,
    ResGetCanteenMenu,
    ResGetCanteenMenuDay,
)
from models.sql_models import m_canteen

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db


###########################################################################
################################### MAIN ##################################
###########################################################################

canteen_router = APIRouter()

# ======================================================== #
# ======================== Canteen ======================= #
# ======================================================== #


@canteen_router.get("/all", response_model=list[ResGetCanteen])
def canteen_read_all(db: Session = Depends(get_db)) -> list[dict]:
    return [canteen.as_dict() for canteen in db.query(m_canteen.Canteen).all()]


@canteen_router.get("/{canteen_short_name}", response_model=ResGetCanteen)
def canteen_read(
    canteen_short_name: Annotated[str, "The short name of the canteen to retrieve."],
    db: Session = Depends(get_db),
):
    return (
        db.query(m_canteen.Canteen)
        .filter_by(canteen_short_name=canteen_short_name)
        .first()
        .as_dict()
    )


@canteen_router.get(
    "/{canteen_short_name}/address", response_model=ResGetCanteenAddress
)
def canteen_read_all_details(
    canteen_short_name: Annotated[
        str, "The short name of the canteen to retrieve the address for."
    ],
    db: Session = Depends(get_db),
):
    return (
        db.query(m_canteen.Canteen)
        .filter_by(canteen_short_name=canteen_short_name)
        .first()
        .as_dict_complete()
    )


# ======================================================== #
# ===================== Canteen Menu ===================== #
# ======================================================== #


@canteen_router.get("/{canteen_short_name}/menu/all", response_model=ResGetCanteenMenu)
def canteen_read_menu_all(canteen_short_name: Annotated[str, "The short name of the canteen to retrieve the menu for."],
    db: Session = Depends(get_db),
) -> dict:
    canteen = (
        db.query(m_canteen.Canteen)
        .filter_by(canteen_short_name=canteen_short_name)
        .first()
    )
    menu = list()
    for line in db.query(m_canteen.Menu).filter_by(canteen_id=canteen.canteen_id).all():
        menu_row = dict()
        menu_row["dish_type"] = line.dish_type
        menu_row["dish"] = line.dish.description
        menu_row["price"] = line.dish.price
        menu_row["serving_date"] = line.serving_date
        menu.append(menu_row)
    returnvalue = {
        "canteen_name": canteen.canteen_name,
        "canteen_short_name": canteen.canteen_short_name,
        "image_url": canteen.image_url,
        "menu": menu,
    }
    return returnvalue


@canteen_router.get("/menu/{day}", response_model=list[ResGetCanteenMenuDay])
def canteen_read_menu_day(
    day: Annotated[str, "The day to retrieve the menu for. (e.g. '2021-10-01')"],
    db: Session = Depends(get_db),
) -> list[dict]:
    return_value = []
    for menu in db.query(m_canteen.Menu).filter_by(serving_date=day).all():
        menu_row = dict()
        menu_row["canteen_name"] = menu.canteen.canteen_name
        menu_row["canteen_short_name"] = menu.canteen.canteen_short_name if menu.canteen.canteen_short_name else None
        menu_row["image_url"] = menu.canteen.image_url if menu.canteen.image_url else None
        menu_row["menu"] = {
            "dish_type": menu.dish_type,
            "dish": menu.dish.description,
            "price": menu.dish.price,
            "serving_date": menu.serving_date,
        }
        return_value.append(menu_row)
    return return_value


@canteen_router.get("/menu/{canteen_short_name}/currentweek", response_model=ResGetCanteenMenu)
def canteen_read_canteen_menu(
    canteen_short_name: Annotated[
        str, "The short name of the canteen to retrieve the menu for."
    ],
    db: Session = Depends(get_db),
) -> ResGetCanteenMenu:

    menus = (
        db.query(m_canteen.Menu)
        .filter_by(
            canteen_id=db.query(m_canteen.Canteen)
            .filter_by(canteen_short_name=canteen_short_name)
            .first()
            .canteen_id
        )
        .all()
    )
    return_value = dict()
    return_value["canteen_name"] = (
        menus[0].canteen.canteen_name if menus[0].canteen.canteen_name else None
    )
    return_value["canteen_short_name"] = (
        menus[0].canteen.canteen_short_name
        if menus[0].canteen.canteen_short_name
        else None
    )
    return_value["image_url"] = (
        menus[0].canteen.image_url if menus[0].canteen.image_url else None
    )
    return_value["menu"] = list()

    return_value["menu"] = [
        {
            "dish_type": menu.dish_type,
            "dish": menu.dish.description,
            "price": menu.dish.price,
            "serving_date": menu.serving_date,
        }
        for menu in sorted(menus, key=lambda x: x.serving_date)
        if menu.serving_date.date() > (datetime.now()-timedelta(days=datetime.now().weekday())).date()
    ]

    return return_value
