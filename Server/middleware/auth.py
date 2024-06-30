from fastapi import HTTPException
from typing import List, Tuple
from sqlalchemy.orm import Session
from cryptography.hazmat.primitives.serialization import (
    load_pem_private_key,
    load_pem_public_key,
)
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

import pyotp
import secrets
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
import uuid

from pathlib import Path

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.security import *

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_auth

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_user, s_auth

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.user import get_user_security, get_user_2fa, get_user


###########################################################################
############################## Security Warns #############################
###########################################################################

# Raise security warnings and potentially lock the account
def raise_security_warns(db: Session, user_security: m_auth.UserSecurity, error: str) -> None:
    security_warns = user_security.security_warns + 1
    if security_warns >= MAX_WARNS:
        if user_security.locked_until:
            user_security.locked_until = None
            user_security.locked = True
        else:
            user_security.security_warns = security_warns
            user_security.locked = True
            user_security.locked_until = unix_timestamp(hours=2)
            db.commit()
            raise HTTPException(
                status_code=403,
                detail=f"{error}! Account is now locked for 2 hours",
            )

    user_security.security_warns = security_warns
    db.commit()
    raise HTTPException(
        status_code=403,
        detail=f"{error}! Warns:{security_warns}/{MAX_WARNS} until Account is locked",
    )

# Check if an account is locked and handle unlocking if necessary
def check_security_warns(db: Session, user_security: m_auth.UserSecurity) -> None:
    if user_security.locked_until:
        if user_security.locked and user_security.locked_until > unix_timestamp():
            raise HTTPException(status_code=403, detail="Account locked please try again later")
        elif user_security.locked and user_security.locked_until < unix_timestamp():
            user_security.locked = False
            user_security.security_warns = 0
        elif user_security.locked_until + (2 * 24 * 60 * 60) < unix_timestamp(days=2):
            user_security.locked_until = None
        db.update(user_security)
        db.flush()
    elif user_security.locked:
        raise HTTPException(status_code=403, detail="Account might be permanently locked. Please contact support")


###########################################################################
################################## Helper #################################
###########################################################################

# Helper function to get the current Unix timestamp with optional time adjustments
def unix_timestamp(
    days: int = 0,
    seconds: int = 0,
    microseconds: int = 0,
    milliseconds: int = 0,
    minutes: int = 0,
    hours: int = 0,
    weeks: int = 0,
) -> int:
    out = datetime.now(tz=timezone.utc) + timedelta(
        days,
        seconds,
        microseconds,
        milliseconds,
        minutes,
        hours,
        weeks,
    )
    return int(out.timestamp())


###########################################################################
################################## TOKENS #################################
###########################################################################

# ======================================================== #
# ======================= Gen Keys ======================= #
# ======================================================== #

# Function to generate ECDSA keys
def generate_ecdsa_keys(curve: ec.EllipticCurve):
    # Generate the private key
    private_key = ec.generate_private_key(curve)

    # Get the public key from the private key
    public_key = private_key.public_key()

    # Convert the keys to PEM format
    pem_private_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pem_public_key = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    return pem_private_key, pem_public_key


# ======================================================== #
# ================== Key File Operations ================= #
# ======================================================== #

# Function to save a key to a file
def save_key(key: bytes, file_name: str, folder_path: Path):
    with (folder_path / file_name).open("wb") as key_file:
        key_file.write(key)

# Function to load a key from a file
def load_key(
    file_name: str,
    key_password: bytes = None,
    folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys",
):
    if "private" in file_name:
        with (folder_path / file_name).open("rb") as key_file:
            key = load_pem_private_key(key_file.read(), password=key_password, backend=default_backend())
    elif "public" in file_name:
        with (folder_path / file_name).open("rb") as key_file:
            key = load_pem_public_key(key_file.read(), backend=default_backend())
    else:
        raise ValueError("Invalid file_name")
    return key

# Function to generate keys and save them to files
def generate_keys(folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys"):
    access_private_key, access_public_key = generate_ecdsa_keys(ec.SECP256R1())
    refresh_private_key, refresh_public_key = generate_ecdsa_keys(ec.SECP521R1())
    save_key(access_private_key, "access_private_key.pem", folder_path)
    save_key(access_public_key, "access_public_key.pem", folder_path)
    save_key(refresh_private_key, "refresh_private_key.pem", folder_path)
    save_key(refresh_public_key, "refresh_public_key.pem", folder_path)


# ======================================================== #
# ======================= Get Keys ======================= #
# ======================================================== #

# Get the private keys for tokens, generate if not exist
def get_tokens_private(
    folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys",
) -> Tuple[ec.EllipticCurvePrivateKey, ec.EllipticCurvePrivateKey]:
    if not (folder_path / "refresh_private_key.pem").exists() and not (folder_path / "access_private_key.pem").exists():
        generate_keys()

    # Get the refresh private key
    refresh_private_key = load_key("refresh_private_key.pem")

    # Get the access private key
    access_private_key = load_key("access_private_key.pem")

    return refresh_private_key, access_private_key

# Get the private key for security tokens, generate if not exist
def get_security_token_private(
    folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys",
) -> ec.EllipticCurvePrivateKey:
    if not (folder_path / "security_private_key.pem").exists():
        security_private_key, security_public_key = generate_ecdsa_keys(ec.SECP256R1())
        save_key(security_private_key, "security_private_key.pem", folder_path)
        save_key(security_public_key, "security_public_key.pem", folder_path)
    security_private_key = load_key("security_private_key.pem")
    return security_private_key

# Get the public key for refresh tokens, generate if not exist
def get_refresh_token_public(
    folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys",
) -> ec.EllipticCurvePublicKey:
    folder_path = Path(folder_path)
    if not (folder_path / "refresh_public_key.pem").exists():
        generate_keys()

    # Get the refresh public key
    public_key = load_key("refresh_public_key.pem")

    return public_key

# Get the public key for access tokens, generate if not exist
def get_access_token_public(
    folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys",
) -> ec.EllipticCurvePublicKey:
    folder_path = Path(folder_path)
    if not (folder_path / "access_public_key.pem").exists():
        generate_keys()

    # Get the access public key
    public_key = load_key("access_public_key.pem")

    return public_key

# Get the public key for security tokens, generate if not exist
def get_security_token_public(
    folder_path: Path = Path(__file__).parent.absolute() / "jwt_keys",
) -> ec.EllipticCurvePublicKey:
    folder_path = Path(folder_path)
    if not (folder_path / "security_public_key.pem").exists():
        generate_keys()

    # Get the access public key
    public_key = load_key("security_public_key.pem")

    return public_key


# ======================================================== #
# ======================== Verify ======================== #
# ======================================================== #

# Function to check the JTI of a token
def check_jti(
    db: Session,
    jti: uuid.UUID,
    check_value: str,
    user_id: str = None,
    user_uuid: str = None,
    user_security: m_auth.UserSecurity = None,
) -> bool:
    try:
        application_id = uuid.UUID(check_value)
        token_value = None
    except:
        application_id = None
        token_value = check_value

    token_exists = False

    # Check if the token exists for the given user ID
    if user_id:
        if application_id:
            token_exists = (
                db.query(m_auth.UserTokens)
                .join(
                    m_auth.UserRegisteredApplications,
                    m_auth.UserRegisteredApplications.app_id == m_auth.UserTokens.app_id,
                )
                .filter(
                    m_auth.UserTokens.user_id == user_id,
                    m_auth.UserTokens.token_jti == jti,
                    m_auth.UserRegisteredApplications.app_id == application_id,
                )
                .first()
            ) is not None
        else:
            token_exists = (
                db.query(m_auth.UserTokens)
                .filter(
                    m_auth.UserTokens.user_id == user_id,
                    m_auth.UserTokens.token_jti == jti,
                    m_auth.UserTokens.token_value == token_value,
                )
                .first()
                is not None
            )

    # Check if the token exists for the given user UUID
    elif user_uuid:
        user_uuid = uuid.UUID(user_uuid)
        if application_id:
            token_exists = (
                db.query(m_auth.UserTokens)
                .join(m_user.UserUUID, m_user.UserUUID.user_id == m_auth.UserTokens.user_id)
                .join(
                    m_auth.UserRegisteredApplications,
                    m_auth.UserRegisteredApplications.app_id == m_auth.UserTokens.app_id,
                )
                .filter(
                    m_user.UserUUID.user_uuid == user_uuid,
                    m_auth.UserTokens.token_jti == jti,
                    m_auth.UserRegisteredApplications.app_id == application_id,
                )
                .first()
            ) is not None
        else:
            token_exists = (
                db.query(m_auth.UserTokens)
                .join(m_user.UserUUID, m_user.UserUUID.user_uuid == user_uuid)
                .filter(m_auth.UserTokens.token_jti == jti, m_auth.UserTokens.token_value == token_value)
                .first()
                is not None
            )

    # Check if the token exists for the given user security
    elif user_security:
        tokens: List[m_auth.UserTokens] = user_security.user_tokens

        if application_id:
            for token in tokens:
                if token.token_jti == jti and token.app_id == application_id:
                    token_exists = True
                    break
        else:
            for token in tokens:
                if token.token_jti == jti and token.token_value == token_value:
                    token_exists = True
                    break

    return token_exists


# Verify the refresh token
def verify_refresh_token(db: Session, token: str):
    public_key = get_refresh_token_public()
    try:
        options = {"verify_aud": False}  # TODO Change this to True
        payload = jwt.decode(token, public_key, algorithms="ES512", options=options)

        if not check_jti(
            db=db,
            jti=uuid.UUID(payload["jti"]),
            user_uuid=payload["sub"],
            check_value=payload["aud"],
        ):
            return False

        return payload
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False

# Verify the access token
def verify_access_token(db: Session, token: str):
    public_key = get_access_token_public()
    try:
        options = {"verify_aud": False}  # TODO Change this to True
        payload = jwt.decode(token, public_key, algorithms="ES256", options=options)

        # Check if the JTI is valid
        if not check_jti(
            db=db,
            jti=uuid.UUID(payload["jti"]),
            user_uuid=payload["sub"],
            check_value=payload["aud"],
        ):
            return False
        return payload
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False

# Verify the security token
def verify_security_token(db: Session, token: str, is_2fa: bool = False):
    public_key = get_security_token_public()
    try:
        reasons = ["login-2fa", "forgot-password"]  # TODO Update this
        payload = jwt.decode(token, public_key, algorithms="ES256", audience=reasons)

        user_security = get_user_security(db, user_uuid=payload["sub"], with_2fa=is_2fa)
        # Check if the JTI is valid
        if not check_jti(
            db=db,
            jti=uuid.UUID(payload["jti"]),
            user_security=user_security,
            check_value=payload["aud"],
        ):
            return False, None

        return payload, user_security
    except jwt.ExpiredSignatureError:
        return False, None
    except jwt.InvalidTokenError:
        return False, None

# Get the payload of a token without verifying the signature
def get_token_payload(token: str):
    payload = jwt.decode(token, options={"verify_signature": False})
    return payload


# ======================================================== #
# ===================== Check Tokens ===================== #
# ======================================================== #

# Check if the refresh token is valid and return the user
def check_refresh_token(db: Session, token: str) -> m_user.User:
    jwt_payload = verify_refresh_token(db, token)
    if jwt_payload:
        user = get_user(db, user_uuid=jwt_payload["sub"])
        if user:
            return user
        else:
            raise HTTPException(status_code=404, detail="User not found")
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")

# Check if the access token is valid and return the user
def check_access_token(
    db: Session, token: str, with_uuid: bool = False, with_address: bool = False, with_avatar: bool = False
) -> m_user.User:
    jwt_payload = verify_access_token(db, token)
    if jwt_payload:
        user = get_user(
            db, user_uuid=jwt_payload["sub"], with_uuid=with_uuid, with_address=with_address, with_avatar=with_avatar
        )
        if user:
            return user
        else:
            raise HTTPException(status_code=404, detail="User not found")
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ======================================================== #
# ==================== Tokens-Rotation =================== #
# ======================================================== #

# Create new tokens (refresh and access)
def create_tokens(
    db: Session,
    user_security: m_auth.UserSecurity,
    user_uuid: str,  # TODO Maybe use relationship between user_security and user_uuid
    old_jti: uuid.UUID = None,
    application_id: uuid.UUID = None,
) -> Tuple[str, str]:

    # Check if the application_id is a valid UUID
    if application_id:
        try:
            application_id = uuid.UUID(application_id)
        except:
            pass

    user_id = user_security.user_id

    # Check if the user is locked
    check_security_warns(db, user_security)

    current_timestamp = unix_timestamp()

    # Remove expired tokens
    _, temporary_tokens, active_access_tokens = remove_old_tokens(db, user_security, current_timestamp, old_jti)

    if len(active_access_tokens) >= MAX_ACTIVE_ACCESS_TOKENS:
        raise_security_warns(db, user_security, "Too many access tokens active")

    if len(temporary_tokens) >= MAX_WEB_REFRESH_TOKENS:
        raise HTTPException(status_code=403, detail="Too many active temporary instances")

    # Get the private keys and create the JTI
    refresh_private_key, access_private_key = get_tokens_private()
    refresh_jti = uuid.uuid4()
    access_jti = uuid.uuid4()

    # ~~~~~~~~ Create the refresh token ~~~~~~~ #

    if application_id and isinstance(application_id, uuid.UUID):
        token_exp = unix_timestamp(days=30)
        payload = {
            "iss": "https://api.theshopmaster.com",  #! Change this to the domain of the api
            "sub": str(user_uuid),
            "aud": str(application_id),
            "exp": token_exp,
            "nbf": current_timestamp,
            "iat": current_timestamp,
            "jti": str(refresh_jti),
        }

        # Add the JTI and application_id to the user_security
        new_refresh_token = m_auth.UserTokens(
            user_id=user_id,
            token_type="Application",
            token_jti=refresh_jti,
            app_id=application_id,
            creation_time=current_timestamp,
            expiration_time=token_exp,
        )
    else:
        token_exp = unix_timestamp(minutes=15)  #! More than 15 minutes?
        payload = {
            "iss": "https://api.theshopmaster.com",  #! Change this to the domain of the api
            "sub": user_uuid,
            "aud": "webapplication",
            "exp": token_exp,
            "nbf": current_timestamp,
            "iat": current_timestamp,
            "jti": str(refresh_jti),
        }
        new_refresh_token = m_auth.UserTokens(
            user_id=user_id,
            token_type="Temporary",
            token_jti=refresh_jti,
            token_value="webapplication",
            creation_time=current_timestamp,
            expiration_time=token_exp,
        )

    refresh_token = jwt.encode(payload, refresh_private_key, algorithm="ES512")
    db.add(new_refresh_token)
    db.flush()

    # ~~~~~~~~ Create the access token ~~~~~~~ #
    token_exp = unix_timestamp(minutes=8)
    payload = {
        "iss": "https://api.theshopmaster.com",  #! Change this to the domain of the api
        "sub": user_uuid,
        "aud": str(application_id) if application_id else "webapplication",
        "exp": token_exp,
        "nbf": current_timestamp,
        "iat": current_timestamp,
        "jti": str(access_jti),
    }

    if application_id and isinstance(application_id, uuid.UUID):
        new_access_token = m_auth.UserTokens(
            user_id=user_id,
            token_type="Access",
            token_jti=access_jti,
            app_id=application_id,
            creation_time=current_timestamp,
            expiration_time=token_exp,
        )
    else:
        new_access_token = m_auth.UserTokens(
            user_id=user_id,
            token_type="Access",
            token_jti=access_jti,
            token_value="webapplication",
            creation_time=current_timestamp,
            expiration_time=token_exp,
        )

    access_token = jwt.encode(payload, access_private_key, algorithm="ES256")
    db.add(new_access_token)
    db.flush()

    return refresh_token, access_token

# Create a security token
def create_security_token(
    db: Session,
    user_id: str,
    user_uuid: str,  # TODO Maybe use relationship between user_security and user_uuid
    reason: str,
) -> Tuple[str, str]:
    new_jti = uuid.uuid4()
    current_timestamp = unix_timestamp()
    token_exp = unix_timestamp(minutes=5)
    payload = {
        "iss": "https://api.theshopmaster.com",  #! Change this to the domain of the api
        "sub": user_uuid,
        "aud": reason,
        "exp": token_exp,
        "nbf": current_timestamp,
        "iat": current_timestamp,
        "jti": str(new_jti),
    }
    new_security_token = m_auth.UserTokens(
        user_id=user_id,
        token_type="Security",
        token_jti=new_jti,
        token_value=reason,
        creation_time=current_timestamp,
        expiration_time=token_exp,
    )
    security_private_key = get_security_token_private()
    security_token = jwt.encode(payload, security_private_key, algorithm="ES256")
    db.add(new_security_token)
    db.flush()

    return security_token


# ======================================================== #
# ==================== Tokens-Revocation ================= #
# ======================================================== #

# Revoke a single token
def revoke_token(db: Session, user_id: str, token_type: str, token_value: str, token_jti: uuid.UUID) -> bool:
    try:
        db.query(m_auth.UserTokens).filter(
            m_auth.UserTokens.user_id == user_id,
            m_auth.UserTokens.token_type == token_type,
            m_auth.UserTokens.token_value == token_value,
            m_auth.UserTokens.token_jti == token_jti,
        ).delete(synchronize_session=False)
        db.flush()
        return True
    except:
        return False

# Revoke all tokens of a specific type or value for a user
def revoke_all_tokens(db: Session, user_id: str, token_type: str = None, token_value: str = None):
    query = db.query(m_auth.UserTokens).filter(m_auth.UserTokens.user_id == user_id)

    if token_type:
        query = query.filter(m_auth.UserTokens.token_type == token_type)
    elif token_value:
        query = query.filter(m_auth.UserTokens.token_value == token_value)

    query.delete(synchronize_session=False)
    db.flush()

# Revoke all application tokens for a user
def revoke_all_application_tokens(db: Session, user: s_user.User):
    revoke_all_tokens(db, user.user_id, token_type="Application")

# Revoke all security tokens for a user
def revoke_all_security_tokens(db: Session, user_id: str):
    revoke_all_tokens(db, user_id, token_type="Security")

# Revoke all temporary tokens for a user
def revoke_all_temporary_tokens(db: Session, user_id: str):
    revoke_all_tokens(db, user_id, token_type="Temporary")

# Revoke all access tokens for a user
def revoke_all_access_tokens(db: Session, user_id: str):
    revoke_all_tokens(db, user_id, token_type="Access")


###########################################################################
################################### OTP ###################################
###########################################################################

# ======================================================== #
# ========================= TOTP ========================= #
# ======================================================== #

# Verify a TOTP (Time-based One-Time Password)
def verify_totp(db: Session, otp: str, user_uuid: str = None, user_2fa: m_auth.User2FA = None) -> bool:
    if user_uuid:
        user_2fa = get_user_2fa(db, user_uuid=user_uuid)
    if not user_2fa:
        return False

    totp_secret = user_2fa._2fa_secret
    totp = pyotp.TOTP(totp_secret)
    if user_2fa._2fa_last_used != otp and totp.verify(
        otp
    ):  # * short-circuit evaluation to prevent efficient timing attacks
        user_2fa._2fa_last_used = otp
        db.flush()
        return True
    else:
        return False

# Create a TOTP for a user
def create_totp(db: Session, user_id: str) -> str:
    if db.query(m_auth.User2FA).filter(m_auth.User2FA.user_id == user_id).first() is not None:
        raise HTTPException(status_code=400, detail="2FA-TOTP already in creation process")

    totp_secret = pyotp.random_base32()
    user_2fa = m_auth.User2FA(
        user_id=user_id,
        _2fa_secret=totp_secret,
        _2fa_backup=None,
    )
    db.add(user_2fa)
    db.flush()
    return totp_secret

# Create backup codes for a user
def create_backup_codes(db: Session, user_uuid: str) -> List[str]:
    user_security = get_user_security(db, user_uuid=user_uuid, with_2fa=True)
    if not user_security._2fa_enabled:
        user_2fa = user_security.user_2fa
        backup_codes = []
        for _ in range(6):
            tmp_number = secrets.randbelow(1000000)
            backup_codes.append(f"{tmp_number:06}")
        backup_codes_str = ";".join(backup_codes)
        print(user_2fa._2fa_id)
        user_2fa._2fa_backup = backup_codes_str
        user_security._2fa_enabled = True
        db.flush()
        return backup_codes
    else:
        raise HTTPException(status_code=400, detail="2FA already enabled")


# ======================================================== #
# ====================== Simple-OTP ====================== #
# ======================================================== #

# Verify a simple OTP
def verify_simple_otp(user_security: m_auth.UserSecurity, otp: str) -> bool:
    otp = otp.strip()
    verify_otp = user_security.verify_otp
    if verify_otp:
        verify_otp = verify_otp.split(":")
        if verify_otp[0] == otp and int(verify_otp[1]) > unix_timestamp():
            return True
        else:
            return False
    else:
        return False

# Create a simple OTP for a user
def create_simple_otp(db: Session, user_security: m_auth.UserSecurity, expire_time: int = 15) -> int:
    # Create the otp: XXXXXX
    otp = secrets.randbelow(1000000)
    # Add the expire time: XXXXXX:XXXXXX and save it to the user_security
    user_security.verify_otp = f"{otp}:{unix_timestamp(minutes=expire_time)}"
    db.flush()
    return otp


# ======================================================== #
# ======================= Password ======================= #
# ======================================================== #

# Check if a password is correct
def check_password(
    db: Session,
    password: str,
    user_id: str = None,
    user_security: m_auth.UserSecurity = None,
) -> bool:

    if not password:
        raise ValueError("No password provided")

    if user_id:
        user_security = get_user_security(db, user_id=user_id)
    elif not user_security:
        raise ValueError("No user_security provided")

    # Check if the password is correct
    if bcrypt.checkpw(password.encode("utf-8"), user_security.password.encode("utf-8")):
        return True
    else:
        return False

# Change a user's password
def change_password(db: Session, user_security: m_auth.UserSecurity, new_password: str):
    user_security.password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    db.flush()


# ======================================================== #
# ====================== Application ===================== #
# ======================================================== #

# Register a new application for a user
def register_application(db: Session, user_security: m_auth.UserSecurity, application: s_auth.Application) -> uuid.UUID:
    application_uuid = application.application_id

    new_application = (
        db.query(m_auth.UserRegisteredApplications)
        .filter(m_auth.UserRegisteredApplications.app_id == application_uuid)
        .first()
    )

    if new_application:
        raise HTTPException(status_code=400, detail="Application already registered")

    new_application = m_auth.UserRegisteredApplications(
        app_id=application_uuid,
        users_id=user_security.user_id,
        app_name=application.application_name,
        app_type=application.application_type,
        last_location=application.current_location,
    )

    db.add(new_application)
    db.flush()
    return application_uuid


###########################################################################
############################## Token Cleaners #############################
###########################################################################

# Remove old tokens from the database
def remove_old_tokens(
    db: Session,
    user_security: m_auth.UserSecurity,
    current_timestamp: int = unix_timestamp(),
    old_jti: uuid.UUID = None,
) -> tuple:
    # Get all tokens
    tokens: List[m_auth.UserTokens] = user_security.user_tokens

    # Split the tokens
    access_tokens = [token for token in tokens if token.token_type == "Access"]
    temporary_tokens = [token for token in tokens if token.token_type == "Temporary"]
    application_tokens = [token for token in tokens if token.token_type == "Application"]
    security_tokens = [token for token in tokens if token.token_type == "Security"]

    expired_tokens = []

    if application_tokens:
        # Remove expired application tokens
        for token in application_tokens:
            if token.expiration_time < current_timestamp or token.token_jti == old_jti:
                application_tokens.remove(token)
                expired_tokens.append(token.token_jti)
    else:
        application_tokens = []

    if temporary_tokens:
        # Remove expired temporary tokens
        for token in temporary_tokens:
            if token.expiration_time < current_timestamp or token.token_jti == old_jti:
                temporary_tokens.remove(token)
                expired_tokens.append(token.token_jti)
    else:
        temporary_tokens = []

    if access_tokens:
        # Remove expired active access tokens
        for token in access_tokens:
            if token.expiration_time < current_timestamp:
                access_tokens.remove(token)
                expired_tokens.append(token.token_jti)
    else:
        access_tokens = []

    if security_tokens:
        # Remove expired active security tokens
        for token in security_tokens:
            if token.expiration_time < current_timestamp:
                security_tokens.remove(token)
                expired_tokens.append(token.token_jti)

    # Remove expired tokens from the database
    if expired_tokens:
        db.query(m_auth.UserTokens).filter(
            m_auth.UserTokens.user_id == user_security.user_id,
            m_auth.UserTokens.token_jti.in_(expired_tokens),
        ).delete(synchronize_session=False)
        db.flush()
    return application_tokens, temporary_tokens, access_tokens

# Remove older security tokens if the limit is reached
def remove_older_security_token(db: Session, user_security: m_auth.UserSecurity, reason: str):
    security_tokens: List[m_auth.UserTokens] = user_security.user_tokens
    if len(security_tokens) >= MAX_SECURITY_TOKENS:
        security_tokens = security_tokens[: len(security_tokens) - MAX_SECURITY_TOKENS + 1]  # Remove the oldest token
        db.query(m_auth.UserTokens).filter(
            m_auth.UserTokens.user_id == user_security.user_id,
            m_auth.UserTokens.token_type == "Security",
            m_auth.UserTokens.token_value == reason,
            m_auth.UserTokens.token_jti.in_([token.token_jti for token in security_tokens]),
        ).delete(synchronize_session=False)
        db.flush()