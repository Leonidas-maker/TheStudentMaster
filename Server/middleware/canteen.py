from sqlalchemy.orm import Session

from utils.canteen.canteen_stw_ma import fetch_menu
from middleware.general import create_address
from models.sql_models import m_canteen, m_general


def get_canteen(
    db: Session, short_name: str = "", canteen_id: int = ""
) -> m_canteen.Canteen:

    if not (short_name and canteen_id):
        raise ValueError("Parameter short_name or canteen_id is required")

    canteen = (
        db.query(m_canteen.Canteen)
        .filter(
            m_canteen.Canteen.canteen_short_name == short_name
            or m_canteen.Canteen.canteen_id == canteen_id
        )
        .first()
    )
    if not canteen:
        raise ReferenceError("Canteen not found")

    return canteen


def create_canteen(db: Session, canteen: m_canteen.Canteen) -> m_canteen.Canteen:
    if isinstance(canteen.address, m_general.Address):
        canteen_address = create_address(db, canteen.address)
    elif canteen.address_id:
        canteen_address = (
            db.query(m_general.Address).filter_by(address_id=canteen.address_id).first()
        )
    else:
        raise ValueError("Error while creating canteen. Address is missing.")

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


def update_canteen(db: Session, canteen: m_canteen.Canteen) -> m_canteen.Canteen:
    # TODO: Implement update_canteen
    pass


def get_dish(db: Session, description: str, dish_id: int = "") -> m_canteen.Dish:
    if not (description and dish_id):
        raise ValueError("Parameter description or dish_id is required")

    dish = (
        db.query(m_canteen.Dish)
        .filter(
            m_canteen.Dish.description == description
            or m_canteen.Dish.dish_id == dish_id
        )
        .first()
    )
    if not dish:
        print("Dish not found")
        raise ReferenceError("Dish not found")

    return dish


def create_dish(db: Session, dish: m_canteen.Dish) -> m_canteen.Dish:
    if not dish:
        raise ValueError("Parameter dish is required")

    # Check if dish exists
    dish_exists = (
        db.query(m_canteen.Dish).filter_by(description=dish.description).first()
    )
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


def update_dish(db: Session, dish: m_canteen.Dish) -> m_canteen.Dish:
    # TODO: Implement update_dish
    pass


# TODO: Still bullshit for getting
def get_menu(
    db: Session,
    canteen_id: int,
    dish_id: int,
    dish_type: str,
    serving_date: str,
) -> m_canteen.Menu:

    if not (canteen_id and dish_id and dish_type and serving_date):
        raise ValueError(
            "Parameter canteen_id, dish_id, dish_type or serving_date is required"
        )

    menu = (
        db.query(m_canteen.Menu)
        .filter(
            m_canteen.Menu.canteen_id == canteen_id,
            m_canteen.Menu.dish_id == dish_id,
            m_canteen.Menu.dish_type == dish_type,
            m_canteen.Menu.serving_date == serving_date,
        )
        .first()
    )
    if not menu:
        create_menu(
            db,
            m_canteen.Menu(
                canteen_id=canteen_id,
                dish_id=dish_id,
                dish_type=dish_type,
                serving_date=serving_date,
            ),
        )
        raise ReferenceError("Menu not found")

    return menu


def create_menu(db: Session, menu: m_canteen.Menu) -> m_canteen.Menu:
    if not menu:
        raise ValueError("Parameter menu is required")

    # Check if canteen exists
    canteen_exists = (
        db.query(m_canteen.Canteen).filter_by(canteen_id=menu.canteen_id).first()
    )
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


def update_menu(db: Session, menu: m_canteen.Menu) -> m_canteen.Menu:
    # TODO: Implement update_menu
    pass


def canteen_menu_to_db(db: Session, canteen_id: int, week_offset: int = 0) -> bool:
    """This function fetches the menu from the canteen and stores it in the database.

    Args:
        db (Session): database session
        canteen_id (int): canteen id
        week_offset (int, optional): value between 0 and 3. Defaults to 0.

    Raises:
        ValueError: If canteen_id is not provided

    Returns:
        bool: True if successful, False if not
    """

    if not canteen_id:
        raise ValueError("Parameter canteen_id is required")

    if not week_offset:
        week_offset = 0

    canteen_short_name = (
        db.query(m_canteen.Canteen)
        .filter_by(canteen_id=canteen_id)
        .first()
        .canteen_short_name
    )
    try:
        # get menu for week
        complete_menu = fetch_menu(canteen_short_name=canteen_short_name, week_offset=0)
    except ValueError as e:
        print(e)
        return False

    days = complete_menu.keys()
    for day in days:
        for dish in complete_menu[day]:
            # check if dish exists
            dish_exists = (
                db.query(m_canteen.Dish)
                .filter_by(description=dish["description"])
                .first()
            )
            # create new dish if not exists
            if not dish_exists:
                new_dish = m_canteen.Dish(
                    description=dish["description"], price=dish["price"]
                )
                db.add(new_dish)
                db.flush()
            else:
                # update price if price has been changed
                if dish_exists.price != dish["price"]:
                    dish_exists.price = dish["price"]
                    db.flush()

            # get dish id
            dish_id = (
                db.query(m_canteen.Dish)
                .filter_by(description=dish["description"])
                .first()
                .dish_id
            )

            # check if menu_item exists
            menu_item_exists = (
                db.query(m_canteen.Menu)
                .filter_by(
                    canteen_id=canteen_id,
                    dish_id=dish_id,
                    dish_type=dish["dish_type"],
                    serving_date=dish["serving_date"],
                )
                .first()
            )

            if menu_item_exists:
                continue

            new_menu_item = m_canteen.Menu(
                canteen_id=canteen_id,
                dish_id=dish_id,
                dish_type=dish["dish_type"],
                serving_date=dish["serving_date"],
            )
            print(
                new_menu_item.dish_id,
                new_menu_item.canteen_id,
                new_menu_item.serving_date,
                new_menu_item.dish_type,
                str(new_menu_item.serving_date),
            )
            db.add(new_menu_item)
            db.flush()

    return True
