from sqlalchemy.orm import Session

from models.pydantic_schemas import  s_general
from models.sql_models import m_general


def create_address(db: Session, new_address: s_general.AddressCreate) -> s_general.Address:
    if not new_address:
        raise ValueError("Address is required")

    # Check if request.address exists
    address_exists = (
        db.query(m_general.Address)
        .filter_by(
            address1=new_address.address1,
            address2=new_address.address2,
            postal_code=new_address.postal_code,
        )
        .first()
    )
    
    if address_exists:
        return address_exists

    # Check if request.address.city exists
    city_exists = (
        db.query(m_general.Address)
        .join(m_general.City)
        .join(m_general.Country)
        .filter(
            m_general.City.city == new_address.city, 
            m_general.Country.country == new_address.country,
        )
        .first()
    )
    
    if not city_exists:
        # Check if country exists
        country_exists = db.query(m_general.Country).filter_by(country=new_address.country).first()
        if not country_exists:
            # Create new country
            country_exists = m_general.Country(country=new_address.country)
            db.add(country_exists)
            db.flush()

        # Create new city
        city_exists = m_general.City(city=new_address.city, country_id=country_exists.country_id)
        db.add(city_exists)
        db.flush()
        
    
    # Create new address
    new_address = m_general.Address(
        address1=new_address.address1,
        address2=new_address.address2,
        district=new_address.district,
        postal_code=new_address.postal_code,
        city_id=city_exists.city_id,
    )
    db.add(new_address)
    db.flush()

    return new_address
