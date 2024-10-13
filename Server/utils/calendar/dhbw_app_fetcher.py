# ~~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~~ #
import requests
from rich.progress import Progress
import asyncio
from typing import List, Dict
import json

# ~~~~~~~~~~~~~~ Own Imports ~~~~~~~~~~~~~~ #
import models.pydantic_schemas.s_calendar as Scheme
from config.general import DEFAULT_TIMEZONE, MAX_COURSE_NAME_LENGTH

###########################################################################
############################## DHBWAppFetcher #############################
###########################################################################

class DHBWAppFetcher:
    """
    A class to fetch and process DHBW calendar data from the DHBW API.

    Attributes:
        exam_keywords (List[str]): Keywords used to identify exam sessions.
        online_keywords (List[str]): Keywords used to identify online sessions.
        progress (Progress): Rich Progress instance for displaying progress.
        tz (str): Default timezone setting.
        task_id (Optional[int]): ID for tracking progress tasks.
    """

    def __init__(self, progress: Progress):
        """
        Initializes the DHBWAppFetcher with a progress tracker.

        Args:
            progress (Progress): An instance of Rich's Progress for displaying progress bars.
        """
        self.exam_keywords = [
            "klausur",
            "exam",
            "prüfung",
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

    def __convert_sessions_to_dhbw_course(self, sessions: List[dict], site: str) -> Scheme.DHBWCourses:
        """
        Converts a list of session dictionaries into a structured DHBWCourses object.

        Args:
            sessions (List[dict]): List of session data dictionaries.
            site (str): Site identifier (e.g., "KA", "VS", etc.)

        Returns:
            Scheme.DHBWCourses: Structured courses data.
        """
        # Add progress tracking for processing sessions
        self.task_id = self.progress.add_task(
            f"[bold green]Native-Calendar-DHBW[/bold green] Processing {site.upper()} calendar", total=len(sessions)
        )

        courses = Scheme.DHBWCourses(courses={})
        for session in sessions:
            # Extract course name and lecture name, applying max length limits
            course_name = session.get("course").replace(f"{site.upper()}-", "")[:MAX_COURSE_NAME_LENGTH]
            lecture_name = session.get("name").strip()[:MAX_COURSE_NAME_LENGTH]

            # Initialize course in courses dict if not present
            if not courses.courses.get(course_name):
                courses.courses[course_name] = {}

            # Initialize lecture in course if not present
            if lecture_name and not courses.courses[course_name].get(lecture_name):
                courses.courses[course_name][lecture_name] = Scheme.DHBWLecture(
                    lecturer="",
                    sessions={},
                )

            # Update lecturer information
            if (
                session.get("lecturer")
                and session.get("lecturer") not in courses.courses[course_name][lecture_name].lecturer
            ):
                if courses.courses[course_name][lecture_name].lecturer:
                    courses.courses[course_name][lecture_name].lecturer += f", {session.get('lecturer')}"
                else:
                    courses.courses[course_name][lecture_name].lecturer = session.get("lecturer")

            # Add session to lecture sessions
            external_id = str(session.get("id", ""))
            new_session = Scheme.SessionBase(
                start=session.get("startTime"),
                end=session.get("endTime"),
                rooms=self.__clean_room_info(session.get("rooms")),
                tags=self.__get_tags(session.get("name"), " ".join(session.get("rooms"))),
            )

            # Avoid adding duplicate sessions
            session_exists = False
            for _, existing_session in courses.courses[course_name][lecture_name].sessions.items():
                if (
                    existing_session.start == new_session.start
                    and existing_session.end == new_session.end
                    and existing_session.rooms == new_session.rooms
                ):
                    session_exists = True
                    break

            if not session_exists:
                courses.courses[course_name][lecture_name].sessions[external_id] = new_session

            # Update progress bar
            self.progress.update(self.task_id, advance=1)

        # Remove progress task after completion
        self.progress.remove_task(self.task_id)

        return courses

    def __get_tags(self, lecture_name: str, room_str: str) -> List[str]:
        """
        Determines tags for a session based on lecture name and room information.

        Args:
            lecture_name (str): Name of the lecture.
            room_str (str): String containing room information.

        Returns:
            List[str]: A list of tags associated with the session.
        """
        tags = []
        lecture_name_lower = lecture_name.lower()

        # Check if the session is online or hybrid
        if any(
            (online_keyword in lecture_name_lower or online_keyword in room_str)
            for online_keyword in self.online_keywords
        ):
            tags.append("online")
        elif "hybrid" in lecture_name_lower:
            tags.append("hybrid")

        # Check if the session is an exam
        if any(exam_keyword in lecture_name_lower for exam_keyword in self.exam_keywords):
            if "klausureinsicht" in lecture_name_lower:
                tags.append("exam_review")
            else:
                tags.append("exam")

        return tags

    def __clean_room_info(self, rooms: List[str]) -> List[str]:
        """
        Cleans and formats the room information from a list of room strings.

        Args:
            rooms (List[str]): List of room strings to clean.

        Returns:
            List[str]: List of cleaned room strings.
        """
        # Remove unnecessary prefixes and trim whitespace
        cleaned_rooms = [room.replace("VL-Raum", "").replace("Unterrichtsraum", "").strip() for room in rooms]
        return cleaned_rooms

    def __get_new_sessions(
        self, lectures_input: List[dict], updated_sites: Dict[str, Scheme.DHBWCourseUpdate]
    ) -> Dict[str, Scheme.DHBWCourseUpdate]:
        """
        Processes new lectures and updates the updated_sites dictionary with new sessions.

        Args:
            lectures_input (List[dict]): List of new lecture data dictionaries.
            updated_sites (Dict[str, Scheme.DHBWCourseUpdate]): Dictionary to update with new sessions.

        Returns:
            Dict[str, Scheme.DHBWCourseUpdate]: Updated dictionary with new sessions added.
        """
        for lecture_input in lectures_input:
            # Skip if essential data is missing
            if not lecture_input.get("course") or not lecture_input.get("name") or not lecture_input.get("id"):
                continue

            # Extract site and course name
            splitted_course = lecture_input.get("course").split("-")
            site = splitted_course[0]
            course_name = "-".join(splitted_course[1:])[:MAX_COURSE_NAME_LENGTH]

            session_external_id = str(lecture_input.get("id"))
            lecture_name = lecture_input.get("name").strip()[:MAX_COURSE_NAME_LENGTH]

            # Initialize site in updated_sites if not present
            if site not in updated_sites.keys():
                updated_sites[site] = Scheme.DHBWCourseUpdate(courses={})

            # Initialize the deleted sessions list if not present
            if updated_sites.get(site).deleted_sessions is None:
                updated_sites[site].deleted_sessions = []

            # Prepare the session object
            session = Scheme.SessionBase(
                start=lecture_input.get("startTime"),
                end=lecture_input.get("endTime"),
                rooms=self.__clean_room_info(lecture_input.get("rooms")),
                tags=self.__get_tags(lecture_input.get("name"), " ".join(lecture_input.get("rooms"))),
            )

            # Initialize course and lecture if not present
            if not updated_sites[site].courses.get(course_name):
                updated_sites[site].courses[course_name] = {}
            if not updated_sites[site].courses[course_name].get(lecture_name):
                updated_sites[site].courses[course_name][lecture_name] = Scheme.DHBWLecture(
                    lecturer="",
                    sessions={},
                )

            # Update lecturer information
            if lecture_input.get("lecturer") and lecture_input.get("lecturer") not in updated_sites[site].courses[course_name][lecture_name].lecturer:
                if updated_sites[site].courses[course_name][lecture_name].lecturer:
                    updated_sites[site].courses[course_name][lecture_name].lecturer += f", {lecture_input.get('lecturer')}"
                else:
                    updated_sites[site].courses[course_name][lecture_name].lecturer = lecture_input.get("lecturer")

            # Add session to lecture sessions
            updated_sites[site].courses[course_name][lecture_name].sessions[session_external_id] = session

        return updated_sites

    def __get_updated_sessions(
        self, lectures_input: List[dict], updated_sites: Dict[str, Scheme.DHBWCourseUpdate]
    ) -> Dict[str, Scheme.DHBWCourseUpdate]:
        """
        Processes updated lectures and updates the updated_sites dictionary with updated sessions.

        Args:
            lectures_input (List[dict]): List of updated lecture data dictionaries.
            updated_sites (Dict[str, Scheme.DHBWCourseUpdate]): Dictionary to update with updated sessions.

        Returns:
            Dict[str, Scheme.DHBWCourseUpdate]: Updated dictionary with updated sessions added.
        """
        updated_sessions = {}
        proccessed_courses = []
        for lecture_input in lectures_input:
            # Extract site from the course identifier
            site = lecture_input.get("lecture").get("course").split("-")[0]
            if not updated_sessions.get(site):
                updated_sessions[site] = []

            # Skip if the course has already been processed
            if lecture_input.get("lecture").get("course") in proccessed_courses:
                continue
            # Fetch the latest sessions for the course
            response = requests.get(f"https://api.dhbw.app/rapla/lectures/{lecture_input.get('lecture').get('course')}")
            if response.status_code != 200:
                print(f"Failed to fetch DHBW calendar for {lecture_input.get('lecture').get('course')}")
                continue

            sessions = response.json()
            proccessed_courses.append(lecture_input.get("lecture").get("course"))
            updated_sessions[site].extend(sessions)

        # Convert fetched sessions into structured format and update updated_sites
        for site, sessions in updated_sessions.items():
            structured_sessions: Scheme.DHBWCourses = self.__convert_sessions_to_dhbw_course(sessions, site)
            if not updated_sites.get(site):
                updated_sites[site] = Scheme.DHBWCourseUpdate(courses=structured_sessions.courses, deleted_sessions=[])
                continue

            if not updated_sites.get(site).courses:
                updated_sites[site].courses = structured_sessions.courses

            for course_name, lectures in structured_sessions.courses.items():
                if not updated_sites[site].courses.get(course_name):
                    updated_sites[site].courses[course_name] = lectures
                    continue

                for lecture_name, lecture in lectures.items():
                    updated_sites[site].courses[course_name][lecture_name] = lecture
        return updated_sites

    def __get_deleted_sessions(
        self, lectures_input: List[dict], updated_sites: Dict[str, Scheme.DHBWCourseUpdate]
    ) -> Dict[str, Scheme.DHBWCourseUpdate]:
        """
        Processes removed lectures and updates the updated_sites dictionary with deleted session IDs.

        Args:
            lectures_input (List[dict]): List of removed lecture data dictionaries.
            updated_sites (Dict[str, Scheme.DHBWCourseUpdate]): Dictionary to update with deleted session IDs.

        Returns:
            Dict[str, Scheme.DHBWCourseUpdate]: Updated dictionary with deleted sessions recorded.
        """
        # Extract site from the first lecture input
        site = lectures_input[0].get("course").split("-")[0]
        # Collect external IDs of deleted sessions
        external_ids = [str(lecture_input.get("id")) for lecture_input in lectures_input]
        if not updated_sites.get(site):
            updated_sites[site] = Scheme.DHBWCourseUpdate(courses={}, deleted_sessions=external_ids)
        else:
            updated_sites[site].deleted_sessions.extend(external_ids)

        return updated_sites

    def __process_sync_info(
        self, sync_info: dict, updated_courses: Dict[str, Scheme.DHBWCourseUpdate]
    ) -> Dict[str, Scheme.DHBWCourseUpdate]:
        """
        Processes synchronization information from the DHBW API and updates the updated_courses dictionary.

        Args:
            sync_info (dict): Synchronization information containing new, updated, and removed lectures.
            updated_courses (Dict[str, Scheme.DHBWCourseUpdate]): Dictionary to update with synchronization data.

        Returns:
            Dict[str, Scheme.DHBWCourseUpdate]: Updated dictionary with synchronization data processed.
        """
        if sync_info.get("newLectures"):
            updated_courses = self.__get_new_sessions(sync_info.get("newLectures"), updated_courses)
        if sync_info.get("updatedLectures"):
            updated_courses = self.__get_updated_sessions(sync_info.get("updatedLectures"), updated_courses)
        if sync_info.get("removedLectures"):
            updated_courses = self.__get_deleted_sessions(sync_info.get("removedLectures"), updated_courses)
        return updated_courses

    # ======================================================== #
    # ======================== Getters ======================= #
    # ======================================================== #

    def get_nativ_dhbw_sources(self) -> List[str]:
        """
        Fetches available DHBW sources from the DHBW API.

        Returns:
            List[str]: List of available DHBW sources.
        """
        response = requests.get("https://api.dhbw.app/sites")
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
        Fetches updated calendars from the DHBW API and processes synchronization information.

        This function waits for the latest synchronization to complete if it is currently running.

        Returns:
            Dict[str, Scheme.DHBWCourseUpdate]: Updated calendar data structured in a dictionary.
        """
        is_synced = False

        while not is_synced:
            response = requests.get("https://api.dhbw.app/sync/lectures/group/latest", params={"skip": 0, "amount": 1})

            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                return {}

            sync_status = response.json()[0]

            if sync_status.get("status") == "error":
                print("Failed to fetch DHBW updated calendars")
                return {}
            elif sync_status.get("status") == "running":
                # Wait for synchronization to complete
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
            response = requests.get(f"https://api.dhbw.app/sync/lectures/info/{sync_id}")
            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                continue

            sync_info = response.json()
            updated_courses = self.__process_sync_info(sync_info, updated_courses)

        return updated_courses

    def get_all_calendars(self, site: str) -> Scheme.DHBWCourses:
        """
        Fetches all calendar data for a given site from the DHBW API and processes it.

        Args:
            site (str): Site identifier (e.g., "KA", "VS", etc.)

        Returns:
            Scheme.DHBWCourses: Structured courses data.
        """
        response = requests.get(f"https://api.dhbw.app/rapla/{site}/lectures")
        if response.status_code != 200:
            print(f"Failed to fetch DHBW calendar for {site}")
            return {}

        sessions = response.json()
        if not sessions:
            return {}
        return self.__convert_sessions_to_dhbw_course(sessions, site)