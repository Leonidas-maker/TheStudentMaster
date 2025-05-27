from fastapi import APIRouter, Depends, Response, HTTPException
from typing import List
import uuid
from fastapi_cache.decorator import cache
from datetime import datetime

from controllers import calendar as ctrl_calendar
from crud import calendar as crud_calendar

from core.generic import EndpointContext

from schemas import s_generic, s_calendar

from middleware.general import get_endpoint_context


from utils.cache_keybuilder import request_key_builder
from utils.exceptions import handle_exception

router = APIRouter()


@router.get("/available_calendars", response_model=List[s_calendar.ResAvailableNativeCalendars], tags=["Calendar"])
@cache(expire=60, key_builder=request_key_builder)
async def api_get_available_calendars(ep_context: EndpointContext = Depends(get_endpoint_context)):
    try:
        universities = await crud_calendar.get_available_calendars(ep_context.db)
        return [s_calendar.ResAvailableNativeCalendars.model_validate(university) for university in universities]
    except Exception as e:
        await handle_exception(e, ep_context, "Failed to search clubs")


@router.get("/{university_uuid}/{course_name}", response_model=s_calendar.ResCalendar, tags=["Calendar"])
async def api_get_calendar(
    university_uuid: uuid.UUID,
    course_name: str,
    response: Response,
    ep_context: EndpointContext = Depends(get_endpoint_context),
):
    try:
        return await ctrl_calendar.get_calendar_by_university_and_course(
            ep_context, university_uuid, course_name, response
        )
    except Exception as e:
        await handle_exception(e, ep_context, "Failed to get calendar")


@router.get("/{university_uuid}/{course_name}/hash", response_model=s_generic.MessageResponse, tags=["Calendar"])
@cache(expire=60, key_builder=request_key_builder)
async def api_get_calendar_hash(
    university_uuid: uuid.UUID, course_name: str, ep_context: EndpointContext = Depends(get_endpoint_context)
):
    try:
        calendar_hash = await crud_calendar.get_calendar_last_modified(ep_context.db, university_uuid, course_name)
        if calendar_hash is None:
            raise HTTPException(status_code=404, detail="Course not found")

        return s_generic.MessageResponse(message=calendar_hash.isoformat())
    except Exception as e:
        await handle_exception(e, ep_context, "Failed to get calendar hash")


@router.get("/rooms/free/{university_uuid}", response_model=List[s_calendar.RoomAvailabilityResponse], tags=["Calendar"])
@cache(expire=60, key_builder=request_key_builder)
async def api_get_free_rooms_by_university(
    university_uuid: uuid.UUID,
    start_time: datetime,
    end_time: datetime,
    ep_context: EndpointContext = Depends(get_endpoint_context),
):
    try:
        return await ctrl_calendar.get_free_rooms(ep_context.db, university_uuid, start_time, end_time)
    except Exception as e:
        await handle_exception(e, ep_context, "Failed to get free rooms")
