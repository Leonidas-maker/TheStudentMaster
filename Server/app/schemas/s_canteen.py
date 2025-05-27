import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from .s_generic import CompleteAddress


class CanteenBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #


class ResGetCanteen(CanteenBase):
    model_config = ConfigDict(from_attributes=True)

    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]


class ResGetCanteenAddress(CanteenBase):
    model_config = ConfigDict(from_attributes=True)

    address: CompleteAddress


class ResGetMenuDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dish_type: str
    dish: str
    price: str
    serving_date: datetime.datetime


class ResGetCanteenMenu(CanteenBase):
    model_config = ConfigDict(from_attributes=True)

    # Response model for a canteen's full menu
    canteen_name: str
    canteen_short_name: Optional[str]

    image_url: Optional[str]
    menu: list[ResGetMenuDay]


class ResGetCanteenMenuDay(CanteenBase):
    model_config = ConfigDict(from_attributes=True)

    menu: ResGetMenuDay