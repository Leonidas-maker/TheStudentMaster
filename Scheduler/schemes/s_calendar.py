from pydantic import BaseModel, UUID4, field_validator, field_serializer, ConfigDict, Field, computed_field
from typing import Optional, Union, List, Dict
from datetime import datetime
from dateutil import parser
import pytz
import hashlib

# from config.general import DEFAULT_TIMEZONE
DEFAULT_TIMEZONE = pytz.timezone("UTC")


###########################################################################
################################# DHBW.APP ################################
###########################################################################
class ApiLectureDTO(BaseModel):
    date: datetime
    site: str
    lecturer: Optional[str] = Field(default=None)
    startTime: datetime
    endTime: datetime
    name: str
    type: str
    rooms: List[str]
    course: str
    id: int


class ApiChangeInfoDTO(BaseModel):
    fieldName: str
    fieldType: str
    previousValue: str
    value: str
    id: int


class ApiUpdatedLectureDTO(BaseModel):
    lecture: ApiLectureDTO
    changeInfos: List[ApiChangeInfoDTO]
    id: int


class ApiSyncLecturesInfoResponseDTO(BaseModel):
    sites: List[str]
    startTime: datetime
    endTime: datetime
    status: str
    newLectures: List[ApiLectureDTO]
    updatedLectures: List[ApiUpdatedLectureDTO]
    removedLectures: List[ApiLectureDTO]
    id: int


###########################################################################
########################## Database Add / Update ##########################
###########################################################################


# ======================================================== #
# ========================= Room ========================= #
# ======================================================== #
class Room(BaseModel):
    """Represents a room in the university."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    capacity: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)
    equipment: List[str] = Field(default_factory=list)


# ======================================================== #
# ======================== Session ======================= #
# ======================================================== #

def session_parse_dt(v: Union[str, datetime]) -> datetime:
    """Parses a datetime string into a datetime object."""
    if isinstance(v, str):
        dt = parser.parse(v)
        if dt.tzinfo is None:
            dt = pytz.utc.localize(dt)
        return dt.astimezone(DEFAULT_TIMEZONE)
    return v.astimezone(DEFAULT_TIMEZONE) if isinstance(v, datetime) else v

def get_session_hash(start: datetime, end: datetime) -> str:
    """Generates a hash for the session based on its start and end times."""
    key = f"{start.isoformat()}|{end.isoformat()}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()

class Lecture(BaseModel):
    """Represents a session in the university."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    lecturer: Optional[str] = Field(default=None)

    start: datetime
    end: datetime
    rooms: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    @field_validator("start", "end", mode="before")
    def _parse_dt(cls, v):
        return session_parse_dt(v)

    @field_serializer("start", "end")
    def _ser_dt(self, v: datetime, _info) -> str:
        return v.astimezone(DEFAULT_TIMEZONE).isoformat()



class LectureCreate(Lecture):
    """Represents a session in the university.
    The 'external_id' field is a unique identifier for the session.
    """
    @computed_field
    @property
    def external_id(self) -> str:
        start: datetime = self.start
        end:   datetime = self.end
        if not start or not end:
            raise ValueError("Cannot generate external_id without both start and end")

        return get_session_hash(start, end)
    
class LectureUpdate(LectureCreate):
    """Represents an updated session in the university."""
    old_name: str
    old_external_id: str


# ======================================================== #
# ======================== Course ======================== #
# ======================================================== #
class CourseBase(BaseModel):
    """Represents a course in the university."""

    name: str


class CourseCreate(CourseBase):
    """
    Represents a course in the university.

    The 'lectures' field is a dictionary where the keys are the lecture names and the values are the lecture base models.
    """

    lectures: List[LectureCreate]

###########################################################################
########################### Scraper/Fetcher Base ##########################
###########################################################################
class DHBWCourseUpdate(BaseModel):
    """Represents an update from the DHBW API."""
    
    new_sessions: List[LectureCreate] = Field(default_factory=list)
    updated_sessions: List[LectureUpdate] = Field(default_factory=list)
    deleted_sessions: List[str] = Field(default_factory=list)
    