from bs4 import BeautifulSoup
import requests
from datetime import datetime, timedelta
import re


def fetch_menu(
    canteen_short_name: str,
    week_offset: int,
) -> dict:
    # Function to fetch menu based on canteen name and week offset
    match canteen_short_name:
        case "dhbw_eppelheim":
            # Special case for DHBW Eppelheim
            try:
                return fetch_menu_dhbw_eppel(week_offset)
            except Exception as e:
                # Error handling for DHBW Eppelheim menu fetch
                print("Error fetching DHBW Eppelheim Menu")
                print(e)
                return {}
        case _:
            # Default case for all other canteens
            try:
                return fetch_menu_stw_ma(canteen_short_name, week_offset)
            except Exception as e:
                # Error handling for other canteens' menu fetch
                print("Error fetching Menu, fetch_menu_stw_ma", canteen_short_name, week_offset)
                print(e)
                return {}


def fetch_menu_dhbw_eppel(
    week_offset: int,
) -> dict:
    # Input validation
    if not isinstance(week_offset, int):
        raise ValueError("week_offset must be an integer")
    if week_offset < 0:
        raise ValueError("week_offset must be a positive integer")
    if week_offset > 4:
        raise ValueError("week_offset must be less than 4")

    # Calculate the target date
    date = datetime.now().day + 7 * week_offset

    # Calculate dates for the week
    current_date = datetime.now().date() + timedelta(days=7 * week_offset)
    weekday = current_date.weekday()
    diff = timedelta(days=weekday)

    monday = current_date - diff
    tuesday = monday + timedelta(days=1)
    wednesday = monday + timedelta(days=2)
    thursday = monday + timedelta(days=3)
    friday = monday + timedelta(days=4)

    # Construct URL for the menu
    url = "https://www.stw-ma.de/essen-trinken/speiseplaene/speisenausgabe-eppelheim/"
    # url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Speisenausgabe+DHBW+Eppelheim-date-2024%25252d03%25252d{date}-view-week.html"

    # Fetch and parse the menu page
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.find_all("tr")
    menu = {}

    # Clean up rows
    for i in range(0, len(rows)):
        rows[i] = re.split(pattern=r"[\n\t\:\*\xa0]+", string=rows[i].text)
        rows[i] = remove_empty_strings(rows[i])

    # Process menu items
    for i in range(0, len(rows), 2):
        menu_items = list()

        # Determine serving date
        match rows[i][0]:
            case "Montag":
                serving_date = monday
            case "Dienstag":
                serving_date = tuesday
            case "Mittwoch":
                serving_date = wednesday
            case "Donnerstag":
                serving_date = thursday
            case "Freitag":
                serving_date = friday
            case _:
                serving_date = None

        # Add first dish
        menu_items.append(
            {
                "dish_type": rows[i][1] if len(rows[i]) > 1 else None,
                "description": rows[i][2] if len(rows[i]) > 2 else None,
                "price": rows[i][3] if len(rows[i]) > 3 else None,
                "serving_date": serving_date,
            }
        )

        # Add second dish
        menu_items.append(
            {
                "dish_type": rows[i + 1][0] if len(rows[i + 1]) > 0 else None,
                "description": rows[i + 1][1] if len(rows[i + 1]) > 1 else None,
                "price": rows[i + 1][2] if len(rows[i + 1]) > 2 else None,
                "serving_date": serving_date,
            }
        )

        # Add menu items to the menu dictionary
        menu[rows[i][0]] = menu_items

    return menu


def fetch_menu_stw_ma(
    canteen_short_name: str,
    week_offset: int,
) -> dict:

    no_menu_list = ["Für den heutigen Tag steht kein Angebot zur Verfügung."]

    # * check input
    # check week_offset
    if not isinstance(week_offset, int):
        raise ValueError("week_offset must be an integer")
    if week_offset < 0:
        raise ValueError("week_offset must be a positive integer")
    if week_offset > 4:
        raise ValueError("week_offset must be less than 4")

    # check canteen_short_name
    if not canteen_short_name:
        raise ValueError("canteen_short_name is required")
    if not isinstance(canteen_short_name, str):
        raise ValueError("canteen_short_name must be a string")

    # get dates
    date = datetime.now() + timedelta(days=7 * week_offset)
    day = f"0{date.day}" if date.day < 10 else f"{date.day}"
    month = f"0{date.month}" if date.month < 10 else f"{date.month}"
    year = f"{datetime.now().year}"

    # get dates for the week
    current_date = datetime.now().date() + timedelta(days=7 * week_offset)
    weekday = current_date.weekday()
    diff = timedelta(days=weekday)

    monday = current_date - diff
    tuesday = monday + timedelta(days=1)
    wednesday = monday + timedelta(days=2)
    thursday = monday + timedelta(days=3)
    friday = monday + timedelta(days=4)

    # get url for canteen_id
    match canteen_short_name:
        case "schlossmensa":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=610&date={year}-{month}-{day}&lang=de"
        case "greens":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=710&date={year}-{month}-{day}&lang=de"
        case "mensawagon":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=709&date={year}-{month}-{day}&lang=de"  # no menu available
        case "hochschule_mannheim":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=611&date={year}-{month}-{day}&lang=de"
        case "cafeteria_musikhochschule":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=714&date={year}-{month}-{day}&lang=de"
        case "popakademie":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=717&date={year}-{month}-{day}&lang=de"
        case "mensaria_metropol":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=613&date={year}-{month}-{day}&lang=de"
        case "mensaria_wohlgelegen":
            url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location=614&date={year}-{month}-{day}&lang=de"
        case _:
            raise ValueError("Invalid canteen_id").add_note(
                "canteen_id must be one of the following: schlossmensa, greens, mensawagon, hochschule_mannheim, cafeteria_musikhochschule, popakademie, mensaria_metropol, mensaria_wohlgelegen, dhbw_eppelheim"
            )

    # fetch menu from url
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.find_all("tr")
    menu = {}

    # get menu names
    menu_names = rows.pop(0)
    menu_names = re.split(r"[\n\t]+", menu_names.text)
    menu_names = remove_empty_strings(menu_names)

    for i in range(0, len(rows) - 1, 2):
        # get menu items
        item_row = rows[i]
        menu_items = re.split(r"[\n\t]+", item_row.text)
        menu_items = remove_empty_strings(menu_items)

        match menu_items[0]:
            case "Montag":
                serving_date = monday
            case "Dienstag":
                serving_date = tuesday
            case "Mittwoch":
                serving_date = wednesday
            case "Donnerstag":
                serving_date = thursday
            case "Freitag":
                serving_date = friday
            case _:
                serving_date = None

        # get price
        raw_price_list = rows[i + 1]
        raw_price_list = re.split(r"[\n\t]+", raw_price_list.text)
        raw_price_list = remove_empty_strings(raw_price_list)
        menu_prices = ["Montag"]
        for j in range(0, len(raw_price_list), 2):
            # check if there is no menu for that day
            if raw_price_list[0] in no_menu_list:
                menu_prices = ["Kein Angebot"]
                break

            # catch errors from the website regarding price
            if not re.match(r"(Portion|Glas|pro 100g): \d+,\d{2} €", f"{raw_price_list[j+1]}: {raw_price_list[j]}"):
                # if quantity is missing, add it
                if re.match(r"\d+,\d{2} €", raw_price_list[j]):
                    price = raw_price_list[j]
                    raw_price_list[j] = "Portion"
                    raw_price_list.insert(j, price)
                # if price is missing, add it
                if re.match(r"(Portion|Glas|pro 100g)", raw_price_list[j]):
                    raw_price_list.insert(j, "-,-- €")

            menu_prices.append(f"{raw_price_list[j+1]}: {raw_price_list[j]}")

        # check if menu items and prices match
        if (
            not (len(menu_items) == len(menu_prices) and len(menu_items) == len(menu_names))
            and not menu_prices[0] == "Kein Angebot"
        ):
            print("Error: Length of menu items and prices do not match")
            return {}

        # create menu dictionary
        list_items_prices = list()
        for j in range(len(menu_items)):

            list_items_prices.append(
                {
                    "dish_type": menu_names[j],
                    "description": menu_items[j],
                    "price": menu_prices[j],
                    "serving_date": serving_date,
                }
            )
        menu[menu_items[0]] = list_items_prices[1:]

    return menu


def remove_empty_strings(list: list) -> list:
    return [x for x in list if x]


if __name__ == "__main__":

    # canteen_short_names = [
    #     "schlossmensa",
    #     "greens",
    #     "mensawagon",
    #     "hochschule_mannheim",
    #     "cafeteria_musikhochschule",
    #     "popakademie",
    #     "mensaria_metropol",
    #     "mensaria_wohlgelegen",
    #     "dhbw_eppelheim",
    # ]

    # fetch_menu(canteen_short_name="schlossmensa", week_offset=0)

    pass
