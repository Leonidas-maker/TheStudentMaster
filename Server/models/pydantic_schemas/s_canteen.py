from pydantic import BaseModel
from typing import Optional

from .s_general import CompleteAdress


class CanteenBase(BaseModel):
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    address_id: int

    class Config:
        from_attributes = True


class ResGetCanteen(CanteenBase):
    canteen_id: int
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    address_id: int

    class Config:
        from_attributes = True


class ResGetCanteenAddress(CanteenBase):
    canteen_id: int
    canteen_name: str
    canteen_short_name: Optional[str]
    image_url: Optional[str]
    address: CompleteAdress

    class Config:
        from_attributes = True
