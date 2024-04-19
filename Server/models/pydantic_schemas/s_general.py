from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ======================================================== #
# ======================== Address ======================= #
# ======================================================== #
class AddressBase(BaseModel):
    address1: str
    address2: Optional[str] = None

class AddressCreate(AddressBase):
    city: str
    country: str
    district: str
    postal_code: str


class Address(AddressBase):
    address_id: int
    city_id: int
    last_modified: datetime

    class Config:
        from_attributes = True

# ======================================================== #
# ====================== PostalCode ====================== #
# ======================================================== #

class PostalCodeBase(BaseModel):
    postal_code: str
    

class PostalCodeCreate(PostalCodeBase):
    city: str
    country: str
    district: str

class PostalCode(PostalCodeBase):
    city_id: int
    postal_code_id: int
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ========================= City ========================= #
# ======================================================== #
class CityBase(BaseModel):
    city: str

class CityCreate(CityBase):
    district: str
    country: str

class City(CityBase):
    city_id: int
    district_id: int
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= District ======================= #
# ======================================================== #

class DistrictBase(BaseModel):
    district: str

class DistrictCreate(DistrictBase):
    country: str

class District(DistrictBase):
    district_id: int
    country_id: int
    last_modified: datetime

    class Config:
        from_attributes = True

# ======================================================== #
# ======================== Country ======================= #
# ======================================================== #

class CountryBase(BaseModel):
    country: str

class Country(CountryBase):
    country_id: int
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #


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
