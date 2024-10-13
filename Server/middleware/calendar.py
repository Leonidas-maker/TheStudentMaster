from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload, defer, load_only
from sqlalchemy import select, update
from profanity_check import predict
import json
import datetime
from typing import Union, List, Dict, Tuple
from rich.progress import Progress
from rich.console import Console
from rich.table import Table
from rich import box
from rich.panel import Panel
from rich.text import Text
import traceback

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_calendar

# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
from utils.calendar.calendar_wrapper import CalendarWrapper

###########################################################################
######################## Calendar_Users Management ########################
###########################################################################
# ======================================================== #
# ===================== Adder/Updater ==================== #
# ======================================================== #
async def add_update_user_calendar(
    db: Session, user_id: int, custom_calendar_id: int = None, native_calendar_id: int = None
) -> m_calendar.UserCalendar:
    """
    Function to add or update a user's calendar.

    This function adds a new calendar to a user or updates an existing one.

    Args:
        db (Session): Database session
        user_id (int): User ID for which to add/update the calendar
        custom_calendar_id (int, optional): ID of the custom calendar to add/update. Defaults to None.
        native_calendar_id (int, optional): ID of the native calendar to add/update. Defaults to None.
    """

    # Ensure only one of custom_calendar_id or native_calendar_id is provided
    if custom_calendar_id and native_calendar_id or not custom_calendar_id and not native_calendar_id:
        raise ValueError("Invalid calendar id combination")

    # Query the database for an existing UserCalendar entry for the given user_id
    user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    if user_calendar:
        # If an entry exists, update it with the new calendar ID
        user_calendar.custom_calendar_id = custom_calendar_id
        user_calendar.native_calendar_id = native_calendar_id
    else:
        # If no entry exists, create a new UserCalendar entry
        user_calendar = m_calendar.UserCalendar(
            user_id=user_id,
            custom_calendar_id=custom_calendar_id,
            native_calendar_id=native_calendar_id,
        )
        db.add(user_calendar)  # Stage the new entry for commit

    db.flush()  # Flush changes to the database to get the user_calendar ready for immediate use
    return user_calendar


def add_native_calendar_to_user(
    db: Session, user_id: int, course_name: int, university_id=int
) -> m_calendar.Course | None:
    """
    Function to add a native calendar to a user.

    This function adds a new native calendar to a user's calendar list.

    :param db: SQLAlchemy session object
    :param user_id: ID of the user to add the calendar to
    :param course_name: Name of the course to add
    :param university_id: ID of the
    """
    course = (
        db.query(m_calendar.Course)
        .join(m_calendar.University)
        .filter(
            m_calendar.Course.course_name == course_name,
            m_calendar.University.university_id == university_id,
        )
        .first()
    )

    # Check if calendar exists
    if course:
        add_update_user_calendar(db, user_id, native_calendar_id=course.course_id)
        db.commit()
        return course
    return None


def add_custom_calendar_to_user(db: Session, user_id: int, new_custom_calendar: s_calendar.CalendarCustomCreate):
    """
    Function to add a custom calendar to a user.

    :param db: SQLAlchemy session object
    :param user_id: ID of the user to add the calendar to
    :param new_custom_calendar: Pydantic model object containing the custom calendar data

    """
    # Check if course name does not contain profanity
    if predict([new_custom_calendar.course_name]):
        raise HTTPException(status_code=406, detail="Course name not accepted")

    # Check if backend exists
    backend = (
        db.query(m_calendar.CalendarBackend)
        .filter(m_calendar.CalendarBackend.backend_name == new_custom_calendar.source_backend)
        .first()
    )
    print(backend.calendar_backend_id)
    if backend:
        # Check if custom calendar already exists
        custom_calendar = (
            db.query(m_calendar.CalendarCustom)
            .filter(m_calendar.CalendarCustom.source_url == new_custom_calendar.source_url)
            .first()
        )

        # Create new custom calendar if it does not exist
        if not custom_calendar:

            custom_calendar_data = CalendarWrapper(backend.backend_name).get_data(new_custom_calendar.source_url)

            if not custom_calendar_data:
                raise HTTPException(status_code=400, detail="Invalid calendar source")

            university = (
                db.query(m_calendar.University)
                .filter(m_calendar.University.university_id == new_custom_calendar.university_id)
                .first()
            )

            custom_calendar = m_calendar.CalendarCustom(
                university_id=university.university_id if university else None,
                course_name=new_custom_calendar.course_name,
                source_backend_id=backend.calendar_backend_id,
                source_url=new_custom_calendar.source_url,
                data=custom_calendar_data.get("data"),
                hash=custom_calendar_data.get("hash"),
                refresh_interval=15,  # TODO: Implement refresh interval (out of scope for now)
                last_updated=datetime.datetime.now(),
                verified=False,
                last_modified=datetime.datetime.now(),
            )
            db.add(custom_calendar)  # Stage the new UserCalendar entry for commit
            db.flush()  # Flush changes to the database to get the custom_calendar ready for immediate use

        # Add custom calendar to user
        add_update_user_calendar(db, user_id, custom_calendar_id=custom_calendar.calendar_custom_id)
        db.commit()  # Commit the changes to the database

        # Return the custom calendar
        return custom_calendar
    else:
        raise HTTPException(status_code=400, detail="Invalid backend source")