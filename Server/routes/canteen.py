from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas.s_canteen import (
    ResGetCanteen,
    ResGetCanteenAddress,
    ResGetCanteenMenu,
    ResGetCanteenMenuDay,
    ResGetCanteenHash,
)

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_canteen

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.canteen import get_menu_for_canteen, get_menu_for_day
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
    # Retrieve all canteens from the database and return as a list of dictionaries
    return [canteen.as_dict() for canteen in db.query(m_canteen.Canteen).all()]


@canteen_router.get("/{canteen_short_name}", response_model=ResGetCanteen)
def canteen_read(
    canteen_short_name: Annotated[str, "The short name of the canteen to retrieve."],
    db: Session = Depends(get_db),
):
    # Retrieve a specific canteen by its short name
    return db.query(m_canteen.Canteen).filter_by(canteen_short_name=canteen_short_name).first().as_dict()


@canteen_router.get("/{canteen_short_name}/address", response_model=ResGetCanteenAddress)
def canteen_read_all_details(
    canteen_short_name: Annotated[str, "The short name of the canteen to retrieve the address for."],
    db: Session = Depends(get_db),
):
    # Retrieve complete details including address for a specific canteen
    return db.query(m_canteen.Canteen).filter_by(canteen_short_name=canteen_short_name).first().as_dict_complete()


# ======================================================== #
# ===================== Canteen Menu ===================== #
# ======================================================== #


@canteen_router.get("/{canteen_short_name}/menu/all", response_model=ResGetCanteenMenu)
def canteen_read_menu_all(
    canteen_short_name: Annotated[str, "The short name of the canteen to retrieve the menu for."],
    db: Session = Depends(get_db),
) -> ResGetCanteenMenu:
    # Retrieve the full menu for a specific canteen
    return get_menu_for_canteen(db=db, canteen_short_name=canteen_short_name, current_week_only=False)


@canteen_router.get("/{canteen_short_name}/menu/currentweek", response_model=ResGetCanteenMenu)
def canteen_read_canteen_menu(
    canteen_short_name: Annotated[str, "The short name of the canteen to retrieve the menu for."],
    db: Session = Depends(get_db),
) -> ResGetCanteenMenu:
    # Retrieve the current week's menu for a specific canteen
    return get_menu_for_canteen(db=db, canteen_short_name=canteen_short_name, current_week_only=True)


@canteen_router.get("/menu/{day}", response_model=list[ResGetCanteenMenuDay])
def canteen_read_menu_day(
    day: Annotated[str, "The day to retrieve the menu for. (e.g. '2021-10-01')"],
    db: Session = Depends(get_db),
) -> list[ResGetCanteenMenuDay]:
    return get_menu_for_day(db=db, day=day)


# ======================================================== #
# ==================== Canteen Hashes ==================== #
# ======================================================== #


@canteen_router.get("/all/hash", response_model=list[ResGetCanteenHash])
def canteen_read_all_hash(db: Session = Depends(get_db)) -> list[dict]:
    try:
        return [canteen.as_dict_hash() for canteen in db.query(m_canteen.Canteen).all()]
    except Exception as e:
        print(e)
        return [{"canteen_short_name": "", "hash": ""}]


@canteen_router.get("/{canteen_short_name}/hash", response_model=ResGetCanteenHash)
def canteen_read_hash(
    canteen_short_name: Annotated[str, "The short name of the canteen to retrieve."],
    db: Session = Depends(get_db),
):
    try:
        return db.query(m_canteen.Canteen).filter_by(canteen_short_name=canteen_short_name).first().as_dict_hash()
    except Exception as e:
        print(e)
        return {"canteen_short_name": "", "hash": ""}
