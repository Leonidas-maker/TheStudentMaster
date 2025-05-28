from sqlalchemy import select, delete, exists, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from rich.progress import Progress, TaskID
from rich.console import Console
from rich.table import Table
from rich import print
from typing import Optional, Dict, List, Tuple, Union
import datetime
import json
from dataclasses import dataclass

from models import m_calendar
from utils.scraper.calendar.dhbw_app_fetcher_v2 import DHBWAppFetcher
from schemas import s_calendar

from config.settings import COURSE_HISTORY_DAYS, DEFAULT_TIMEZONE


###########################################################################
############################# Helper Functions ############################
###########################################################################
@dataclass
class SummaryItem:
    name: str
    new: int
    updated: int
    deleted: int


def print_summary_table(university_name: str, items: List[SummaryItem], console: Optional[Console] = None) -> None:
    if not console:
        console = Console()
    table = Table(
        title=f"📊 Summary for {university_name}",
        header_style="bold white on blue",
        row_styles=["none", "dim"],
        title_style="bold magenta",
    )
    table.add_column("Entity", style="cyan", no_wrap=True)
    table.add_column("New", justify="right", style="green", header_style="bold green")
    table.add_column("Updated", justify="right", style="yellow", header_style="bold yellow")
    table.add_column("Deleted", justify="right", style="red", header_style="bold red")

    for item in items:
        table.add_row(
            f"[bold]{item.name}[/bold]",
            str(item.new),
            str(item.updated),
            str(item.deleted),
        )

    console.log(table)


def map_dhbw_app_site_to_university_name(site: str) -> Optional[str]:
    """
    Map a DHBW.APP site code to its full university name.
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
        case _:
            return None


async def map_dhbw_app_site_to_university(
    db: AsyncSession, site: str, with_rooms: bool = False
) -> Optional[m_calendar.University]:
    """
    Asynchronously fetch the University record for a given DHBW.APP site code.
    """
    name = map_dhbw_app_site_to_university_name(site)
    if not name:
        return None

    query_options = []

    if with_rooms:
        query_options.append(joinedload(m_calendar.University.rooms))

    result = await db.execute(
        select(m_calendar.University).options(*query_options).filter(m_calendar.University.name == name)
    )
    return result.unique().scalar_one_or_none()


async def get_create_rooms(
    db: AsyncSession, existing_rooms: dict, university: m_calendar.University, rooms: List[str]
) -> List[m_calendar.Room]:
    """
    Create or fetch rooms for a given university.
    """
    new_rooms = set()
    for room_name in rooms:
        room = existing_rooms.get(room_name)
        if not room:
            room = m_calendar.Room(name=room_name, university=university)
            db.add(room)
            existing_rooms[room_name] = room
            new_rooms.add(room)
        else:
            new_rooms.add(room)
    return list(new_rooms)


def get_sorted_lectures_dict(
    lectures_raw: Union[List[s_calendar.LectureCreate], List[s_calendar.LectureUpdate]],
) -> Dict[str, Union[List[s_calendar.LectureCreate], List[s_calendar.LectureUpdate]]]:
    """
    Convert a list of LectureCreate objects to a dictionary.
    """
    lectures = {}

    should_type = type(lectures_raw[0])

    for lecture in lectures_raw:
        if type(lecture) != should_type:
            raise TypeError(f"Expected {should_type}, but got {type(lecture)}")
        lecture_name = lecture.old_name if type(lecture) == s_calendar.LectureUpdate else lecture.name

        if lecture_name not in lectures:
            lectures[lecture_name] = []

        lectures[lecture_name].append(lecture)
    return lectures


async def create_lecture(
    db: AsyncSession,
    ca_context: s_calendar.CalendarContext,
    course: m_calendar.Course,
    lecture_name: str,
    lecture_data: List[s_calendar.LectureCreate],
) -> Tuple[m_calendar.Lecture, List[m_calendar.Session]]:
    # Create new lecture
    new_lecture = m_calendar.Lecture(
        name=lecture_name, course=course, lecturer=lecture_data[0].lecturer if lecture_data[0].lecturer != "" else None
    )
    db.add(new_lecture)
    ca_context.new_lectures += 1

    new_sessions = []
    for raw_session in lecture_data:
        new_session = await create_session(db, ca_context, new_lecture, raw_session)
        new_sessions.append(new_session)
    return new_lecture, new_sessions


async def create_session(
    db: AsyncSession,
    ca_context: s_calendar.CalendarContext,
    lecture: m_calendar.Lecture,
    raw_session: s_calendar.LectureCreate,
) -> m_calendar.Session:
    # Create new session
    new_session = m_calendar.Session(
        start_time=raw_session.start,
        end_time=raw_session.end,
        rooms=await get_create_rooms(db, ca_context.existing_rooms, ca_context.university, raw_session.rooms),
        tags=[ca_context.existing_tags.get(tag) for tag in raw_session.tags],
        lecture=lecture,
        external_id=raw_session.external_id,
    )

    db.add(new_session)
    ca_context.new_sessions += 1
    return new_session


async def refresh_course(
    db: AsyncSession,
    car_context: s_calendar.CalendarRefreshContext,
    course_name: str,
    course_data: Union[List[s_calendar.LectureCreate], List[s_calendar.LectureUpdate]],
):
    ex_course = car_context.existing_courses.get(course_name)
    raw_lectures = get_sorted_lectures_dict(course_data)

    if ex_course:
        for lecture_name, lecture_data in raw_lectures.items():
            await refresh_lecture(db, car_context, ex_course, lecture_name, lecture_data)
    else:
        if type(course_data) == s_calendar.LectureUpdate:
            raise ValueError(f"Course {course_name} not found, but LectureUpdate provided")

        # Create new course
        new_course = m_calendar.Course(
            name=course_name,
            university=car_context.university,
        )
        db.add(new_course)

        car_context.existing_courses[course_name] = s_calendar.ExistingCourse(course=new_course, lectures={})

        for lecture_name, lecture_data in raw_lectures.items():
            new_lecture, new_sessions = await create_lecture(db, car_context, new_course, lecture_name, lecture_data)  # type: ignore

            car_context.existing_courses[course_name].lectures[lecture_name] = s_calendar.ExistingLecture(
                lecture=new_lecture, sessions={session.external_id: session for session in new_sessions}
            )


async def refresh_lecture(
    db: AsyncSession,
    car_context: s_calendar.CalendarRefreshContext,
    ex_course: s_calendar.ExistingCourse,
    lecture_name: str,
    lecture_data: Union[List[s_calendar.LectureCreate], List[s_calendar.LectureUpdate]],
):
    ex_lecture = ex_course.lectures.get(lecture_name)
    if ex_lecture:
        if type(lecture_data[0]) == s_calendar.LectureUpdate:
            if lecture_data[0].old_name != lecture_name:
                ex_lecture.lecture.name = lecture_data[0].name

        if ex_lecture.lecture.lecturer != lecture_data[0].lecturer:
            ex_lecture.lecture.lecturer = lecture_data[0].lecturer if lecture_data[0].lecturer != "" else None
            car_context.updated_lectures += 1

        car_context.lectures_to_delete.discard(ex_lecture.lecture.id)

        for raw_session in lecture_data:
            await refresh_session(db, car_context, ex_lecture, raw_session)
    else:
        if type(lecture_data[0]) == s_calendar.LectureUpdate:
            raise ValueError(f"Lecture {lecture_name} not found, but LectureUpdate provided")
        new_lecture, new_sessions = await create_lecture(
            db,
            car_context,
            ex_course.course,
            lecture_name,
            lecture_data,  # type: ignore
        )

        ex_course.lectures[lecture_name] = s_calendar.ExistingLecture(
            lecture=new_lecture, sessions={session.external_id: session for session in new_sessions}
        )


async def refresh_session(
    db: AsyncSession,
    car_context: s_calendar.CalendarRefreshContext,
    ex_lecture: s_calendar.ExistingLecture,
    raw_session: Union[s_calendar.LectureCreate, s_calendar.LectureUpdate],
) -> None:
    lecture = ex_lecture.lecture

    # Check if the session already exists
    if type(raw_session) == s_calendar.LectureCreate:
        session = ex_lecture.sessions.get(raw_session.external_id)
        was_updated = False
    elif type(raw_session) == s_calendar.LectureUpdate:
        session = ex_lecture.sessions.get(raw_session.old_external_id)
        if not session:
            raise ValueError(
                f"Session with external ID {raw_session.old_external_id} not found in lecture {lecture.name}"
            )
        session.external_id = raw_session.external_id
        was_updated = True
    else:
        raise TypeError("Invalid session type")

    # Process the session data
    if session:
        car_context.sessions_to_delete.discard(session.id)

        ex_rooms = [room.name for room in session.rooms]
        ex_tags = [tag.name for tag in session.tags]

        # Update existing session
        if len(session.rooms) != len(raw_session.rooms) or not all([room in raw_session.rooms for room in ex_rooms]):
            session.rooms = await get_create_rooms(
                db, car_context.existing_rooms, car_context.university, raw_session.rooms
            )
            was_updated = True

        if len(session.tags) != len(raw_session.tags) or not all(
            [session_tags in raw_session.tags for session_tags in ex_tags]
        ):
            session.tags = [car_context.existing_tags.get(tag) for tag in raw_session.tags]
            was_updated = True

        if was_updated:
            car_context.updated_sessions += 1
    else:
        # Create new session
        new_session = await create_session(db, car_context, lecture, raw_session)
        ex_lecture.sessions[raw_session.external_id] = new_session


async def get_existing_courses(
    db: AsyncSession,
    university: m_calendar.University,
    calendars: List[str],
    existing_tags: Optional[Dict[str, m_calendar.Tag]] = None,
) -> s_calendar.CalendarRefreshContext:
    if not existing_tags:
        res = await db.execute(select(m_calendar.Tag))
        existing_tags = {tag.name: tag for tag in res.unique().scalars().all()}

    res = await db.execute(
        select(m_calendar.Course)
        .options(
            joinedload(m_calendar.Course.lectures),
            joinedload(m_calendar.Course.lectures).joinedload(m_calendar.Lecture.sessions),
            joinedload(m_calendar.Course.lectures)
            .joinedload(m_calendar.Lecture.sessions)
            .joinedload(m_calendar.Session.rooms),
            joinedload(m_calendar.Course.lectures)
            .joinedload(m_calendar.Lecture.sessions)
            .joinedload(m_calendar.Session.tags),
        )
        .filter(
            m_calendar.Course.university_id == university.id,
            m_calendar.Course.name.in_(calendars),
        )
    )
    courses = res.unique().scalars().all()

    existing_courses: Dict[str, s_calendar.ExistingCourse] = {}
    existing_rooms = {room.name: room for room in university.rooms}

    car_context = s_calendar.CalendarRefreshContext(university, existing_courses, existing_rooms, existing_tags)

    for course in courses:
        lectures = {}
        for lecture in course.lectures:
            car_context.lectures_to_delete.add(lecture.id)
            sessions = {}
            for session in lecture.sessions:
                car_context.sessions_to_delete.add(session.id)
                sessions[session.external_id] = session
            lectures[lecture.name] = s_calendar.ExistingLecture(lecture=lecture, sessions=sessions)

        existing_courses[course.name] = s_calendar.ExistingCourse(course=course, lectures=lectures)

    return car_context


async def refresh_all_dhbw_calendars(db: AsyncSession, console: Console, progress: Progress, task_id: TaskID) -> bool:
    """
    Refresh all DHBW.APP calendars by fetching current site lists,
    removing courses that no longer exist, and committing updates.
    Returns True on success, False if any errors occur.
    """
    errors = []
    try:
        # Initialize fetcher and get available sites
        fetcher = DHBWAppFetcher(progress)
        sites = fetcher.get_nativ_dhbw_sources()

        # Set the total number of steps in the progress bar
        progress.update(task_id, total=len(sites), refresh=True)

        # Preload Tags for potential use
        res = await db.execute(select(m_calendar.Tag))

        existing_tags = {tag.name: tag for tag in res.unique().scalars().all()}

        for site in sites:
            # Look up the University for this site code
            university = await map_dhbw_app_site_to_university(db, site, with_rooms=True)
            if not university:
                errors.append(f"University not found for site: {site}")
                continue

            # Update progress to 'fetching'
            progress.update(
                task_id,
                description=(
                    f"[bold green]Native-Calendar-DHBW[/bold green] " f"Fetching calendar for {university.name}..."
                ),
            )
            calendars = fetcher.get_all_calendars(site)
            if not calendars:
                errors.append(f"Failed to fetch calendar for site: {site}")
                continue

            # Update progress to 'processing'
            progress.update(
                task_id,
                description=(
                    f"[bold green]Native-Calendar-DHBW[/bold green] " f"Processing calendar for {university.name}..."
                ),
            )

            # Get calendar context with existing courses, lectures and sessions
            car_context = await get_existing_courses(
                db,
                university,
                list(calendars.keys()),
                existing_tags,
            )

            for course_name, course_data in calendars.items():
                await refresh_course(
                    db,
                    car_context,
                    course_name,
                    course_data,
                )

            # Delete all sessions that are not in the new calendar
            threshold = (
                datetime.datetime.now(tz=DEFAULT_TIMEZONE) - datetime.timedelta(days=COURSE_HISTORY_DAYS)
            )
            now = datetime.datetime.now(tz=DEFAULT_TIMEZONE)

            res = await db.execute(
                delete(m_calendar.Session).where(
                    m_calendar.Session.id.in_(car_context.sessions_to_delete),
                    or_(
                        m_calendar.Session.end_time < threshold,
                        m_calendar.Session.start_time > now,
                    ),
                )
            )
            await db.flush()

            deleted_sessions = res.rowcount

            # Delete all future sessions of lectures that are not in the new calendar
            res = await db.execute(
                delete(m_calendar.Session).where(
                    m_calendar.Session.lecture_id.in_(car_context.lectures_to_delete),
                    m_calendar.Session.start_time > now,
                )
            )

            deleted_sessions += res.rowcount

            # Clean up old courses and lectures
            deleted_courses, deleted_lectures = await delete_old_courses_lectures(db, university)

            course_sum = SummaryItem("Courses", car_context.new_courses, car_context.updated_courses, deleted_courses)
            lecture_sum = SummaryItem(
                "Lectures", car_context.new_lectures, car_context.updated_lectures, deleted_lectures
            )
            session_sum = SummaryItem(
                "Sessions", car_context.new_sessions, car_context.updated_sessions, deleted_sessions
            )
            print_summary_table(university.name, [course_sum, lecture_sum, session_sum], console)

            await db.commit()
            progress.update(task_id, advance=1)

        if errors:
            # Consolidate all errors into one exception
            raise ValueError("\n".join(errors))

        return True

    except Exception:
        # On error, update the progress indicator and print traceback
        progress.update(task_id, description="[bold red]Error[/bold red]", visible=True)

        console.print_exception()
        return False


async def update_all_dhbw_calendars(db: AsyncSession, console: Console, progress: Progress, task_id: TaskID) -> bool:
    try:
        fetcher = DHBWAppFetcher(progress)
        updated_calendars = fetcher.get_updated_calendars()
        if not updated_calendars:
            console.log("No updated calendars found.")
            return True

        res = await db.execute(select(m_calendar.Tag))
        existing_tags = {tag.name: tag for tag in res.unique().scalars().all()}

        for site, calendars in updated_calendars.items():
            university = await map_dhbw_app_site_to_university(db, site, with_rooms=True)
            if not university:
                console.log(f"University not found for site: {site}")
                continue

            car_context = await get_existing_courses(db, university, list(calendars.keys()), existing_tags)
            sessions_to_delete = []
            for course_name, course_data in calendars.items():
                if course_data.new_sessions:
                    await refresh_course(
                        db,
                        car_context,
                        course_name,
                        course_data.new_sessions,
                    )
                if course_data.updated_sessions:
                    ex_course = car_context.existing_courses.get(course_name)
                    if not ex_course:
                        console.log(f"Course {course_name} not found.")
                        continue

                    await refresh_course(
                        db,
                        car_context,
                        course_name,
                        course_data.updated_sessions,
                    )

                if course_data.deleted_sessions:
                    for lecture_name, session_external_ids in course_data.deleted_sessions.items():
                        ex_course = car_context.existing_courses.get(course_name)
                        if not ex_course:
                            console.log(f"Course '{course_name}' for session deletion not found.")
                            continue

                        ex_lecture = ex_course.lectures.get(lecture_name)
                        if not ex_lecture:
                            console.log(f"Lecture '{lecture_name}' for session deletion not found.")
                            continue

                        for session_external_id in session_external_ids:
                            session = ex_lecture.sessions.get(session_external_id)
                            if session:
                                sessions_to_delete.append(session.id)
                            else:
                                console.log(
                                    f"Session {session_external_id} not found in lecture '{lecture_name}' for session deletion."
                                )

            now = datetime.datetime.now(tz=DEFAULT_TIMEZONE)
            res = await db.execute(
                delete(m_calendar.Session).where(
                    m_calendar.Session.id.in_(sessions_to_delete),
                    m_calendar.Session.start_time > now,
                )
            )
            deleted_sessions = res.rowcount

            course_sum = SummaryItem("Courses", car_context.new_courses, car_context.updated_courses, 0)
            lecture_sum = SummaryItem("Lectures", car_context.new_lectures, car_context.updated_lectures, 0)
            session_sum = SummaryItem(
                "Sessions", car_context.new_sessions, car_context.updated_sessions, deleted_sessions
            )
            print_summary_table(university.name, [course_sum, lecture_sum, session_sum], console)

            await db.flush()
        await db.commit()

        return True
    except Exception:
        # On error, update the progress indicator and print traceback
        progress.update(task_id, description="[bold red]Error[/bold red]", visible=True)

        console.print_exception()
        return False


async def delete_old_courses_lectures(db: AsyncSession, university: m_calendar.University) -> Tuple[int, int]:
    # 1. Calculate the threshold
    threshold = datetime.datetime.now() - datetime.timedelta(days=COURSE_HISTORY_DAYS)

    # 2. Subquery: returns 1 if a session for the lecture >= threshold exists
    recent_session_exists = (
        select(1)
        .select_from(m_calendar.Session)
        .where(
            m_calendar.Session.lecture_id == m_calendar.Lecture.id,
            m_calendar.Session.end_time >= threshold,
        )
    )

    # 3. Delete all lectures for which no "recent sessions" exist
    res = await db.execute(
        delete(m_calendar.Lecture).where(
            # only lectures of the desired university
            m_calendar.Lecture.course.has(m_calendar.Course.university_id == university.id),
            # and that have no session after the threshold
            ~exists(recent_session_exists),
        )
    )

    del_lecture_count = res.rowcount

    # 4. Subquery: returns 1 if a lecture exists for the course
    lecture_exists = (
        select(1).select_from(m_calendar.Lecture).where(m_calendar.Lecture.course_id == m_calendar.Course.id)
    )

    # 5. Delete all courses that no longer have lectures
    res = await db.execute(
        delete(m_calendar.Course)
        .where(
            m_calendar.Course.university_id == university.id,
            ~exists(lecture_exists),
        )
        .execution_options(synchronize_session="fetch")
    )

    del_course_count = res.rowcount

    return del_course_count, del_lecture_count
