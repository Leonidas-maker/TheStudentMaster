from fastapi import APIRouter, Depends, Path, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Union

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_auth, s_user

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_db

# ~~~~~~~~~~~~~~ Controllers ~~~~~~~~~~~~~~ #
from controllers.auth import (
    refresh_tokens,
    register,
    login,
    logout,
    verify_account,
    add_2fa,
    verify_first_2fa,
    verify_2fa,
    verify_2fa_backup,
    remove_2fa,
)


###########################################################################
################################### MAIN ##################################
###########################################################################

auth_router = APIRouter()

# For token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ======================================================== #
# ======================= Register ======================= #
# ======================================================== #


@auth_router.post("/register", response_model=s_auth.UserResRegister)
def user_register(
    user: s_user.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return register(db, background_tasks, user)


@auth_router.post("/verify-account/{user_uuid}")
def user_verify_account(verify_code: str, db: Session = Depends(get_db), user_uuid: str = Path(...)):
    return verify_account(db, user_uuid, verify_code)


# ======================================================== #
# ==================== Forgot Password =================== #
# ======================================================== #


@auth_router.post("/forgot-password/")
def user_forgot_password():
    return {"Hello": "World"}


@auth_router.post("/reset-password/{user_uuid}")
def user_reset_password():
    return {"Hello": "World"}


# ======================================================== #
# ===================== Account Auth ===================== #
# ======================================================== #


@auth_router.post("/login", response_model=Union[s_auth.UserTokens, s_auth.UserSecurityToken])
def user_login(user_login: s_auth.UserLogin, db: Session = Depends(get_db)):
    return login(db, user_login.ident, user_login.password, user_login.new_application)


@auth_router.delete("/logout/")
def user_logout(
    tokens: s_auth.UserTokens,
    db: Session = Depends(get_db),
):
    return logout(db, tokens.refresh_token, tokens.access_token)


# ~~~~~~~~~~~~~~~~~ Tokens ~~~~~~~~~~~~~~~~ #
@auth_router.post("/refresh-token", response_model=s_auth.UserTokens)
def refresh_token(refresh_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    return refresh_tokens(db, refresh_token)


@auth_router.post("/register-application")  #! May not needed
def register_application():
    return {"Hello": "World"}


# ======================================================== #
# ========================== 2FA ========================= #
# ======================================================== #


# ~~~~~~~~~~~~~~~~~~ TOTP ~~~~~~~~~~~~~~~~~ #
@auth_router.post("/add-2fa/", response_model=s_auth.UserResActivate2FA)
def user_add_2fa(
    req: s_auth.UserReqActivate2FA, access_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    return add_2fa(db, req, access_token)


@auth_router.delete("/remove-2fa/")
def user_remove_2fa(
    otp: s_auth.OTP, background_tasks: BackgroundTasks, access_token: str = Path(...), db: Session = Depends(get_db)
):
    return remove_2fa(db, background_tasks, access_token, otp)


@auth_router.post("/verify-first-2fa/", response_model=s_auth.UserResVerifyFirst2FA)
def user_verify_first_2fa(
    otp: s_auth.OTP,
    background_tasks: BackgroundTasks,
    access_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    return verify_first_2fa(db, background_tasks, access_token, otp.otp_code)


@auth_router.post("/verify-2fa/", response_model=s_auth.UserTokens)
def user_verify_2fa(otp: s_auth.OTP, security_token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    return verify_2fa(db, security_token, otp.otp_code)


@auth_router.post("/verify-2fa-backup/{user_uuid}")
def user_verify_2fa_backup(
    otp: s_auth.BackupOTP,
    security_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    return verify_2fa_backup(db, security_token, otp)
