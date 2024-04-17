from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CalendarNative(BaseModel):
    id: int
    university_id: int
    lecture_name: str
    source_backend_id: int
    source: str
    data: dict
    hash: str
    is_active: bool
    last_modified: datetime

    class Config:
        orm_mode = True


class CalendarCustom(BaseModel):
    id: int
    university_id: int
    lecture_name: str
    source_backend_id: int
    source_url: str
    data: dict
    hash: str
    verified: bool
    last_modified: datetime

    class Config:
        orm_mode = True


class University(BaseModel):
    id: int
    address_id: int
    name: str
    rooms: dict
    last_modified: datetime

    class Config:
        orm_mode = True


class Backend(BaseModel):
    id: int
    name: str
    last_modified: datetime

    class Config:
        orm_mode = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #
class ResponseCalendarNative(BaseModel):
    data: CalendarNative
    status: str
