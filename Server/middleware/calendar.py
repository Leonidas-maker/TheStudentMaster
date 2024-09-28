from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload, defer
from sqlalchemy.orm.attributes import flag_modified
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
from utils.calendar.dhbw_app_fetcher import DHBWAppFetcher
from utils.calendar.calendar_wrapper import CalendarWrapper
from utils.helpers.hashing import dict_hash
import utils.calendar.schemes as calendar_schemes

###########################################################################
############################# Helper Functions ############################
###########################################################################

def get_backend_ids(db: Session):
    """Function to get backend IDs for calendar updates."""
    backends = db.query(m_calendar.CalendarBackend).all()
    return {backend.backend_name: backend.calendar_backend_id for backend in backends}


def map_dhbw_app_site_to_university_name(db: Session, site: str) -> str | None:
    """
    Function to map DHBW.APP sites to university names.
    
    This function maps the DHBW.APP site codes to the corresponding university names.

    Args:
        db (Session): Database session
        site (str): DHBW.APP site code
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
        case "DHBW":
            return "Duale Hochschule Baden-Wuerttemberg - Standortübergreifend"
        case _:
            return None


def map_dhbw_app_site_to_university(db: Session, site) -> m_calendar.University | None:
    """
    Function to map DHBW.APP sites to university records.

    Args:
        db (Session): Database session
        site (str): DHBW.APP site code
    """

    university_name = map_dhbw_app_site_to_university_name(db, site)
    if university_name:
        return db.query(m_calendar.University).filter(m_calendar.University.university_name == university_name).first()
    return None

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
                rooms=university.get("rooms"),
                domains=university.get("domains"),
                address_id=university_address.address_id if university_address else None,
            )
        )
    db.commit()

###########################################################################
############################ Major Update Logic ###########################
###########################################################################
# ======================================================== #
# ======================= DHBW.APP ======================= #
# ======================================================== #

async def refresh_all_dhbw_calendars(db: Session, progress, task_id: int):
    """
    Function to refresh all native dhbw calendars.
    
    This function fetches all available DHBW.APP sites and updates the native calendars for each site.

    Args:
        db (Session): Database session
        progress (Progress): Progress bar instance
        task_id (int): Task ID for the progress bar
    """
    query_options = [
        defer(m_calendar.CalendarNative.data),  # Defer loading of large 'data' field to optimize query performance
    ]

    error_messages = []

    try:
        source_backend_ids = get_backend_ids(db)  # Get the backend IDs for calendar updates
        dhbw_app_fetcher = DHBWAppFetcher(progress)  # Initialize the DHBW App fetcher
        available_dhbw_sites = dhbw_app_fetcher.get_nativ_dhbw_sources()  # Get the currently available sources for DHBW
        available_dhbw_sites.append("DHBW")

        progress.update(task_id, total=len(available_dhbw_sites), refresh=True)

        for available_dhbw_site in available_dhbw_sites:
            university = map_dhbw_app_site_to_university(db, available_dhbw_site)

            if not university:
                error_messages.append(f"University not found for site: {available_dhbw_site}")
                continue

            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] Init-Update {university.university_name}: Fetching...",
            )

            calenders = dhbw_app_fetcher.get_all_calendars(available_dhbw_site).data

            if not calenders:
                error_messages.append(f"Failed to fetch calendar for site: {available_dhbw_site}")
                continue

            site_lectures = (
                db.query(m_calendar.CalendarNative)
                .filter(m_calendar.CalendarNative.university_id == university.university_id)
                .options(*query_options)
                .all()
            )

            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] Init-Update {university.university_name}: Processing...",
            )

            for lectures in site_lectures:
                lecture_exists = False
                if lectures.course_name not in calenders.keys():
                    db.delete(lectures)
                    continue
                else:
                    lecture_exists = True

                calendar_data = calenders.get(lectures.course_name)
                if calendar_data.hash != lectures.hash:
                    lectures.data = calendar_data.data.model_dump()
                    lectures.hash = calendar_data.hash
                    db.add(lectures)

                if lecture_exists:
                    calenders.pop(lectures.course_name)

            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] Init-Update {university.university_name}: Adding...",
            )


            for course_name, calendar_data in calenders.items():
                db.add(
                    m_calendar.CalendarNative(
                        university_id=university.university_id,
                        source_backend_id=source_backend_ids.get("DHBW.APP"),
                        course_name=course_name,
                        source="DHBW.APP",
                        data=calendar_data.data.model_dump(),
                        hash=calendar_data.hash,
                        last_modified=datetime.datetime.now(),
                    )
                )

            db.flush()
            progress.update(task_id, advance=1)
        db.commit()

        if error_messages:
            raise ValueError("\n".join(error_messages))


        # Final update to indicate the task is done
        progress.update(
            task_id,
            description=f"[bold green]Native-Calendar-DHBW[/bold green] Done!",
            visible=True,
            refresh=True,
        )

    except Exception as e:
        # Handle any errors by updating the progress bar and printing the error
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)


async def update_all_dhbw_calendars(db: Session, progress, task_id: int):
    """
    Function to update all native calendars.
    
    This function fetches updates for all native DHBW calendars and updates the database accordingly.

    Args:
        db (Session): Database session
        progress (Progress): Progress bar instance
        task_id (int): Task ID for the progress bar
    """
    try:
        source_backend_ids = get_backend_ids(db)  # Get the backend IDs for calendar updates
        dhbw_app_fetcher = DHBWAppFetcher(progress)  # Initialize the DHBW App fetcher


        progress.update(task_id, description=f"[bold green]Native-Calendar-DHBW[/bold green] Fetching updates...")

        raw_updates:calendar_schemes.DHBWUpdateCalendar = await dhbw_app_fetcher.get_updated_calendars()

        timzone = raw_updates.X_WR_TIMEZONE
        updated_calendars = raw_updates.data

        if not updated_calendars:
            # Final update to indicate the task found no updates
            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] No updates found!",
                visible=True,
                refresh=True,
            )
            return

        available_dhbw_sites = dhbw_app_fetcher.get_nativ_dhbw_sources()  # Get the currently available sources for DHBW

        for university_name, _types in updated_calendars.items():
            university = map_dhbw_app_site_to_university(db, university_name)

            if not university and university_name not in available_dhbw_sites:
                print(f"University not found for site: {university_name}")
                continue

            lecture_names = list(_types.new.keys()) 
            lecture_names += list(_types.updated.keys())
            lecture_names += list(_types.deleted)
           

            courses_to_update = (
                db.query(m_calendar.CalendarNative)
                .filter(
                    m_calendar.CalendarNative.university_id == university.university_id,
                    m_calendar.CalendarNative.course_name.in_(lecture_names),
                )
                .all()
            )
            
            progress.update(
                task_id,
                description=f"[bold green]Native-Calendar-DHBW[/bold green] Updating {university.university_name}...",
                total=len(courses_to_update),
            )

            for course in courses_to_update:
                new = _types.new.pop(course.course_name, {})
                updated = _types.updated.pop(course.course_name, {})
                deleted = _types.deleted if _types.deleted else []

                course_data = course.data

                # Check if timezones are the same and raise an error if they are not
                if timzone != course_data.get("X_WR_TIMEZONE"):
                    raise ValueError("Timezone mismatch!\nDelete the data in the database or change the timezone!")

                remaining_events = []
                for lecture in course_data.get("events", []):
                    lecture_id = lecture.get("description", {}).get("id")
                    if lecture_id in deleted:
                        _types.deleted.remove(lecture_id)
                        continue
                    elif lecture_id in updated.keys():
                        lecture = updated.pop(lecture_id).model_dump()
                        remaining_events.append(lecture)
                    elif lecture_id in new.keys():
                        lecture = new.pop(lecture_id).model_dump()
                        remaining_events.append(lecture)
                    else:
                        remaining_events.append(lecture)
                
                for lecture, data in new.items():
                    remaining_events.append(data.model_dump())

                course_data["events"] = remaining_events


                #* Data will not automatically update in the database so we need to manually update it
                flag_modified(course, "data")

                # Update the course data, hash and last modified timestamp
                course.data = course_data
                course.hash = dict_hash(course.data)
                course.last_modified = datetime.datetime.now()
                db.add(course)

            for course_name, new_data in _types.new.items():

                
                db.add(
                    m_calendar.CalendarNative(
                        university_id=university.university_id,
                        source_backend_id=source_backend_ids.get("DHBW.APP"),
                        course_name=course_name,
                        source="DHBW.APP",
                        data=new_data.model_dump(),
                        hash=dict_hash(new_data),
                        last_modified=datetime.datetime.now(),
                    )
                )

            db.flush()
            progress.update(task_id, advance=1)

        db.commit()

        # Final update to indicate the task is done
        progress.update(
            task_id,
            description=f"[bold green]Native-Calendar-DHBW[/bold green] Done!",
            visible=True,
            refresh=True,
        )
    except Exception as e:
        # Handle any errors by updating the progress bar and printing the error
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)

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
    db: Session, user_id: int, course_name: int, university_uuid: uuid.UUID
) -> m_calendar.CalendarNative | None:
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
) -> m_calendar.CalendarCustom | m_calendar.CalendarNative | None:
    """
    Function to get a user's calendar.
    
    This function fetches a user's calendar based on the user ID.

    Args:
        db (Session): Database session
        user_id (int): User ID for which to get the calendar
        with_university (bool, optional): Flag to include university data in the response. Defaults to False.
        with_data (bool, optional): Flag to include calendar data in the response. Defaults to False.
    """

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
