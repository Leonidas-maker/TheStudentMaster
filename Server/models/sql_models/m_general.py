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

    city = relationship("City", cascade="save-update", back_populates="addresses")

    def as_dict_complete(self):
        return {
            "address1": self.address1,
            "address2": self.address2,
            "district": self.district,
            "postal_code": self.postal_code,
            "city": self.city.city,
            "country": self.city.country.country,
        }


class City(Base):
    __tablename__ = "cities"

    city_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(255), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    country = relationship("Country", back_populates="cities")

    addresses = relationship("Address", cascade="save-update", back_populates="city")

    def as_dict_complete(self):
        return {
            "city": self.city,
            "country": self.country.country,
        }


class Country(Base):
    __tablename__ = "countries"

    country_id = Column(Integer, primary_key=True, index=True)
    country = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    cities = relationship("City", cascade="save-update", back_populates="country")
