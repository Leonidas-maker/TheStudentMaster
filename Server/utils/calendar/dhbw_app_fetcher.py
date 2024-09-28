# ~~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~~ #
import requests
from dateutil import parser
import pytz
from rich.progress import Progress
import asyncio
from typing import List, Dict

import hashlib
import json


# ~~~~~~~~~~~~~~ Own Imports ~~~~~~~~~~~~~~ #
def dict_hash(dictionary: dict) -> str:
    dhash = hashlib.sha1()
    encoded = json.dumps(dictionary, sort_keys=True).encode("utf-8")
    dhash.update(encoded)
    return dhash.hexdigest()


from utils.helpers.hashing import dict_hash
from utils.calendar.schemes import (
    Event,
    EventDescription,
    EventData,
    DEFAULT_TIMEZONE,
    CourseData,
    DHBWUpdateSiteBase,
    DHBWUpdateCalendar,
    EventData,
    DHBWCourse,
)


###########################################################################
############################## DHBWAppFetcher #############################
###########################################################################


class DHBWAppFetcher:
    def __init__(self, progress: Progress):
        self.exam_keywords = [
            "klausur",
            "exam",
            "prüfung",
            "test",
            "quiz",
            "examen",
            "examination",
            "prüfungsleistung",
            "abschlussklausur",
            "abschlussprüfung",
            "abschlussarbeit",
            "prüfungsform",
        ]

        self.online_keywords = ["online", "e-learning"]

        self.progress = progress
        self.tz = DEFAULT_TIMEZONE
        self.task_id = None

    def __remove_duplicate_events(self, events: List[Event], unique_keys: List[str]) -> List[Event]:
        seen = set()  # Set zum Speichern der einzigartigen Kombinationen
        result = []

        for event in events:
            # Erstelle einen Schlüssel basierend auf den Werten der einzigartigen Felder
            key = tuple(getattr(event, key) for key in unique_keys)

            if key not in seen:
                seen.add(key)  # Füge den Schlüssel zum Set hinzu
                result.append(event)  # Füge das Event zur Ergebnisliste hinzu

        return result

    def get_nativ_dhbw_sources(self) -> List[str]:
        response = requests.get("https://api.dhbw.dev/sites")
        if response.status_code != 200:
            print("Failed to fetch DHBW sources")
            return []

        sources = response.json()
        available_sources = [
            source.get("site") for source in sources if source.get("lectures") in ["active", "partial", "beta"]
        ]
        return available_sources

    def __get_tags(self, lecture_name: str) -> List[str]:
        tags = []
        lecture_name_lower = lecture_name.lower()
        if any(keyword in lecture_name_lower for keyword in self.online_keywords):
            tags.append("online")
        elif "hybrid" in lecture_name_lower:
            tags.append("hybrid")

        if any(keyword in lecture_name_lower for keyword in self.exam_keywords):
            if "klausureinsicht" in lecture_name_lower:
                tags.append("exam_review")
            else:
                tags.append("exam")
        return tags

    def __convert_room_info(self, rooms: List[str]) -> str:
        cleaned_rooms = [room.replace("VL-Raum", "").replace("Unterrichtsraum", "").strip() for room in rooms]
        return "\n".join(cleaned_rooms)

    def __convert_to_site_course_models(
        self, lectures: List[dict], _type: str, courses: DHBWUpdateCalendar = DHBWUpdateCalendar(data={})
    ) -> DHBWUpdateCalendar:

        for lecture in lectures:
            # Get the site and course name
            splitted_course = lecture.get("course").split("-")
            site = splitted_course[0]
            course_name = "-".join(splitted_course[1:])

            # Initialize the site in courses if not present
            if site not in courses.data:
                courses.data[site] = DHBWUpdateSiteBase(new={}, updated={}, deleted=[])

            # Prepare the event
            event = Event(
                start=lecture.get("startTime"),
                end=lecture.get("endTime"),
                summary=lecture.get("name"),
                location=self.__convert_room_info(lecture.get("rooms")),
                description=EventDescription(
                    tags=self.__get_tags(lecture.get("name")),
                    lecturer=lecture.get("lecturer", ""),
                    id=lecture.get("id"),
                ),
            )

            # Add the event to the appropriate type and course
            site_data = courses.data[site]
            if _type == "deleted":
                site_data.deleted.append(lecture.get("id"))
            elif _type == "new":
                site_data.new.setdefault(course_name, {})[lecture.get("id")] = event
            elif _type == "updated":
                site_data.updated.setdefault(course_name, {})[lecture.get("id")] = event
                

            self.progress.update(self.task_id, advance=1)
        return courses

    async def get_updated_calendars(self) -> DHBWUpdateCalendar:
        """
        Fetches updated calendars from the DHBW API.

        This function retrieves and returns updated calendar data from the DHBW API.
        The returned data is structured using Pydantic models for validation and serialization.

        Returns:
            DHBWUpdateCalendar: A Pydantic model containing the updated calendars.
        """
        self.task_id = self.progress.add_task(
            "[bold green]Native-Calendar-DHBW[/bold green] Checking for updated calendars"
        )
        is_synced = False

        while not is_synced:
            response = requests.get("https://api.dhbw.dev/sync/lectures/group/latest", params={"skip": 3, "amount": 1})

            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                self.progress.remove_task(self.task_id)
                return DHBWUpdateCalendar(data={})

            sync_status = response.json()[0]

            if sync_status.get("status") == "error":
                print("Failed to fetch DHBW updated calendars")
                self.progress.remove_task(self.task_id)
                return DHBWUpdateCalendar(data={})
            elif sync_status.get("status") == "running":
                await asyncio.sleep(20)
            else:
                is_synced = True

        sync_infos = sync_status.get("syncInfos", [])
        needed_sync_ids = [
            sync_info.get("id")
            for sync_info in sync_infos
            if sync_info.get("status") != "error" and sync_info.get("hasChanges")
        ]

        updated_calendars = DHBWUpdateCalendar(data={})
        for sync_id in needed_sync_ids:
            response = requests.get(f"https://api.dhbw.dev/sync/lectures/info/{sync_id}")
            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                continue

            sync_info = response.json()
            updated_calendars = self.__process_sync_info(sync_info, updated_calendars)

        self.progress.remove_task(self.task_id)
        return updated_calendars

    def __process_sync_info(self, sync_info: dict, updated_calendars: DHBWUpdateCalendar) -> DHBWUpdateCalendar:
        if sync_info.get("newLectures"):
            updated_calendars = self.__convert_to_site_course_models(
                sync_info.get("newLectures"), "new", updated_calendars
            )

        if sync_info.get("updatedLectures"):
            updated_calendars = self.__convert_to_site_course_models(
                sync_info.get("updatedLectures"), "updated", updated_calendars
            )

        if sync_info.get("removedLectures"):
            updated_calendars = self.__convert_to_site_course_models(
                sync_info.get("removedLectures"), "deleted", updated_calendars
            )

        return updated_calendars

    def get_all_calendars(self, site: str) -> DHBWCourse:
        response = requests.get(f"https://api.dhbw.app/rapla/{site}/lectures")
        if response.status_code != 200:
            print(f"Failed to fetch DHBW calendar for {site}")
            return {}

        lectures = response.json()
        if not lectures:
            return {}

        self.task_id = self.progress.add_task(
            f"[bold green]Native-Calendar-DHBW[/bold green] Processing {site.upper()} calendar", total=len(lectures)
        )

        courses = DHBWCourse(data={})
        for lecture in lectures:
            course_name = lecture.get("course").replace(f"{site}-", "")
            event = Event(
                id=lecture.get("id"),
                start=lecture.get("startTime"),
                end=lecture.get("endTime"),
                summary=lecture.get("name"),
                location=self.__convert_room_info(lecture.get("rooms")),
                description=EventDescription(
                    tags=self.__get_tags(lecture.get("name")),
                    lecturer=lecture.get("lecturer", ""),
                    id=lecture.get("id"),
                ),
            )

            # Initialize the course in courses if not present
            if course_name not in courses.data:
                courses.data[course_name] = CourseData(data=EventData(events=[]), hash="")

            # Add the event to the course
            courses.data[course_name].data.events.append(event)
            self.progress.update(self.task_id, advance=1)

        # Calculate hashes for each course
        for course in courses.data.values():
            course.data.events = self.__remove_duplicate_events(course.data.events, ["start", "end", "summary", "location"])
            course.hash = dict_hash(course.data.model_dump())

        self.progress.remove_task(self.task_id)
        return courses