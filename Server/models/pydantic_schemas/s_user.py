from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from .s_general import AddressCreate, CompleteAdress

###########################################################################
############################# Pydantic models #############################
###########################################################################


# ======================================================== #
# ===================== UserSecurity ===================== #
# ======================================================== #


class User2FA(BaseModel):
    _2fa_id: Optional[int]
    user_id: int
    _2fa_secret: str
    _2fa_last_used: Optional[int]
    _2fa_backup: str

    class Config:
        from_attributes = True


class UserTokens(BaseModel):
    token_id: Optional[int]
    user_id: int
    token_type: str
    token_jti: str
    token_value: str
    creation_time: int
    expiration_time: int

    class Config:
        from_attributes = True


class UserSecurityBase(BaseModel):
    password: str


class UserSecurityCeate(UserSecurityBase):
    pass


class UserSecurity(UserSecurityBase):
    user_id: int
    forgot_password: Optional[str]
    security_warns: Optional[int]
    locked: Optional[bool]
    verify_otp: Optional[str]
    verified: Optional[bool]
    _2fa_enabled: Optional[bool]
    last_modified: Optional[datetime]

    user_2fa: Optional[User2FA] = None

    class Config:
        from_attributes = True


# ======================================================== #
# ========================= User ========================= #
# ======================================================== #
class UserUUID(BaseModel):
    user_id: int
    user_uuid: UUID4


class UserBase(BaseModel):
    username: str
    email: EmailStr
    

class UserCreate(UserBase):
    security: UserSecurityCeate
    address: Optional[AddressCreate] = None

class UserUpdate(UserBase):
    
    #* Need password authentication
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None

    #* No password authentication needed
    address: Optional[AddressCreate] = None 
    avatar: Optional[bytes] = None

class User(UserBase):
    user_id: int
    avatar: Optional[bytes] = None
    address_id: Optional[int] = None
    last_modified: datetime
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #


class ResGetUser(UserBase):
    user_uuid: UUID4

    avatar: Optional[bytes] = None
    address: Optional[CompleteAdress] = None

    class Config:
        from_attributes = True
