from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models.m_ical import ICalCustom, ICalDHBWMannheim

# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
import utils.ical.nativ_sources as nativ_sources
from utils.ical.general import get_ical_data, get_icals_data

# ======================================================== #
# ===================== ICal Updater ===================== #
# ======================================================== #
def update_ical_custom(db: Session, progress, task_id):
    icals = db.query(ICalCustom).all() 
    progress.update(task_id, total=len(icals), refresh=True)
    for ical in icals:
        progress.update(task_id, description=f"[bold green]iCal-Custom[/bold green] Update {ical.name}")
        ical_data, ical_hash = get_ical_data(ical.source_url, "iCal-Custom")
        if ical_hash != ical.hash:
            ical.data = ical_data
            ical.hash = ical_hash
            db.add(ical)
        progress.update(task_id, advance=1)
    db.commit()


def update_ical_dhbw_mannheim(db: Session, progress, task_id, only_active: bool = True):
    if only_active:
        icals = db.query(ICalDHBWMannheim).filter(ICalDHBWMannheim.is_active == True).all()
    else:
        icals = db.query(ICalDHBWMannheim).all()

    progress.update(task_id, total=len(icals), refresh=True)

    for ical in icals:
        progress.update(task_id, description=f"[bold green]iCal-DHBWMannheim[/bold green] Update {ical.name}")
        ical_data, ical_hash = get_ical_data(ical.source, "iCal-DHBWMannheim")
        if ical_hash != ical.hash:
            ical.data = ical_data
            ical.hash = ical_hash
            db.add(ical)
        progress.update(task_id, advance=1)
        
    db.commit()

def update_all_ical_dhbw_mannheim(db: Session, progress, task_ids:tuple):
    try:
        icals = db.query(ICalDHBWMannheim).all()
        available_sources = nativ_sources.get_source_dhbw_ma()
        progress.update(task_ids[0], total=len(icals), refresh=True)
        
        for i, ical in enumerate(icals):
            progress.update(task_ids[0], description=f"[bold green]iCal-DHBWMannheim[/bold green] Update {ical.name}")
            if ical.source not in available_sources.values():
                db.delete(ical)
            else:
                available_sources.pop(ical.name, None)
                ical_data, ical_hash = get_ical_data(ical.source, "iCal-DHBWMannheim")
                if ical_hash != ical.hash:
                    ical.data = ical_data
                    ical.hash = ical_hash
                    db.add(ical)
            progress.update(task_ids[0], advance=1)

        i = 0
        progress.update(task_ids[1], total=len(available_sources), refresh=True)

        for name, source in available_sources.items():
            progress.update(task_ids[0], description=f"[bold green]iCal-DHBWMannheim[/bold green] Adding {ical.name}")

            ical_data, ical_hash = get_ical_data(source, "iCal-DHBWMannheim")
            ical = ICalDHBWMannheim(name=name, source=source, data=ical_data, hash=ical_hash)
            db.add(ical)
            progress.update(task_ids[1], advance=1)
            i += 1

        db.commit()
    except Exception as e:
        progress.update(task_ids[0], description=f"[bold red]Error[/bold red]", visible=True)
        progress.update(task_ids[1], description=f"[bold red]Error[/bold red]", visible=True)
        print(e)