from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.pydantic_schemas.s_canteen import ResGetCanteen, ResGetCanteenAddress
from models.sql_models import m_canteen
from middleware.database import get_db

canteen_router = APIRouter()


@canteen_router.get("/{canteen_id}", response_model=ResGetCanteen)
def canteen_read(
    canteen_id: Annotated[int, "The ID of the canteen to retrieve."],
    db: Session = Depends(get_db),
):
    return (
        db.query(m_canteen.Canteen).filter_by(canteen_id=canteen_id).first().as_dict()
    )


@canteen_router.get("/{canteen_id}/address", response_model=ResGetCanteenAddress)
def canteen_read_all_details(
    canteen_id: Annotated[int, "The ID of the canteen to retrieve."],
    db: Session = Depends(get_db),
):
    return (
        db.query(m_canteen.Canteen)
        .filter_by(canteen_id=canteen_id)
        .first()
        .as_dict_complete()
    )


# TODO: not finished
# @canteen_router.get("/canteen/menu/{day}", response_model=list[ResGetCanteenMenu])
# def canteen_read_menu(
#     day: Annotated[str, "The day to retrieve the menu for."],
#     db: Session = Depends(get_db),
# ) -> list[dict]:
#     return [
#         menu.as_dict() for menu in db.query(m_canteen.Menu).filter_by(day=day).all()
#     ]


