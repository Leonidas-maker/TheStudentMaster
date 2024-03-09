from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ======================================================== #
# ======================== Address ======================= #
# ======================================================== #
class AddressBase(BaseModel):
    address1: str
    address2: Optional[str] = None
    district: str
    postal_code: str


class AddressCreate(AddressBase):
    city: str
    country: str


class Address(AddressBase):
    address_id: int
    city_id: int
    last_modified: datetime

    class Config:
        from_attributes = True

# ======================================================== #
# ========================= City ========================= #
# ======================================================== #
class CityBase(BaseModel):
    city: str
    country_id: int


class CityCreate(CityBase):
    pass


class City(CityBase):
    city_id: int
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ======================== Country ======================= #
# ======================================================== #
class CountryBase(BaseModel):
    country: str


class CountryCreate(CountryBase):
    pass


class Country(CountryBase):
    country_id: int
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Sonstiges ====================== #
# ======================================================== #
class CompleteAdress(BaseModel):
    address1: str
    address2: Optional[str] = None
    district: str
    postal_code: str
    city: str
    country: str