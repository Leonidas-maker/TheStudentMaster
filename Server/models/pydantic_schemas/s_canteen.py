import datetime
from pydantic import BaseModel
from typing import Optional

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from .s_general import CompleteAdress


class CanteenBase(BaseModel):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #


class ResGetCanteen(CanteenBase):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True


class ResGetCanteenAddress(CanteenBase):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    address: CompleteAdress

    class Config:
        from_attributes = True


class ResGetMenuDay(BaseModel):
    dish_type: str
    dish: str
    price: str
    serving_date: datetime.datetime

    class Config:
        from_attributes = True


class ResGetCanteenMenu(CanteenBase):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    menu: list[ResGetMenuDay]

    class Config:
        from_attributes = True


class ResGetCanteenMenuDay(CanteenBase):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    menu: ResGetMenuDay

    class Config:
        from_attributes = True


class ResGetCanteenHash(CanteenBase):
    canteen_short_name: str
    hash: str

    class Config:
        from_attributes = True
