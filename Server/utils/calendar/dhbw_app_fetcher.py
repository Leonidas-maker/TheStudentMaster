import requests
from dateutil import parser
import pytz
import json
from rich.progress import Progress
import hashlib
import asyncio
from typing import List, Dict


class DHBWAppFetcher:
    def __init__(self, progress):
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
            "abschlussklausur",
            "prüfungsform",
        ]
        self.progress = progress
        self.tz = pytz.timezone("Europe/Berlin")
        self.task_id = None

    def __dict_hash(self, dictionary: dict) -> str:
        dhash = hashlib.sha1()
        encoded = json.dumps(dictionary, sort_keys=True).encode("utf-8")
        dhash.update(encoded)
        return dhash.hexdigest()

    def get_nativ_dhbw_sources(self):
        response = requests.get("https://api.dhbw.dev/sites")

        if response.status_code != 200:
            print("Failed to fetch DHBW sources")
            return

        sources = response.json()

        available_sources = []

        for source in sources:
            if source.get("lectures") in ["active", "partial", "beta"]:
                available_sources.append(source.get("site"))

        return available_sources

    def __get_tags(self, lecture_name):
        tags = []
        if "online" in lecture_name.lower():
            tags.append("online")
        elif "hybrid" in lecture_name.lower():
            tags.append("hybrid")

        if any(ext in lecture_name for ext in self.exam_keywords):
            if "klausureinsicht" in lecture_name.lower():
                tags.append("exam_review")
            else:
                tags.append("exam")

        return tags

    def __convert_room_info(self, rooms: List[str]) -> str:
        for x in range(len(rooms)):
            rooms[x] = rooms[x].replace("VL-Raum", "").replace("Unterrichtsraum", "").strip()
        return "\n".join(rooms)

    def __convert_to_site_course_json(self, lectures: List[dict], _type: str, courses={}) -> dict:
        for lecture in lectures:
            # Get the site and course name
            splitted_course = lecture.get("course").split("-")
            site = splitted_course[0]
            course_name = "-".join(splitted_course[1:])

            # Get the lecture details
            start_time = parser.isoparse(lecture.get("startTime")).astimezone(self.tz)
            end_time = parser.isoparse(lecture.get("endTime")).astimezone(self.tz)
            lecture_name = lecture.get("name")

            tags = self.__get_tags(lecture_name)

            # Check if the site already exists in the courses dictionary
            if not courses.get(site):
                courses[site] = {}

            # Check if the type already exists in the courses dictionary
            if not courses[site].get(_type):
                courses[site][_type] = {}

            # Check if the course already exists in the courses dictionary
            if not courses[site][_type].get(course_name):
                courses[site][_type][course_name] = {"X-WR-TIMEZONE": self.tz.zone, "events": []}

            if _type == "deleted":
                courses[site][_type][course_name]["events"].append(lecture.get("id"))
            else:
                courses[site][_type][course_name]["events"].append(
                    {
                        lecture.get("id"): {
                            "start": start_time.strftime("%Y-%m-%dT%H:%M:%S"),
                            "end": end_time.strftime("%Y-%m-%dT%H:%M:%S"),
                            "summary": lecture_name,
                            "location": self.__convert_room_info(lecture.get("rooms")),
                            "description": {
                                "tags": tags,
                                "lecturer": lecture.get("lecturer", ""),
                                "id": lecture.get("id"),
                            },
                        }
                    }
                )

            self.progress.update(self.task_id, advance=1)
        return courses

    def get_updated_calendars(self) -> Dict[str, Dict[str, Dict[str, any]]]:
        self.task_id = self.progress.add_task(
            f"[bold green]Native-Calendar-DHBW[/bold green] Checking for updated calendars"
        )
        is_synced = False

        while is_synced is False:
            response = requests.get("https://api.dhbw.dev/sync/lectures/group/latest", params={"skip": 0, "amount": 1})

            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                return

            sync_status = response.json()[0]

            if sync_status.get("status") == "error":
                print("Failed to fetch DHBW updated calendars")
                return
            elif sync_status.get("status") == "running":
                asyncio.sleep(20)
            else:
                is_synced = True

        sync_infos = sync_status.get("syncInfos")

        needed_sync_info = []  # List of sync ids that are used for getting the detailed sync info
        for sync_info in sync_infos:
            sites = sync_info.get("sites")
            if sync_info.get("status") == "error":
                print(f"Synchronization of {sites} failed. Skipping...")
                continue

            if sync_info.get("hasChanges"):
                needed_sync_info.append(sync_info.get("id"))

        updated_calendars = {}
        for sync_id in needed_sync_info:
            response = requests.get(f"https://api.dhbw.dev/sync/lectures/info/{sync_id}")

            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                return

            sync_info = response.json()

            if sync_info.get("newLectures"):
                updated_calendars = self.__convert_to_site_course_json(
                    sync_info.get("newLectures"), "new", updated_calendars
                )

            if sync_info.get("updatedLectures"):
                updated_calendars = self.__convert_to_site_course_json(
                    sync_info.get("updatedLectures"), "updated", updated_calendars
                )

            if sync_info.get("deletedLectures"):
                updated_calendars = self.__convert_to_site_course_json(
                    sync_info.get("deletedLectures"), "deleted", updated_calendars
                )

        self.progress.remove_task(self.task_id)

        # Return structure:
        # {
        #     "site": {
        #         "new": {
        #             "course_name": {
        #                 "X-WR-TIMEZONE": "Europe/Berlin",
        #                 "events": [
        #                     "{lecture_id}": {
        #                         ...
        #                     }
        #                 ]
        #             }
        #         },
        #         "updated": {
        #             "course_name": {
        #                 "X-WR-TIMEZONE": "Europe/Berlin",
        #                 "events": [
        #                     "{lecture_id}": {
        #                         ...
        #                     }
        #                 ]
        #             }
        #         },
        #         "deleted": {
        #             "course_name": {
        #                 "X-WR-TIMEZONE": "Europe/Berlin",
        #                 "events": [
        #                     "{lecture_id}"
        #                 ]
        #             }
        #         }
        #     }
        # }
        return updated_calendars

    def get_all_calendars(self, site) -> Dict[str, Dict[str, any]]:
        response = requests.get(f"https://api.dhbw.app/rapla/{site}/lectures")

        if response.status_code != 200:
            print(f"Failed to fetch DHBW calendar for {site}")
            return

        lectures = response.json()

        if not lectures:
            return

        self.task_id = self.progress.add_task(
            f"[bold green]Native-Calendar-DHBW[/bold green] Processing {site.upper()} calendar", total=len(lectures)
        )

        courses = {}
        for lecture in lectures:
            course_name = lecture.get("course").replace(f"{site}-", "")
            self.progress.update(self.task_id, advance=1)

            start_time = parser.isoparse(lecture.get("startTime")).astimezone(self.tz)
            end_time = parser.isoparse(lecture.get("endTime")).astimezone(self.tz)
            lecture_name = lecture.get("name")

            tags = self.__get_tags(lecture_name)

            # Check if the course already exists in the courses dictionary
            if not courses.get(course_name):
                courses[course_name] = {"data": {"X-WR-TIMEZONE": self.tz.zone, "events": []}, "hash": ""}

            # Add the lecture to the course
            courses[course_name]["data"]["events"].append(
                {
                    "start": start_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "end": end_time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "summary": lecture_name,
                    "location": self.__convert_room_info(lecture.get("rooms")),
                    "description": {
                        "tags": tags,
                        "lecturer": lecture.get("lecturer", ""),
                        "id": lecture.get("id"),
                    },
                }
            )

        for course in courses:
            courses[course]["hash"] = self.__dict_hash(courses[course]["data"])

        self.progress.remove_task(self.task_id)
        return courses


if __name__ == "__main__":
    fetcher = DHBWAppFetcher(Progress())
    print(fetcher.get_updated_calendars())
