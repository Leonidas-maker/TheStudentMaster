from sqlalchemy.orm import Session
from tqdm import tqdm

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models.m_ical import ICalCustom, ICalDHBWMannheim

# ~~~~~~~~~~~~~~~~~ Utils ~~~~~~~~~~~~~~~~~ #
import utils.ical.nativ_sources as nativ_sources
from utils.ical.general import get_ical_data, get_icals_data

# ======================================================== #
# ===================== ICal Updater ===================== #
# ======================================================== #
def update_ical_custom(db: Session):
    icals = db.query(ICalCustom).all()

    for ical in icals:
        ical_data, ical_hash = get_ical_data(ical.source_url, "iCal-Custom")
        if ical_hash != ical.hash:
            ical.data = ical_data
            ical.hash = ical_hash
            db.add(ical)
    db.commit()


def update_ical_dhbw_mannheim(db: Session, only_active: bool = True):
    if only_active:
        icals = db.query(ICalDHBWMannheim).filter(ICalDHBWMannheim.is_active == True).all()
    else:
        icals = db.query(ICalDHBWMannheim).all()

    progress = tqdm(icals, leave=False, total=len(icals), ascii=" ▖▘▝▗▚▞█")
    for ical in icals:
        progress.set_description(f"[iCal-DHBWMannheim] Update {ical.name}")
        ical_data, ical_hash = get_ical_data(ical.source, "iCal-DHBWMannheim")
        if ical_hash != ical.hash:
            ical.data = ical_data
            ical.hash = ical_hash
            db.add(ical)
        progress.update(1)
        
    progress.close()
    db.commit()


def update_all_ical_dhbw_mannheim(db: Session):
    icals = db.query(ICalDHBWMannheim).all()
    available_sources = nativ_sources.get_source_dhbw_ma()
    
    progress = tqdm(icals, leave=False, total=len(icals), ascii=" ▖▘▝▗▚▞█")
    for ical in icals:
        progress.set_description(f"[iCal-DHBWMannheim] Update {ical.name}")
        if ical.source not in available_sources.values():
            db.delete(ical)
        else:
            available_sources.pop(ical.name, None)
            ical_data, ical_hash = get_ical_data(ical.source, "iCal-DHBWMannheim")
            if ical_hash != ical.hash:
                ical.data = ical_data
                ical.hash = ical_hash
                db.add(ical)
        progress.update(1)
    progress.close()
    
    progress = tqdm(available_sources.items(), leave=False, total=len(available_sources), ascii=" ▖▘▝▗▚▞█")
    for name, source in available_sources.items():
        progress.set_description(f"[iCal-DHBWMannheim] Adding {name}")
        ical_data, ical_hash = get_ical_data(source, "iCal-DHBWMannheim")
        ical = ICalDHBWMannheim(name=name, source=source, data=ical_data, hash=ical_hash)
        db.add(ical)
        progress.update(1)

    progress.close()
    db.commit()
