from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from config.database import Base
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
import datetime


class Address(Base):
    __tablename__ = "addresses"

    address_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    address1: Mapped[str] = mapped_column(String(255), nullable=False)
    address2: Mapped[str | None] = mapped_column(String(255))

    postal_code_id: Mapped[int] = mapped_column(Integer, ForeignKey("postal_codes.postal_code_id"), primary_key=True)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    postal_code: Mapped["PostalCode"] = relationship("PostalCode", back_populates="addresses")

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

    postal_code_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    postal_code: Mapped[str] = mapped_column(String(255), nullable=False)

    city_id: Mapped[int] = mapped_column(Integer, ForeignKey("cities.city_id"), nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    city: Mapped["City"] = relationship("City", back_populates="postal_codes")
    addresses: Mapped[list["Address"]] = relationship("Address", cascade="save-update", back_populates="postal_code")

    def as_dict_complete(self):
        return {
            "postal_code": self.postal_code,
            "city": self.city.city,
            "district": self.city.district.district,
            "country": self.city.country.country,
        }


class City(Base):
    __tablename__ = "cities"

    city_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    district_id: Mapped[int] = mapped_column(Integer, ForeignKey("districts.district_id"), nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    district: Mapped["District"] = relationship("District", back_populates="cities")
    postal_codes: Mapped[list["PostalCode"]] = relationship("PostalCode", cascade="save-update", back_populates="city")

    def as_dict_complete(self):
        return {
            "city": self.city,
            "district": self.district.district,
            "country": self.district.country.country,
        }


class District(Base):
    __tablename__ = "districts"

    district_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    district: Mapped[str] = mapped_column(String(255), nullable=False)
    country_id: Mapped[int] = mapped_column(Integer, ForeignKey("countries.country_id"), nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    country: Mapped["Country"] = relationship("Country", back_populates="districts", uselist=False)
    cities: Mapped[list["City"]] = relationship("City", cascade="save-update", back_populates="district")

    def as_dict_complete(self):
        return {
            "district": self.district,
            "country": self.country.country,
        }


class Country(Base):
    __tablename__ = "countries"

    country_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    country: Mapped[str] = mapped_column(String(255), nullable=False)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    districts: Mapped[list["District"]] = relationship("District", cascade="save-update", back_populates="country")

    def as_dict_complete(self):
        return {
            "country": self.country,
        }
