from sqlalchemy.orm import Session, joinedload, defer, load_only, selectinload, aliased
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


@cache(expire=120, key_builder=custom_key_builder)
async def get_available_calendars(db: Session) -> List[s_calendar.ResAvailableNativeCalendars]:
    # Using GROUP_CONCAT in MySQL to group course names in the query itself
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

    # Processing the result
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
    print("get_calendar_by_university_and_course")
    course_name = course_name.replace("_", " ")

    querry_options = [
        selectinload(m_calendar.Course.lectures)
        .selectinload(m_calendar.Lecture.sessions)
        .selectinload(m_calendar.Session.tags),
        selectinload(m_calendar.Course.lectures)
        .selectinload(m_calendar.Lecture.sessions)
        .selectinload(m_calendar.Session.rooms),
    ]

    course = (
        db.query(m_calendar.Course)
        .join(m_calendar.University)
        .options(*querry_options)
        .filter(
            and_(m_calendar.University.university_uuid == university_uuid, m_calendar.Course.course_name == course_name)
        )
        .first()
    )

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    events = []
    for lecture in course.lectures:
        for session in lecture.sessions:
            start_time_berlin = session.start_time.astimezone(DEFAULT_TIMEZONE_RESPONSE).isoformat()
            end_time_berlin = session.end_time.astimezone(DEFAULT_TIMEZONE_RESPONSE).isoformat()

            event = s_calendar.ResEvent(
                start=start_time_berlin,
                end=end_time_berlin,
                summary=lecture.lecture_name,
                location=", ".join([session_room.room.room_name for session_room in session.rooms]),
                description=s_calendar.ResEventDescription(
                    tags=[session_tag.tag.tag_name for session_tag in session.tags], lecturer=lecture.lecturer or ""
                ),
            )
            events.append(event)

    # Create the response data
    res_event_data = s_calendar.ResEventData(X_WR_TIMEZONE=DEFAULT_TIMEZONE_RESPONSE.zone, events=events)

    # Create the response calendar
    res_calendar = s_calendar.ResCalendar(
        university_name=course.university.university_name,
        course_name=course.course_name,
        data=res_event_data,
        hash=course.last_modified,  #! Deprecated will be removed in the future only last_modified will be returned
        last_modified=course.last_modified,
    )

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
    course_name = course_name.replace("_", " ")

    course = (
        db.query(m_calendar.Course)
        .join(m_calendar.University)
        .filter(
            and_(m_calendar.University.university_uuid == university_uuid, m_calendar.Course.course_name == course_name)
        )
        .first()
    )

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return {"message": course.last_modified.isoformat()}

@cache(expire=60, key_builder=custom_key_builder)
async def get_free_rooms(db: Session, university_uuid: uuid.UUID, start_time: datetime, end_time: datetime) -> List[str]:
    # Check if start time is before end time
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time.")

    # Check if university exists
    university = db.query(m_calendar.University).filter_by(university_uuid=university_uuid).first()

    if not university:
        raise HTTPException(status_code=404, detail="University not found.")

    # Subquery to find all rooms that are occupied in the given time range
    subquery = (
        select(m_calendar.SessionRoom.room_id)
        .join(m_calendar.Session)
        .filter(m_calendar.Session.start_time < end_time, m_calendar.Session.end_time > start_time)
    )

    # Find all free rooms in the university (rooms not in the subquery)
    free_rooms = (
        db.query(m_calendar.Room)
        .filter(
            m_calendar.Room.university_id == university.university_id,
            m_calendar.Room.room_id.notin_(subquery),  # Use the subquery explicitly as a select()
        )
        .all()
    )

    if not free_rooms:
        raise HTTPException(
            status_code=404, detail="No free rooms found in the specified time range for this university."
        )

    # Get room IDs for the free rooms
    free_room_ids = [room.room_id for room in free_rooms]

    # Fetch the first and last booking times for each free room in a single query
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

    # Map session data to room IDs
    session_map = {
        data.room_id: {"last_booked": data.last_booked, "next_booked": data.next_booked} for data in session_data
    }

    # Create the response with room names and first/last booking times
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
    Function to get a user's calendar.


    This function fetches a user's calendar based on the user ID.

    Args:
        db (Session): Database session
        user_id (int): User ID for which to get the calendar
        with_university (bool, optional): Flag to include university data in the response. Defaults to False.
        with_data (bool, optional): Flag to include calendar data in the response. Defaults to False.
    """

    # Query the user's calendar
    query = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    if not query:
        raise HTTPException(status_code=404, detail="Calendar not found")

    # Load university data if requested
    if with_university:
        query = query.options(joinedload(m_calendar.UserCalendar.university))

    # Load calendar data if requested
    if with_data:
        query = query.options(joinedload(m_calendar.UserCalendar.calendar))

    result = query.first()

    if not result:
        raise HTTPException(status_code=404, detail="Calendar not found")

    # Execute the query
    return result
