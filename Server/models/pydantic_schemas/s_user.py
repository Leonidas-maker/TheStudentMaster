from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from .s_general import AddressCreate, CompleteAdress

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.general import only_one

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

    # * Need password authentication
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None

    # * No password authentication needed
    address: Optional[AddressCreate] = None
    avatar: Optional[bytes] = None

    def are_fields_correct_set(self) -> int:
        # Because the security fields are optional, but can be set with non-security fields,
        # we store the status of the security fields in a variable to avoid duplicate code
        any_security_fields = any([self.username, self.email, self.new_password])
        correct_security_fields = (
            only_one(self.username, self.email, self.new_password)
            and any_security_fields
            and self.old_password is not None
        )

        # ~~~~~~~~~~ Main checking logic ~~~~~~~~~~ #
        # Check if address or avatar is set
        if any([self.address is not None, self.avatar is not None]):
            # Check if any of the security fields are set if not return True --> no need for password authentication
            if not any_security_fields:
                return 1
            # If any of the security fields are set and check if they are correct
            elif correct_security_fields:
                return 3
            # If any of the security fields are set but they are not correct
            else:
                return 0
        # Check if any of the security fields are set correctly
        elif correct_security_fields and any_security_fields:
            return 2
        # No fields are set
        else:
            return 0

        # ~~~~~~~~~~ Return values ~~~~~~~~~~ #
        # 0: No attributes to update
        # 1: Only non-security fields are set
        # 2: Only security fields are set and a password check is needed
        # 3: Both security and non-security fields are set and a password check is needed


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
