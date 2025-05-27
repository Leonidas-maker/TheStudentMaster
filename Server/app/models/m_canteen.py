from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
import hashlib
import datetime
from typing import List, Optional

from config.database import Base

from .m_generic import Address


class Canteen(Base):
    __tablename__ = "canteens"

    # Primary key and basic information columns
    canteen_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    canteen_name: Mapped[str] = mapped_column(String(255), nullable=False)
    canteen_short_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    image_url: Mapped[str | None] = mapped_column(String(255))
    address_id: Mapped[int] = mapped_column(Integer, ForeignKey("addresses.address_id"), nullable=False)

    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)

    # Relationship with Address table
    address: Mapped["Address"] = relationship("Address", cascade="save-update")
    menus: Mapped[List["Menu"]] = relationship("Menu", cascade="save-update", back_populates="canteen", uselist=True)

class Menu(Base):
    __tablename__ = "canteen_menus"

    # Primary key and menu information columns
    menu_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    canteen_id: Mapped[int] = mapped_column(Integer, ForeignKey("canteens.canteen_id"), nullable=False)
    dish_id: Mapped[int] = mapped_column(Integer, ForeignKey("canteen_dishes.dish_id"), nullable=False)
    dish_type: Mapped[str] = mapped_column(String(255), nullable=False)
    serving_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)

    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)

    canteen: Mapped["Canteen"] = relationship("Canteen", cascade="save-update", back_populates="menus")
    dish: Mapped["Dish"] = relationship("Dish", cascade="save-update", back_populates="menu")

class Dish(Base):
    __tablename__ = "canteen_dishes"

    # Primary key and dish information columns
    dish_id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    description: Mapped[str] = mapped_column(String(510), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255))
    price: Mapped[str] = mapped_column(String(255), nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False)

    menu: Mapped[List["Menu"]] = relationship("Menu", cascade="save-update", back_populates="dish", uselist=True)



