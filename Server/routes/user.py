from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_calendar

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user, s_calendar, s_general, s_canteen


# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db
from middleware.auth import check_access_token, check_password
from middleware.calendar import get_calendar
from middleware.canteen import get_canteen

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
def update_me(new_user: s_user.UserUpdate, access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    new_user_check_result = new_user.are_fields_correct_set()
    if new_user_check_result > 0:
        user = check_access_token(db, access_token, with_uuid=True)
        user = update_user(db, user, new_user, new_user_check_result)
        return s_user.ResGetUser(**user.as_dict(True))
    else:
        raise HTTPException(status_code=400, detail="No attributes to update or incorrect attribute combination")


@users_router.delete("/me", response_model=s_general.BasicMessage)
def delete_me(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ======================================================== #
# ======================= Calendar ======================= #
# ======================================================== #


@users_router.post("/calendar", response_model=s_calendar.ResCalendar)
def add_user_calendar(
    new_calendar: s_calendar.CalendarCustomCreate | s_calendar.NativeCalenderIdentifier,
    access_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = check_access_token(db, access_token, with_uuid=True)
    return update_user_calendar(db, user, new_calendar)


@users_router.get("/calendar", response_model=s_calendar.ResCalendar)
def get_user_calendars(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    calendar = get_calendar(db, user.user_id, with_university=True, with_data=True)

    if calendar:
        res_calendar = s_calendar.ResCalendar(
            university_name=calendar.university.university_name if calendar.university else None,
            course_name=calendar.course_name,
            data=calendar.data,
            hash=calendar.hash,
            last_modified=calendar.last_modified,
        )

        return res_calendar
    else:
        raise HTTPException(status_code=404, detail="Calendar not found")


@users_router.get("/calendar/hash", response_model=s_general.BasicMessage)
def get_user_calendar_hash(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    calendar = get_calendar(db, user.user_id)
    if calendar:
        return {"message": calendar.hash}
    else:
        raise HTTPException(status_code=404, detail="Calendar not found")


@users_router.delete("/calendar", response_model=s_general.BasicMessage)
def delete_user_calendar(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user.user_id).first()
    db.delete(user_calendar)
    db.commit()
    return {"message": "Calendar removed"}


# ======================================================== #
# ======================== Canteen ======================= #
# ======================================================== #


@users_router.get("/canteen", response_model=s_canteen.ResGetCanteen)
def get_user_canteen(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    if not user.canteen_id:
        raise HTTPException(status_code=404, detail="No canteen assigned to user")
    canteen = get_canteen(db, user.canteen_id)
    return s_canteen.ResGetCanteen(**canteen.as_dict())


@users_router.put("/canteen", response_model=s_canteen.ResGetCanteen)
def add_user_canteen(
    canteen_short_name: str, access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    user = check_access_token(db, access_token)
    canteen = get_canteen(db, canteen_short_name)

    user.canteen_id = canteen.canteen_id
    db.commit()

    # TODO Get canteen menus @xxchillkroetexx
    return s_canteen.ResGetCanteen(**canteen.as_dict())


@users_router.delete("/canteen", response_model=s_general.BasicMessage)
def delete_user_canteen(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = check_access_token(db, access_token)
    user.canteen_id = None
    db.commit()

    return {"message": "Canteen removed"}
