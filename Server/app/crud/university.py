from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists, and_
import uuid
import datetime


from models import m_calendar


async def get_university_by_id(db: AsyncSession, university_id: uuid.UUID) -> Optional[m_calendar.University]:
    """Fetch a university by its UUID.

    :param db: The database session.
    :param university_id: UUID of the university.
    :return: The university object or None if not found.
    """
    res = await db.execute(
        select(m_calendar.University).filter(m_calendar.University.id == university_id)
    )
    return res.scalar_one_or_none()


async def university_exists(db: AsyncSession, university_id: uuid.UUID) -> bool:
    """Check if a university exists by its UUID.

    :param db: The database session.
    :param university_id: UUID of the university.
    :return: True if the university exists, False otherwise.
    """
    res = await db.execute(
        select(
            exists(
                select(1)
                .select_from(m_calendar.University)
                .filter(m_calendar.University.id == university_id)
            )
        )
    )
    return res.scalar_one_or_none() is not None


async def get_university_free_rooms(
    db: AsyncSession, university_id: uuid.UUID, start_time: datetime.datetime, end_time: datetime.datetime
) -> List[m_calendar.Room]:
    """Retrieve a list of free rooms for a specific university within a time range.

    :param db: The database session.
    :param university_id: UUID of the university.
    :param start_time: The start time for room availability.
    :param end_time: The end time for room availability.
    :return: A list of free rooms.
    """
    res = await db.execute(
        select(m_calendar.Room)
        .join(m_calendar.Room.university)
        .where(
            m_calendar.University.id == university_id,
            # kein Session-Objekt mit zeitlichem Overlap
            ~m_calendar.Room.sessions.any(
                and_(m_calendar.Session.start_time < end_time, m_calendar.Session.end_time > start_time)
            ),
        )
    )

    return list(res.scalars().all())
