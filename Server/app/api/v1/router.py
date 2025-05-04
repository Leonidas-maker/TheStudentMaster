from fastapi import APIRouter
from api.v1.endpoints import calendar, canteen
    

# Main-Router
router = APIRouter()

# Registering the sub-routers
router.include_router(calendar.router, prefix="/calendar")
router.include_router(canteen.router, prefix="/canteen")