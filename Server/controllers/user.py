import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException
import datetime

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config import security

# ~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_auth

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user, s_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address
from middleware.auth import check_password, change_password
from middleware.calendar import add_native_calendar_to_user, add_custom_calendar_to_user
from middleware.user import get_user_security

# ======================================================== #
# ======================= Register ======================= #
# ======================================================== #


# Function to create a new user
def create_user(db: Session, user: s_user.UserCreate) -> tuple[m_user.User, str]:
    if user.address:
        new_address = create_address(db, user.address)

    # Create a new user in the database
    new_user = m_user.User(
        username=user.username,
        email=user.email,
        address_id=new_address.address_id if user.address else None,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Create a new user UUID
    new_user_uuid = m_user.UserUUID(
        user_id=new_user.user_id,
    )
    db.add(new_user_uuid)
    db.flush()

    # Create new user security details
    new_user_security = m_auth.UserSecurity(
        user_id=new_user.user_id,
        password=bcrypt.hashpw(user.security.password.encode("utf-8"), bcrypt.gensalt()),
    )

    db.add(new_user_security)
    db.flush()

    return new_user, new_user_uuid.user_uuid, new_user_security


# ======================================================== #
# ====================== Update User ===================== #
# ======================================================== #


# Function to update a user without authentication checks
def update_user_normal(db: Session, user: m_user.User, new_user: s_user.UserUpdate):
    if new_user.address:
        address = create_address(db, new_user.address)
        user.address_id = address.address_id

    if new_user.avatar:
        user.avatar = new_user.avatar

    db.flush()


# Function to update a user with authentication checks
def update_user_with_auth(db: Session, user: m_user.User, new_user: s_user.UserUpdate):
    user_security = get_user_security(db, user_id=user.user_id)
    min_update_time = user_security.last_modified + datetime.timedelta(hours=security.MAX_SECURITY_CHANGE_HOURS)
    if min_update_time > datetime.datetime.now():
        raise HTTPException(status_code=401, detail="Unauthorized")

    if check_password(db, new_user.old_password, user_security=user_security):
        if new_user.new_password:
            change_password(db, user_security, new_user.new_password)
        elif new_user.username:
            user.username = new_user.username
            user_security.last_modified = datetime.datetime.now()
        elif new_user.email:
            user.email = new_user.email
            user_security.last_modified = datetime.datetime.now()
        db.flush()
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


# Function to update a user based on check result
def update_user(db: Session, user: m_user.User, new_user: s_user.UserUpdate, check_result: int):
    # Based on the check_result, update user normally or with authentication checks
    if check_result == 1:
        update_user_normal(db, user, new_user)
    elif check_result == 2:
        update_user_with_auth(db, user, new_user)
    elif check_result == 3:
        update_user_with_auth(db, user, new_user)
        update_user_normal(db, user, new_user)
    else:
        raise ValueError("Invalid check_result value")

    db.commit()
    db.refresh(user)
    return user


# Function to update a user's calendar
def update_user_calendar(
    db: Session,
    user: m_user.User,
    new_user_calendar: s_calendar.NativeCalenderIdentifier | s_calendar.CalendarCustomCreate,
) -> s_calendar.ResCalendar:
    """
    Function to update a user's calendar

    :param db: Database session
    :param user: User object
    :param new_user_calendar: s_calendar.NativeCalenderIdentifier | s_calendar.CalendarCustomCreate object
    """

    if isinstance(new_user_calendar, s_calendar.NativeCalenderIdentifier):
        calendar = add_native_calendar_to_user(
            db, user.user_id, new_user_calendar.course_name, new_user_calendar.university_uuid
        )
    else:
        calendar = add_custom_calendar_to_user(db, user.user_id, new_user_calendar)

    if not calendar:
        raise HTTPException(status_code=404, detail="Not Found")

    # Return response with calendar details
    res_calendar = s_calendar.ResCalendar(
        university_name=calendar.university.university_name if calendar.university else None,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified,
    )
    return res_calendar
