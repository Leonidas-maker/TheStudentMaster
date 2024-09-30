from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload, defer, load_only
from sqlalchemy import select, update
from profanity_check import predict
import json
import datetime
from typing import Union, List, Dict, Tuple
from rich.progress import Progress
from rich.console import Console
from rich.table import Table
from rich import box
from rich.panel import Panel
from rich.text import Text
import traceback

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general, s_calendar

# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
from utils.calendar.dhbw_app_fetcher import DHBWAppFetcher
from utils.calendar.calendar_wrapper import CalendarWrapper
from utils.helpers.hashing import dict_hash
from config.general import MAX_COURSE_NAME_LENGTH

###########################################################################
############################# Helper Functions ############################
###########################################################################


def get_backend_ids(db: Session):
    """Function to get backend IDs for calendar updates."""
    backends = db.query(m_calendar.CalendarBackend).all()
    return {backend.backend_name: backend.calendar_backend_id for backend in backends}


def map_dhbw_app_site_to_university_name(site: str) -> str | None:
    """
    Function to map DHBW.APP sites to university names.


    This function maps the DHBW.APP site codes to the corresponding university names.

    :param db (Session): Database session
    :param site (str): DHBW.APP site code
    """

    match site:
        case "MOS":
            return "Duale Hochschule Baden-Wuerttemberg Mosbach"
        case "MGH":
            return "Duale Hochschule Baden-Wuerttemberg Bad Mergentheim"
        case "HN":
            return "Duale Hochschule Baden-Wuerttemberg Heilbronn"
        case "KA":
            return "Duale Hochschule Baden-Wuerttemberg Karlsruhe"
        case "VS":
            return "Duale Hochschule Baden-Wuerttemberg Villingen-Schwenningen"
        case "MA":
            return "Duale Hochschule Baden-Wuerttemberg Mannheim"
        case "STG":
            return "Duale Hochschule Baden-Wuerttemberg Stuttgart"
        case "HDH":
            return "Duale Hochschule Baden-Wuerttemberg Heidenheim"
        case "FN":
            return "Duale Hochschule Baden-Wuerttemberg Friedrichshafen"
        case "RV":
            return "Duale Hochschule Baden-Wuerttemberg Ravensburg"
        # case "DHBW":
        #     return "Duale Hochschule Baden-Wuerttemberg - Standortübergreifend"
        case _:
            return None


def map_dhbw_app_site_to_university(db: Session, site) -> m_calendar.University | None:
    """
    Function to map DHBW.APP sites to university records.

    :param db (Session): Database session
    :param site (str): DHBW.APP site code
    """

    university_name = map_dhbw_app_site_to_university_name(site)
    if university_name:
        return db.query(m_calendar.University).filter(m_calendar.University.university_name == university_name).first()
    return None


###########################################################################
############################ Database Functions ###########################
###########################################################################

# ======================================================== #
# ========================= Main ========================= #
# ======================================================== #


# ======================================================== #
# ======================== Course ======================== #
# ======================================================== #
def create_courses(
    course_input: List[s_calendar.CourseCreate],
    university_id: int,
    tags_dict: Dict[str, m_calendar.Tag],
    rooms_dict: Dict[str, m_calendar.Room],
    progress: Progress,
    task_id: int,
) -> Union[
    List[m_calendar.Course],
    Tuple[
        List[m_calendar.Room],
        List[m_calendar.Course],
        List[m_calendar.Lecture],
        List[m_calendar.Session],
        List[m_calendar.SessionTag],
        List[m_calendar.SessionRoom],
    ],
]:
    """
    Creates new database objects for courses and related objects.

    Note: This function does not add the new objects to the database it only returns them for further processing.

    :param course_input (List[s_calendar.CourseCreate]): The course data (Pydantic Course model)
    :param university_id (int): The ID of the university to which the course belongs
    :param tags_dict (Dict[str, m_calendar.Tag]): The dictionary of tags
    :param rooms_dict (Dict[str, m_calendar.Room]): The dictionary of rooms
    :param progress (Progress): A Rich progress instance for tracking the progress
    :param task_id (int): The task ID for progress tracking

    :return: A tuple containing the new rooms, new courses, new lectures, new sessions, new session tags, and new session rooms
    """
    progress.update(
        task_id, total=len(course_input), description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding courses..."
    )

    new_courses = []
    new_lectures = []
    new_sessions = []
    new_session_tags = []
    new_rooms = []
    new_session_rooms = []

    for course in course_input:
        new_course = m_calendar.Course(course_name=course.name, university_id=university_id)
        child_task_id = progress.add_task(
            total=len(course.lectures),
            description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding lectures to Course ID: {course.name}...",
        )
        new_db_objects = create_lectures(
            new_course,
            course.lectures,
            university_id,
            tags_dict,
            rooms_dict,
            progress,
            child_task_id,
        )

        # Unpack the new database objects
        if isinstance(new_db_objects, tuple):
            rooms, lectures, sessions, session_tags, session_rooms = new_db_objects
            new_rooms.extend(rooms)
            new_lectures.extend(lectures)
            new_sessions.extend(sessions)
            new_session_tags.extend(session_tags)
            new_session_rooms.extend(session_rooms)

        new_courses.append(new_course)

        progress.remove_task(child_task_id)
        progress.advance(task_id)

    return new_rooms, new_courses, new_lectures, new_sessions, new_session_tags, new_session_rooms


def delete_courses(db: Session, course_names: Union[str, List[str]]):
    """
    Deletes a course from the database.

    Note: If a list of course names is provided, this function queries each course name individually.

    :param db (Session): The SQLAlchemy database session
    :param course_names (Union[str, List[str]]): The name(s) of the course(s) to delete
    """
    if isinstance(course_names, str):
        course_names = [course_names]

    db.query(m_calendar.Course).filter(m_calendar.Course.course_name.in_(course_names)).delete()
    db.flush()


# ======================================================== #
# ======================== Lecture ======================= #
# ======================================================== #
def create_lectures(
    course: m_calendar.Course,
    Lectures_create: List[s_calendar.LectureCreate],
    university_id: int,
    tags_dict: Dict[str, m_calendar.Tag],
    rooms_dict: Dict[str, m_calendar.Room],
    progress: Progress,
    task_id: int,
) -> Union[
    List[m_calendar.Lecture],
    Tuple[
        List[m_calendar.Room],
        List[m_calendar.Lecture],
        List[m_calendar.Session],
        List[m_calendar.SessionTag],
        List[m_calendar.SessionRoom],
    ],
]:
    """
    Creates new database objects for lectures and related objects.

    Note: This function does not add the new objects to the database it only returns them for further processing.

    :param db (Session): The SQLAlchemy database session
    :param course_id (int): The ID of the course to which the lecture belongs
    :param lecture_name_lecturer (Dict[str, str]): The lecture data (lecture name and lecturer)
    :param sessions_data (Dict[str, s_calendar.Event]): The event data for the lecture
    :param progress (Progress): A Rich progress instance for tracking the progress
    :param task_id (int): The task ID for progress tracking

    :return: A tuple containing the new rooms, new lectures, new sessions, new session tags, and new session rooms
    """
    new_lectures = []
    new_sessions = []
    new_session_tags = []
    new_rooms = []
    new_session_rooms = []

    for Lecture_create in Lectures_create:
        new_lecture = m_calendar.Lecture(
            lecture_name=Lecture_create.name[:MAX_COURSE_NAME_LENGTH],
            lecturer=Lecture_create.lecturer,
            course=course,
        )
        child_task_id = progress.add_task(
            total=len(Lecture_create.sessions),
            description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding sessions to Lecture ID: {new_lecture.lecture_name}...",
        )
        new_db_objects = create_sessions(
            new_lecture, Lecture_create.sessions, university_id, tags_dict, rooms_dict, progress, child_task_id
        )
        progress.remove_task(child_task_id)

        # Unpack the new database objects
        if isinstance(new_db_objects, tuple):
            rooms, sessions, session_tags, session_rooms = new_db_objects
            new_rooms.extend(rooms)
            new_sessions.extend(sessions)
            new_session_tags.extend(session_tags)
            new_session_rooms.extend(session_rooms)

        # Add the new lecture to the list of new lectures
        new_lectures.append(new_lecture)

        progress.advance(task_id)

    return new_rooms, new_lectures, new_sessions, new_session_tags, new_session_rooms


def delete_lectures(db: Session, lecture_names: Union[str, List[str]]):
    """
    Deletes a lecture from the database.

    Note: If a list of lecture names is provided, this function queries each lecture name individually.

    :param db (Session): The SQLAlchemy database session
    :param lecture_names (Union[str, List[str]]): The name(s) of the lecture(s) to delete
    """
    if isinstance(lecture_names, str):
        lecture_names = [lecture_names]

    db.query(m_calendar.Lecture).filter(m_calendar.Lecture.lecture_name.in_(lecture_names)).delete()
    db.flush()


# ======================================================== #
# ======================== Session ======================= #
# ======================================================== #
def create_sessions(
    lecture: m_calendar.Lecture,
    sessions_create: List[s_calendar.SessionCreateUpdate],
    university_id: int,
    tags_dict: Dict[str, m_calendar.Tag],
    rooms_dict: Dict[str, m_calendar.Room],
    progress: Progress,
    task_id: int,
) -> Union[
    List[m_calendar.Session],
    Tuple[List[m_calendar.Room], List[m_calendar.Session], List[m_calendar.SessionTag], List[m_calendar.SessionRoom]],
]:
    """
    Creates new database objects for sessions and related objects.

    Note: This function does not add the new objects to the database it only returns them for further processing.

    :param lecture (m_calendar.Lecture): The lecture object to which the sessions belong
    :param sessions_create (List[s_calendar.SessionCreateUpdate]): The session data (Pydantic Session model)
    :param university_id (int): The ID of the university to which the session belongs
    :param tags_dict (Dict[str, m_calendar.Tag]): The dictionary of tags
    :param rooms_dict (Dict[str, m_calendar.Room]): The dictionary of rooms

    :return: A tuple containing the new rooms, new sessions, new session tags, and new session rooms
    """

    # Initialize containers to store new sessions, external tags, and external rooms.
    new_sessions: List[m_calendar.Session] = []
    new_session_tags: List[m_calendar.SessionTag] = []
    new_session_rooms: List[m_calendar.SessionRoom] = []
    new_rooms: List[m_calendar.Room] = []

    # Loop through each event in the session data, creating new session objects
    for session_create in sessions_create:
        new_session = m_calendar.Session(
            start_time=session_create.start,
            end_time=session_create.end,
            lecture=lecture,
            external_id=session_create.external_id,
        )

        # Handle tags
        if session_create.tags:
            for tag_name in session_create.tags:
                tag = tags_dict.get(tag_name)
                if tag:
                    session_tag = m_calendar.SessionTag(session=new_session, tag=tag)
                    new_session_tags.append(session_tag)

        # Handle rooms
        if session_create.rooms:
            for room_name in session_create.rooms:
                room = rooms_dict.get(room_name)
                if room:
                    session_room = m_calendar.SessionRoom(session=new_session, room=room)
                    new_session_rooms.append(session_room)
                else:
                    new_room = m_calendar.Room(room_name=room_name, university_id=university_id)
                    new_rooms.append(new_room)
                    rooms_dict[room_name] = new_room
                    session_room = m_calendar.SessionRoom(session=new_session, room=new_room)
                    new_session_rooms.append(session_room)

        # Add the session to the list of new sessions
        new_sessions.append(new_session)
        progress.advance(task_id)

    # Return the new session objects, external tags, and external rooms
    return new_rooms, new_sessions, new_session_tags, new_session_rooms


def update_session_tags_rooms(
    db: Session,
    university_id: int,
    sessions_db: m_calendar.Session,
    input_rooms: set[m_calendar.Room],
    input_tags: set[m_calendar.Tag],
    tags_dict: Dict[str, m_calendar.Tag],
    rooms_dict: Dict[str, m_calendar.Room],
) -> Tuple[
    List[m_calendar.Room],
    List[m_calendar.SessionTag],
    List[m_calendar.SessionRoom],
]:
    """
    Creates new session tags and rooms, and deletes old session tags and rooms.

    Note: This function does not change data in the database, it only returns the new and deleted objects for further processing.

    :param db (Session): The SQLAlchemy database session
    :param university_id (int): The
    :param sessions_db (m_calendar.Session): The session object to update
    :param input_rooms (set[m_calendar.Room]): The new rooms for the session
    :param input_tags (set[m_calendar.Tag]): The new tags for the session
    :param tags_dict (Dict[str, m_calendar.Tag]): The dictionary of tags
    :param rooms_dict (Dict[str, m_calendar.Room]): The dictionary of rooms

    :return: A tuple containing the new rooms, new session tags, new session rooms, deleted session tags, and deleted session rooms
    """
    new_session_tags: List[m_calendar.SessionTag] = []
    new_session_rooms: List[m_calendar.SessionRoom] = []

    delete_session_tags: List[str] = []
    delete_session_rooms: List[str] = []

    new_rooms: List[m_calendar.Room] = []

    # Check tags
    for tag in sessions_db.tags:
        if tag.tag not in input_tags:
            delete_session_tags.append(tag.session_tag_id)
        else:
            input_tags.discard(tag.tag)

    for tag_name in input_tags:
        tag = tags_dict.get(tag_name)
        if tag:
            new_session_tag = m_calendar.SessionTag(session=sessions_db, tag=tag)
            new_session_tags.append(new_session_tag)

    # Check rooms
    for room in sessions_db.rooms:
        if room.room not in input_rooms:
            db.delete(room)
        else:
            input_rooms.discard(room.room)

    for room_name in input_rooms:
        room = rooms_dict.get(room_name)
        if room:
            new_session_room = m_calendar.SessionRoom(session=sessions_db, room=room)
            new_session_rooms.append(new_session_room)
        else:
            new_room = m_calendar.Room(room_name=room_name, university_id=university_id)
            new_rooms.append(new_room)
            rooms_dict[room_name] = new_room
            new_session_room = m_calendar.SessionRoom(session=sessions_db, room=new_room)
            new_session_rooms.append(new_session_room)

    return new_rooms, new_session_tags, new_session_rooms


def delete_sessions(db: Session, session_id: Union[int, List[int]] = None, external_id: Union[str, List[str]] = None):
    """
    Deletes a session from the database.

    Note: Only one of the parameters (session_id or external_id) should be provided.

    :param db (Session): The SQLAlchemy database session
    :param session_id (Union[int, List[int]]): The ID(s) of the session(s) to delete
    :param external_id (Union[str, List[str]]): The external ID(s) of the session(s) to delete
    """
    if not session_id and not external_id:
        raise ValueError("Session ID or external ID must be provided")

    if session_id:
        if isinstance(session_id, int):
            session_id = [session_id]
        db.query(m_calendar.Session).filter(m_calendar.Session.session_id.in_(session_id)).delete()
    else:
        if isinstance(external_id, str):
            external_id = [external_id]
        db.query(m_calendar.Session).filter(m_calendar.Session.external_id.in_(external_id)).delete()

    db.flush()


###########################################################################
############################ Startup functions ############################
###########################################################################
def prepareCalendarTables(db: Session):
    """
    Function to prepare calendar tables by adding initial data


    This function adds initial data to the calendar tables if they are empty.

    Args:
        db (Session): Database session
    """
    backends = ["Rapla", "iCalendar", "DHBW.APP"]
    for backend in backends:
        if not db.query(m_calendar.CalendarBackend).filter(m_calendar.CalendarBackend.backend_name == backend).first():
            if backend == "DHBW.APP":
                db.add(m_calendar.CalendarBackend(backend_name=backend, is_custom_available=False))
            else:
                db.add(m_calendar.CalendarBackend(backend_name=backend))

    with open(
        "./data/address_lists/ger_univercity.json", "r", encoding="utf-8"
    ) as f:  # TODO: Change path --> not relative
        data = json.load(f)

    for university in data:
        university_address = None
        if (
            db.query(m_calendar.University)
            .filter(m_calendar.University.university_name == university.get("name"))
            .first()
        ):
            continue
        if university.get("address1"):
            new_address = s_general.AddressCreate(
                address1=university.get("address1"),
                address2=university.get("address2"),
                city=university.get("city"),
                district=university.get("district"),
                postal_code=university.get("zip"),
                country=university.get("county"),
            )

            university_address = create_address(db, new_address)

        db.add(
            m_calendar.University(
                university_name=university.get("name"),
                domains=university.get("domains"),
                address_id=university_address.address_id if university_address else None,
            )
        )
    # Add default tags
    tags = ["online", "hybrid", "exam", "exam_review"]

    for tag in tags:
        if not db.query(m_calendar.Tag).filter(m_calendar.Tag.tag_name == tag).first():
            db.add(m_calendar.Tag(tag_name=tag))

    db.commit()


###########################################################################
############################ Major Update Logic ###########################
###########################################################################
# ======================================================== #
# ======================= DHBW.APP ======================= #
# ======================================================== #
def dhbw_course_db_update_create_convert(
    db: Session,
    university_id: int,
    courses: s_calendar.DHBWCourses,
    tags_dict: Dict[str, m_calendar.Tag],
    console: Console,
    progress: Progress,
    task_id: int,
    delete_old: bool = True,
):
    """
    Function to convert DHBW courses to CourseUpdate objects.

    :param db: SQLAlchemy session object
    :param university_id: ID der Universität
    :param courses: DHBW courses object containing course data
    :param tags_dict: Dictionary mapping tag names to Tag objects
    :param progress: Progress tracking object
    :param task_id: ID des aktuellen Tasks für Progress Tracking
    """
    query_options = [
        joinedload(m_calendar.Course.lectures)
        .joinedload(m_calendar.Lecture.sessions)
        .joinedload(m_calendar.Session.tags)
        .joinedload(m_calendar.SessionTag.tag),
        joinedload(m_calendar.Course.lectures)
        .joinedload(m_calendar.Lecture.sessions)
        .joinedload(m_calendar.Session.rooms)
        .joinedload(m_calendar.SessionRoom.room),
    ]

    # Get existing Rooms from the database
    rooms_dict = {
        room.room_name: room
        for room in db.query(m_calendar.Room).filter(m_calendar.Room.university_id == university_id).all()
    }

    # Get existing courses from the database
    courses_db = (
        db.query(m_calendar.Course)
        .filter(
            m_calendar.Course.university_id == university_id, m_calendar.Course.course_name.in_(courses.courses.keys())
        )
        .options(*query_options)
        .all()
    )

    updated_course_ids = set()

    # Pydantic-Creation Objects for DB-Objects
    new_lectures: List[Tuple[m_calendar.Course, s_calendar.LectureCreate]] = []
    new_sessions: List[Tuple[m_calendar.Lecture, s_calendar.SessionCreateUpdate]] = []

    # DB-Objects
    new_session_tags_db: List[m_calendar.SessionTag] = []
    new_session_rooms_db: List[m_calendar.SessionRoom] = []
    new_rooms_db: List[m_calendar.Room] = []

    updated_lectures = 0
    updated_sessions = 0

    deleted_courses = 0
    deleted_lectures = 0
    deleted_sessions = 0

    # Process each course in the database
    for course_db in courses_db:
        if not courses.courses.get(course_db.course_name):
            if delete_old:
                db.delete(course_db)
                deleted_courses += 1
            continue

        # Get the lectures from the database and the input
        lectures_db: List[m_calendar.Lecture] = course_db.lectures
        lectures_input: Dict[str, s_calendar.DHBWLecture] = courses.courses.get(course_db.course_name, {})

        # Process each lecture in the database
        for lecture_db in lectures_db:
            if not lectures_input.get(lecture_db.lecture_name):
                if delete_old:
                    db.delete(lecture_db)
                    updated_course_ids.add(course_db.course_id)
                    deleted_lectures += 1
                continue

            # Get the lecture input
            lecture_input = lectures_input.get(lecture_db.lecture_name)

            sessions_input = lecture_input.sessions

            # Check if the lecturer is changed
            if lecture_input.lecturer and lecture_input.lecturer != lecture_db.lecturer:
                lecture_db.lecturer = lecture_input.lecturer
                updated_course_ids.add(course_db.course_id)
                updated_lectures += 1

            # Get the sessions from the database
            sessions_db: List[m_calendar.Session] = lecture_db.sessions

            # Process each session in the database
            for session_db in sessions_db:
                if not sessions_input.get(session_db.external_id):
                    if delete_old:
                        db.delete(session_db)
                        updated_course_ids.add(course_db.course_id)
                        deleted_sessions += 1
                    continue

                session_input = sessions_input.get(session_db.external_id)

                tags_input: set[str] = set(session_input.tags)
                tags_db_names: set[str] = {tag.tag.tag_name for tag in session_db.tags}

                rooms_input: set[str] = set(session_input.rooms)
                rooms_db_names: set[str] = {room.room.room_name for room in session_db.rooms}

                # Check if the start and end times are changed
                if session_input.start.replace(tzinfo=None) != session_db.start_time:
                    session_db.start_time = session_input.start
                    updated_course_ids.add(course_db.course_id)
                    updated_sessions += 1

                if session_input.end.replace(tzinfo=None) != session_db.end_time:
                    session_db.end_time = session_input.end
                    updated_course_ids.add(course_db.course_id)
                    updated_sessions += 1

                # Check if the tags and rooms are changed
                if tags_input != tags_db_names or rooms_input != rooms_db_names:
                    rooms, session_tags, session_rooms = update_session_tags_rooms(
                        db,
                        university_id,
                        session_db,
                        rooms_input,
                        tags_input,
                        tags_dict,
                        rooms_dict,
                    )

                    # Add the new objects to the lists
                    new_session_tags_db.extend(session_tags)
                    new_session_rooms_db.extend(session_rooms)
                    new_rooms_db.extend(rooms)

                    updated_course_ids.add(course_db.course_id)
                    updated_sessions += 1

                sessions_input.pop(session_db.external_id, None)
            # End of existent_sessions loop

            for external_id, new_session in sessions_input.items():
                updated_course_ids.add(course_db.course_id)
                new_sessions.append(
                    (
                        lecture_db,
                        s_calendar.SessionCreateUpdate(
                            start=new_session.start,
                            end=new_session.end,
                            external_id=external_id,
                            tags=new_session.tags,
                            rooms=new_session.rooms,
                        ),
                    )
                )

            lectures_input.pop(lecture_db.lecture_name, None)
        # End of existent_lectures loop

        for lecture_name, new_lecture in lectures_input.items():
            updated_course_ids.add(course_db.course_id)
            new_lectures.append((course_db, new_lecture.to_lecture_create(lecture_name)))
        courses.courses.pop(course_db.course_name, None)
    # End of existent_courses loop

    db.flush()

    # Get the remaining courses
    new_courses = courses.to_courses_create()

    new_lectures_db: List[m_calendar.Lecture] = []
    new_sessions_db: List[m_calendar.Session] = []

    # Child task ID for progress tracking
    child_task_id = progress.add_task(
        total=1,
        description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding new courses, lectures, and sessions...",
    )

    # ~~~~~~~~~~~ Create new courses ~~~~~~~~~~ #
    try:
        rooms, new_courses_db, lectures, sessions, session_tags, session_rooms = create_courses(
            new_courses, university_id, tags_dict, rooms_dict, progress, child_task_id
        )
        # Add the new objects to the lists
        new_rooms_db.extend(rooms)
        new_lectures_db.extend(lectures)
        new_sessions_db.extend(sessions)
        new_session_tags_db.extend(session_tags)
        new_session_rooms_db.extend(session_rooms)
    except Exception as e:
        print("Could not create new courses")
        print(e)
        traceback.print_exc()

    # ~~~~~~~~~~ Create new lectures ~~~~~~~~~~ #
    for course, new_lecture in new_lectures:
        try:
            rooms, lectures, sessions, session_tags, session_rooms = create_lectures(
                course, [new_lecture], university_id, tags_dict, rooms_dict, progress, child_task_id
            )

            # Add the new objects to the lists
            new_rooms_db.extend(rooms)
            new_lectures_db.extend(lectures)
            new_sessions_db.extend(sessions)
            new_session_tags_db.extend(session_tags)
            new_session_rooms_db.extend(session_rooms)
        except Exception as e:
            print("Could not create lecture:", new_lecture.name)
            traceback.print_exc()

    # ~~~~~~~~~~ Create new sessions ~~~~~~~~~~ #
    for lecture, new_session in new_sessions:
        try:
            rooms, sessions, session_tags, session_rooms = create_sessions(
                lecture, [new_session], university_id, tags_dict, rooms_dict, progress, child_task_id
            )
            # Add the new objects to the lists
            new_rooms_db.extend(rooms)
            new_sessions_db.extend(sessions)
            new_session_tags_db.extend(session_tags)
            new_session_rooms_db.extend(session_rooms)
        except Exception as e:
            print("Could not create session:", new_session.external_id)
            print(e)
            traceback.print_exc()

    # Close child task
    progress.remove_task(child_task_id)

    # ~~~~~~~~~~~~ Add new data to DB ~~~~~~~~~~~~ #
    progress.update(
        task_id,
        description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding new data to the database...",
    )
    #! DEBUG
    # progress.update(
    #     task_id,
    #     description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding course and room to database!",
    # )
    # db.add_all(new_rooms_db)
    # db.add_all(new_courses_db)
    # db.flush()
    # # Add new lectures
    # progress.update(task_id, description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding lectures to database!")
    # db.add_all(new_lectures_db)
    # db.flush()
    # # Add new sessions
    # progress.update(task_id, description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding sessions to database!")
    # db.add_all(new_sessions_db)
    # db.flush()
    # # Add new session tags and rooms
    # progress.update(
    #     task_id,
    #     description=f"[bold green]Native-Calendar-DHBW[/bold green] Adding session tags and rooms to database!",
    # )
    # db.add_all(new_session_tags_db)
    # db.add_all(new_session_rooms_db)

    db.add_all(
        new_rooms_db + new_courses_db + new_lectures_db + new_sessions_db + new_session_tags_db + new_session_rooms_db
    )

    # Update course timestamps
    progress.update(
        task_id,
        description=f"[bold green]Native-Calendar-DHBW[/bold green] Updating updated courses timestamps...",
    )

    new_last_modified = datetime.datetime.now(datetime.timezone.utc)
    db.execute(
        update(m_calendar.Course)
        .where(m_calendar.Course.course_id.in_(updated_course_ids))
        .values(last_modified=new_last_modified)
    )

    # Close add transaction
    db.commit()

    # ======================================================== #
    # =================== Console Feedback =================== #
    # ======================================================== #

    # Create a header
    header_text = Text(
        f"Database Operations Summary - University ID: {university_id}", style="bold cyan", justify="center"
    )
    header_panel = Panel(header_text, style="bold cyan", expand=False)

    # Create a table
    table = Table(title=header_panel, box=box.SIMPLE, show_lines=True)

    # Define the columns
    table.add_column("Operation", style="bold")
    table.add_column("Entity", style="bold")
    table.add_column("Count", justify="right")

    # Add "Added" entries with green color
    was_added = False
    if len(new_rooms_db) > 0:
        table.add_row("[green]Added[/green]", "Rooms", str(len(new_rooms_db)))
        was_added = True
    if len(new_courses_db) > 0:
        table.add_row("[green]Added[/green]", "Courses", str(len(new_courses_db)))
        was_added = True
    if len(new_lectures_db) > 0:
        table.add_row("[green]Added[/green]", "Lectures", str(len(new_lectures_db)))
        was_added = True
    if len(new_sessions_db) > 0:
        table.add_row("[green]Added[/green]", "Sessions", str(len(new_sessions_db)))
        was_added = True
    if len(new_session_tags_db) > 0:
        table.add_row("[green]Added[/green]", "Session Tags", str(len(new_session_tags_db)))
        was_added = True
    if len(new_session_rooms_db) > 0:
        table.add_row("[green]Added[/green]", "Session Rooms", str(len(new_session_rooms_db)))
        was_added = True
    if not was_added:
        table.add_row("[green]Added[/green]", "None", "0")

    # Add "Updated" entries with yellow color
    was_updated = False
    if updated_lectures > 0:
        table.add_row("[yellow]Updated[/yellow]", "Lectures", str(updated_lectures))
        was_updated = True
    if updated_sessions > 0:
        table.add_row("[yellow]Updated[/yellow]", "Sessions", str(updated_sessions))
        was_updated = True
    if not was_updated:
        table.add_row("[yellow]Updated[/yellow]", "None", "0")

    # Add "Deleted" entries with red color
    was_deleted = False
    if deleted_courses > 0:
        table.add_row("[red]Deleted[/red]", "Courses", str(deleted_courses))
        was_deleted = True
    if deleted_lectures > 0:
        table.add_row("[red]Deleted[/red]", "Lectures", str(deleted_lectures))
        was_deleted = True
    if deleted_sessions > 0:
        table.add_row("[red]Deleted[/red]", "Sessions", str(deleted_sessions))
        was_deleted = True
    if not was_deleted:
        table.add_row("[red]Deleted[/red]", "None", "0")

    # Print the table to the console
    console.print(table)


async def refresh_all_dhbw_calendars(db: Session, console: Console, progress: Progress, task_id: int):
    """
    Function to refresh all native dhbw calendars.

    This function fetches all available DHBW.APP sites and updates the native calendars for each site.

    Args:
        db (Session): Database session
        progress (Progress): Progress bar instance
        task_id (int): Task ID for the progress bar
    """
    error_messages = []
    try:
        dhbw_app_fetcher = DHBWAppFetcher(progress)  # Initialize the DHBW App fetcher
        available_dhbw_sites = dhbw_app_fetcher.get_nativ_dhbw_sources()  # Get the currently available sources for DHBW

        progress.update(task_id, total=len(available_dhbw_sites), refresh=True)
        tags_dict = {tag.tag_name: tag for tag in db.query(m_calendar.Tag).all()}

        for available_dhbw_site in available_dhbw_sites:
            university = map_dhbw_app_site_to_university(db, available_dhbw_site)

            if not university:
                error_messages.append(f"University not found for site: {available_dhbw_site}")
                continue

            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] Init-Update {university.university_name}: Fetching...",
            )

            calenders = dhbw_app_fetcher.get_all_calendars(available_dhbw_site)

            if not calenders:
                error_messages.append(f"Failed to fetch calendar for site: {available_dhbw_site}")
                continue

            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] Init-Update {university.university_name}: Processing...",
            )

            # Delete all courses that are not in the fetched data
            db.query(m_calendar.Course).filter(
                m_calendar.Course.university_id == university.university_id,
                ~m_calendar.Course.course_name.in_(calenders.courses.keys()),
            ).delete(synchronize_session="fetch")
            db.flush()

            # Update the courses in the database
            dhbw_course_db_update_create_convert(
                db,
                university.university_id,
                calenders,
                tags_dict,
                console,
                progress,
                task_id,
            )

            db.commit()
            progress.update(task_id, advance=1)

        if error_messages:
            raise ValueError("\n".join(error_messages))

        return True

    except Exception as e:
        # Handle any errors by updating the progress bar and printing the error
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)
        traceback.print_exc()
        return False


async def update_all_dhbw_calendars(db: Session, progress, task_id: int, console: Console):
    """
    Function to update all native calendars.

    This function fetches updates for all native DHBW calendars and updates the database accordingly.

    Args:
        db (Session): Database session
        progress (Progress): Progress bar instance
        task_id (int): Task ID for the progress bar
    """
    try:
        fetcher = DHBWAppFetcher(progress=Progress())
        new_sites_data: Dict[str, s_calendar.DHBWCourseUpdate] = await fetcher.get_updated_calendars()

        if not new_sites_data:
            return True
        tags_dict = {tag.tag_name: tag for tag in db.query(m_calendar.Tag).all()}
        for site_name, site_data in new_sites_data.items():
            university_name = map_dhbw_app_site_to_university_name(site_name)
            university = (
                db.query(m_calendar.University).filter(m_calendar.University.university_name == university_name).first()
            )
            if not university:
                continue
            dhbw_course_db_update_create_convert(
                db,
                university.university_id,
                site_data.to_dhbw_courses(),
                tags_dict,
                console,
                progress,
                task_id,
                delete_old=False,
            )

            if len(site_data.deleted_sessions) > 0:
                db.query(m_calendar.Session).filter(
                    m_calendar.Session.external_id.in_(site_data.deleted_sessions)
                ).delete(synchronize_session=False)
            db.flush()

    except Exception as e:
        # Handle any errors by updating the progress bar and printing the error
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)
        traceback.print_exc()
        return False


# ======================================================== #
# ===================== Custom Update ==================== #
# ======================================================== #
async def update_custom_calendars(db: Session, progress, task_id, backend: m_calendar.CalendarBackend):
    """
    Function to update custom calendars for a specific backend.


    This function fetches updates for all custom calendars associated with the specified backend and updates the database accordingly.

    Args:
        db (Session): Database session
        progress (Progress): Progress bar instance
        task_id (int): Task ID for the progress bar
        backend (m_calendar.CalendarBackend): Backend object for which to update custom calendars
    """
    query_options = [
        defer(m_calendar.CalendarCustom.data),  # Defer loading of large 'data' field to optimize query performance
    ]

    try:
        calendar_wrapper = CalendarWrapper(backend.backend_name)  # Initialize the wrapper for handling calendar data

        # Query all custom calendars associated with the specified backend
        custom_calendars = (
            db.query(m_calendar.CalendarCustom)
            .filter(m_calendar.CalendarCustom.source_backend_id == backend.calendar_backend_id)
            .options(*query_options)
            .all()
        )
        progress.update(task_id, total=len(custom_calendars), refresh=True)

        current_time = datetime.datetime.now()  # Get the current time for refresh interval checks

        for custom_calendar in custom_calendars:
            # Skip calendars that don't need updating based on their refresh interval
            if (
                custom_calendar.last_updated + datetime.timedelta(minutes=custom_calendar.refresh_interval)
                > current_time
            ):
                progress.update(task_id, advance=1)
                continue

            progress.update(
                task_id,
                description=f"[bold green]Custom-Calendar[/bold green] Update {backend.backend_name} - {custom_calendar.course_name}",
            )

            # Fetch and update calendar if the new data hash differs from the current one
            calendar_data = calendar_wrapper.get_data(custom_calendar.source_url)
            if calendar_data and calendar_data.get("hash") != custom_calendar.hash:
                custom_calendar.data = calendar_data.get("data")
                custom_calendar.hash = calendar_data.get("hash")
                db.add(custom_calendar)  # Stage the updated calendar for commit

            progress.update(task_id, advance=1)

        db.commit()  # Commit all changes to the database in a single transaction

        # Final update to indicate the task is done
        progress.update(
            task_id,
            description=f"[bold green]Custom-Calendar-{backend.backend_name}[/bold green] Done!",
            visible=True,
            refresh=True,
        )
    except Exception as e:
        # Handle any errors by updating the progress bar and printing the error
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


###########################################################################
######################## Calendar_Users Management ########################
###########################################################################


# ======================================================== #
# ===================== Adder/Updater ==================== #
# ======================================================== #
async def add_update_user_calendar(
    db: Session, user_id: int, custom_calendar_id: int = None, native_calendar_id: int = None
) -> m_calendar.UserCalendar:
    """
    Function to add or update a user's calendar.

    This function adds a new calendar to a user or updates an existing one.

    Args:
        db (Session): Database session
        user_id (int): User ID for which to add/update the calendar
        custom_calendar_id (int, optional): ID of the custom calendar to add/update. Defaults to None.
        native_calendar_id (int, optional): ID of the native calendar to add/update. Defaults to None.
    """

    # Ensure only one of custom_calendar_id or native_calendar_id is provided
    if custom_calendar_id and native_calendar_id or not custom_calendar_id and not native_calendar_id:
        raise ValueError("Invalid calendar id combination")

    # Query the database for an existing UserCalendar entry for the given user_id
    user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    if user_calendar:
        # If an entry exists, update it with the new calendar ID
        user_calendar.custom_calendar_id = custom_calendar_id
        user_calendar.native_calendar_id = native_calendar_id
    else:
        # If no entry exists, create a new UserCalendar entry
        user_calendar = m_calendar.UserCalendar(
            user_id=user_id,
            custom_calendar_id=custom_calendar_id,
            native_calendar_id=native_calendar_id,
        )
        db.add(user_calendar)  # Stage the new entry for commit

    db.flush()  # Flush changes to the database to get the user_calendar ready for immediate use
    return user_calendar


def add_native_calendar_to_user(
    db: Session, user_id: int, course_name: int, university_id=int
) -> m_calendar.Course | None:
    """
    Function to add a native calendar to a user.

    This function adds a new native calendar to a user's calendar list.

    Args:
        db (Session): Database session
        user_id (int): User ID for which to add the calendar
        course_name (int): Name of the course for the calendar
        university_uuid (uuid.UUID): UUID of the university for the calendar
    """
    calendar_native = (
        db.query(m_calendar.Course)
        .join(m_calendar.University)
        .filter(
            m_calendar.Course.course_name == course_name,
            m_calendar.University.university_id == university_id,
        )
        .first()
    )

    # Check if calendar exists
    if calendar_native:
        add_update_user_calendar(db, user_id, native_calendar_id=calendar_native.calendar_native_id)
        db.commit()
        return calendar_native
    return None


def add_custom_calendar_to_user(db: Session, user_id: int, new_custom_calendar: s_calendar.CalendarCustomCreate):
    """Function to add a custom calendar to a user.
    This function adds a new custom calendar to a user's calendar list.

    """
    # Check if course name does not contain profanity
    if predict([new_custom_calendar.course_name]):
        raise HTTPException(status_code=406, detail="Course name not accepted")

    # Check if backend exists
    backend = (
        db.query(m_calendar.CalendarBackend)
        .filter(m_calendar.CalendarBackend.backend_name == new_custom_calendar.source_backend)
        .first()
    )
    print(backend.calendar_backend_id)
    if backend:
        # Check if custom calendar already exists
        custom_calendar = (
            db.query(m_calendar.CalendarCustom)
            .filter(m_calendar.CalendarCustom.source_url == new_custom_calendar.source_url)
            .first()
        )

        # Create new custom calendar if it does not exist
        if not custom_calendar:

            custom_calendar_data = CalendarWrapper(backend.backend_name).get_data(new_custom_calendar.source_url)

            if not custom_calendar_data:
                raise HTTPException(status_code=400, detail="Invalid calendar source")

            university = (
                db.query(m_calendar.University)
                .filter(m_calendar.University.university_id == new_custom_calendar.university_id)
                .first()
            )

            custom_calendar = m_calendar.CalendarCustom(
                university_id=university.university_id if university else None,
                course_name=new_custom_calendar.course_name,
                source_backend_id=backend.calendar_backend_id,
                source_url=new_custom_calendar.source_url,
                data=custom_calendar_data.get("data"),
                hash=custom_calendar_data.get("hash"),
                refresh_interval=15,  # TODO: Implement refresh interval (out of scope for now)
                last_updated=datetime.datetime.now(),
                verified=False,
                last_modified=datetime.datetime.now(),
            )
            db.add(custom_calendar)  # Stage the new UserCalendar entry for commit
            db.flush()  # Flush changes to the database to get the custom_calendar ready for immediate use

        # Add custom calendar to user
        add_update_user_calendar(db, user_id, custom_calendar_id=custom_calendar.calendar_custom_id)
        db.commit()  # Commit the changes to the database

        # Return the custom calendar
        return custom_calendar
    else:
        raise HTTPException(status_code=400, detail="Invalid backend source")


# ======================================================== #
# ======================== Getter ======================== #
# ======================================================== #
def get_calendar(
    db: Session, user_id: int, with_university: bool = False, with_data: bool = False
) -> m_calendar.CalendarCustom | None:
    """
    Function to get a user's calendar.


    This function fetches a user's calendar based on the user ID.

    Args:
        db (Session): Database session
        user_id (int): User ID for which to get the calendar
        with_university (bool, optional): Flag to include university data in the response. Defaults to False.
        with_data (bool, optional): Flag to include calendar data in the response. Defaults to False.
    """

    # query_options = []
    # user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    # # Check if user has a calendar
    # if user_calendar:
    #     if user_calendar.native_calendar_id:
    #         if with_university:
    #             query_options += [joinedload(m_calendar.CalendarNative.university)]
    #         if not with_data:
    #             query_options += [defer(m_calendar.CalendarNative.data)]

    #         # Get native calendar
    #         calendar = (
    #             db.query(m_calendar.CalendarNative)
    #             .options(*query_options)
    #             .filter(m_calendar.CalendarNative.calendar_native_id == user_calendar.native_calendar_id)
    #             .first()
    #         )
    #     else:
    #         if with_university:
    #             query_options += [joinedload(m_calendar.CalendarCustom.university)]
    #         if not with_data:
    #             query_options += [defer(m_calendar.CalendarCustom.data)]
    #         # Get custom calendar
    #         calendar = (
    #             db.query(m_calendar.CalendarCustom)
    #             .options(*query_options)
    #             .filter(m_calendar.CalendarCustom.calendar_custom_id == user_calendar.custom_calendar_id)
    #             .first()
    #         )
    #     return calendar

    # # Return None if user has no calendar
    return None


# ======================================================== #
# ========================= Utils ======================== #
# ======================================================== #
async def clean_custom_calendars(db: Session) -> int:
    """
    Function to clean custom calendars that are not used by any user.

    This function deletes custom calendars that are not associated with any user.

    Args:
        db (Session): Database session
    """
    query_options = [defer(m_calendar.CalendarCustom.data)]
    try:
        # Define a subquery for custom calendars that are not used by any user
        subquery = (
            db.query(m_calendar.CalendarCustom.calendar_custom_id)
            .options(query_options)
            .outerjoin(
                m_calendar.UserCalendar,
                m_calendar.CalendarCustom.calendar_custom_id == m_calendar.UserCalendar.custom_calendar_id,
            )
            .filter(m_calendar.UserCalendar.calendar_users_id == None)
            .subquery()
        )

        # Explicitly create a select() object from the subquery
        subquery_select = select(subquery)

        # Delete all entries that match the subquery
        delete_query = (
            db.query(m_calendar.CalendarCustom)
            .options(query_options)
            .filter(m_calendar.CalendarCustom.calendar_custom_id.in_(subquery_select))
        )
        delete_count = delete_query.delete(synchronize_session=False)
        db.commit()
        return delete_count
    except Exception as e:
        print(e)
        db.rollback()
        return 0
