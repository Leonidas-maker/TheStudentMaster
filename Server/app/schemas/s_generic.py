from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ======================================================== #
# ======================== Address ======================= #
# ======================================================== #


class AddressBase(BaseModel):
    address1: str = Field(..., description="First line of the street address.")
    address2: Optional[str] = Field(
        None, description="Second line of the street address (e.g., apartment or suite number)."
    )


class AddressCreate(AddressBase):
    city: str = Field(..., description="Name of the city for this address.")
    country: str = Field(..., description="Name of the country for this address.")
    district: str = Field(..., description="District, state, or region for this address.")
    postal_code: str = Field(..., description="Postal or ZIP code for this address.")


class Address(AddressBase):
    address_id: int = Field(..., description="Unique identifier of the address record.")
    city_id: int = Field(..., description="Identifier of the related city record.")
    last_modified: datetime = Field(..., description="Timestamp when this address was last updated.")

    class Config:
        from_attributes = True


# ======================================================== #
# ====================== PostalCode ====================== #
# ======================================================== #


class PostalCodeBase(BaseModel):
    postal_code: str = Field(..., description="Postal or ZIP code.")


class PostalCodeCreate(PostalCodeBase):
    city: str = Field(..., description="Name of the city for this postal code.")
    country: str = Field(..., description="Name of the country for this postal code.")
    district: str = Field(..., description="District, state, or region for this postal code.")


class PostalCode(PostalCodeBase):
    city_id: int = Field(..., description="Identifier of the related city record.")
    postal_code_id: int = Field(..., description="Unique identifier of the postal code record.")
    last_modified: datetime = Field(..., description="Timestamp when this postal code entry was last updated.")

    class Config:
        from_attributes = True


# ======================================================== #
# ========================= City ========================= #
# ======================================================== #


class CityBase(BaseModel):
    city: str = Field(..., description="Name of the city.")


class CityCreate(CityBase):
    district: str = Field(..., description="District, state, or region where the city is located.")
    country: str = Field(..., description="Country where the city is located.")


class City(CityBase):
    city_id: int = Field(..., description="Unique identifier of the city record.")
    district_id: int = Field(..., description="Identifier of the related district record.")
    last_modified: datetime = Field(..., description="Timestamp when this city record was last updated.")

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= District ======================= #
# ======================================================== #


class DistrictBase(BaseModel):
    district: str = Field(..., description="Name of the district, state, or region.")


class DistrictCreate(DistrictBase):
    country: str = Field(..., description="Country where the district is located.")


class District(DistrictBase):
    district_id: int = Field(..., description="Unique identifier of the district record.")
    country_id: int = Field(..., description="Identifier of the related country record.")
    last_modified: datetime = Field(..., description="Timestamp when this district record was last updated.")

    class Config:
        from_attributes = True


# ======================================================== #
# ======================== Country ======================= #
# ======================================================== #


class CountryBase(BaseModel):
    country: str = Field(..., description="Name of the country.")


class Country(CountryBase):
    country_id: int = Field(..., description="Unique identifier of the country record.")
    last_modified: datetime = Field(..., description="Timestamp when this country record was last updated.")

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Sonstiges ====================== #
# ======================================================== #
class CompleteAddress(BaseModel):
    address1: str = Field(..., description="First line of the street address.")
    address2: Optional[str] = Field(None, description="Second line of the street address (e.g., apartment or suite).")
    district: str = Field(..., description="District, state, or region.")
    postal_code: str = Field(..., description="Postal or ZIP code.")
    city: str = Field(..., description="Name of the city.")
    country: str = Field(..., description="Name of the country.")

class MessageResponse(BaseModel):
    """
    Model for returning a simple message response.
    """

    message: str = Field(..., description="The message text to be returned.")
