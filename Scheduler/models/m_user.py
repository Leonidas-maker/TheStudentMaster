from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, TIMESTAMP, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import MEDIUMBLOB, INTEGER as INT
from sqlalchemy.sql import func
import uuid

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import Base
from config.security import *

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.m_general import *


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    avatar = Column(MEDIUMBLOB)  # TODO Will be implemented later

    address_id = Column(Integer, ForeignKey("addresses.address_id"))
    canteen_id = Column(Integer, ForeignKey("canteens.canteen_id"))

    is_active = Column(Boolean, default=True)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    user_uuid = relationship("UserUUID", back_populates="user", uselist=False, cascade="save-update, delete")
    address = relationship("Address", uselist=False)
    canteen = relationship("Canteen", uselist=False)

    def as_dict(self, address=False):
        if address:
            return {
                "username": self.username,
                "email": self.email,
                "user_uuid": self.user_uuid.user_uuid,
                "avatar": self.avatar,
                "address": self.address.as_dict_complete() if self.address else None,
            }
        else:
            return {
                "username": self.username,
                "email": self.email,
                "user_uuid": self.user_uuid.user_uuid,
                "avatar": self.avatar,
            }


class UserUUID(Base):
    __tablename__ = "users_uuid"

    user_uuid = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    user = relationship("User", back_populates="user_uuid", uselist=False, cascade="save-update")
