from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from config.database import Base
from sqlalchemy.orm import relationship


class Address(Base):
    __tablename__ = "addresses"

    address_id = Column(Integer, primary_key=True, index=True)
    address1 = Column(String(255), nullable=False)
    address2 = Column(String(255))


    postal_code_id = Column(Integer, ForeignKey("postal_codes.postal_code_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    postal_code = relationship("PostalCode", back_populates="addresses")

    def as_dict_complete(self):
        return {
            "address1": self.address1,
            "address2": self.address2,
            "postal_code": self.postal_code.postal_code,
            "city": self.postal_code.city.city,
            "district": self.postal_code.city.district.district,
            "country": self.postal_code.city.district.country.country,
        }

class PostalCode(Base):
    __tablename__ = "postal_codes"

    postal_code_id = Column(Integer, primary_key=True, index=True)
    postal_code = Column(String(255), nullable=False)

    city_id = Column(Integer, ForeignKey("cities.city_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    city = relationship("City", back_populates="postal_codes")
    addresses = relationship("Address", cascade="save-update", back_populates="postal_code")

    def as_dict_complete(self):
        return {
            "postal_code": self.postal_code,
            "city": self.city.city,
            "district": self.city.district.district,
            "country": self.city.country.country,
        }


class City(Base):
    __tablename__ = "cities"

    city_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(255), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.district_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    district = relationship("District", back_populates="cities")
    postal_codes = relationship("PostalCode", cascade="save-update", back_populates="city")

    def as_dict_complete(self):
        return {
            "city": self.city,
            "district": self.district.district,
            "country": self.district.country.country,
        }

class District(Base):
    __tablename__ = "districts"

    district_id = Column(Integer, primary_key=True, index=True)
    district = Column(String(255), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    country = relationship("Country", back_populates="districts")
    cities = relationship("City", cascade="save-update", back_populates="district")


    def as_dict_complete(self):
        return {
            "district": self.district,
            "country": self.country.country,
        }
class Country(Base):
    __tablename__ = "countries"

    country_id = Column(Integer, primary_key=True, index=True)
    country = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    districts = relationship("District", cascade="save-update", back_populates="country")

    def as_dict_complete(self):
        return {
            "country": self.country,
        }

