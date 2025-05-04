from sqlalchemy import select, func, distinct
from sqlalchemy.orm import load_only, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from sqlalchemy import func
from typing import List, Optional
import uuid
import datetime

from models import m_calendar


async def get_available_calendars(db: AsyncSession) -> List[m_calendar.University]:
    """Fetches available native calendars from the database.

    :param db: AsyncSession instance for database operations.
    :return: List of available native calendars.
    """

    res = await db.execute(
        select(m_calendar.University)
        .filter(m_calendar.University.courses.any())
        .options(
            load_only(m_calendar.University.university_name, m_calendar.University.university_uuid),
            joinedload(m_calendar.University.courses).load_only(m_calendar.Course.course_name),
        )
        .distinct(m_calendar.University.university_name, m_calendar.University.university_uuid)
    )

    # res = await db.execute(select(
    #         m_calendar.University.university_name,
    #         m_calendar.University.university_uuid,
    #         func.group_concat(m_calendar.Course.course_name)
    #     )
    #     .join(m_calendar.Course)
    #     .group_by(
    #         m_calendar.University.university_name,
    #         m_calendar.University.university_uuid
    #     ))

    return list(res.scalars().unique().all())


async def get_calendar_by_university_and_course(
    db: AsyncSession,
    university_uuid: uuid.UUID,
    course_name: str,
) -> list[dict]:
    """Get the calendar for a specific university and course.

    :param db: Database session.
    :param university_uuid: UUID of the university.
    :param course_name: Name of the course.
    :return: List of dictionaries containing session details.
    """
    normalized_name = course_name.replace("_", " ")

    rooms_agg = func.coalesce(func.group_concat(distinct(m_calendar.Room.room_name)), "").label("rooms")

    tags_agg = func.coalesce(func.group_concat(distinct(m_calendar.Tag.tag_name)), "").label("tags")

    stmt = (
        select(
            m_calendar.Session.session_id,
            m_calendar.Lecture.lecture_name,
            m_calendar.Lecture.lecturer,
            m_calendar.Session.start_time,
            m_calendar.Session.end_time,
            rooms_agg,
            tags_agg,
            m_calendar.University.university_name,
            m_calendar.Course.last_modified,
        )
        .select_from(m_calendar.Session)
        .join(
            m_calendar.Lecture,
            m_calendar.Session.lecture_id == m_calendar.Lecture.lecture_id,
        )
        .join(
            m_calendar.Course,
            m_calendar.Lecture.course_id == m_calendar.Course.course_id,
        )
        .join(
            m_calendar.University,
            m_calendar.Course.university_id == m_calendar.University.university_id,
        )
        .outerjoin(
            m_calendar.SessionRoom,
            m_calendar.Session.session_id == m_calendar.SessionRoom.session_id,
        )
        .outerjoin(
            m_calendar.Room,
            m_calendar.SessionRoom.room_id == m_calendar.Room.room_id,
        )
        .outerjoin(
            m_calendar.SessionTag,
            m_calendar.Session.session_id == m_calendar.SessionTag.session_id,
        )
        .outerjoin(
            m_calendar.Tag,
            m_calendar.SessionTag.tag_id == m_calendar.Tag.tag_id,
        )
        .where(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.Course.course_name == normalized_name,
        )
        .group_by(
            m_calendar.Session.session_id,
            m_calendar.Lecture.lecture_name,
            m_calendar.Lecture.lecturer,
            m_calendar.Session.start_time,
            m_calendar.Session.end_time,
            m_calendar.University.university_name,
            m_calendar.Course.last_modified,
        )
        .order_by(m_calendar.Session.start_time)
    )

    result = await db.execute(stmt)
    return [row._asdict() for row in result.all()]


async def get_calendar_last_modified(
    db: AsyncSession,
    university_uuid: uuid.UUID,
    course_name: str,
) -> Optional[datetime.datetime]:
    """
    Get the last modified date of a specific course for a given university.

    :param db: Database session.
    :param university_uuid: UUID of the university.
    :param course_name: Name of the course.
    :return: Last modified date as a string.
    """
    normalized_name = course_name.replace("_", " ")

    stmt = (
        select(m_calendar.Course.last_modified)
        .join(m_calendar.University, m_calendar.Course.university_id == m_calendar.University.university_id)
        .where(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.Course.course_name == normalized_name,
        )
    )

    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_rooms_last_next_booked(
    db: AsyncSession,
    room_ids: List[int],
) -> list[m_calendar.RoomBooking]:
    """
    Get the next booked time for specific rooms.

    :param db: Database session.
    :param room_ids: List of room IDs.
    :return: List of dicts with keys: room_id, last_booked, next_booked.
    """
    res = await db.execute(
        select(
            m_calendar.SessionRoom.room_id,
            func.min(m_calendar.Session.start_time).label("last_booked"),
            func.max(m_calendar.Session.end_time).label("next_booked"),
        )
        .join(
            m_calendar.Session,
            m_calendar.SessionRoom.session_id == m_calendar.Session.session_id,
        )
        .filter(m_calendar.SessionRoom.room_id.in_(room_ids))
        .group_by(m_calendar.SessionRoom.room_id)
    )
    return [m_calendar.RoomBooking(**row._mapping) for row in res.all()]
