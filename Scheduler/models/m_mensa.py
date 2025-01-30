from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, TIMESTAMP, DateTime, Float, UniqueConstraint
from sqlalchemy.orm import relationship
import hashlib

from config.database import Base


class Mensa(Base):
    __tablename__ = "mensa"

    # Primary key and basic information columns
    mensa_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    site = Column(String(255), primary_key=True, index=True)
    mensa_name = Column(String(255), nullable=False)
    canteen_short_name = Column(String(255))
    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=False)
    opening_hours = Column(String(255))
    info_url = Column(String(255))
    menu_url = Column(String(255))

    hash = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    # Relationship with Address table
    address = relationship("Address", cascade="save-update")
    menus = relationship("Menu", cascade="save-update", uselist=True, back_populates="mensa")

    def __init__(
        self, site, mensa_name, canteen_short_name, address_id, opening_hours, info_url, menu_url, last_modified
    ):
        self.site = site
        self.mensa_name = mensa_name
        self.canteen_short_name = canteen_short_name
        self.address_id = address_id
        self.opening_hours = opening_hours
        self.info_url = info_url
        self.menu_url = menu_url
        self.hash = self.generate_sha1_hash(last_modified)
        self.last_modified = last_modified

    @staticmethod
    def generate_sha1_hash(last_modified):
        hash_input = f"{last_modified}"
        return hashlib.sha1(hash_input.encode()).hexdigest()

    def as_dict(self) -> dict:
        # Return basic mensa information as a dictionary
        return {
            "mensa_id": self.mensa_id,
            "site": self.site,
            "mensa_name": self.mensa_name,
            "canteen_short_name": self.canteen_short_name,
            "opening_hours": self.opening_hours,
            "address_id": self.address_id,
            "info_url": self.info_url,
            "menu_url": self.menu_url,
            "hash": self.hash,
        }

    def as_dict_complete(self) -> dict:
        # Return complete mensa information including address details
        address = self.address.as_dict_complete()
        return {
            "mensa_id": self.mensa_id,
            "site": self.site,
            "mensa_name": self.mensa_name,
            "canteen_short_name": self.canteen_short_name,
            "opening_hours": self.opening_hours,
            "address_id": self.address_id,
            "info_url": self.info_url,
            "menu_url": self.menu_url,
            "hash": self.hash,
            "address": {
                "address1": address["address1"],
                "address2": address["address2"],
                "district": address["district"],
                "postal_code": address["postal_code"],
                "city": address["city"],
                "country": address["country"],
            },
        }

    def as_dict_hash(self) -> dict:
        return {
            "canteen_short_name": self.canteen_short_name,
            "hash": self.hash,
        }


class Dish(Base):
    __tablename__ = "mensa_dishes"
    __table_args__ = (
        UniqueConstraint(
            "name", "dish_type", "price_student", "price_employee", "price_guest", name="uq_dish_composite"
        ),
    )

    # Primary key and dish information columns
    dish_id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(510), nullable=False)
    image = Column(String(255))
    dish_type = Column(String(255))
    price_student = Column(Float)
    price_employee = Column(Float)
    price_guest = Column(Float)
    co2_portion = Column(Integer, nullable=True)
    co2_100g = Column(Integer, nullable=True)
    allergens = Column(String(255))
    additives = Column(String(255))

    hash = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    menus_relation = relationship("Menu", cascade="save-update", uselist=True, back_populates="dish")

    def __init__(
        self,
        name,
        image,
        dish_type,
        price_student,
        price_employee,
        price_guest,
        co2_portion,
        co2_100g,
        allergens,
        additives,
        last_modified,
    ):
        self.name = name
        self.image = image
        self.dish_type = dish_type
        self.price_student = price_student
        self.price_employee = price_employee
        self.price_guest = price_guest
        self.co2_portion = co2_portion
        self.co2_100g = co2_100g
        self.allergens = allergens
        self.additives = additives
        self.hash = self.generate_sha1_hash(last_modified)
        self.last_modified = last_modified

    def generate_sha1_hash(self, last_modified):
        hash_input = f"{last_modified}"
        return hashlib.sha1(hash_input.encode()).hexdigest()

    def as_dict(self) -> dict:
        return {
            "dish_id": self.dish_id,
            "description": self.name,
            "image": self.image,
            "dish_type": self.dish_type,
            "price": self.price_student,
            "price_employee": self.price_employee,
            "price_guest": self.price_guest,
            "co2_portion": self.co2_portion,
            "co2_100g": self.co2_100g,
            "allergens": self.allergens,
            "additives": self.additives,
            "hash": self.hash,
        }


class Menu(Base):
    __tablename__ = "mensa_menus"

    # Primary key and menu information columns
    menu_id = Column(Integer, primary_key=True, index=True)
    mensa_id = Column(Integer, ForeignKey("mensa.mensa_id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("mensa_dishes.dish_id"), nullable=False)
    serving_date = Column(DateTime, nullable=False)
    hash = Column(String(255), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    mensa = relationship("Mensa", cascade="save-update", uselist=False, back_populates="menus")
    dish = relationship("Dish", cascade="save-update", uselist=False, back_populates="menus_relation")

    def __init__(self, mensa_id, dish_id, serving_date, last_modified):
        self.mensa_id = mensa_id
        self.dish_id = dish_id
        self.serving_date = serving_date
        self.last_modified = last_modified
        self.hash = self.generate_sha1_hash(last_modified)

    def generate_sha1_hash(self, last_modified):
        hash_input = f"{last_modified}"
        return hashlib.sha1(hash_input.encode()).hexdigest()

    def as_dict(self) -> dict:
        # Return menu information as a dictionary
        return {
            "menu_id": self.menu_id,
            "mensa_id": self.mensa_id,
            "dish_id": self.dish_id,
            "serving_date": self.serving_date,
            "hash": self.hash,
        }
