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


class City(Base):
    __tablename__ = "cities"

    city_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(255), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    country = relationship("Country")


class Country(Base):
    __tablename__ = "countries"

    country_id = Column(Integer, primary_key=True, index=True)
    country = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)
    