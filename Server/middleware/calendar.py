from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload, defer
from sqlalchemy import select
from profanity_check import predict
import json
import datetime
import uuid

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general, s_calendar

# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
import utils.calendar.nativ_sources as nativ_sources
from utils.calendar.calendar_wrapper import CalendarWrapper


###########################################################################
############################ Major Update Logic ###########################
###########################################################################


# ======================================================== #
# =================== Startup functions ================== #
# ======================================================== #
def prepareCalendarTables(db: Session):
    backends = ["Rapla", "iCalendar"]
    for backend in backends:
        if not db.query(m_calendar.CalendarBackend).filter(m_calendar.CalendarBackend.backend_name == backend).first():
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
                rooms=university.get("rooms"),
                domains=university.get("domains"),
                address_id=university_address.address_id if university_address else None,
            )
        )
    db.commit()


# ======================================================== #
# ===================== Native Update ==================== #
# ======================================================== #
def update_active_native_calendars(db: Session, progress, task_id):
    query_options = [
        defer(m_calendar.CalendarNative.data),
    ]
    try:
        calendar_wrapper = CalendarWrapper("iCalendar", "dhbw-mannheim")
        dhbw_calendars = (
            db.query(m_calendar.CalendarNative)
            .join(
                m_calendar.UserCalendar,
                m_calendar.UserCalendar.native_calendar_id == m_calendar.CalendarNative.calendar_native_id,
            )
            .join(m_calendar.University)
            .filter(m_calendar.University.university_name == "Duale Hochschule Baden-Wuerttemberg Mannheim")
            .options(*query_options)
            .all()
        )

        progress.update(task_id, total=len(dhbw_calendars), refresh=True)

        for dhbw_calendar in dhbw_calendars:
            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar[/bold green] Update DHBW-Mannheim - {dhbw_calendar.course_name}",
            )
            calendar_data = calendar_wrapper.get_data(dhbw_calendar.source)
            if calendar_data and calendar_data.get("hash") != dhbw_calendar.hash:
                dhbw_calendar.data = calendar_data.get("data")
                dhbw_calendar.hash = calendar_data.get("hash")
                db.add(dhbw_calendar)
            progress.update(task_id, advance=1)
        db.commit()
        progress.update(
            task_id,
            description=f"[bold green]Native-Calendar-DHBWMannheim[/bold green] Done!",
            visible=True,
            refresh=True,
        )
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


def get_backend_ids(db: Session):
    backends = db.query(m_calendar.CalendarBackend).all()
    return {backend.backend_name: backend.calendar_backend_id for backend in backends}


def update_all_native_calendars(db: Session, progress, task_id: int):
    query_options = [
        defer(m_calendar.CalendarNative.data),
    ]
    try:
        calendar_wrapper = CalendarWrapper("iCalendar", "dhbw-mannheim")
        calendar_backends = get_backend_ids(db)

        dhbw_mannheim = (
            db.query(m_calendar.University)
            .filter(m_calendar.University.university_name == "Duale Hochschule Baden-Wuerttemberg Mannheim")
            .first()
        )

        dhbw_calendars = (
            db.query(m_calendar.CalendarNative)
            .filter(m_calendar.CalendarNative.university_id == dhbw_mannheim.university_id)
            .options(*query_options)
            .all()
        )
        dhbw_available_sources = nativ_sources.get_source_dhbw_ma()

        progress.update(task_id, total=len(dhbw_available_sources), refresh=True)

        for dhbw_calendar in dhbw_calendars:
            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar[/bold green] Update DHBW-Mannheim - {dhbw_calendar.course_name}",
            )
            if dhbw_calendar.source not in dhbw_available_sources.values():
                db.delete(dhbw_calendar)
                continue
            else:
                dhbw_available_sources.pop(dhbw_calendar.course_name, None)

            calendar_data = calendar_wrapper.get_data(dhbw_calendar.source)

            if calendar_data and calendar_data.get("hash") != dhbw_calendar.hash:
                dhbw_calendar.data = calendar_data.get("data")
                dhbw_calendar.hash = calendar_data.get("hash")
                db.add(dhbw_calendar)
            progress.update(task_id, advance=1)

        for name, source in dhbw_available_sources.items():
            progress.update(
                task_id, description=f"[bold green]Native-Calendar[/bold green] Adding DHBW-Mannheim - {name}"
            )
            calendar_data = calendar_wrapper.get_data(source)
            if calendar_data:
                calendar = m_calendar.CalendarNative(
                    university_id=dhbw_mannheim.university_id,
                    course_name=name,
                    source_backend_id=calendar_backends.get("iCalendar"),
                    source=source,
                    data=calendar_data.get("data"),
                    hash=calendar_data.get("hash"),
                )
                db.add(calendar)
            progress.update(task_id, advance=1)
        db.commit()
        progress.update(
            task_id,
            description=f"[bold green]Native-Calendar-DHBWMannheim[/bold green] Done!",
            visible=True,
            refresh=True,
        )
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


# ======================================================== #
# ===================== Custom Update ==================== #
# ======================================================== #
def update_custom_calendars(db: Session, progress, task_id, backend: m_calendar.CalendarBackend):
    query_options = [
        defer(m_calendar.CalendarCustom.data),
    ]

    try:
        calendar_wrapper = CalendarWrapper(backend.backend_name)

        custom_calendars = (
            db.query(m_calendar.CalendarCustom)
            .filter(m_calendar.CalendarCustom.source_backend_id == backend.calendar_backend_id)
            .options(*query_options)
            .all()
        )
        progress.update(task_id, total=len(custom_calendars), refresh=True)

        current_time = datetime.datetime.now()

        for custom_calendar in custom_calendars:
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
            calendar_data = calendar_wrapper.get_data(custom_calendar.source_url)
            if calendar_data and calendar_data.get("hash") != custom_calendar.hash:
                custom_calendar.data = calendar_data.get("data")
                custom_calendar.hash = calendar_data.get("hash")
                db.add(custom_calendar)
            progress.update(task_id, advance=1)
        db.commit()
        progress.update(
            task_id,
            description=f"[bold green]Custom-Calendar-{backend.backend_name}[/bold green] Done!",
            visible=True,
            refresh=True,
        )
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


###########################################################################
######################## Calendar_Users Management ########################
###########################################################################


# ======================================================== #
# ===================== Adder/Updater ==================== #
# ======================================================== #
def add_update_user_calendar(
    db: Session, user_id: int, custom_calendar_id: int = None, native_calendar_id: int = None
) -> m_calendar.UserCalendar:
    if custom_calendar_id and native_calendar_id or not custom_calendar_id and not native_calendar_id:
        raise ValueError("Invalid calendar id combination")

    user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    if user_calendar:
        user_calendar.custom_calendar_id = custom_calendar_id
        user_calendar.native_calendar_id = native_calendar_id
    else:
        user_calendar = m_calendar.UserCalendar(
            user_id=user_id,
            custom_calendar_id=custom_calendar_id,
            native_calendar_id=native_calendar_id,
        )
        db.add(user_calendar)
    db.flush()
    return user_calendar


def add_native_calendar_to_user(
    db: Session, user_id: int, course_name: int, university_uuid: uuid.UUID
) -> m_calendar.CalendarNative | None:
    calendar_native = (
        db.query(m_calendar.CalendarNative)
        .join(m_calendar.University)
        .filter(
            m_calendar.University.university_uuid == university_uuid,
            m_calendar.CalendarNative.course_name == course_name,
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
                .filter(m_calendar.University.university_uuid == new_custom_calendar.university_uuid)
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
            db.add(custom_calendar)
            db.flush()

        # Add custom calendar to user
        add_update_user_calendar(db, user_id, custom_calendar_id=custom_calendar.calendar_custom_id)
        db.commit()

        # Return the custom calendar
        return custom_calendar
    else:
        raise HTTPException(status_code=400, detail="Invalid backend source")


# ======================================================== #
# ======================== Getter ======================== #
# ======================================================== #
def get_calendar(
    db: Session, user_id: int, with_university: bool = False, with_data: bool = False
) -> m_calendar.CalendarCustom | m_calendar.CalendarNative | None:
    query_options = []

    user_calendar = db.query(m_calendar.UserCalendar).filter(m_calendar.UserCalendar.user_id == user_id).first()

    # Check if user has a calendar
    if user_calendar:
        if user_calendar.native_calendar_id:
            if with_university:
                query_options += [joinedload(m_calendar.CalendarNative.university)]
            if not with_data:
                query_options += [defer(m_calendar.CalendarNative.data)]

            # Get native calendar
            calendar = (
                db.query(m_calendar.CalendarNative)
                .options(*query_options)
                .filter(m_calendar.CalendarNative.calendar_native_id == user_calendar.native_calendar_id)
                .first()
            )
        else:
            if with_university:
                query_options += [joinedload(m_calendar.CalendarCustom.university)]
            if not with_data:
                query_options += [defer(m_calendar.CalendarCustom.data)]
            # Get custom calendar
            calendar = (
                db.query(m_calendar.CalendarCustom)
                .options(*query_options)
                .filter(m_calendar.CalendarCustom.calendar_custom_id == user_calendar.custom_calendar_id)
                .first()
            )
        return calendar

    # Return None if user has no calendar
    return None


# ======================================================== #
# ========================= Utils ======================== #
# ======================================================== #
def clean_custom_calendars(db: Session) -> int:
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
