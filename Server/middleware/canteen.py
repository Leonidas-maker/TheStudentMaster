from sqlalchemy.orm import Session

from middleware.general import create_address
from models.sql_models import m_canteen


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
        canteen_short_name=canteen.canteen_short_name,
        image_url=canteen.image_url,
        address_id=canteen_address.address_id,
    )

    db.add(new_canteen)
    db.flush()

    return new_canteen


def create_dish(db: Session, dish: m_canteen.Dish) -> m_canteen.Dish:
    if not dish:
        raise ValueError("Parameter dish is required")

    # Check if dish exists
    dish_exists = db.query(m_canteen.Dish).filter_by(dish_name=dish.description).first()
    if dish_exists:
        # check if price has been updated
        if dish_exists.price != dish.price:
            dish_exists.price = dish.price
            db.flush()
        return dish_exists

    # Check if dish image is empty
    if dish.image_url == "":
        dish.image_url = None

    # Create new dish
    new_dish = m_canteen.Dish(
        describtion=dish.description,
        image_url=dish.image_url,
        description=dish.description,
    )

    db.add(new_dish)
    db.flush()

    return new_dish


def create_menu(db: Session, menu: m_canteen.Menu) -> m_canteen.Menu:
    if not menu:
        raise ValueError("Parameter menu is required")

    # Check if canteen exists
    canteen_exists = db.query(m_canteen.Canteen).filter_by(canteen_id=menu.canteen_id).first()
    if not canteen_exists:
        raise ReferenceError("Canteen not found")

    # Check if dish exists
    dish_exists = db.query(m_canteen.Dish).filter_by(dish_id=menu.dish_id).first()
    if not dish_exists:
        raise ReferenceError("Dish not found")

    # Check if menu exists
    menu_exists = (
        db.query(m_canteen.Menu)
        .filter_by(
            canteen_id=menu.canteen_id,
            dish_id=menu.dish_id,
            dish_type=menu.dish_type,
            serving_date=menu.serving_date,
        )
        .first()
    )
    if menu_exists:
        return menu_exists

    new_menu = m_canteen.Menu(
        canteen_id=menu.canteen_id,
        dish_id=menu.dish_id,
        dish_type=menu.dish_type,
        serving_date=menu.serving_date,
    )

    db.add(new_menu)
    db.flush()

    return new_menu
