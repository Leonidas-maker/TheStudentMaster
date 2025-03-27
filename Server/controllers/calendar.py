from sqlalchemy.orm import Session, joinedload, defer, load_only, aliased
from fastapi import HTTPException, Response
import uuid
from typing import List
from sqlalchemy import func, and_, select
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi_cache.decorator import cache

from models.sql_models import m_calendar
from models.pydantic_schemas import s_calendar, s_general
from config.general import DEFAULT_TIMEZONE_RESPONSE
from utils.cache import custom_key_builder


@cache(expire=240, key_builder=custom_key_builder)
async def get_available_calendars(db: Session) -> List[s_calendar.ResAvailableNativeCalendars]:
    """
    Retrieve a list of available calendars grouped by universities.

    Args:
        db (Session): The database session.

    Returns:
        List[s_calendar.ResAvailableNativeCalendars]: A list of available calendars with university details.
    """
    # Query to get universities and their courses, grouped by university
    result = (
        db.query(
            m_calendar.University.university_name,
            m_calendar.University.university_uuid,
            func.group_concat(m_calendar.Course.course_name),
        )
        .join(m_calendar.Course)
        .group_by(m_calendar.University.university_name, m_calendar.University.university_uuid)
        .all()
    )

    # Processing the query result into the response format
    response = [
        s_calendar.ResAvailableNativeCalendars(
            university_name=uni_name,
            university_uuid=uni_uuid,
            course_names=courses.split(","),
        )
        for uni_name, uni_uuid, courses in result
    ]

    return response


@cache(expire=60, key_builder=custom_key_builder)
async def get_calendar_by_university_and_course(
    db: Session, university_uuid: uuid.UUID, course_name: str, response: Response
) -> s_calendar.ResCalendar:
    """
    Retrieve a calendar for a specific university and course.

    Args:
        db (Session): The database session.
        university_uuid (uuid.UUID): UUID of the university.
        course_name (str): Name of the course.
        response (Response): FastAPI response object to attach headers.

    Returns:
        s_calendar.ResCalendar: Calendar data for the specified university and course.

    Raises:
        HTTPException: If the course is not found.
    """
    # Log the function call for debugging purposes
    print("get_calendar_by_university_and_course")

    # Normalize the course name by replacing underscores with spaces
    course_name = course_name.replace("_", " ")

    # This query retrieves the course, university, lectures, sessions, rooms, and tags with joins and outer joins.
    # Outer joins are used where some data (like rooms or tags) might not exist.
    # It is more efficient than using joinedload, as this version improves query speed by about 50%.
    course_row = (
        db.query(
            m_calendar.Course,
            m_calendar.University,
            m_calendar.Lecture,
            m_calendar.Session,
            m_calendar.SessionRoom,
            m_calendar.Room,
            m_calendar.SessionTag,
            m_calendar.Tag,
        )
        # Join tables for courses, lectures, sessions, and other related entities
        .join(m_calendar.University, m_calendar.Course.university_id == m_calendar.University.university_id)
        .join(m_calendar.Lecture, m_calendar.Course.course_id == m_calendar.Lecture.course_id)
        .join(m_calendar.Session, m_calendar.Lecture.lecture_id == m_calendar.Session.lecture_id)
        # Use outer joins for optional entities like rooms and tags
        .outerjoin(m_calendar.SessionRoom, m_calendar.Session.session_id == m_calendar.SessionRoom.session_id)
        .outerjoin(m_calendar.Room, m_calendar.SessionRoom.room_id == m_calendar.Room.room_id)
        .outerjoin(m_calendar.SessionTag, m_calendar.Session.session_id == m_calendar.SessionTag.session_id)
        .outerjoin(m_calendar.Tag, m_calendar.SessionTag.tag_id == m_calendar.Tag.tag_id)
        # Filter by the provided university UUID and course name
        .filter(m_calendar.University.university_uuid == university_uuid, m_calendar.Course.course_name == course_name)
        .all()
    )

    # If no course data is found, raise a 404 error
    if not course_row:
        raise HTTPException(status_code=404, detail="Course not found")

    # Initialize variables to store events and university name
    events = []
    university_name = course_row[0][1].university_name  # Extract university name from the first row
    proccessed_sessions = {str: int}  # Dictionary to track processed sessions

    # Process each row and build the event data
    for course, _, lecture, session, _, room, _, tag in course_row:
        start_time_berlin = session.start_time.astimezone(DEFAULT_TIMEZONE_RESPONSE).isoformat()
        end_time_berlin = session.end_time.astimezone(DEFAULT_TIMEZONE_RESPONSE).isoformat()

        if session.session_id in proccessed_sessions and (room or tag):
            event = events[proccessed_sessions[session.session_id]]
            event.location = event.location + ", " + room.room_name if room else event.location
            if tag:
                event.description.tags.append(tag.tag_name)
            continue

        event = s_calendar.ResEvent(
            start=start_time_berlin,
            end=end_time_berlin,
            summary=lecture.lecture_name,
            location=room.room_name if room else "",
            description=s_calendar.ResEventDescription(
                tags=[tag.tag_name] if tag else [], lecturer=lecture.lecturer or ""
            ),
        )
        events.append(event)
        proccessed_sessions[session.session_id] = len(events) - 1

    res_event_data = s_calendar.ResEventData(X_WR_TIMEZONE=DEFAULT_TIMEZONE_RESPONSE.zone, events=events)

    # Prepare the final response calendar object
    res_calendar = s_calendar.ResCalendar(
        university_name=university_name,
        course_name=course_name,
        data=res_event_data,
        hash=course.last_modified,  # Deprecated field for backward compatibility
        last_modified=course.last_modified,  # Use this field for versioning
    )

    # Add a warning header about the deprecated 'hash' field
    response.headers["Warning"] = (
        '199 - "Deprecation: The field `hash` is deprecated and will be removed in the future."'
    )

    return res_calendar


@cache(expire=60, key_builder=custom_key_builder)
async def get_calendar_hash(
    db: Session,
    university_uuid: uuid.UUID,
    course_name: str,
) -> s_general.BasicMessage:
    """
    Retrieve the last modified hash for a specific university and course.

    Args:
        db (Session): The database session.
        university_uuid (uuid.UUID): UUID of the university.
        course_name (str): Name of the course.

    Returns:
        s_general.BasicMessage: A message containing the last modified timestamp.

    Raises:
        HTTPException: If the course is not found.
    """
    # Normalize the course name
    course_name = course_name.replace("_", " ")

    # Query the course data
    course = (
        db.query(m_calendar.Course)
        .join(m_calendar.University)
        .filter(
            and_(m_calendar.University.university_uuid == university_uuid, m_calendar.Course.course_name == course_name)
        )
        .first()
    )

    # If no course is found, raise a 404 error
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Return the last modified timestamp as a message
    return {"message": course.last_modified.isoformat()}


@cache(expire=60, key_builder=custom_key_builder)
async def get_free_rooms(
    db: Session, university_uuid: uuid.UUID, start_time: datetime, end_time: datetime
) -> List[str]:
    """
    Retrieve a list of free rooms for a specific university within a time range.

    Args:
        db (Session): The database session.
        university_uuid (uuid.UUID): UUID of the university.
        start_time (datetime): Start time for room availability.
        end_time (datetime): End time for room availability.

    Returns:
        List[str]: A list of free room names.

    Raises:
        HTTPException: If no free rooms are found or if time parameters are invalid.
    """
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time.")

    # Query to check if the university exists
    university = db.query(m_calendar.University).filter_by(university_uuid=university_uuid).first()

    if not university:
        raise HTTPException(status_code=404, detail="University not found.")

    # Subquery to find rooms that are occupied within the time range
    subquery = (
        select(m_calendar.SessionRoom.room_id)
        .join(m_calendar.Session)
        .filter(m_calendar.Session.start_time < end_time, m_calendar.Session.end_time > start_time)
    )

    # Query to find free rooms
    free_rooms = (
        db.query(m_calendar.Room)
        .filter(
            m_calendar.Room.university_id == university.university_id,
            m_calendar.Room.room_id.notin_(subquery),
        )
        .all()
    )

    if not free_rooms:
        raise HTTPException(
            status_code=404, detail="No free rooms found in the specified time range for this university."
        )

    free_room_ids = [room.room_id for room in free_rooms]

    # Fetch first and last booking times for the free rooms
    session_alias = aliased(m_calendar.Session)
    session_data = (
        db.query(
            m_calendar.SessionRoom.room_id,
            func.min(session_alias.start_time).label("last_booked"),
            func.max(session_alias.end_time).label("next_booked"),
        )
        .join(session_alias, m_calendar.SessionRoom.session_id == session_alias.session_id)
        .filter(m_calendar.SessionRoom.room_id.in_(free_room_ids))
        .group_by(m_calendar.SessionRoom.room_id)
        .all()
    )

    session_map = {
        data.room_id: {"last_booked": data.last_booked, "next_booked": data.next_booked} for data in session_data
    }

    # Build the response with room names and their booking information
    response = []
    for room in free_rooms:
        session_info = session_map.get(room.room_id, {"last_booked": None, "next_booked": None})
        response.append(
            s_calendar.RoomAvailabilityResponse(
                room_name=room.room_name,
                last_booked=session_info["last_booked"],
                next_booked=session_info["next_booked"],
            )
        )

    return response


def get_user_calendar(
    db: Session, user_id: int, with_university: bool = False, with_data: bool = False
) -> m_calendar.CalendarCustom | None:
    """
    Retrieve a user's custom calendar.

    Args:
        db (Session): The database session.
        user_id (int): ID of the user.
        with_university (bool, optional): Whether to include university data. Defaults to False.
        with_data (bool, optional): Whether to include calendar data. Defaults to False.

    Returns:
        m_calendar.CalendarCustom | None: The user's custom calendar or None if not found.

    Raises:
        HTTPException: If the calendar is not found.
    """
    # Query the user's calendar based on user_id
    query = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    if not query:
        raise HTTPException(status_code=404, detail="Calendar not found")

    # Load related university data if requested
    if with_university:
        query = query.options(joinedload(m_calendar.UserCalendar.university))

    # Load calendar data if requested
    if with_data:
        query = query.options(joinedload(m_calendar.UserCalendar.calendar))

    result = query.first()

    if not result:
        raise HTTPException(status_code=404, detail="Calendar not found")

    return result
