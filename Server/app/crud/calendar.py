from sqlalchemy import select, func, case, distinct
from sqlalchemy.orm import load_only, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from sqlalchemy import func
from typing import List, Optional
import uuid
import datetime

from models import m_calendar
from config.settings import DEFAULT_TIMEZONE


async def get_available_calendars(db: AsyncSession) -> List[m_calendar.University]:
    """Fetches available native calendars from the database.

    :param db: AsyncSession instance for database operations.
    :return: List of available native calendars.
    """

    res = await db.execute(
        select(m_calendar.University)
        .filter(m_calendar.University.courses.any())
        .options(
            load_only(m_calendar.University.name, m_calendar.University.id),
            joinedload(m_calendar.University.courses).load_only(m_calendar.Course.name),
        )
        .distinct(m_calendar.University.name, m_calendar.University.id)
    )

    # res = await db.execute(select(
    #         m_calendar.University.name,
    #         m_calendar.University.id,
    #         func.group_concat(m_calendar.Course.course_name)
    #     )
    #     .join(m_calendar.Course)
    #     .group_by(
    #         m_calendar.University.name,
    #         m_calendar.University.university_uuid
    #     ))

    return list(res.scalars().unique().all())


async def get_calendar_by_university_and_course(
    db: AsyncSession,
    university_id: uuid.UUID,
    course_name: str,
) -> list[dict]:
    """Get the calendar for a specific university and course.

    :param db: Database session.
    :param university_id: ID of the university.
    :param course_name: Name of the course.
    :return: List of dictionaries containing session details.
    """
    normalized_name = course_name.replace("_", " ")

    rooms_agg = func.coalesce(func.group_concat(distinct(m_calendar.Room.name)), "").label("rooms")

    tags_agg = func.coalesce(func.group_concat(distinct(m_calendar.Tag.name)), "").label("tags")

    stmt = (
        select(
            m_calendar.Session.id,
            m_calendar.Lecture.name,
            m_calendar.Lecture.lecturer,
            m_calendar.Session.start_time,
            m_calendar.Session.end_time,
            rooms_agg,
            tags_agg,
            m_calendar.University.name.label("university_name"),
            m_calendar.Course.last_modified,
        )
        .select_from(m_calendar.Session)
        .join(
            m_calendar.Lecture,
            m_calendar.Session.lecture_id == m_calendar.Lecture.id,
        )
        .join(
            m_calendar.Course,
            m_calendar.Lecture.course_id == m_calendar.Course.id,
        )
        .join(
            m_calendar.University,
            m_calendar.Course.university_id == m_calendar.University.id,
        )
        .outerjoin(
            m_calendar.SessionRoom,
            m_calendar.Session.id == m_calendar.SessionRoom.session_id,
        )
        .outerjoin(
            m_calendar.Room,
            m_calendar.SessionRoom.room_id == m_calendar.Room.id,
        )
        .outerjoin(
            m_calendar.SessionTag,
            m_calendar.Session.id == m_calendar.SessionTag.session_id,
        )
        .outerjoin(
            m_calendar.Tag,
            m_calendar.SessionTag.tag_id == m_calendar.Tag.id,
        )
        .where(
            m_calendar.University.id == university_id,
            m_calendar.Course.name == normalized_name,
        )
        .group_by(
            m_calendar.Session.id,
            m_calendar.Lecture.name,
            m_calendar.Lecture.lecturer,
            m_calendar.Session.start_time,
            m_calendar.Session.end_time,
            m_calendar.University.name,
            m_calendar.Course.last_modified,
        )
        .order_by(m_calendar.Session.start_time)
    )

    result = await db.execute(stmt)
    return [row._asdict() for row in result.all()]


async def get_calendar_last_modified(
    db: AsyncSession,
    university_id: uuid.UUID,
    course_name: str,
) -> Optional[datetime.datetime]:
    """
    Get the last modified date of a specific course for a given university.

    :param db: Database session.
    :param university_id: ID of the university.
    :param course_name: Name of the course.
    :return: Last modified date as a string.
    """
    normalized_name = course_name.replace("_", " ")

    stmt = (
        select(m_calendar.Course.last_modified)
        .join(m_calendar.University, m_calendar.Course.university_id == m_calendar.University.id)
        .where(
            m_calendar.University.id == university_id,
            m_calendar.Course.name == normalized_name,
        )
    )

    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_rooms_last_next_booked(
    db: AsyncSession,
    room_ids: List[int],
    current_time: Optional[datetime.datetime] = None,
) -> list[m_calendar.RoomBooking]:
    """
    Retrieve the previous and upcoming booking times for the specified rooms.

    :param db: AsyncSession instance for database operations.
    :param room_ids: List of room IDs.
    :param current_time: Optional current time; if not provided, uses the current time in the default timezone.
    :return: List of RoomBooking objects containing room_id, last_booked, and next_booked.
    """
    now = current_time or datetime.datetime.now(DEFAULT_TIMEZONE)

    stmt = (
        select(
            m_calendar.SessionRoom.room_id.label("room_id"),
            func.max(case((m_calendar.Session.end_time <= now, m_calendar.Session.end_time), else_=None)).label(
                "last_booked"
            ),
            func.min(case((m_calendar.Session.start_time >= now, m_calendar.Session.start_time), else_=None)).label(
                "next_booked"
            ),
        )
        .join(m_calendar.Session, m_calendar.Session.id == m_calendar.SessionRoom.session_id)
        .where(m_calendar.SessionRoom.room_id.in_(room_ids))
        .group_by(m_calendar.SessionRoom.room_id)
    )

    result = await db.execute(stmt)

    return [
        m_calendar.RoomBooking(room_id=row.room_id, last_booked=row.last_booked, next_booked=row.next_booked)
        for row in result
    ]
