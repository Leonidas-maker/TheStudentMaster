from .conftest import *
import pytest
import requests
import random
from typing import List, Dict, Any
import datetime
import json

from config.settings import DEFAULT_TIMEZONE_RESPONSE  # type: ignore


def clean_lecture_name(name: str) -> str:
    """
    Cleans and formats the lecture name.

    :param name (str): Lecture name to clean.
    :return: str: Cleaned lecture name.
    """
    name = name.lower().title().strip()
    return name


def clean_room_info(rooms: List[str]) -> List[str]:
    """
    Cleans and formats the room information from a list of room strings.

    :param rooms (List[str]): List of room strings to clean.
    return: List[str]: List of cleaned room strings.
    """
    # Remove unnecessary prefixes and trim whitespace
    cleaned_rooms = [room.replace("VL-Raum", "").replace("Unterrichtsraum", "").strip() for room in rooms]
    return list(set(cleaned_rooms))


def normalize_target(target_list: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """
    Wandelt die Liste im 'Ziel-Schema' (mit entityType, startTime, rooms, …)
    in das Format der 'Quell-Liste' (start, end, summary, location, description) um.
    """
    today = datetime.date.today()

    normalized = {}
    for entry in target_list:
        end = datetime.datetime.fromisoformat(entry.get("endTime", "")).astimezone(DEFAULT_TIMEZONE_RESPONSE)
        if end.date() < today:
            continue  # Skip events that are in the past

        location = clean_room_info(entry.get("rooms", []))
        start = (
            datetime.datetime.fromisoformat(entry.get("startTime", ""))
            .astimezone(DEFAULT_TIMEZONE_RESPONSE)
            .replace(tzinfo=None)
            .isoformat()
        )
        end = end.replace(tzinfo=None).isoformat()

        summary = clean_lecture_name(entry.get("name", ""))

        normalized[hash(f"{summary}-{start}-{end}")] = {
            "start": start,
            "end": end,
            "summary": summary,
            "location": location,
        }
    return normalized


def filter_api_data(
    api_data: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Filter the API data to only include events for the specified course name.

    :param api_data: List of event data from the API.
    :param course_name: The name of the course to filter by.
    :return: Filtered list of events for the specified course.
    """
    now = datetime.datetime.now(DEFAULT_TIMEZONE_RESPONSE).replace(tzinfo=None)
    return [
        event
        for event in api_data
        if datetime.datetime.fromisoformat(event["start"])
        .astimezone(DEFAULT_TIMEZONE_RESPONSE)
        .replace(tzinfo=None)
        .date()
        >= now.date()
    ]


def test_correct_dhbw_data(client):
    res = client.get("/api/v1/calendar/available_calendars")
    assert res.status_code == 200, f"Expected status code 200, got {res.status_code}"
    available_calendars = res.json()
    assert isinstance(available_calendars, list), "Response data should be a list"
    for calendar in available_calendars:
        site = map_dhbw_university_to_site_code(calendar["university_name"])
        assert site is not None, "Site code should not be None for a valid university name"

        check_courses = (
            random.sample(calendar["course_names"], COURSES_COUNT_TO_CHECK)
            if len(calendar["course_names"]) > COURSES_COUNT_TO_CHECK
            else calendar["course_names"]
        )

        for course in check_courses:

            res = requests.get(f"https://api.dhbw.app/rapla/lectures/{site}-{course}")
            if res.status_code != 200:
                print(
                    f"Skipping course {course} for university {calendar['university_name']} due to API error: {res.status_code}"
                )
                continue
            dhbw_data = res.json()

            res = client.get(f"/api/v1/calendar/{calendar['university_uuid']}/{course}")
            assert res.status_code == 200, f"Expected status code 200, got {res.status_code}"
            calendar_data = filter_api_data(res.json()["data"]["events"])
            assert isinstance(calendar_data, list), "Response data should be a list"

            normalized_dhbw_data = normalize_target(dhbw_data)

            assert len(normalized_dhbw_data.keys()) == len(
                calendar_data
            ), f"Expected {len(normalized_dhbw_data.keys())} events, got {len(calendar_data)} for course {course} in {calendar['university_name']}"

            for event in calendar_data:
                event_hash = hash(f"{event['summary']}-{event['start']}-{event['end']}")
                assert (
                    event_hash in normalized_dhbw_data
                ), f"Event {event['summary']} not found in DHBW data for course {course} in {calendar['university_name']}"
            print(f"All events for course {course} in {calendar['university_name']} match DHBW.APP data.")
