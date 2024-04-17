from sqlalchemy.orm import Session, joinedload, defer
import json

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_calendar

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import create_address

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general

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
    calendar_wrapper = calendarWrapper("ical", "dhbw-mannheim")

    try:
        dhbw_calendars = (
            db.query(m_calendar.CalendarNative)
            .join(m_calendar.CalendarNative.university)  # Join auf die University über die Beziehung
            .filter(
                m_calendar.CalendarNative.is_active == True,
                m_calendar.University.name == "Duale Hochschule Baden-Württemberg Mannheim",
            )
            .options(*query_options)
            .all()
        )

        progress.update(task_id, total=len(dhbw_calendars), refresh=True)

        for dhbw_calendar in dhbw_calendars:
            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar[/bold green] Update DHBW-Mannheim - {dhbw_calendar.lecture_name}",
            )
            calendar_data = calendar_wrapper.get_data(dhbw_calendar.source)
            if calendar_data and calendar_data.get("hash") != dhbw_calendar.hash:
                dhbw_calendar.data = calendar_data.get("data")
                dhbw_calendar.hash = calendar_data.get("hash")
                db.add(dhbw_calendar)
            progress.update(task_id, advance=1)
        db.commit()
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


def get_backend_ids(db: Session):
    backends = db.query(m_calendar.CalendarBackend).all()
    return {backend.name: backend.id for backend in backends}


def update_all_native_calendars(db: Session, progress, task_id: int):
    query_options = [
        joinedload(m_calendar.CalendarNative.source_backend),
        joinedload(m_calendar.CalendarNative.university),
        defer(m_calendar.CalendarNative.data),
    ]
    calendar_wrapper = calendarWrapper("ical", "dhbw-mannheim")

    try:

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
                description=f"[bold green]Native-Calendar[/bold green] Update DHBW-Mannheim - {dhbw_calendar.lecture_name}",
            )
            if dhbw_calendar.source not in dhbw_available_sources.values():
                db.delete(dhbw_calendar)
                continue
            else:
                dhbw_available_sources.pop(dhbw_calendar.lecture_name, None)

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
                    lecture_name=name,
                    source_backend_id=calendar_backends.get("iCalender"),
                    source=source,
                    data=calendar_data.get("data"),
                    hash=calendar_data.get("hash"),
                )
                db.add(calendar)
            progress.update(task_id, advance=1)

        db.commit()
    except Exception as e:
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


# # ======================================================== #
# # ===================== ICal Updater ===================== #
# # ======================================================== #
# def update_ical_custom(db: Session, progress, task_id):
#     icals = db.query(ICalCustom).all()
#     progress.update(task_id, total=len(icals), refresh=True)
#     for ical in icals:
#         progress.update(task_id, description=f"[bold green]iCal-Custom[/bold green] Update {ical.name}")
#         ical_data, ical_hash = get_ical_data(ical.source_url, "iCal-Custom")
#         if ical_hash != ical.hash:
#             ical.data = ical_data
#             ical.hash = ical_hash
#             db.add(ical)
#         progress.update(task_id, advance=1)
#     db.commit()


# def update_ical_dhbw_mannheim(db: Session, progress, task_id, only_active: bool = True):
#     if only_active:
#         icals = db.query(ICalDHBWMannheim).filter(ICalDHBWMannheim.is_active == True).all()
#     else:
#         icals = db.query(ICalDHBWMannheim).all()

#     progress.update(task_id, total=len(icals), refresh=True)

#     for ical in icals:
#         progress.update(task_id, description=f"[bold green]iCal-DHBWMannheim[/bold green] Update {ical.name}")
#         ical_data, ical_hash = get_ical_data(ical.source, "iCal-DHBWMannheim")
#         if ical_hash != ical.hash:
#             ical.data = ical_data
#             ical.hash = ical_hash
#             db.add(ical)
#         progress.update(task_id, advance=1)

#     db.commit()

# def update_all_ical_dhbw_mannheim(db: Session, progress, task_ids:tuple):
#     try:
#         icals = db.query(ICalDHBWMannheim).all()
#         available_sources = nativ_sources.get_source_dhbw_ma()
#         progress.update(task_ids[0], total=len(icals), refresh=True)

#         for i, ical in enumerate(icals):
#             progress.update(task_ids[0], description=f"[bold green]iCal-DHBWMannheim[/bold green] Update {ical.name}")
#             if ical.source not in available_sources.values():
#                 db.delete(ical)
#             else:
#                 available_sources.pop(ical.name, None)
#                 ical_data, ical_hash = get_ical_data(ical.source, "iCal-DHBWMannheim")
#                 if ical_hash != ical.hash:
#                     ical.data = ical_data
#                     ical.hash = ical_hash
#                     db.add(ical)
#             progress.update(task_ids[0], advance=1)

#         i = 0
#         progress.update(task_ids[1], total=len(available_sources), refresh=True)

#         for name, source in available_sources.items():
#             progress.update(task_ids[0], description=f"[bold green]iCal-DHBWMannheim[/bold green] Adding {ical.name}")

#             ical_data, ical_hash = get_ical_data(source, "iCal-DHBWMannheim")
#             ical = ICalDHBWMannheim(name=name, source=source, data=ical_data, hash=ical_hash)
#             db.add(ical)
#             progress.update(task_ids[1], advance=1)
#             i += 1

#         db.commit()
#     except Exception as e:
#         progress.update(task_ids[0], description=f"[bold red]Error[/bold red]", visible=True)
#         progress.update(task_ids[1], description=f"[bold red]Error[/bold red]", visible=True)
#         print(e)
