from fastapi import HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, select
from sqlalchemy.orm import aliased, joinedload
import uuid
from typing import List

from datetime import datetime
from fastapi_cache.decorator import cache

from models import m_calendar
from schemas import s_calendar, s_generic
from config.settings import DEFAULT_TIMEZONE_RESPONSE
from core.generic import EndpointContext

from crud import calendar as crud_calendar, university as crud_university


async def get_calendar_by_university_and_course(
    ep_context: EndpointContext,
    university_uuid: uuid.UUID,
    course_name: str,
    response: Response,
) -> s_calendar.ResCalendar:
    """Retrieve the calendar for a specific university and course.

    :param ep_context: The endpoint context containing database and logger
    :param university_uuid: UUID of the university
    :param course_name: Name of the course
    :param response: Response object to set headers
    :return: A ResCalendar object containing the calendar data
    """
    db = ep_context.db
    audit = ep_context.audit_logger

    # 1) Retrieve data
    rows = await crud_calendar.get_calendar_by_university_and_course(db, university_uuid, course_name)
    if not rows:
        raise HTTPException(status_code=404, detail="Course not found")

    # 2) Build events
    events: list[s_calendar.ResEvent] = []
    for row in rows:
        # Split rooms and tags ("" → empty list)
        rooms = row["rooms"].split(",") if row["rooms"] else []
        tags = row["tags"].split(",") if row["tags"] else []

        # Convert and format times
        start_iso = row["start_time"].astimezone(DEFAULT_TIMEZONE_RESPONSE).isoformat()
        end_iso = row["end_time"].astimezone(DEFAULT_TIMEZONE_RESPONSE).isoformat()

        # Create event object
        events.append(
            s_calendar.ResEvent(
                start=start_iso,
                end=end_iso,
                summary=row["lecture_name"],
                location=", ".join(rooms),
                description=s_calendar.ResEventDescription(
                    tags=tags,
                    lecturer=row["lecturer"] or "",
                ),
            )
        )

    # 3) Set deprecation warning header
    response.headers["Warning"] = (
        '199 - "Deprecation: The field `hash` is deprecated and will be removed in the future."'
    )

    # 4) Assemble ResCalendar
    first = rows[0]
    return s_calendar.ResCalendar(
        university_name=first["university_name"],
        course_name=course_name,
        data=s_calendar.ResEventData(
            X_WR_TIMEZONE=DEFAULT_TIMEZONE_RESPONSE.zone or "",
            events=events,
        ),
        hash=first["last_modified"],  # Backward compatibility
        last_modified=first["last_modified"],  # Versioning
    )


async def get_free_rooms(
    db: AsyncSession, university_uuid: uuid.UUID, start_time: datetime, end_time: datetime
) -> List[str]:
    """Retrieve free rooms for a specific university within a time range.

    :param db: The database session
    :param university_uuid: UUID of the university
    :param start_time: Start time for the room availability check
    :param end_time: End time for the room availability check
    :return: List of available room names
    """
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time.")

    if not await crud_university.university_exists(db, university_uuid):
        raise HTTPException(status_code=404, detail="University not found.")

    # Fetch free rooms for the specified university and time range
    free_rooms = await crud_university.get_university_free_rooms(db, university_uuid, start_time, end_time)

    if not free_rooms:
        raise HTTPException(
            status_code=404, detail="No free rooms found in the specified time range for this university."
        )

    free_room_ids = [room.room_id for room in free_rooms]

    # Fetch first and last booking times for the free rooms
    rooms_booked = await crud_calendar.get_rooms_last_next_booked(db, free_room_ids)

    rooms_booked_dic = {
        data.room_id: {"last_booked": data.last_booked, "next_booked": data.next_booked} for data in rooms_booked
    }

    # Build the response with room names and their booking information
    response = []
    for room in free_rooms:
        rooms_booked = rooms_booked_dic.get(room.room_id, {"last_booked": None, "next_booked": None})
        response.append(
            s_calendar.RoomAvailabilityResponse(
                room_name=room.room_name,
                last_booked=rooms_booked["last_booked"],
                next_booked=rooms_booked["next_booked"],
            )
        )

    return response
