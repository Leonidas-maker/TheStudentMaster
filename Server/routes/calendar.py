from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload, defer
from typing import List
import uuid

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db


###########################################################################
################################### MAIN ##################################
###########################################################################

calendar_router = APIRouter()

# ======================================================== #
# ======================== Calendar ====================== #
# ======================================================== #
@calendar_router.get("/available_calendars")
def get_available_calendars(db: Session = Depends(get_db)) -> List[s_calendar.ResAvailableNativeCalendars]:
    query_options = [joinedload(m_calendar.CalendarNative.university), defer(m_calendar.CalendarNative.data)]

    calendars = db.query(m_calendar.CalendarNative).options(*query_options).all()
    
    available_calendars = {}
    university_uuids = {}

    for calendar in calendars:
        if calendar.university.name not in available_calendars:
            available_calendars[calendar.university.name] = []
            university_uuids[calendar.university.name] = calendar.university.uuid

        available_calendars[calendar.university.name].append(calendar.course_name)

    response = []

    
    for university_name, lectures in available_calendars.items():
        response.append(s_calendar.ResAvailableNativeCalendars(university_name=university_name, university_uuid=university_uuids[university_name], course_names=lectures))

    return response
  
@calendar_router.get("/calendar/{university_uuid}/{course_name}")
def get_calendar(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)) -> s_calendar.CalendarNative:
    query_options = [joinedload(m_calendar.CalendarNative.university)]

    course_name = course_name.replace("_", " ")

    calendar = db.query(m_calendar.CalendarNative).options(*query_options).filter(
        m_calendar.University.uuid == university_uuid,
        m_calendar.CalendarNative.course_name == course_name
    ).first()

    res_calendar = s_calendar.CalendarNative(
        university_name=calendar.university.name,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified
    )
    return res_calendar

@calendar_router.get("/calendar/{university_uuid}/{course_name}/hash")
def get_calendar_hash(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)) -> str:
    query_options = [joinedload(m_calendar.CalendarNative.university)]

    course_name = course_name.replace("_", " ")

    calendar = db.query(m_calendar.CalendarNative).options(*query_options).filter(
        m_calendar.University.uuid == university_uuid,
        m_calendar.CalendarNative.course_name == course_name
    ).first()

    return calendar.hash