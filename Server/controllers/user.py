import bcrypt
from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address


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


def update_user(db: Session, user: s_user.User):
    # TODO Check if something changed
    pass
