from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload, defer
import uuid

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_auth

###########################################################################
############################## Get functions ##############################
###########################################################################


def get_user(
    db: Session,
    user_uuid: uuid.UUID = None,
    user_id: int = None,
    username: str = None,
    email: str = None,
    with_uuid: bool = False,
    with_address: bool = False,
    with_avatar: bool = False,
    with_user_security: bool = False,
    with_tokens: bool = False,
    with_2fa: bool = False,
) -> m_user.User:
    # User Options
    query_options = [joinedload(m_user.User.user_uuid)] if with_uuid else []
    query_options += [joinedload(m_user.User.address)] if with_address else []
    query_options += [defer(m_user.User.avatar)] if not with_avatar else []

    # User Security Options
    if with_user_security:
        query_options += [joinedload(m_user.User.user_security)]
        if with_tokens:
            query_options += [joinedload(m_user.User.user_security).joinedload(m_auth.UserSecurity.user_tokens)]
        if with_2fa:
            query_options += [joinedload(m_user.User.user_security).joinedload(m_auth.UserSecurity.user_2fa)]

    # Build Query
    query = db.query(m_user.User).options(*query_options)
    user = None

    # Execute Query
    if user_uuid:
        if isinstance(user_uuid, str):
            user_uuid = uuid.UUID(user_uuid)
        user = (
            query.join(m_user.UserUUID, m_user.UserUUID.user_id == m_user.User.user_id)
            .filter(m_user.UserUUID.user_uuid == user_uuid)
            .first()
        )

    elif user_id:
        user = query.filter(m_user.User.user_id == user_id).first()
    elif username:
        user = query.filter(m_user.User.username == username).first()
    elif email:
        user = query.filter(m_user.User.email == email).first()

    return user


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(m_user.User).offset(skip).limit(limit).all()


def get_user_security(
    db: Session,
    user_uuid: uuid.UUID = None,
    user_id: str = None,
    with_user: bool = False,
    with_tokens: bool = False,
    with_2fa: bool = False,
) -> m_auth.UserSecurity:
    query_options = []
    query_options += [joinedload(m_auth.UserSecurity.user)] if with_user else []
    query_options += [joinedload(m_auth.UserSecurity.user_tokens)] if with_tokens else []
    query_options += [joinedload(m_auth.UserSecurity.user_2fa)] if with_2fa else []

    query = db.query(m_auth.UserSecurity).options(*query_options)
    user_security = None

    if user_id:
        user_security = query.filter_by(user_id=user_id).first()

    elif user_uuid:
        if isinstance(user_uuid, str):
            user_uuid = uuid.UUID(user_uuid)

        user_security = (
            query.join(m_user.UserUUID, m_user.UserUUID.user_id == m_auth.UserSecurity.user_id)
            .filter(m_user.UserUUID.user_uuid == user_uuid)
            .first()
        )

    if user_security:
        return user_security
    else:
        raise HTTPException(status_code=400, detail="Invalid Parameters")


def get_user_tokens(db: Session, user_uuid: uuid.UUID = None, user_id: str = None) -> m_auth.UserTokens:
    query = db.query(m_auth.UserTokens)
    user_tokens = None

    if user_id:
        user_tokens = query.filter_by(user_id=user_id).all()
    elif user_uuid:
        if isinstance(user_uuid, str):
            user_uuid = uuid.UUID(user_uuid)
        user_tokens = (
            query.join(m_user.UserUUID, m_user.UserUUID.user_id == m_auth.UserTokens.user_id)
            .filter(m_user.UserUUID.user_uuid == user_uuid)
            .all()
        )

    if user_tokens:
        return user_tokens
    else:
        raise HTTPException(status_code=400, detail="Invalid Parameters")


def get_user_2fa(db: Session, user_uuid: uuid.UUID = None, user_id: str = None) -> m_auth.User2FA:
    query = db.query(m_auth.User2FA)
    user_2fa = None

    if user_id:
        user_2fa = query.filter_by(user_id=user_id).first()
    elif user_uuid:
        if isinstance(user_uuid, str):
            user_uuid = uuid.UUID(user_uuid)
        user_2fa = (
            query.join(m_user.UserUUID, m_user.UserUUID.user_id == m_auth.User2FA.user_id)
            .filter(m_user.UserUUID.user_uuid == user_uuid)
            .first()
        )

    if user_2fa:
        return user_2fa
    else:
        raise HTTPException(status_code=400, detail="Invalid Parameters")
