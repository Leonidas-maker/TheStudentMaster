from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import pyotp
import uuid

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_auth, m_user
from models.pydantic_schemas import s_auth, s_user

# ~~~~~~~~~~~~~~ Controllers ~~~~~~~~~~~~~~ #
from controllers.user import create_user

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.user import get_user, get_user_security
from middleware.auth import (
    verify_refresh_token,
    create_tokens,
    get_token_payload,
    get_user_security,
    check_password,
    verify_simple_otp,
    check_security_warns,
    create_totp,
    verify_totp,
    create_simple_otp,
    verify_access_token,
    create_backup_codes,
    verify_security_token,
    create_security_token,
    remove_older_security_token,
    revoke_token,
    raise_security_warns,
    check_access_token,
    register_application,
    change_password,
)

# ~~~~~~~~~~~~~~~~~~ Util ~~~~~~~~~~~~~~~~~ #
from utils.email.email import async_send_mail_with_template, send_mail_with_template, EmailSchema


# Function to refresh tokens using a refresh token
def refresh_tokens(db: Session, refresh_token: str):
    payload = verify_refresh_token(db, refresh_token)
    if payload and payload.get("jti"):
        user_uuid = uuid.UUID(payload["sub"])
        user_security = get_user_security(db, user_uuid=user_uuid, with_tokens=True)
        refresh_token, access_token = create_tokens(
            db, user_security, str(user_uuid), uuid.UUID(payload.get("jti")), payload["aud"]
        )
        db.commit()
        return {"refresh_token": refresh_token, "access_token": access_token}
    raise HTTPException(status_code=401, detail="Unauthorized")


# Function to register a new user
def register(
    db: Session,
    background_tasks: BackgroundTasks,
    user: s_user.UserCreate,
):
    db_user = get_user(db, email=user.email, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user, user_uuid, user_security = create_user(db, user)

    verify_code = create_simple_otp(db, user_security)
    send_mail_with_template(
        background_tasks,
        EmailSchema(
            email=user.email,
            body={"verify_code": str(verify_code)},
            type="verify-first",
        ),
    )
    response = s_auth.UserResRegister(**user.__dict__, user_uuid=user_uuid)
    db.commit()
    return response


# Function to log in a user
def login(
    db: Session,
    ident: str,
    password: str,
    new_application: s_auth.Application = None,
):
    # Determine if the identifier is an email or username
    if "@" in ident:
        user = get_user(db, email=ident, with_uuid=True, with_user_security=True, with_2fa=True, with_tokens=True)
    else:
        user = get_user(db, username=ident, with_uuid=True, with_user_security=True, with_2fa=True, with_tokens=True)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = user.user_id
    user_uuid = str(user.user_uuid.user_uuid)
    user_security: m_auth.UserSecurity = user.user_security

    # Check if the user's account is verified
    if not user_security.verified:
        raise HTTPException(status_code=401, detail="Account not verified")
    check_security_warns(db, user_security)

    # Verify the user's password
    if not check_password(db, password, user_security=user_security):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Handle 2FA if enabled
    if user_security._2fa_enabled:
        remove_older_security_token(db, user_security, "login-2fa")
        secret_token = create_security_token(
            db,
            user_id,
            user_uuid,
            f"login-2fa::{new_application.application_id}" if new_application else "login-2fa",
        )

        db.commit()
        return {
            "secret_token": secret_token,
        }

    # Register a new application if provided
    if new_application:
        application_uuid = register_application(db, user_security, new_application)
    else:
        application_uuid = None

    refresh_token, access_token = create_tokens(db, user_security, user_uuid, None, application_uuid)
    db.commit()
    return {"refresh_token": refresh_token, "access_token": access_token}


# Function to log out a user
def logout(db: Session, refresh_token: str, access_token: str):
    refresh_payload = verify_refresh_token(db, refresh_token)
    access_payload = get_token_payload(access_token)
    if refresh_payload and refresh_payload.get("jti"):
        delete_tokens = [uuid.UUID(refresh_payload["jti"]), uuid.UUID(access_payload["jti"])]

        db.query(m_auth.UserTokens).filter(m_auth.UserTokens.token_jti.in_(delete_tokens)).delete(
            synchronize_session=False
        )
        db.commit()
        return {"message": "Logout successful"}
    else:
        raise HTTPException(status_code=403, detail="Forbidden")


# Function to verify a user's account
def verify_account(db: Session, user_uuid: str, verify_code: str):
    user_security = get_user_security(db, user_uuid=user_uuid)
    if not user_security.verified and verify_simple_otp(user_security, verify_code):
        user_security.verified = True
        user_security.verify_otp = None
        db.commit()
        return {"message": "Account verified"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials or account already verified")


###########################################################################
################################### 2FA ###################################
###########################################################################


# Function to add 2FA to a user's account
def add_2fa(db: Session, user_add_2fa_req: s_auth.UserReqActivate2FA, access_token: str) -> s_auth.UserResActivate2FA:
    access_payload = verify_access_token(db, access_token)
    if access_payload:
        user_security = get_user_security(db, user_uuid=access_payload["sub"], with_user=True)

        if user_security._2fa_enabled:
            raise HTTPException(status_code=400, detail="2FA already enabled")

        user_id = user_security.user_id
        if not check_password(db, user_add_2fa_req.password, user_security=user_security):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        _2fa_secret = create_totp(db, user_id)
        db.commit()
        if user_add_2fa_req.need_qr_code:
            user = get_user(db, user_id=user_id)
            return s_auth.UserResActivate2FA(
                provisioning_uri=pyotp.totp.TOTP(_2fa_secret).provisioning_uri(
                    name=user.email, issuer_name="TheStudentMaster.com"
                ),
                secret_2fa=_2fa_secret,
            )
        else:
            return s_auth.UserResActivate2FA(secret_2fa=_2fa_secret)
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


# Function to verify the first 2FA setup
def verify_first_2fa(db: Session, background_tasks: BackgroundTasks, access_token: str, otp: str):
    user = check_access_token(db, access_token, with_uuid=True)
    if user:
        user_uuid = user.user_uuid.user_uuid
        if verify_totp(db, otp, user_uuid=user_uuid):
            backup_codes = create_backup_codes(db, user_uuid)
            response = s_auth.UserResVerifyFirst2FA(backup_codes=backup_codes)
            db.commit()
            send_mail_with_template(
                background_tasks,
                EmailSchema(
                    email=user.email,
                    body={"username": user.username, "user_uuid": user_uuid},
                    type="activate-2fa",
                ),
            )
            return response
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


# Function to verify 2FA during login
def verify_2fa(db: Session, secret_token: str, otp: str, new_application: s_auth.Application = None):
    secret_payload, user_security = verify_security_token(db, secret_token, is_2fa=True)
    if secret_payload:
        user_uuid = secret_payload["sub"]
        if verify_totp(db, otp, user_2fa=user_security.user_2fa):
            if new_application:
                application_uuid = register_application(db, user_security, new_application)
            else:
                application_uuid = None

            revoke_token(db, user_security.user_id, "Security", secret_payload["aud"], uuid.UUID(secret_payload["jti"]))

            refresh_token, access_token = create_tokens(
                db, user_security, user_uuid, secret_payload["jti"], application_uuid
            )
            db.commit()
            return {"refresh_token": refresh_token, "access_token": access_token}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials | Type: 2FA")
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


# Function to verify 2FA backup codes
def verify_2fa_backup(db: Session, background_tasks: BackgroundTasks, secret_token: str, otp: s_auth.BackupOTP):
    secret_payload, user_security = verify_security_token(db, secret_token, is_2fa=True)
    if secret_payload:
        user_uuid = secret_payload["sub"]
        user_2fa: m_auth.User2FA = user_security.user_2fa
        user_2fa_backup_codes = user_2fa.backup_codes.split(";")
        count_correct = 0
        for backup_code in user_2fa_backup_codes:
            if not backup_code in otp.backup_codes:
                raise_security_warns(db, user_security, "2FA Backup Codes")
            else:
                count_correct += 1

        if count_correct == (len(user_2fa_backup_codes) // 2):
            revoke_token(db, user_security.user_id, "Security", secret_payload["aud"], secret_payload["jti"])

            # * Duplicate code from remove_2fa but okay for now
            # ~~~~~~~~~~~~~~~ Remove 2FA ~~~~~~~~~~~~~~ #
            db.delete(user_security.user_2fa)
            user_security._2fa_enabled = False

            # TODO Await email response
            send_mail_with_template(
                background_tasks,
                EmailSchema(
                    email=user_security.user.email,
                    body={"username": user_security.user.username, "user_uuid": user_uuid},
                    type="deactivate-2fa",
                ),
            )

            aud_split = secret_payload["aud"].split("::")
            application_id = aud_split[1] if len(aud_split) > 1 else None

            refresh_token, access_token = create_tokens(
                db, user_security, user_uuid, secret_payload["jti"], application_id
            )
            db.commit()
            return {"refresh_token": refresh_token, "access_token": access_token, "message": "2FA removed"}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials | Type: 2FA")
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


# Function to remove 2FA from a user's account
def remove_2fa(db: Session, background_tasks: BackgroundTasks, access_token: str, otp: str):
    access_payload = verify_access_token(db, access_token)
    if access_payload:
        user_uuid = access_payload["sub"]
        user_security = get_user_security(db, user_uuid=user_uuid, with_user=True, with_2fa=True)
        if not user_security._2fa_enabled:
            raise HTTPException(status_code=400, detail="2FA not enabled")
        if verify_totp(db, otp, user_2fa=user_security.user_2fa):
            # * Duplicate code from remove_2fa but okay for now
            # ~~~~~~~~~~~~~~~ Remove 2FA ~~~~~~~~~~~~~~ #
            db.delete(user_security.user_2fa)
            user_security._2fa_enabled = False
            db.commit()

            # TODO Await email response
            send_mail_with_template(
                background_tasks,
                EmailSchema(
                    email=user_security.user.email,
                    body={"username": user_security.user.username, "user_uuid": user_uuid},
                    type="deactivate-2fa",
                ),
            )
            return {"message": "2FA removed"}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials | Type: 2FA")
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


###########################################################################
############################# Forgot password #############################
###########################################################################


# Function to handle forgot password requests
# TODO Optimize the two db queries to only one
def forgot_password(db: Session, background_tasks: BackgroundTasks, email: str):
    user = get_user(db, email=email, with_uuid=True)
    if user:
        user_security = get_user_security(db, user_id=user.user_id)

        if user_security.verified and not user_security.locked and not user_security.verify_otp:
            # Create new verify code for password reset
            verify_code = create_simple_otp(db, user_security)
            db.commit()

            send_mail_with_template(
                background_tasks,
                EmailSchema(
                    email=user.email,
                    body={"verify_code": str(verify_code), "username": user.username},
                    type="forgot-password",
                ),
            )
            return {
                "message": "Email sent",
                "user_uuid": str(user.user_uuid.user_uuid),
            }  # TODO: Maybe remove user_uuid --> Security risk?
    raise HTTPException(status_code=401, detail="Invalid credentials")


# Function to reset a user's password
def reset_password(db: Session, background_tasks: BackgroundTasks, user_uuid: str, verify_code: str, new_password: str):
    user_security = get_user_security(db, user_uuid=user_uuid)

    # Check if the otp is correct and reset the password
    if user_security and verify_simple_otp(user_security, verify_code):
        user_security.verify_otp = None
        change_password(db, user_security, new_password)
        db.commit()
        return {"message": "Password reset successfully"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")