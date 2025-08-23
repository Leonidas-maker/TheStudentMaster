import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

from .s_generic import CompleteAddress

class CanteenBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    canteen_name: str = Field(..., description="Name of the canteen.")
    canteen_short_name: str = Field(..., description="Short name of the canteen, used for URL paths.")
    image_url: Optional[str] = Field(
        None, description="URL of the canteen's image. If not provided, no image will be displayed."
    )


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #
class ResGetCanteen(CanteenBase):
    model_config = ConfigDict(from_attributes=True)
    address: Optional[CompleteAddress]  = Field(
        None, description="Complete address of the canteen. If not provided, no address will be displayed.",
    )
  
class ResGetMenuDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dish_type: str
    dish: str
    price: str
    serving_date: datetime.datetime


class ResGetCanteenMenu(CanteenBase):
    model_config = ConfigDict(from_attributes=True)

    # Response model for a canteen's full menu
    menu: list[ResGetMenuDay]


class ResGetCanteenMenuDay(CanteenBase):
    model_config = ConfigDict(from_attributes=True)

    menu: ResGetMenuDay