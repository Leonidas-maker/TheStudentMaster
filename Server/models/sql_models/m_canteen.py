from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship

from config.database import Base


class Canteen(Base):
    __tablename__ = "canteen"

    canteen_id = Column(Integer, primary_key=True, index=True)
    canteen_name = Column(String(255), nullable=False)
    image_url = Column(String(255))
    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    address = relationship("Address", back_populates="canteen")


class Dish(Base):
    __tablename__ = "canteen_dishes"

    dish_id = Column(Integer, primary_key=True, nullable=False)
    dish_name = Column(String(255), nullable=False)
    image_url = Column(String(255))
    description = Column(String(255))
    
    last_modified = Column(TIMESTAMP, nullable=False)


class Menu(Base):
    __tablename__ = "canteen_menus"
    
    menu_id = Column(Integer, primary_key=True, index=True)
    canteen_id = Column(Integer, ForeignKey("canteens.canteen_id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("dishes.dish_id"), nullable=False)
    dish_type = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    serving_date = Column(TIMESTAMP, nullable=False)
    
    last_modified = Column(TIMESTAMP, nullable=False)
    
    canteen = relationship("Canteen", back_populates="canteen_menu")
    dish = relationship("Dish", back_populates="dish_menu")
    
