# ~~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~~ #
import requests
from rich.progress import Progress
import asyncio
from typing import List, Dict



# ~~~~~~~~~~~~~~ Own Imports ~~~~~~~~~~~~~~ #
import models.pydantic_schemas.s_calendar as Scheme
from config.general import DEFAULT_TIMEZONE, MAX_COURSE_NAME_LENGTH


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

    # ======================================================== #
    # ======================== Helpers ======================= #
    # ======================================================== #
    def __get_tags(self, lecture_name: str, room_str: str) -> List[str]:
        tags = []
        lecture_name_lower = lecture_name.lower()
        if any((online_keyword in lecture_name_lower or online_keyword in room_str) for online_keyword in self.online_keywords):
            tags.append("online")
        elif "hybrid" in lecture_name_lower:
            tags.append("hybrid")

        if any(exam_keyword in lecture_name_lower for exam_keyword in self.exam_keywords):
            if "klausureinsicht" in lecture_name_lower:
                tags.append("exam_review")
            else:
                tags.append("exam")
        return tags

    def __clean_room_info(self, rooms: List[str]) -> List[str]:
        """
        Converts the list of rooms to a string.

        :param rooms: List of rooms to convert to a string.
        """
        cleaned_rooms = [room.replace("VL-Raum", "").replace("Unterrichtsraum", "").strip() for room in rooms]
        return cleaned_rooms

    def __convert_to_site_course_models(
        self, lectures_input: List[dict], _type: str, updated_sites: Dict[str, Scheme.DHBWCourseUpdate]
    ) -> Dict[str, Scheme.DHBWCourseUpdate]:

        for lecture_input in lectures_input:
            if not lecture_input.get("course") or not lecture_input.get("name") or not lecture_input.get("id"):
                continue

            # Get the site and course name
            splitted_course = lecture_input.get("course").split("-")
            site = splitted_course[0]
            course_name = "-".join(splitted_course[1:])[:MAX_COURSE_NAME_LENGTH]

            session_external_id = str(lecture_input.get("id"))
            lecture_name = lecture_input.get("name")[:MAX_COURSE_NAME_LENGTH]

            # Initialize the site in courses if not present
            if site not in updated_sites.keys():
                updated_sites[site] = Scheme.DHBWCourseUpdate(courses={})

            # Initialize the deleted sessions list if not present
            if updated_sites.get(site).deleted_sessions:
                updated_sites[site].deleted_sessions = []


            # Prepare the session
            session = Scheme.SessionBase(
                start=lecture_input.get("startTime"),
                end=lecture_input.get("endTime"),
                rooms=self.__clean_room_info(lecture_input.get("rooms")),
                tags=self.__get_tags(lecture_input.get("name"), " ".join(lecture_input.get("rooms"))),
            )
            
            # Add the event to the appropriate type and course
            if _type == "deleted":
                updated_sites.get(site).deleted_sessions.append(session_external_id)
            elif _type == "new" or _type == "updated":
                # Initialize the course if not present
                if not updated_sites.get(site).courses.get(course_name):
                    updated_sites.get(site).courses[course_name] = {}

                # Initialize the lecture if not present
                if not updated_sites.get(site).courses[course_name].get(lecture_name):
                    updated_sites.get(site).courses[course_name][lecture_name] = Scheme.DHBWLecture(
                        lecturer="",
                        sessions={},
                    )

                # Update the lecturer
                if lecture_name not in updated_sites.get(site).courses[course_name][lecture_name].lecturer:
                    if updated_sites.get(site).courses[course_name][lecture_name].lecturer:
                        updated_sites.get(site).courses[course_name][lecture_name].lecturer += f", {lecture_name}"
                    else:
                        updated_sites.get(site).courses[course_name][lecture_name].lecturer = lecture_name

                updated_sites.get(site).courses[course_name][lecture_name].sessions[session_external_id] = session
                
            self.progress.update(self.task_id, advance=1)
        return updated_sites


    def __process_sync_info(self, sync_info: dict, updated_courses: Dict[str, Scheme.DHBWCourseUpdate]) -> Dict[str, Scheme.DHBWCourseUpdate]:
        if sync_info.get("newLectures"):
            updated_courses = self.__convert_to_site_course_models(
                sync_info.get("newLectures"), "new", updated_courses
            )

        if sync_info.get("updatedLectures"):
            updated_courses = self.__convert_to_site_course_models(
                sync_info.get("updatedLectures"), "updated", updated_courses
            )

        if sync_info.get("removedLectures"):
            updated_courses = self.__convert_to_site_course_models(
                sync_info.get("removedLectures"), "deleted", updated_courses
            )
        return updated_courses
    
    # ======================================================== #
    # ======================== Getters ======================= #
    # ======================================================== #

    def get_nativ_dhbw_sources(self) -> List[str]:
        """
        Fetches available DHBW sources from the DHBW API.

        This function retrieves and returns available DHBW sources from the DHBW API.

        :return: List of available DHBW sources.        
        """

        response = requests.get("https://api.dhbw.dev/sites")
        if response.status_code != 200:
            print("Failed to fetch DHBW sources")
            return []

        sources = response.json()
        available_sources = [
            source.get("site") for source in sources if source.get("lectures") in ["active", "partial", "beta"]
        ]
        return available_sources


    async def get_updated_calendars(self) -> Dict[str, Scheme.DHBWCourseUpdate]:
        """
        Fetches updated calendars from the DHBW API.

        This function retrieves and returns updated calendar data from the DHBW API.
        The returned data is structured using Pydantic models for validation and serialization.

        :return: Updated calendar data.
        """
        self.task_id = self.progress.add_task(
            "[bold green]Native-Calendar-DHBW[/bold green] Checking for updated calendars"
        )
        is_synced = False

        while not is_synced:
            response = requests.get("https://api.dhbw.dev/sync/lectures/group/latest", params={"skip": 0, "amount": 1})

            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                self.progress.remove_task(self.task_id)
                return {}

            sync_status = response.json()[0]

            if sync_status.get("status") == "error":
                print("Failed to fetch DHBW updated calendars")
                self.progress.remove_task(self.task_id)
                return {}
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

        updated_courses = {}
        for sync_id in needed_sync_ids:
            response = requests.get(f"https://api.dhbw.dev/sync/lectures/info/{sync_id}")
            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                continue

            sync_info = response.json()
            updated_courses = self.__process_sync_info(sync_info, updated_courses)

        self.progress.remove_task(self.task_id)

        return updated_courses

    

    def get_all_calendars(self, site: str) -> Scheme.DHBWCourses:
        response = requests.get(f"https://api.dhbw.app/rapla/{site}/lectures")
        if response.status_code != 200:
            print(f"Failed to fetch DHBW calendar for {site}")
            return {}

        sessions = response.json()
        if not sessions:
            return {}

        self.task_id = self.progress.add_task(
            f"[bold green]Native-Calendar-DHBW[/bold green] Processing {site.upper()} calendar", total=len(sessions)
        )

        courses = Scheme.DHBWCourses(courses={})
        for session in sessions:
            # Get the course name
            course_name = session.get("course").replace(f"{site.upper()}-", "")[:MAX_COURSE_NAME_LENGTH]
            session_name = session.get("name")[:MAX_COURSE_NAME_LENGTH]
            
            # Initialize the course if not present
            if not courses.courses.get(course_name):
                courses.courses[course_name] = {}

            # Initialize the lecture if not present
            if session_name and not courses.courses[course_name].get(session_name):
                courses.courses[course_name][session.get("name")[:MAX_COURSE_NAME_LENGTH]] = Scheme.DHBWLecture(
                    lecturer="",
                    sessions={},
                )

            # Update the lecturer
            if session.get("lecturer") and session.get("lecturer") not in courses.courses[course_name][session_name].lecturer:
                if courses.courses[course_name][session_name].lecturer:
                    courses.courses[course_name][session_name].lecturer += f", {session.get('lecturer')}"
                else:
                    courses.courses[course_name][session_name].lecturer = session.get("lecturer")

            # Add the session
            external_id = str(session.get("id", ""))
            new_session = Scheme.SessionBase(
                start=session.get("startTime"),
                end=session.get("endTime"),
                rooms=self.__clean_room_info(session.get("rooms")),
                tags=self.__get_tags(session.get("name"), " ".join(session.get("rooms"))),
            )
            session_exists = False
            for _, exsitent_session in courses.courses[course_name][session_name].sessions.items():
                if exsitent_session.start == new_session.start and exsitent_session.end == new_session.end and exsitent_session.rooms == new_session.rooms:
                    session_exists = True
                    break

            if not session_exists:
                courses.courses[course_name][session_name].sessions[external_id] = new_session

            self.progress.update(self.task_id, advance=1)

        self.progress.remove_task(self.task_id)
        return courses