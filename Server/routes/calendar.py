from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime
from fastapi_cache.decorator import cache

# ~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~ #
from controllers.calendar import (
    get_available_calendars,
    get_calendar_by_university_and_course,
    get_calendar_hash,
    get_free_rooms,
)

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general, s_calendar

calendar_router = APIRouter()


@calendar_router.get("/available_calendars", response_model=List[s_calendar.ResAvailableNativeCalendars])
async def api_get_available_calendars(db: Session = Depends(get_db)):
    return await get_available_calendars(db)


@calendar_router.get("/{university_uuid}/{course_name}", response_model=s_calendar.ResCalendar)
async def api_get_calendar(
    university_uuid: uuid.UUID,
    course_name: str,
    response: Response,
    db: Session = Depends(get_db),
):
    return await get_calendar_by_university_and_course(db, university_uuid, course_name, response)


@calendar_router.get("/{university_uuid}/{course_name}/hash", response_model=s_general.BasicMessage)
async def api_get_calendar_hash(university_uuid: uuid.UUID, course_name: str, db: Session = Depends(get_db)):
    return await get_calendar_hash(db, university_uuid, course_name)


@calendar_router.get("/rooms/free/{university_uuid}", response_model=List[s_calendar.RoomAvailabilityResponse])
async def api_get_free_rooms_by_university(
    university_uuid: uuid.UUID, start_time: datetime, end_time: datetime, db: Session = Depends(get_db)
):
    return await get_free_rooms(db, university_uuid, start_time, end_time)
