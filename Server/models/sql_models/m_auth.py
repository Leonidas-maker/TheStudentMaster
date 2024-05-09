from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, TIMESTAMP, Uuid, CheckConstraint, UniqueConstraint, or_
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import INTEGER as INT
from sqlalchemy.sql import func
from sqlalchemy.ext.orderinglist import ordering_list
import uuid

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import Base


class UserSecurity(Base):
    __tablename__ = "users_security"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True, nullable=False)
    password = Column(String(255), nullable=False)

    # ~~~~~~~~~~~~~~~~ Security ~~~~~~~~~~~~~~~ #
    secutity_warns = Column(Integer, default=0)  # * Number of times suspicious activity has been detected max. 10
    locked = Column(Boolean, default=False)

    # ~~~~~~~~~~~~~~ Verification ~~~~~~~~~~~~~ #
    verified = Column(Boolean, default=False)
    verify_otp = Column(String(255))  #! Equivalent to name simple_otp
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())
    _2fa_enabled = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="user_security", uselist=False)
    user_tokens = relationship(
        "UserTokens",
        back_populates="user_security",
        cascade="save-update, delete",
        order_by="UserTokens.creation_time",
        collection_class=ordering_list("creation_time"),
    )  # * Performance improved by ordering tokens by creation_time
    user_2fa = relationship("User2FA", back_populates="user_security", cascade="save-update, delete", uselist=False)
    registered_applications = relationship("UserRegisteredApplications", back_populates="user_security", cascade="save-update, delete")


class User2FA(Base):
    __tablename__ = "users_2fa"

    _2fa_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_security.user_id"), nullable=False)
    _2fa_secret = Column(String(255))
    _2fa_last_used = Column(INT(11))
    _2fa_backup = Column(String(255))
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    # Relationship to UserSecurity
    user_security = relationship("UserSecurity", back_populates="user_2fa", uselist=False)


class UserTokens(Base):
    __tablename__ = "users_token"

    token_jti = Column(Uuid, primary_key=True)
    user_id = Column(Integer, ForeignKey("users_security.user_id"), nullable=False)

    token_type = Column(String(255), nullable=False)
    token_value = Column(String(255))
    app_id = Column(Uuid, ForeignKey("users_registered_applications.app_id"))

    creation_time = Column(INT(11), nullable=False)
    expiration_time = Column(INT(11), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    user_security = relationship("UserSecurity", back_populates="user_tokens")
    registered_application = relationship("UserRegisteredApplications", back_populates="user_tokens")

    __table_args__ = (
        CheckConstraint(
            "(token_value IS NOT NULL AND app_id IS NULL) OR "
            "(token_value IS NULL AND app_id IS NOT NULL)",
            name="chk_token_type_or_app_id",
        ),
    )


class UserRegisteredApplications(Base):
    __tablename__ = "users_registered_applications"

    app_id = Column(Uuid, primary_key=True)
    users_id = Column(Integer, ForeignKey("users_security.user_id"), nullable=False)

    app_name = Column(String(255), nullable=False)
    last_location = Column(String(255)) # TODO Nullable for now, because ip to location is needed
    last_used = Column(TIMESTAMP, nullable=False)
    app_type = Column(String(12), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    user_security = relationship("UserSecurity", back_populates="registered_applications", uselist=False)
    user_tokens = relationship("UserTokens", back_populates="registered_application", cascade="save-update, delete")

    __table_args__ = (CheckConstraint(app_type.in_(['webbrowser', 'native_app']), name='check_app_type'), UniqueConstraint('users_id', 'app_name', name='uix_users_id_app_name'))