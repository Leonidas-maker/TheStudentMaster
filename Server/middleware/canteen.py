import json
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
import json


# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
from utils.canteen.canteen_scraper import fetch_menu

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_canteen, m_general

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas.s_canteen import ResGetCanteenMenuDay
from models.pydantic_schemas import s_general


# ======================================================== #
# ======================== Update ======================== #
# ======================================================== #
def create_canteens(db: Session):
    """function to add all canteens included in the canteen_addresses.json file to the database

    Args:
        db (Session): database session
    """
    try:
        with open("./data/address_lists/canteen_addresses.json", "r") as file:
            canteens = json.load(file)
        for canteen_obj in canteens:
            # create address for canteen
            address_new = s_general.AddressCreate(
                address1=canteen_obj["address1"],
                address2=canteen_obj["address2"] if "address2" in canteen_obj else None,
                district=canteen_obj["district"],
                postal_code=canteen_obj["postal_code"],
                city=canteen_obj["city"],
                country=canteen_obj["country"],
            )
            address_new = create_address(db, address_new)

            # create canteen
            canteen_new = m_canteen.Canteen(
                canteen_name=canteen_obj["name"],
                canteen_short_name=(canteen_obj["short_name"] if "short_name" in canteen_obj else None),
                address_id=address_new.address_id,
            )
            create_canteen(db, canteen_new)
        db.commit()
    except Exception as e:
        # print error and rollback changes to database
        print(e)
        db.rollback()


def update_canteen_menus(db: Session, progress, task_id, week_offset: int = 0):
    """This function updates the menu for all canteens in the database. This function is used by the repeated update task.

    Args:
        db (Session): database session
        progress (Progress): progress bar
        task_id (TaskID): task id
        week_offset (int, optional): offset by x weeks to the future. maximum value = 3. Defaults to 0.
    """
    try:
        # get all canteens
        canteens = db.query(m_canteen.Canteen).all()

        # update progress bar and loop through all canteens
        progress.update(task_id, total=(len(canteens) * (3 - week_offset)))
        for canteen_obj in canteens:
            # for each canteen update the menu for the next 3 weeks
            for week in range(week_offset, 3):
                progress.update(
                    task_id,
                    description=f"[bold green]Canteen[/bold green] Update {canteen_obj.canteen_name} - Week {week}",
                )
                # add canteen menu to database
                canteen_menu_to_db(db=db, canteen_id=canteen_obj.canteen_id, week_offset=week)
                db.flush()
                progress.update(task_id, advance=1)
        db.commit()
    except Exception as e:
        print(e)
        db.rollback()


def clean_canteen_menus(db: Session):
    """This function deletes all menu items that are older than the current date.

    Args:
        db (Session): database session
        progress (Progress): progress bar
        task_id (TaskID): task id
    """
    try:
        # get all menu items
        menu_items = db.query(m_canteen.Menu).all()

        # loop through all menu items
        for menu_item in menu_items:
            # check if menu item is older than current date
            if menu_item.serving_date < datetime.now():
                db.delete(menu_item)
        db.commit()
    except Exception as e:
        print(e)
        db.rollback()


# ======================================================== #
# ======================== Canteen ======================= #
# ======================================================== #
def get_canteen(db: Session, short_name: str = "", canteen_id: int = "") -> m_canteen.Canteen:
    """get the canteen by short_name or canteen_id

    Args:
        db (Session): database session
        short_name (str, optional): short canteen name. Defaults to "".
        canteen_id (int, optional): canteen_id. Defaults to "".

    Raises:
        ValueError: required parameter is missing
        ReferenceError: canteen not found

    Returns:
        m_canteen.Canteen: Canteen object
    """

    # check for required parameters
    if not (short_name or canteen_id):
        raise ValueError("Parameter short_name or canteen_id is required")

    try:
        if short_name:
            canteen = db.query(m_canteen.Canteen).filter_by(canteen_short_name=short_name).first()
        elif canteen_id:
            canteen = db.query(m_canteen.Canteen).filter_by(canteen_id=canteen_id).first()
    except AttributeError as e:
        print("Error while fetching canteen")
        print(e)

    if not canteen:
        raise ReferenceError("Canteen not found")

    return canteen


def create_canteen(db: Session, canteen: m_canteen.Canteen) -> m_canteen.Canteen:
    if isinstance(canteen.address, m_general.Address):
        canteen_address = create_address(db, canteen.address)
    elif canteen.address_id:
        canteen_address = db.query(m_general.Address).filter_by(address_id=canteen.address_id).first()
    else:
        raise ValueError("Error while creating canteen. Address is missing.")

    try:
        # Check if canteen exists
        canteen_exists = (
            db.query(m_canteen.Canteen)
            .filter_by(
                canteen_name=canteen.canteen_name,
                address_id=canteen_address.address_id,
            )
            .first()
        )
    except AttributeError as e:
        print("Error while fetching canteen_exists")
        print(e)
        return False

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
    try:
        db.add(new_canteen)
        db.flush()
    except Exception as e:
        print("Error while adding new canteen")
        print(e)
        return False
    return new_canteen


# ======================================================== #
# ========================= Dish ========================= #
# ======================================================== #
def get_dish(db: Session, description: str, dish_id: int = "") -> m_canteen.Dish:
    if not (description and dish_id):
        raise ValueError("Parameter description or dish_id is required")

    try:
        dish = (
            db.query(m_canteen.Dish)
            .filter(m_canteen.Dish.description == description or m_canteen.Dish.dish_id == dish_id)
            .first()
        )
    except AttributeError as e:
        print("Error while fetching dish")
        print(e)
        return False

    if not dish:
        print("Dish not found")
        raise ReferenceError("Dish not found")

    return dish


def create_dish(db: Session, dish: m_canteen.Dish) -> m_canteen.Dish:
    if not dish:
        raise ValueError("Parameter dish is required")
    try:
        # Check if dish exists
        dish_exists = db.query(m_canteen.Dish).filter_by(description=dish.description).first()
    except AttributeError as e:
        print("Error while fetching dish_exists")
        print(e)
        return False

    if dish_exists:
        # check if price has been updated
        if dish_exists.price != dish.price:
            try:
                dish_exists.price = dish.price
                db.flush()
            except Exception as e:
                print("Error while updating dish price")
                print(e)
                return False
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
    try:
        db.add(new_dish)
        db.flush()
    except Exception as e:
        print("Error while adding new dish")
        print(e)
        return False

    return new_dish


# ======================================================== #
# ========================= Menu ========================= #
# ======================================================== #
def get_menu(db: Session, canteen_id: int, dish_id: int, dish_type: str, serving_date: str) -> m_canteen.Menu:

    if not (canteen_id and dish_id and dish_type and serving_date):
        raise ValueError("Parameter canteen_id, dish_id, dish_type or serving_date is required")
    try:
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
    except AttributeError as e:
        print("Error while fetching menu, function get_menu")
        print(e)
        return False

    if not menu:
        try:
            create_menu(
                db,
                m_canteen.Menu(
                    canteen_id=canteen_id,
                    dish_id=dish_id,
                    dish_type=dish_type,
                    serving_date=serving_date,
                ),
            )
        except Exception as e:
            print("Error while creating menu")
            print(e)
            return False
    return menu


def create_menu(db: Session, menu: m_canteen.Menu) -> m_canteen.Menu:
    if not menu:
        raise ValueError("Parameter menu is required")

    try:
        # Check if canteen exists
        canteen_exists = db.query(m_canteen.Canteen).filter_by(canteen_id=menu.canteen_id).first()
    except AttributeError as e:
        print("Error while fetching canteen_exists")
        print(e)
        return False

    if not canteen_exists:
        raise ReferenceError("Canteen not found")

    try:
        # Check if dish exists
        dish_exists = db.query(m_canteen.Dish).filter_by(dish_id=menu.dish_id).first()
    except AttributeError as e:
        print("Error while fetching dish_exists")
        print(e)
        return False

    if not dish_exists:
        raise ReferenceError("Dish not found")

    try:
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
    except AttributeError as e:
        print("Error while fetching menu_exists")
        print(e)
        return False

    if menu_exists:
        return menu_exists

    new_menu = m_canteen.Menu(
        canteen_id=menu.canteen_id,
        dish_id=menu.dish_id,
        dish_type=menu.dish_type,
        serving_date=menu.serving_date,
    )
    try:
        db.add(new_menu)
        db.flush()
    except Exception as e:
        print("Error while adding new menu")
        print(e)
        return False

    return new_menu


def get_menu_for_canteen(db: Session, canteen_short_name: str, current_week_only: bool = False) -> dict:
    """Fetches the menu for a given canteen and returns it in a structured format.

    Args:
        db (Session): Database session.
        canteen_short_name (str): Short name of the canteen.
        current_week_only (bool, optional): If True, fetches the menu for the current week only. Defaults to False.

    Raises:
        ValueError: If required parameters are not provided or are of incorrect type.

    Returns:
        dict: Structured menu data for the canteen.
    """
    # Validate the input parameters
    if not db:
        raise ValueError("Parameter db is required")
    if not canteen_short_name:
        raise ValueError("Parameter canteen_short_name is required")
    if not isinstance(canteen_short_name, str):
        raise ValueError("Parameter canteen_short_name must be a string")

    # Determine the current week number if only the current week's menu is requested
    if current_week_only:
        current_week = datetime.now().isocalendar()[1]
    else:
        current_week = 0

    try:
        # Use joinedload to load menus and dishes in one query for performance optimization
        canteen = (
            db.query(m_canteen.Canteen)
            .options(joinedload(m_canteen.Canteen.menus).joinedload(m_canteen.Menu.dish))
            .filter_by(canteen_short_name=canteen_short_name)
            .first()
        )
        # Check if the canteen exists
        if not canteen:
            raise ValueError("Canteen not found")
        # Retrieve the menus associated with the canteen
        menus = canteen.menus
    except AttributeError as e:
        print("Error while fetching canteen or menus")
        print(e)
        return False

    # Initialize the return value dictionary with canteen details
    return_value = {
        "canteen_name": canteen.canteen_name,
        "hash": canteen.hash,
        "canteen_short_name": canteen.canteen_short_name if canteen.canteen_short_name else None,
        "image_url": canteen.image_url if canteen.image_url else None,
        "menu": [],
    }

    # Filter and format the menu items based on the current_week_only flag
    if current_week_only:
        for m in menus:
            # Check if the menu item is for the current week
            if m.serving_date.isocalendar()[1] == current_week:
                return_value["menu"].append(
                    {
                        "dish_type": m.dish_type,
                        "dish": m.dish.description,
                        "price": m.dish.price,
                        "serving_date": m.serving_date,
                    }
                )
    else:
        # Include all menu items
        return_value["menu"] = [
            {
                "dish_type": m.dish_type,
                "dish": m.dish.description,
                "price": m.dish.price,
                "serving_date": m.serving_date,
            }
            for m in menus
        ]

    return return_value


def get_menu_for_day(db: Session, day: str) -> list[ResGetCanteenMenuDay]:
    """Fetches the menu for a given day and returns it in a structured format.

    Args:
        db (Session): Database session.
        day (str): The day to fetch the menu for.

    Raises:
        ValueError: If required parameters are not provided or are of incorrect type.

    Returns:
        list[ResGetCanteenMenuDay]: Structured menu data for the given day.
    """
    # Validate the input parameters
    if not db:
        raise ValueError("Parameter db is required")
    if not day:
        raise ValueError("Parameter day is required")
    if not isinstance(day, str):
        raise ValueError("Parameter day must be a string")

    try:
        # Fetch the menu items for the given day
        menus = db.query(m_canteen.Menu).filter_by(serving_date=day).all()
    except AttributeError as e:
        print("Error while fetching menu items")
        print(e)
        return False

    # Initialize the return value list
    return_value = []

    # Format the menu items
    for menu in menus:
        menu_row = dict()
        menu_row["canteen_name"] = menu.canteen.canteen_name
        menu_row["canteen_short_name"] = menu.canteen.canteen_short_name
        menu_row["image_url"] = menu.canteen.image_url if menu.canteen.image_url else None
        menu_row["hash"] = menu.canteen.hash
        menu_row["menu"] = {
            "dish_type": menu.dish_type,
            "dish": menu.dish.description,
            "price": menu.dish.price,
            "serving_date": menu.serving_date,
        }
        return_value.append(menu_row)

    return return_value


# ======================================================== #
# ========================= Main ========================= #
# ======================================================== #
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
    if not isinstance(canteen_id, int):
        canteen_id = int(canteen_id)

    if not week_offset:
        week_offset = 0
    try:
        canteen = (
            db.query(m_canteen.Canteen)
            .options(joinedload(m_canteen.Canteen.menus))
            .filter_by(canteen_id=canteen_id)
            .first()
        )
        if not canteen:
            raise ValueError("Canteen not found")
        canteen_short_name = canteen.canteen_short_name
    except AttributeError as e:
        print("Error while fetching canteen_short_name")
        print(e)
        return False

    try:
        # get menu for week
        complete_menu = fetch_menu(canteen_short_name=canteen_short_name, week_offset=week_offset)
    except ValueError as e:
        print("Error while fetching menu, function canteen_menu_to_db")
        print(e)
        return False

    days = complete_menu.keys()
    for day in days:
        for dish in complete_menu[day]:

            try:
                # check if dish exists
                dish_exists = db.query(m_canteen.Dish).filter_by(description=dish["description"]).first()
            except AttributeError as e:
                print("Error while fetching dish_exists")
                print(e)
                return False

            # create new dish if not exists
            if not dish_exists:
                if dish["price"] is None:
                    continue
                new_dish = m_canteen.Dish(description=dish["description"], price=dish["price"])
                try:
                    db.add(new_dish)
                    db.flush()
                except Exception as e:
                    print("Error while adding new dish")
                    print(e)
                    return False

            else:
                # update price if price has been changed
                if dish_exists.price != dish["price"]:
                    dish_exists.price = dish["price"]
                    db.flush()

            try:
                # get dish id
                dish_id = db.query(m_canteen.Dish).filter_by(description=dish["description"]).first().dish_id
            except AttributeError as e:
                print("Error while fetching dish_id")
                print(e)
                return False

            try:
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
            except AttributeError as e:
                print("Error while fetching menu_item_exists")
                print(e)
                return False

            if menu_item_exists:
                continue

            try:
                # check if menu_item has been changed and needs to be updated
                if (
                    menu_item_exists.dish_type == dish["dish_type"]
                    and menu_item_exists.serving_date == dish["serving_date"]
                    and menu_item_exists.canteen_id == canteen_id
                ):
                    menu_item_exists.dish_id = dish_id
                    db.flush()
            except Exception as e:
                print("Error while updating menu_item")
                print(e)
                return False

            new_menu_item = m_canteen.Menu(
                canteen_id=canteen_id,
                dish_id=dish_id,
                dish_type=dish["dish_type"],
                serving_date=dish["serving_date"],
            )
            try:
                db.add(new_menu_item)
                db.flush()
            except Exception as e:
                print("Error while adding new menu_item")
                print(e)
                return False
    return True
