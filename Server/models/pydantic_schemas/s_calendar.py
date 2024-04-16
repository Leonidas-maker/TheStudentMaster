from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CalendarNative(BaseModel):
    name: str
    ical_source_id: int
    ical_data: str
    last_modified: datetime

    class Config:
        orm_mode = True


class CalendarCustom(BaseModel):
    name: str
    source_url: str
    ical_data: str
    last_modified: datetime

    class Config:
        orm_mode = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #
