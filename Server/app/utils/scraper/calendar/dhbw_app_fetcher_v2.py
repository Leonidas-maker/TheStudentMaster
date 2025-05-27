# ~~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~~ #
import requests
from rich import print
from rich.progress import Progress
import asyncio
from typing import List, Dict
import time
import pytz

# ~~~~~~~~~~~~~~ Own Imports ~~~~~~~~~~~~~~ #
import schemas.s_calendar as schemes

# from config.general import DEFAULT_TIMEZONE, MAX_COURSE_NAME_LENGTH

DEFAULT_TIMEZONE = pytz.timezone("UTC")
MAX_COURSE_NAME_LENGTH = 255

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

        :param progress (Progress): An instance of Rich's Progress for displaying progress bars.
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
    def __get_tags(self, lecture: schemes.ApiLectureDTO) -> List[str]:
        """
        Determines tags for a session based on lecture name and room information.

        :param lecture (schemes.ApiLectureDTO): Lecture data object.
        :return: List[str]: List of tags associated with the session.
        """
        tags = set()
        lecture_name_lower = lecture.name.lower()

        if lecture.type.lower() == "online":
            tags.add("online")
        elif lecture.type.lower() == "hybrid":
            tags.add("hybrid")

        # Check if the session is online or hybrid
        if any(
            (online_keyword in lecture_name_lower or online_keyword in lecture.rooms)
            for online_keyword in self.online_keywords
        ):
            tags.add("online")
        elif "hybrid" in lecture_name_lower:
            tags.add("hybrid")

        # Check if the session is an exam
        if any(exam_keyword in lecture_name_lower for exam_keyword in self.exam_keywords):
            if "klausureinsicht" in lecture_name_lower:
                tags.add("exam_review")
            else:
                tags.add("exam")

        return list(tags)

    def __clean_lecture_name(self, name: str) -> str:
        """
        Cleans and formats the lecture name.

        :param name (str): Lecture name to clean.
        :return: str: Cleaned lecture name.
        """
        name = name.lower().title().strip()
        return name

    def __clean_room_info(self, rooms: List[str]) -> List[str]:
        """
        Cleans and formats the room information from a list of room strings.

        :param rooms (List[str]): List of room strings to clean.
        return: List[str]: List of cleaned room strings.
        """
        # Remove unnecessary prefixes and trim whitespace
        cleaned_rooms = [room.replace("VL-Raum", "").replace("Unterrichtsraum", "").strip() for room in rooms]
        return list(set(cleaned_rooms))

    def __get_new_sessions(
        self, lectures: List[schemes.ApiLectureDTO], updated_sites: Dict[str, Dict[str, schemes.DHBWCourseUpdate]]
    ) -> Dict[str, Dict[str, schemes.DHBWCourseUpdate]]:
        """
        Processes new lectures and updates the updated_sites dictionary with new sessions.

        :param lectures_input (List[dict]): List of new lecture data dictionaries.
        :param updated_sites (Dict[str,schemes.DHBWCourseUpdate]): Dictionary to update with new sessions.
        return: Dict[str,schemes.DHBWCourseUpdate]: Updated dictionary with new sessions added.
        """
        for lecture in lectures:
            # Extract site and course name
            splitted_course = lecture.course.split("-")
            site = splitted_course[0].strip()
            course_name = "-".join(splitted_course[1:]).strip()

            # Initialize site in updated_sites if not present
            if not updated_sites.get(site):
                updated_sites[site] = {}

            if updated_sites[site].get(course_name) is None:
                updated_sites[site][course_name] = schemes.DHBWCourseUpdate()

            updated_sites[site][course_name].new_sessions.append(
                schemes.LectureCreate(
                    name=self.__clean_lecture_name(lecture.name),
                    start=lecture.startTime,
                    end=lecture.endTime,
                    rooms=self.__clean_room_info(lecture.rooms),
                    tags=self.__get_tags(lecture),
                )
            )

        return updated_sites

    def __get_updated_sessions(
        self,
        lecture_updates: List[schemes.ApiUpdatedLectureDTO],
        updated_sites: Dict[str, Dict[str, schemes.DHBWCourseUpdate]],
    ) -> Dict[str, Dict[str, schemes.DHBWCourseUpdate]]:
        """
        Processes updated lectures and updates the updated_sites dictionary with updated sessions.

        :param lectures_input (List[dict]): List of updated lecture data dictionaries.
        :param updated_sites (Dict[str,Dict[str,schemes.DHBWCourseUpdate]]): Dictionary to update with updated sessions.
        return: Dict[str,Dict[str,schemes.DHBWCourseUpdate]]: Updated dictionary with updated sessions added.
        """
        for lecture_update in lecture_updates:
            lecture = lecture_update.lecture
            change_infos = lecture_update.changeInfos

            start_time = lecture.startTime
            end_time = lecture.endTime
            old_name = self.__clean_lecture_name(lecture.name)

            for change_info in change_infos:
                if change_info.fieldName == "startTime":
                    start_time = schemes.session_parse_dt(change_info.value)
                elif change_info.fieldName == "endTime":
                    end_time = schemes.session_parse_dt(change_info.value)
                elif change_info.fieldName == "name":
                    old_name = self.__clean_lecture_name(change_info.value)

            # Extract site from the course identifier
            splitted_course = lecture.course.split("-")
            site = splitted_course[0].strip()
            course_name = "-".join(splitted_course[1:]).strip()

            if updated_sites.get(site) is None:
                updated_sites[site] = {}

            if updated_sites[site].get(course_name) is None:
                updated_sites[site][course_name] = schemes.DHBWCourseUpdate()

            updated_sites[site][course_name].updated_sessions.append(
                schemes.LectureUpdate(
                    name=self.__clean_lecture_name(lecture.name),
                    old_name=old_name,
                    start=lecture.startTime,
                    end=lecture.endTime,
                    rooms=self.__clean_room_info(lecture.rooms),
                    tags=self.__get_tags(lecture),
                    old_external_id=schemes.get_session_hash(start_time, end_time),
                )
            )

        return updated_sites

    def __get_deleted_sessions(
        self, lectures_input: List[schemes.ApiLectureDTO], updated_sites: Dict[str, Dict[str, schemes.DHBWCourseUpdate]]
    ) -> Dict[str, Dict[str, schemes.DHBWCourseUpdate]]:
        """
        Processes removed lectures and updates the updated_sites dictionary with deleted session IDs.

        :param lectures_input (List[dict]): List of removed lecture data dictionaries.
        :param updated_sites (Dict[str,Dict[str,schemes.DHBWCourseUpdate]]): Dictionary to update with deleted session IDs.
        return: Dict[str,Dict[str,schemes.DHBWCourseUpdate]]: Updated dictionary with deleted session IDs added.
        """
        for lecture in lectures_input:
            # Extract site and course name
            splitted_course = lecture.course.split("-")
            site = splitted_course[0].strip()
            course_name = "-".join(splitted_course[1:]).strip()

            # Initialize site in updated_sites if not present
            if updated_sites.get(site) is None:
                updated_sites[site] = {}

            if updated_sites[site].get(course_name) is None:
                updated_sites[site][course_name] = schemes.DHBWCourseUpdate()

            if updated_sites[site][course_name].deleted_sessions.get(lecture.name) is None:
                updated_sites[site][course_name].deleted_sessions[lecture.name] = []

            updated_sites[site][course_name].deleted_sessions[lecture.name].append(
                schemes.get_session_hash(lecture.startTime, lecture.endTime)
            )
        return updated_sites

    def __process_sync_info(
        self,
        sync_info: schemes.ApiSyncLecturesInfoResponseDTO,
        updated_sites: Dict[str, Dict[str, schemes.DHBWCourseUpdate]],
    ) -> Dict[str, Dict[str, schemes.DHBWCourseUpdate]]:
        """
        Processes synchronization information from the DHBW API and updates the updated_courses dictionary.

        :param sync_info (ApiSyncLecturesInfoResponseDTO): Synchronization information containing new, updated, and removed lectures.
        :param updated_courses (Dict[str,schemes.DHBWCourseUpdate]): Dictionary to update with synchronization data.
        :return: Dict[str,schemes.DHBWCourseUpdate]: Updated dictionary with synchronization data processed.
        """

        if sync_info.newLectures:
            updated_sites = self.__get_new_sessions(sync_info.newLectures, updated_sites)
        if sync_info.updatedLectures:
            updated_sites = self.__get_updated_sessions(sync_info.updatedLectures, updated_sites)
        if sync_info.removedLectures:
            updated_sites = self.__get_deleted_sessions(sync_info.removedLectures, updated_sites)
        return updated_sites

    # ======================================================== #
    # ======================== Getters ======================= #
    # ======================================================== #

    def get_nativ_dhbw_sources(self) -> List[str]:
        """
        Fetches available DHBW sources from the DHBW API.

        :return: List[str]: List of available DHBW sources.
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

    def get_updated_calendars(self) -> Dict[str, Dict[str, schemes.DHBWCourseUpdate]]:
        """
        Fetches updated calendars from the DHBW API and processes synchronization information.

        This function waits for the latest synchronization to complete if it is currently running.

        :return: Dict[str, Dict[str, schemes.DHBWCourseUpdate]]: Dictionary containing updated courses for each site.
        """
        is_synced = False
        sync_status = {}

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
                time.sleep(20)
            else:
                is_synced = True

        sync_infos = sync_status.get("syncInfos", [])

        needed_sync_ids = [
            sync_info.get("id")
            for sync_info in sync_infos
            if sync_info.get("status") != "error" and sync_info.get("hasChanges")
        ]
        updated_sites = {}

        for sync_id in needed_sync_ids:
            response = requests.get(f"https://api.dhbw.app/sync/lectures/info/{sync_id}")

            if response.status_code != 200:
                print("Failed to fetch DHBW updated calendars")
                continue

            # Process the synchronization information
            sync_info = schemes.ApiSyncLecturesInfoResponseDTO.model_validate(response.json())

            updated_sites = self.__process_sync_info(sync_info, updated_sites)

        return updated_sites

    def get_all_calendars(self, site: str) -> Dict[str, List[schemes.LectureCreate]]:
        """
        Fetches all calendar data for a given site from the DHBW API and processes it.

        :param site: Site identifier (e.g., "KA", "VS", etc.)
        :return: Dict[str, List[schemes.SessionCreate]]: Dictionary containing course names and their associated sessions.
        """
        response = requests.get(f"https://api.dhbw.app/rapla/{site}/lectures")
        if response.status_code != 200:
            print(f"Failed to fetch DHBW calendar for {site}")
            return {}

        sessions: List[schemes.ApiLectureDTO] = [
            schemes.ApiLectureDTO.model_validate(session) for session in response.json()
        ]
        courses = {}
        for session in sessions:
            course_name = "-".join(session.course.split("-")[1:]).strip()
            if not courses.get(course_name):
                courses[course_name] = []

            courses[course_name].append(
                schemes.LectureCreate(
                    name=self.__clean_lecture_name(session.name),
                    lecturer=session.lecturer if session.lecturer != "" else None,
                    start=session.startTime,
                    end=session.endTime,
                    rooms=self.__clean_room_info(session.rooms),
                    tags=self.__get_tags(session),
                )
            )

        return courses
