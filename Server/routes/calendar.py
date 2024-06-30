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


# Endpoint to get the list of available calendars
@calendar_router.get("/available_calendars", response_model=List[s_calendar.ResAvailableNativeCalendars])
def get_available_calendars(db: Session = Depends(get_db)):
    # Query options to defer loading data and join with university table
    query_options = [joinedload(m_calendar.CalendarNative.university), defer(m_calendar.CalendarNative.data)]

    # Get all native calendars with the specified query options
    calendars = db.query(m_calendar.CalendarNative).options(*query_options).all()

    available_calendars = {}
    university_uuids = {}

    # Organize calendars by university
    for calendar in calendars:
        if calendar.university.university_name not in available_calendars:
            available_calendars[calendar.university.university_name] = []
            university_uuids[calendar.university.university_name] = calendar.university.university_uuid

        available_calendars[calendar.university.university_name].append(calendar.course_name)

    response = []

    # Prepare the response with university names and their respective courses
    for university_name, lectures in available_calendars.items():
        response.append(
            s_calendar.ResAvailableNativeCalendars(
                university_name=university_name,
                university_uuid=university_uuids[university_name],
                course_names=lectures,
            )
        )

    return response


# Endpoint to get a specific calendar by university UUID and course name
@calendar_router.get("/{university_uuid}/{course_name}", response_model=s_calendar.ResCalendar)
def get_calendar(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    # Replace underscores with spaces in the course name
    course_name = course_name.replace("_", " ")

    # Query the database for the specified calendar
    calendar = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
        )
        .first()
    )

    # Create the response model
    res_calendar = s_calendar.CalendarNative(
        university_name=calendar.university.university_name,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified,
    )
    return res_calendar


# Endpoint to get the hash of a specific calendar by university UUID and course name
@calendar_router.get("/{university_uuid}/{course_name}/hash", response_model=s_general.BasicMessage)
def get_calendar_hash(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    # Replace underscores with spaces in the course name
    course_name = course_name.replace("_", " ")

    # Query the database for the specified calendar
    calendar = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
        )
        .first()
    )

    # Return the hash of the calendar
    return {"message": calendar.hash}
