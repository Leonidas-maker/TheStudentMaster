from sqlalchemy.orm import Session, joinedload, defer
from fastapi import HTTPException
import uuid
import datetime


from models.sql_models import m_calendar
from models.pydantic_schemas import s_calendar


def fetch_available_calendars(db: Session):
    # Optimize query by loading related University objects and deferring the loading of large 'data' field
    query_options = [joinedload(m_calendar.CalendarNative.university), defer(m_calendar.CalendarNative.data)]

    # Query all CalendarNative entries with the specified query options
    calendars = db.query(m_calendar.CalendarNative).options(*query_options).all()

    available_calendars = {}  # Dictionary to hold lists of course names, keyed by university name
    university_uuids = {}  # Dictionary to hold university UUIDs, keyed by university name

    # Iterate through all fetched calendars
    for calendar in calendars:
        # Initialize lists in the dictionaries if the university hasn't been encountered yet
        if calendar.university.university_name not in available_calendars:
            available_calendars[calendar.university.university_name] = []
            university_uuids[calendar.university.university_name] = calendar.university.university_uuid

        # Append the course name to the list for the corresponding university
        available_calendars[calendar.university.university_name].append(calendar.course_name)

    response = []
    # Convert the dictionaries into a list of ResAvailableNativeCalendars objects
    for university_name, lectures in available_calendars.items():
        response.append(
            s_calendar.ResAvailableNativeCalendars(
                university_name=university_name,
                university_uuid=university_uuids[university_name],
                course_names=lectures,
            )
        )

    return response


def fetch_calendar_by_university_and_course(university_uuid: uuid.UUID, course_name: str, db: Session):
    course_name = course_name.replace("_", " ")

    # Query the database for the calendar based on university UUID and course name
    calendar = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
        )
        .first()
    )

    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")

    # Check if the last_accessed field needs to be updated
    current_time = datetime.datetime.now()
    if (current_time - calendar.guest_last_accessed) > datetime.timedelta(minutes=15):
        # Update last_accessed to the current time if more than 15 minutes have passed
        calendar.guest_last_accessed = current_time
        db.commit() # Commit the update to the database

    # Create the response structure with the necessary calendar details
    res_calendar = s_calendar.CalendarNative(
        university_name=calendar.university.university_name,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified,
        guest_last_accessed=calendar.guest_last_accessed,
    )

    return res_calendar


def fetch_calendar_hash(university_uuid: uuid.UUID, course_name: str, db: Session):
    querry_options = [defer(m_calendar.CalendarNative.data)]  # Defer loading of large 'data' field to optimize query performance
    course_name = course_name.replace("_", " ")  # Replace underscores with spaces in the course name
    print(course_name)  # Debug print to verify the course name formatting

    # Query the database for the specific calendar by university UUID and course name
    calendar = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
        )
        .options(*querry_options)
        .first()
    )

    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")

    # Check if the guest_last_accessed field needs to be updated (only if more than 15 minutes have passed)
    current_time = datetime.datetime.now()
    if (current_time - calendar.guest_last_accessed) > datetime.timedelta(minutes=15):
        # Update guest_last_accessed to the current time
        calendar.guest_last_accessed = current_time
        db.commit()  # Commit the update to the database

    return {"message": calendar.hash}
