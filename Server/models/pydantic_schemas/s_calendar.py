from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime

class CalendarNative(BaseModel):
    university_name: str
    course_name: str
    data: dict
    hash: str
    last_modified: datetime

    class Config:
        from_attributes = True


class CalendarCustomBase(BaseModel):
    course_name: str
    

class CalendarCustomCreate(CalendarCustomBase):
    university_uuid: Optional[UUID4] = None
    source_backend: str
    source_url: str
    
class CalendarCustom(CalendarCustomBase):
    university_name: str
    data: dict
    hash: str
    refresh_interval: int
    verified: bool
    last_modified: datetime

    class Config:
        from_attributes = True


class University(BaseModel):
    id: int
    address_id: int
    name: str
    rooms: dict
    last_modified: datetime

    class Config:
        from_attributes = True


class CalendarBackend(BaseModel):
    id: int
    name: str
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #

class NativeCalenderIdentifier(BaseModel):
    university_uuid: UUID4
    course_name: str

# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #
class ResAvailableNativeCalendars(BaseModel):
    university_name: str
    university_uuid: UUID4
    course_names: List[str]


class ResUserCalendar(BaseModel):
    university_name: str
    university_uuid: UUID4
    course_name: str
    data: dict
    hash: str
    last_modified: datetime