from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP, DateTime
from sqlalchemy.orm import relationship
import hashlib

from config.database import Base


class Canteen(Base):
    __tablename__ = "canteens"

    # Primary key and basic information columns
    canteen_id = Column(Integer, primary_key=True, index=True)
    canteen_name = Column(String(255), nullable=False)
    canteen_short_name = Column(String(255))
    image_url = Column(String(255))
    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=False)
    hash = Column(String(255), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    # Relationship with Address table
    address = relationship("Address", cascade="save-update")
    menus = relationship("Menu", cascade="save-update", uselist=True, back_populates="canteen")

    def __init__(self, canteen_name, canteen_short_name, address_id, image_url=None):
        self.canteen_name = canteen_name
        self.canteen_short_name = canteen_short_name
        self.image_url = image_url
        self.address_id = address_id
        self.hash = self.generate_sha1_hash(canteen_name, canteen_short_name, image_url, address_id)

    @staticmethod
    def generate_sha1_hash(canteen_name, canteen_short_name, image_url, address_id):
        hash_input = f"{canteen_name}{canteen_short_name}{image_url if image_url else ''}{address_id}"
        return hashlib.sha1(hash_input.encode()).hexdigest()

    def as_dict(self) -> dict:
        # Return basic canteen information as a dictionary
        return {
            "canteen_id": self.canteen_id,
            "canteen_name": self.canteen_name,
            "canteen_short_name": self.canteen_short_name,
            "image_url": self.image_url,
            "address_id": self.address_id,
            "hash": self.hash,
        }

    def as_dict_complete(self) -> dict:
        # Return complete canteen information including address details
        address = self.address.as_dict_complete()
        return {
            "canteen_id": self.canteen_id,
            "canteen_name": self.canteen_name,
            "canteen_short_name": self.canteen_short_name,
            "image_url": self.image_url,
            "address_id": self.address_id,
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
    __tablename__ = "canteen_dishes"

    # Primary key and dish information columns
    dish_id = Column(Integer, primary_key=True, nullable=False)
    description = Column(String(510))
    image_url = Column(String(255))
    price = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    menu = relationship("Menu", cascade="save-update", uselist=True, back_populates="dish")

    def as_dict(self) -> dict:
        return {
            "dish_id": self.dish_id,
            "description": self.description,
            "image_url": self.image_url,
            "price": self.price,
        }


class Menu(Base):
    __tablename__ = "canteen_menus"

    # Primary key and menu information columns
    menu_id = Column(Integer, primary_key=True, index=True)
    canteen_id = Column(Integer, ForeignKey("canteens.canteen_id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("canteen_dishes.dish_id"), nullable=False)
    dish_type = Column(String(255), nullable=False)
    serving_date = Column(DateTime, nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    canteen = relationship("Canteen", cascade="save-update", uselist=False, back_populates="menus")
    dish = relationship("Dish", cascade="save-update", uselist=False, back_populates="menu")

    def as_dict(self) -> dict:
        # Return menu information as a dictionary
        return {
            "menu_id": self.menu_id,
            "canteen_id": self.canteen_id,
            "dish_id": self.dish_id,
            "dish_type": self.dish_type,
            "serving_date": self.serving_date,
        }
