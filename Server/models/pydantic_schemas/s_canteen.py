from pydantic import BaseModel
from typing import Optional

from .s_general import CompleteAdress


class CanteenBase(BaseModel):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True


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
