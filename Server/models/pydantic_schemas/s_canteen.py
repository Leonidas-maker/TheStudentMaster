import datetime
from pydantic import BaseModel
from typing import Optional

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from .s_general import CompleteAdress


class CanteenBase(BaseModel):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    hash: str

    class Config:
        from_attributes = True  # Allows the model to be created from ORM objects


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #


class ResGetCanteen(CanteenBase):
    # Response model for basic canteen Information
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    hash: str

    class Config:
        from_attributes = True


class ResGetCanteenAddress(CanteenBase):
    # Response model for canteen information including address
    address: CompleteAdress
    hash: str

    class Config:
        from_attributes = True


class ResGetMenuDay(BaseModel):
    # Response model for a single menu item
    dish_type: str
    dish: str
    price: str
    serving_date: datetime.datetime

    class Config:
        from_attributes = True


class ResGetCanteenMenu(CanteenBase):
    # Response model for a canteen's full menu
    canteen_name: str
    canteen_short_name: Optional[str]
    hash: str
    image_url: Optional[str]
    menu: list[ResGetMenuDay]


class ResGetCanteenMenuDay(CanteenBase):
    # Response model for a canteen's menu for a specific day
    menu: ResGetMenuDay
    hash: str

    class Config:
        from_attributes = True


class ResGetCanteenHash(BaseModel):
    canteen_short_name: str
    hash: str

    class Config:
        from_attributes = True
