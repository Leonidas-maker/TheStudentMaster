import time

from task_scheduler import TaskScheduler
from modules import canteen, calendar, general
from models import m_calendar, m_general, m_user, m_canteen
from config.database import SessionLocal, engine


def main():
    m_general.Base.metadata.create_all(bind=engine)
    m_user.Base.metadata.create_all(bind=engine)
    m_calendar.Base.metadata.create_all(bind=engine)
    m_canteen.Base.metadata.create_all(bind=engine)

    task_scheduler = TaskScheduler(verbose=True)

    db = SessionLocal()
    canteen.create_canteens(db)
    print("Preparing calendar tables...")
    calendar.prepareCalendarTables(db)
    print("Preparing stats...")
    backends = db.query(m_calendar.CalendarBackend).all()
    db.close()

    # task_scheduler.add_task(
    #     "canteen",
    #     update_canteen_menus,
    #     cron="*/20 6-18 * * 1-5",  # Every 15 minutes from 6am to 6pm on weekdays
    #     blocked_by=[],
    #     on_startup=True,
    #     with_progress=True,
    # )

    task_scheduler.add_task(
        "calendar_dhbw_refresh",
        calendar.refresh_all_dhbw_calendars,
        cron="0 12 * * Sat",  # Every 7 days
        on_startup=True,
        with_console=True,
    )

    task_scheduler.add_task(
        "calendar_dhbw_update",
        calendar.update_all_dhbw_calendars,
        cron="*/20 * * * *",  # Every 20 minutes
        blocked_by=["calendar_dhbw_refresh"],
        with_console=True,
    )

    for backend in backends:
        if backend.backend_name != "DHBW.APP":
            task_scheduler.add_task(
                f"calendar_custom_{backend.backend_name}",
                calendar.update_custom_calendars,
                cron="*/20 * * * *",  # Every 20 minutes
                blocked_by=[],
                on_startup=True,
                kwargs={"backend": backend},
            )

    # ~~~~~~~~~~~~~~~~ Cleaners ~~~~~~~~~~~~~~~ #
    task_scheduler.add_task(
        "calendar_custom_clean",
        calendar.clean_custom_calendars,
        cron="0 0 * * *",  # Every day at midnight
        blocked_by=[],
        with_progress=False,
    )

    task_scheduler.add_task(
        "address_clean",
        general.clean_address,
        cron="0 0 * * *",  # Every day at midnight
        blocked_by=[],
        with_progress=False,
    )

    # task_scheduler.add_task(
    #     "canteen_clean_menus",
    #     calendar.clean_canteen_menus,
    #     interval_seconds=60 * 60 * 12,  # 12 hours
    #     # start_time=6,
    #     # end_time=18,
    #     blocked_by=["canteen"],
    #     with_progress=False,
    # )

    task_scheduler.start(run_startup_tasks=True)

    try:
        # Keep the main thread alive
        while True:
            time.sleep(5)
    except (KeyboardInterrupt, SystemExit):
        task_scheduler.stop()


if __name__ == "__main__":
    main()
