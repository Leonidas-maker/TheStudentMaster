from fastapi import FastAPI, Depends
from fastapi_cdn_host import monkey_patch_for_docs_ui 
from sqlalchemy.orm import Session

from models import m_user, m_ical, m_general
from config.database import engine
from routes import user, auth
from data.email import send_with_template, EmailSchema
from middleware.database import get_db
from middleware.ical import update_ical_dhbw_mannheim


m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_ical.Base.metadata.create_all(bind=engine)
app = FastAPI()
monkey_patch_for_docs_ui(app)

@app.get("/")
async def root(db: Session = Depends(get_db)):
    return {"message": "Hello World"}

app.include_router(user.users_router, prefix="/user")
app.include_router(auth.auth_router, prefix="/auth")