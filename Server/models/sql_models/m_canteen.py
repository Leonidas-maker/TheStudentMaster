from sqlalchemy import Column, Date, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship

from config.database import Base


class Canteen(Base):
    __tablename__ = "canteens"

    canteen_id = Column(Integer, primary_key=True, index=True)
    canteen_name = Column(String(255), nullable=False)
    canteen_short_name = Column(String(255))
    image_url = Column(String(255))
    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    address = relationship("Address")


class Dish(Base):
    __tablename__ = "canteen_dishes"

    dish_id = Column(Integer, primary_key=True, nullable=False)
    description = Column(String(255))
    image_url = Column(String(255))
    price = Column(Integer, nullable=False)
         
    last_modified = Column(TIMESTAMP, nullable=False)


class Menu(Base):
    __tablename__ = "canteen_menus"
    
    menu_id = Column(Integer, primary_key=True, index=True)
    canteen_id = Column(Integer, ForeignKey("canteens.canteen_id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("canteen_dishes.dish_id"), nullable=False)
    dish_type = Column(String(255), nullable=False)
    serving_date = Column(Date, nullable=False)
    
    last_modified = Column(TIMESTAMP, nullable=False)
    
    canteen = relationship("Canteen")
    dish = relationship("Dish")
    
