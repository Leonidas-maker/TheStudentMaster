from sqlalchemy.orm import Session

from Server.middleware.general import create_address
from models import m_canteen


def create_canteen(db: Session, canteen: m_canteen.Canteen) -> m_canteen.Canteen:
    if not canteen:
        raise ValueError("Canteen is required")
    
    canteen_address = create_address(db, canteen.address)
    
    # Check if canteen exists
    canteen_exists = (
        db.query(m_canteen.Canteen)
        .filter_by(
            canteen_name=canteen.canteen_name,
            address_id=canteen_address.address_id,
        )
        .first()
    )
    if canteen_exists:
        return canteen_exists
    
    if canteen.image_url == "":
        canteen.image_url = None
        
    new_canteen = m_canteen.Canteen(
        canteen_name=canteen.canteen_name,
        image_url=canteen.image_url,
        address_id=canteen_address.address_id,
    )
    
    db.add(new_canteen)
    db.flush()
    
    return new_canteen
