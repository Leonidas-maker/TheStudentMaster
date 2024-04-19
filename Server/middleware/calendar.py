from sqlalchemy.orm import Session, joinedload, defer
import json
import datetime

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general, s_calendar

# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
import utils.calendar.nativ_sources as nativ_sources
from utils.calendar.calendar_wrapper import calendarWrapper


# ======================================================== #
# =================== Startup functions ================== #
# ======================================================== #


def prepareCalendarTables(db: Session):
    backends = ["Rapla", "iCalender"]
    for backend in backends:
        if not db.query(m_calendar.CalendarBackend).filter(m_calendar.CalendarBackend.name == backend).first():
            db.add(m_calendar.CalendarBackend(name=backend))

    with open(
        "./data/address_lists/ger_univercity.json", "r", encoding="utf-8"
    ) as f:  # TODO: Change path --> not relative
        data = json.load(f)

    for university in data:
        university_address = None
        if db.query(m_calendar.University).filter(m_calendar.University.name == university.get("name")).first():
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
                name=university.get("name"),
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
        calendar_wrapper = calendarWrapper("iCalender", "dhbw-mannheim")
        dhbw_calendars = (
            db.query(m_calendar.CalendarNative)
            .join(m_calendar.UserCalendar, m_calendar.UserCalendar.native_calendar_id == m_calendar.CalendarNative.id)
            .join(m_calendar.University)
            .filter(m_calendar.University.name == "Duale Hochschule Baden-Wuerttemberg Mannheim")
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
        progress.update(task_id, description=f"[bold green]Native-Calendar-DHBWMannheim[/bold green] Done!", visible=True, refresh=True)
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


def get_backend_ids(db: Session):
    backends = db.query(m_calendar.CalendarBackend).all()
    return {backend.name: backend.id for backend in backends}


def update_all_native_calendars(db: Session, progress, task_id: int):
    query_options = [
        defer(m_calendar.CalendarNative.data),
    ]
    try:
        calendar_wrapper = calendarWrapper("iCalender", "dhbw-mannheim")
        calendar_backends = get_backend_ids(db)

        dhbw_mannheim = (
            db.query(m_calendar.University)
            .filter(m_calendar.University.name == "Duale Hochschule Baden-Wuerttemberg Mannheim")
            .first()
        )

        dhbw_calendars = (
            db.query(m_calendar.CalendarNative)
            .filter(m_calendar.CalendarNative.university_id == dhbw_mannheim.id)
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
                    university_id=dhbw_mannheim.id,
                    course_name=name,
                    source_backend_id=calendar_backends.get("iCalender"),
                    source=source,
                    data=calendar_data.get("data"),
                    hash=calendar_data.get("hash"),
                )
                db.add(calendar)
            progress.update(task_id, advance=1)
        db.commit()
        progress.update(task_id, description=f"[bold green]Native-Calendar-DHBWMannheim[/bold green] Done!", visible=True, refresh=True)
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
        calendar_wrapper = calendarWrapper(backend.name)

        custom_calendars = (
            db.query(m_calendar.CalendarCustom)
            .filter(m_calendar.CalendarCustom.source_backend_id == backend.id)
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
                continue

            progress.update(
                task_id,
                description=f"[bold green]Custom-Calendar[/bold green] Update {backend.name} - {custom_calendar.course_name}",
            )
            calendar_data = calendar_wrapper.get_data(custom_calendar.source_url)
            if calendar_data and calendar_data.get("hash") != custom_calendar.hash:
                custom_calendar.data = calendar_data.get("data")
                custom_calendar.hash = calendar_data.get("hash")
                db.add(custom_calendar)
            progress.update(task_id, advance=1)
        db.commit()
        progress.update(task_id, description=f"[bold green]Custom-Calendar-{backend.name}[/bold green] Done!", visible=True, refresh=True) 
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


def clean_custom_calendars(db: Session):
    query_options = [defer(m_calendar.CalendarCustom.data)]

    try:
        # Delete all custom calendars that are not used by any user
        db.query(m_calendar.CalendarCustom).options(*query_options).outerjoin(
            m_calendar.UserCalendar, m_calendar.CalendarCustom.id == m_calendar.UserCalendar.custom_calendar_id
        ).filter(m_calendar.UserCalendar.id == None).delete(synchronize_session=False)

        db.commit()
    except Exception as e:
        print(e)
