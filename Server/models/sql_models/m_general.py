from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from config.database import Base
from sqlalchemy.orm import relationship


class Address(Base):
    __tablename__ = "addresses"

    address_id = Column(Integer, primary_key=True, index=True)
    address1 = Column(String(255), nullable=False)
    address2 = Column(String(255))
    district = Column(String(255), nullable=False)
    postal_code = Column(String(255), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.city_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    city = relationship("City")

    def as_dict(self):
        return {
            "address_id": self.address_id,
            "address1": self.address1,
            "address2": self.address2,
            "district": self.district,
            "postal_code": self.postal_code,
            "city_id": self.city_id,
        }

    def as_dict_complete(self):
        return {
            "address_id": self.address_id,
            "address1": self.address1,
            "address2": self.address2,
            "district": self.district,
            "postal_code": self.postal_code,
            "city_id": self.city_id,
            "city": self.city.as_dict_complete(),
        }


class City(Base):
    __tablename__ = "cities"

    city_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(255), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    country = relationship("Country")

    def as_dict(self):
        return {
            "city_id": self.city_id,
            "city": self.city,
            "country_id": self.country_id,
        }

    def as_dict_complete(self):
        return {
            "city_id": self.city_id,
            "city": self.city,
            "country_id": self.country_id,
            "country": self.country.as_dict(),
        }


class Country(Base):
    __tablename__ = "countries"

    country_id = Column(Integer, primary_key=True, index=True)
    country = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    def as_dict(self):
        return {
            "country_id": self.country_id,
            "country": self.country,
        }
