import time

from task_scheduler import TaskScheduler
from modules import canteen, general
from models import m_generic, m_canteen
from config.database import SessionLocal, engine


def main():
    m_generic.Base.metadata.create_all(bind=engine)
    m_canteen.Base.metadata.create_all(bind=engine)

    task_scheduler = TaskScheduler(verbose=True)

    db = SessionLocal()
    canteen.create_canteens(db)
    db.close()

    task_scheduler.add_task(
        "canteen",
        canteen.update_canteen_menus,
        cron="*/20 6-18 * * 1-5",  # Every 15 minutes from 6am to 6pm on weekdays
        blocked_by=[],
        on_startup=True,
        with_progress=True,
    )

    task_scheduler.start(run_startup_tasks=True)

    try:
        # Keep the main thread alive
        while True:
            time.sleep(5)
    except (KeyboardInterrupt, SystemExit):
        task_scheduler.stop()


if __name__ == "__main__":
    main()
