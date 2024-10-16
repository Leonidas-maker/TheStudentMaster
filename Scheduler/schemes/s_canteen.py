from pydantic import BaseModel, field_validator, field_serializer
from typing import List, Dict
from datetime import datetime

class CanteenMenu(BaseModel):
    """
    Represents a menu item in a canteen, including details like name, descriptions, price, quantity,
    tags, and the date the menu is available.

    :param name: Name of the menu item.
    :param descriptions: List of sets representing descriptions and additional information for the menu item.
    :param price: Price of the menu item.
    :param quantity: Quantity available.
    :param tags: List of tags associated with the menu item (e.g., dietary information).
    :param date: Date the menu is valid for, without the time component.
    """

    name: str
    descriptions: List[set]
    price: str
    quantity: str
    tags: List[str]
    date: datetime

    @field_validator("date", mode="before")
    def remove_time(cls, value):
        """
        Validator to remove the time component from the provided date value.

        :param value: The datetime object to be validated.
        :return: A datetime object with the time components set to zero.
        :raises ValueError: If the input is not a valid datetime object.
        """
        if isinstance(value, datetime):
            return value.replace(hour=0, minute=0, second=0, microsecond=0)
        raise ValueError("Invalid datetime format")

    @field_serializer("date", mode="plain")
    def serialize_date(cls, value):
        """
        Serializer to format the datetime object as a string in "YYYY-MM-DD" format.

        :param value: The datetime object to be serialized.
        :return: A string representing the date in "YYYY-MM-DD" format.
        :raises ValueError: If the input is not a valid datetime object.
        """
        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d")
        raise ValueError("Invalid datetime format")


class CanteenOpeningHours(BaseModel):
    """
    Represents the opening hours of a canteen.

    :param start: The starting time of the canteen's opening hours (e.g., "08:00").
    :param end: The ending time of the canteen's opening hours (e.g., "18:00").
    :param days: A list of days on which the canteen is open (e.g., ["Mo", "Di", "Mi"]).
    """

    start: str
    end: str
    days: List[str]


class Canteen(BaseModel):
    """
    Represents a canteen, including its name, ID, opening hours, and menus.

    :param name: The name of the canteen.
    :param _id: The unique identifier for the canteen.
    :param opening_hours: A list of CanteenOpeningHours objects representing the opening hours of the canteen.
    :param menus: A dictionary where the keys are menu types (e.g., "Lunch", "Dinner") and the values are lists of CanteenMenu objects.
    """

    name: str
    _id: str
    opening_hours: List[CanteenOpeningHours]
    menus: Dict[str, List[CanteenMenu]]
