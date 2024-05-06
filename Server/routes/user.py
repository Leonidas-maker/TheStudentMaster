from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_calendar

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user, s_calendar


# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db
from middleware.auth import check_access_token, check_refresh_token
from middleware.calendar import get_calendar

# ~~~~~~~~~~~~~~ Controllers ~~~~~~~~~~~~~~ #
from controllers.user import update_user, update_user_calendar

###########################################################################
################################### MAIN ##################################
###########################################################################

users_router = APIRouter()

# For token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ======================================================== #
# ========================== Me ========================== #
# ======================================================== #
@users_router.get("/me", response_model=s_user.ResGetUser)
def read_me(
    address: bool = False,
    avatar: bool = False,
    access_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = check_access_token(db, access_token, with_uuid=True, with_address=address, with_avatar=avatar)
    return s_user.ResGetUser(**user.as_dict(address))


@users_router.put("/me", response_model=s_user.ResGetUser)
def update_me(
    new_user: s_user.UserUpdate, access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    new_user_check_result = new_user.are_fields_correct_set()
    if new_user_check_result > 0:
        user = check_access_token(db, access_token, with_uuid=True)
        user = update_user(db, user, new_user, new_user_check_result)
        return s_user.ResGetUser(**user.as_dict(True))
    else:
        raise HTTPException(status_code=400, detail="No attributes to update or incorrect attribute combination")


@users_router.delete("/me", response_model=dict[str, str])
def delete_me(refresh_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_refresh_token(db, refresh_token)
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ======================================================== #
# ======================= Calendar ======================= #
# ======================================================== #

@users_router.post("/calendar", response_model=s_calendar.ResUserCalendar)
def add_user_calendar(
    new_calendar: s_calendar.CalendarCustomCreate | s_calendar.NativeCalenderIdentifier,
    access_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = check_access_token(db, access_token, with_uuid=True)
    return update_user_calendar(db, user, new_calendar)

@users_router.get("/calendar", response_model=s_calendar.ResUserCalendar)
def get_user_calendars(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    calendar = get_calendar(db, user.user_id, with_university=True, with_data=True)

    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")

    res_calendar = s_calendar.ResUserCalendar(
        university_name=calendar.university.university_name,
        university_uuid=calendar.university.university_uuid,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified,
    )

    return res_calendar

@users_router.get("/calendar/hash", response_model=str)
def get_user_calendar_hash(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    calendar = get_calendar(db, user.user_id)

    return calendar.hash


@users_router.delete("/calendar", response_model=dict[str, str])
def delete_user_calendar(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user.user_id).first()
    db.delete(user_calendar)
    db.commit()
    return {"message": "Calendar removed"}