from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

# ~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~ #
from controllers.calendar import (
    fetch_available_calendars,
    fetch_calendar_by_university_and_course,
    fetch_calendar_hash,
)

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general, s_calendar

calendar_router = APIRouter()


@calendar_router.get("/available_calendars", response_model=List[s_calendar.ResAvailableNativeCalendars])
def get_available_calendars(db: Session = Depends(get_db)):
    return fetch_available_calendars(db)


@calendar_router.get("/{university_uuid}/{course_name}", response_model=s_calendar.ResCalendar)
def get_calendar(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    return fetch_calendar_by_university_and_course(university_uuid, course_name, db)


@calendar_router.get("/{university_uuid}/{course_name}/hash", response_model=s_general.BasicMessage)
def get_calendar_hash(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    return fetch_calendar_hash(university_uuid, course_name, db)
