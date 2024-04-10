from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP, DateTime
from sqlalchemy.orm import relationship

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import Base


class Canteen(Base):
    __tablename__ = "canteens"

    canteen_id = Column(Integer, primary_key=True, index=True)
    canteen_name = Column(String(255), nullable=False)
    canteen_short_name = Column(String(255))
    image_url = Column(String(255))
    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    address = relationship("Address", cascade="save-update")

    def as_dict(self) -> dict:
        return {
            "canteen_id": self.canteen_id,
            "canteen_name": self.canteen_name,
            "canteen_short_name": self.canteen_short_name,
            "image_url": self.image_url,
            "address_id": self.address_id,
        }

    def as_dict_complete(self) -> dict:
        address = self.address.as_dict_complete()
        return {
            "canteen_id": self.canteen_id,
            "canteen_name": self.canteen_name,
            "canteen_short_name": self.canteen_short_name,
            "image_url": self.image_url,
            "address_id": self.address_id,
            "address": {
                "address1": address["address1"],
                "address2": address["address2"],
                "district": address["district"],
                "postal_code": address["postal_code"],
                "city": address["city"],
                "country": address["country"],
            },
        }


class Dish(Base):
    __tablename__ = "canteen_dishes"

    dish_id = Column(Integer, primary_key=True, nullable=False)
    description = Column(String(255))
    image_url = Column(String(255))
    price = Column(String(255), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)


class Menu(Base):
    __tablename__ = "canteen_menus"

    menu_id = Column(Integer, primary_key=True, index=True)
    canteen_id = Column(Integer, ForeignKey("canteens.canteen_id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("canteen_dishes.dish_id"), nullable=False)
    dish_type = Column(String(255), nullable=False)
    serving_date = Column(DateTime, nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    canteen = relationship("Canteen")
    dish = relationship("Dish")

    def as_dict(self) -> dict:
        return {
            "menu_id": self.menu_id,
            "canteen_id": self.canteen_id,
            "dish_id": self.dish_id,
            "dish_type": self.dish_type,
            "serving_date": self.serving_date,
        }
