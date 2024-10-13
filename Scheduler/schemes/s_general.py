from pydantic import BaseModel
from typing import Optional

class AddressCreate(BaseModel):
    address1: str
    address2: Optional[str] = None
    city: str
    country: str
    district: str
    postal_code: str
