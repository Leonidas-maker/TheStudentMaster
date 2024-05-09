from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload, defer
from typing import List
import uuid

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_calendar, s_general

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db


###########################################################################
################################### MAIN ##################################
###########################################################################

calendar_router = APIRouter()


# ======================================================== #
# ======================== Calendar ====================== #
# ======================================================== #
@calendar_router.get("/available_calendars", response_model=List[s_calendar.ResAvailableNativeCalendars])
def get_available_calendars(db: Session = Depends(get_db)):
    query_options = [joinedload(m_calendar.CalendarNative.university), defer(m_calendar.CalendarNative.data)]

    calendars = db.query(m_calendar.CalendarNative).options(*query_options).all()

    available_calendars = {}
    university_uuids = {}

    for calendar in calendars:
        if calendar.university.university_name not in available_calendars:
            available_calendars[calendar.university.university_name] = []
            university_uuids[calendar.university.university_name] = calendar.university.university_uuid

        available_calendars[calendar.university.university_name].append(calendar.course_name)

    response = []

    for university_name, lectures in available_calendars.items():
        response.append(
            s_calendar.ResAvailableNativeCalendars(
                university_name=university_name,
                university_uuid=university_uuids[university_name],
                course_names=lectures,
            )
        )

    return response


@calendar_router.get("/{university_uuid}/{course_name}", response_model=s_calendar.ResCalendar)
def get_calendar(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    course_name = course_name.replace("_", " ")

    calendar = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
        )
        .first()
    )

    res_calendar = s_calendar.CalendarNative(
        university_name=calendar.university.university_name,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified,
    )
    return res_calendar


@calendar_router.get("/{university_uuid}/{course_name}/hash", response_model=s_general.BasicMessage)
def get_calendar_hash(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    course_name = course_name.replace("_", " ")

    calendar = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
        )
        .first()
    )

    return {"message": calendar.hash}
