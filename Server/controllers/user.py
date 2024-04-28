import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException

# ~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user, s_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address
from middleware.auth import check_password
from middleware.calendar import add_native_calendar_to_user, add_custom_calendar_to_user


# ======================================================== #
# ======================= Register ======================= #
# ======================================================== #

def create_user(db: Session, user: s_user.UserCreate) -> tuple[m_user.User, str]:
    if user.address:
        new_address = create_address(db, user.address)

    # Create new user
    new_user = m_user.User(
        username=user.username,
        email=user.email,
        address_id=new_address.address_id if user.address else None,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    new_user_uuid = m_user.UserUUID(
        user_id=new_user.user_id,
    )
    db.add(new_user_uuid)
    db.flush()

    # Create new user_security
    new_user_security = m_user.UserSecurity(
        user_id=new_user.user_id,
        password=bcrypt.hashpw(user.security.password.encode("utf-8"), bcrypt.gensalt()),
    )

    db.add(new_user_security)
    db.commit()

    return new_user, new_user_uuid.user_uuid


# ======================================================== #
# ====================== Update User ===================== #
# ======================================================== #

def update_user(db: Session, user: m_user.User, new_user: s_user.UserUpdate):
    if (new_user.username or new_user.email) and not new_user.new_password:
        if not check_password(new_user.old_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        raise HTTPException(status_code=403, detail="Forbidden")

    if new_user.address:
        address = create_address(db, new_user.address)
        user.address_id = address.address_id

    if new_user.avatar:
        user.avatar = new_user.avatar

    db.commit() 
    db.refresh(user)
    return user

def update_user_calendar(db: Session, user: m_user.User, new_user_calendar: s_calendar.NativeCalenderIdentifier | s_calendar.CalendarCustomCreate):
    # Add new calendar to user
    if isinstance(new_user_calendar, s_calendar.NativeCalenderIdentifier):
        calendar = add_native_calendar_to_user(db, user.user_id, new_user_calendar.course_name, new_user_calendar.university_uuid)
    else:
        calendar =  add_custom_calendar_to_user(db, user.user_id, new_user_calendar)
        
    # Return response
    res_calendar = s_calendar.ResUserCalendar(
        university_name=calendar.university.university_name,
        university_uuid=calendar.university.university_uuid,
        course_name=calendar.course_name,
        data=calendar.data,
        hash=calendar.hash,
        last_modified=calendar.last_modified
    )
    return res_calendar