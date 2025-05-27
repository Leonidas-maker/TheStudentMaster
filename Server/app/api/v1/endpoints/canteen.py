from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

from middleware.general import get_endpoint_context
from core.generic import EndpointContext
from utils.exceptions import handle_exception

from schemas import s_canteen
import crud.canteen as crud_canteen

router = APIRouter()


@router.get("/all", response_model=list[s_canteen.ResGetCanteen], tags=["Canteen"])
async def get_canteens_v1(db: AsyncSession = Depends(get_db)):
    canteens = await crud_canteen.get_all_canteens(db)
    return [s_canteen.ResGetCanteen.model_validate(canteen) for canteen in canteens]


@router.get("/{canteen_short_name}/menu/all", response_model=s_canteen.ResGetCanteenMenu, tags=["Canteen"])
async def canteen_read_menu_all(
    canteen_short_name: str = Path(..., description="Short name of the canteen"),
    ep_context: EndpointContext = Depends(get_endpoint_context),
):
    try:
        calendar = await crud_canteen.get_canteen(ep_context.db, canteen_short_name, with_menus=True)
        if calendar is None:
            raise HTTPException(status_code=404, detail="Canteen not found")
        return s_canteen.ResGetCanteenMenu(
            canteen_name=calendar.canteen_name,
            canteen_short_name=calendar.canteen_short_name,
            image_url=calendar.image_url,
            menu=[
                s_canteen.ResGetMenuDay(
                    dish_type=menu.dish_type,
                    dish=menu.dish.description,
                    price=menu.dish.price,
                    serving_date=menu.serving_date,
                )
                for menu in calendar.menus
            ],
        )
    except Exception as e:
        await handle_exception(e, ep_context, "Failed to retrieve canteen menu")
