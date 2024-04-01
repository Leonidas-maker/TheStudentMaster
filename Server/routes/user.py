from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user


# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db
from middleware.auth import verify_access_token, check_jti, verify_refresh_token
from middleware.user import get_user

###########################################################################
################################### MAIN ##################################
###########################################################################

users_router = APIRouter()

# For token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ======================================================== #
# ========================== Me ========================== #
# ======================================================== #
@users_router.get("/me", response_model=s_user.ResGetUser)
def read_me(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    jwt_payload = verify_access_token(db, access_token)
    if jwt_payload:
        user = get_user(db, user_uuid=jwt_payload["sub"], with_user_uuid=True)
        return s_user.ResGetUser(**user.as_dict())
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


@users_router.put("/me")
def update_me(access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    jwt_payload = verify_access_token(db, access_token)
    if jwt_payload:
        user = get_user(db, user_uuid=jwt_payload["sub"])
        # TODO Update user
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


@users_router.delete("/me")
def delete_me(refresh_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    jwt_payload = verify_refresh_token(db, refresh_token)
    if jwt_payload:
        user = get_user(db, user_uuid=jwt_payload["sub"])
        db.delete(user)
        db.commit()
        return {"message": "User deleted"}
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ~~~~~~~~~~~~~~~~ Specific ~~~~~~~~~~~~~~~ #
@users_router.get("/me/address")
def read_me_address():
    return {"Hello": "World"}
