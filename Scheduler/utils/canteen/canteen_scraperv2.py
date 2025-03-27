from bs4 import BeautifulSoup
import requests
from datetime import datetime, timedelta
import re
from typing import List, Dict
import logging
import aiohttp
import asyncio

from schemes.s_canteen import Canteen, CanteenMenu, CanteenOpeningHours


async def fetch_html(session: aiohttp.ClientSession, url: str) -> str:
    """
    Fetches HTML content from the provided URL using an aiohttp session.

    :param session: The aiohttp ClientSession used to make the request.
    :param url: The URL from which to fetch the HTML.
    :return: The fetched HTML content as a string, or None if the request failed.
    """
    async with session.get(url) as response:
        if response.status != 200:
            return None
        return await response.text()


async def process_week(
    session: aiohttp.ClientSession, location_id: str, week: datetime, description_pattern: re.Pattern
) -> Dict[str, List[CanteenMenu]]:
    """
    Processes a week's menu data for a specific canteen location by fetching and parsing the HTML content.

    :param session: The aiohttp ClientSession used to make the request.
    :param location_id: The ID of the canteen location.
    :param week: The start date of the week for which to fetch the menu.
    :param description_pattern: A compiled regex pattern for matching menu item descriptions.
    :return: A dictionary containing the parsed CanteenMenu data grouped by menu type.
    """
    url = f"https://www.stw-ma.de/essen-trinken/speiseplaene/wochenansicht?location={location_id}&date={week.strftime('%Y-%m-%d')}&lang=de"
    html = await fetch_html(session, url)
    if html:
        return parse_canteen_menu(html, week, description_pattern)
    return {}


async def gather_menus_for_location(
    location_id: str, location_name: str, weeks: List[datetime], description_pattern: re.Pattern
) -> Canteen:
    """
    Gathers the canteen menus for a specific location over multiple weeks.

    :param location_id: The ID of the canteen location.
    :param location_name: The name of the canteen location.
    :param weeks: A list of week start dates for which to fetch the menu data.
    :param description_pattern: A compiled regex pattern for matching menu item descriptions.
    :return: A Canteen object containing the gathered menu data for the location.
    """
    canteen = Canteen(name=location_name, _id=location_id, opening_hours=[], menus={})

    async with aiohttp.ClientSession() as session:
        tasks = [process_week(session, location_id, week, description_pattern) for week in weeks]
        results = await asyncio.gather(*tasks)

    for result in results:
        for menu_type, menu_items in result.items():
            if menu_type not in canteen.menus:
                canteen.menus[menu_type] = menu_items
            else:
                canteen.menus[menu_type].extend(menu_items)
    return canteen


def expand_days(day_range: str) -> List[str]:
    """
    Expands a string representing a range of days into a list of individual day abbreviations.

    :param day_range: A string representing a range of days (e.g., 'Mo–Fr').
    :return: A list of day abbreviations (e.g., ['Mo', 'Di', 'Mi', 'Do', 'Fr']).
    """
    day_map = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    if "–" in day_range:
        start_day, end_day = [day.strip() for day in day_range.split("–")]
        start_index = day_map.index(start_day)
        end_index = day_map.index(end_day)
        return day_map[start_index : end_index + 1]
    return [day_range.strip()]


def parse_canteen_menu(
    html: str, date_begin: datetime, description_pattern: re.Pattern
) -> Dict[str, List[CanteenMenu]]:
    """
    Parses the HTML content of a canteen menu page and extracts the menu items.

    :param html: The HTML content of the canteen menu page.
    :param date_begin: The starting date for the menu being parsed.
    :param description_pattern: A compiled regex pattern for matching menu item descriptions.
    :return: A dictionary where the keys are menu types and the values are lists of CanteenMenu objects.
    """
    logger = logging.getLogger(__name__)
    soup = BeautifulSoup(html, "html.parser")
    legend_childs = soup.find_all("span", style="white-space: nowrap; padding-right:5px;")

    legend = {}
    for child in legend_childs:
        sup_text = child.find("sup").getText().strip()
        if sup_text:
            legend[sup_text] = child.getText()[len(sup_text) :].strip()

    menu_rows = soup.find("table", {"id": "previewTable"}).find_all("tr")
    header_cols = menu_rows[0].find_all("th")[1:]
    menu_types = [col.getText().strip() for col in header_cols]

    menu_rows = menu_rows[1:]
    canteen_menu: Dict[str, List[CanteenMenu]] = {}
    was_menu_description_before = False
    day = 0
    for row in menu_rows:
        if row.get("class")[0] == "active1" and not was_menu_description_before:
            day_cols = row.find_all("td")
            date = date_begin + timedelta(days=day)

            for i, col in enumerate(day_cols[1:]):
                if not canteen_menu.get(menu_types[i]):
                    canteen_menu[menu_types[i]] = []

                splitted_name = description_pattern.findall(col.getText().strip())

                name = []
                descriptions = []
                for splitted in splitted_name:
                    dish_name = splitted[0].strip()
                    raw_descriptions = splitted[1].split(",")
                    description = set()
                    for raw_description in raw_descriptions:
                        description.add(legend.get(raw_description.strip(), raw_description.strip()))
                    name.append(dish_name)
                    descriptions.append(description)

                name = ", ".join(name)

                canteen_menu[menu_types[i]].append(
                    CanteenMenu(name=name, descriptions=descriptions, price="", quantity="", tags=[], date=date)
                )

            was_menu_description_before = True
        elif row.get("class")[0] == "active2" and was_menu_description_before:
            day_cols = row.find_all("td")

            for i, col in enumerate(day_cols):
                if not canteen_menu[menu_types[i]][-1].name or canteen_menu[menu_types[i]][-1].name in [
                    "Heute kein Angebot"
                ]:
                    canteen_menu[menu_types[i]].pop()
                    continue

                spans = col.find_all("span")
                if len(spans) == 0:
                    continue

                price = spans[0].getText().strip()
                quantity = spans[1].getText().strip()
                tags = []
                if len(spans) > 2:
                    for span in spans[2:]:
                        if not span.get("class"):
                            continue
                        match span.get("class")[1]:
                            case "icon-cow":
                                tags.append("cow")
                            case "icon-pig":
                                tags.append("pig")
                            case "icon-chicken":
                                tags.append("chicken")
                            case "icon-cheap":
                                tags.append("cheap")
                            case "icon-fish":
                                tags.append("fish")
                            case "icon-carrot":
                                tags.append("carrot")
                            case "icon-leaf":
                                tags.append("leaf")
                            case _:
                                logger.debug(f"Unknown tag: {span.get('class')[1]}")
                canteen_menu[menu_types[i]][-1].price = price
                canteen_menu[menu_types[i]][-1].quantity = quantity
                canteen_menu[menu_types[i]][-1].tags = tags

            was_menu_description_before = False
            day += 1
        else:
            raise ValueError("Canteen menu parsing failed!")
    return canteen_menu


async def get_canteen_menu() -> List[Canteen]:
    """
    Fetches canteen menus for multiple locations and parses their opening hours.

    :return: A list of Canteen objects, each containing menu and opening hour data for a location.
    """
    locations = {
        "610": "Mensa am Schloss",
        "611": "Mensa an der HS",
        "613": "Mensaria Metropol + greenes²",
        "614": "Mensaria Wohlgelegen",
        "714": "Cafeteria Musikhochschule",
        "717": "CAFE 33",
    }
    description_pattern = re.compile(r"([^,]+)\s*\(([^)]+)\)")
    hour_pattern = re.compile(r"(\d{2}[:.]\d{2})\s*–\s*(\d{2}[:.]\d{2}) Uhr \((.+?)\)")

    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    weeks = [monday + timedelta(weeks=i) for i in range(4)]

    tasks = [
        gather_menus_for_location(location_id, location_name, weeks, description_pattern)
        for location_id, location_name in locations.items()
    ]

    canteens = await asyncio.gather(*tasks)

    response = requests.get("https://www.stw-ma.de/essen-trinken/mensen-cafeterien/")
    if response.status_code != 200:
        return canteens

    soup = BeautifulSoup(response.text, "html.parser")
    mensa_objects = soup.find_all("div", {"class": "et_pb_module"})

    canteen_hours = {}
    for mensa_object in mensa_objects:
        if mensa_object.find("h2"):
            mensa_name = mensa_object.find("h2").getText()
            opening_hour = mensa_object.find("div", {"class": "et_pb_toggle_content"})
            if not opening_hour:
                continue
            for br in opening_hour.find_all("br"):
                br.replace_with("\n")
            canteen_hours[mensa_name] = opening_hour.find("p").getText()

    for canteen in canteens:
        if canteen_hours.get(canteen.name):
            for match in hour_pattern.finditer(canteen_hours[canteen.name]):
                start_time = match.group(1)
                end_time = match.group(2)
                days_text = match.group(3)

                days = expand_days(days_text)

                canteen.opening_hours.append(CanteenOpeningHours(start=start_time, end=end_time, days=days))
    return canteens


if __name__ == "__main__":
    canteens = asyncio.run(get_canteen_menu())
    for canteen in canteens:
        print(canteen.model_dump())
