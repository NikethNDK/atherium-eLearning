# from pydantic import BaseModel, EmailStr, Field, field_validator
# from pydantic import StringConstraints
# from typing import Optional, Annotated

# NonEmptyStr = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

# class UserBase(BaseModel):
#     email: EmailStr

# class UserCreate(UserBase):
#     firstname: str
#     lastname: str
#     password: str
#     role_id: int
#     title: Optional[str] = None
#     designation: Optional[str] = None
#     phone_number: Optional[int] = None
#     profile_picture: Optional[str]=None

# class UserUpdate(BaseModel):
#     firstname: Optional[NonEmptyStr] = None
#     lastname: Optional[NonEmptyStr] = None
#     title: Optional[NonEmptyStr] = None
#     designation: Optional[NonEmptyStr] = None
#     phone_number: Optional[int] = None
#     username: Optional[NonEmptyStr] = None
#     personal_website: Optional[str] = None
#     facebook: Optional[str] = None
#     instagram: Optional[str] = None
#     linkedin: Optional[str] = None
#     whatsapp: Optional[str] = None
#     youtube: Optional[str] = None
#     date_of_birth: Optional[str] = None
#     profile_picture:Optional[str]=None

#     @field_validator('firstname', 'lastname', 'username')
#     def reject_empty_strings(cls, v):
#         if v == "":
#             raise ValueError("Field cannot be empty")
#         return v

# class PasswordChange(BaseModel):
#     current_password: str
#     new_password: str
#     confirm_password: str

# class RoleResponse(BaseModel):
#     id: int
#     name: str

#     model_config = {
#         "from_attributes": True
#     }

# class UserResponse(UserBase):
#     firstname: Optional[str] = None 
#     lastname: Optional[str] = None
#     username: Optional[str] = None
#     id: int 
#     role: RoleResponse
#     is_active: bool
#     is_emailverified: bool
#     title: Optional[str]
#     designation: Optional[str]
#     phone_number: Optional[int]
#     personal_website: Optional[str] = None
#     facebook: Optional[str] = None
#     instagram: Optional[str] = None
#     linkedin: Optional[str] = None
#     whatsapp: Optional[str] = None
#     youtube: Optional[str] = None
#     date_of_birth: Optional[str] = None
#     profile_picture: Optional[str] = None

#     model_config = {
#         "from_attributes": True
#     }

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class OTPVerify(BaseModel):
#     email: EmailStr
#     otp: str

# class OTPSend(BaseModel):
#     email: EmailStr

from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic import StringConstraints
from typing import Optional, Annotated

NonEmptyStr = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    firstname: str
    lastname: str
    password: str
    role_id: int
    title: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[int] = None
    profile_picture: Optional[str]=None

class UserUpdate(BaseModel):
    firstname: Optional[NonEmptyStr] = None
    lastname: Optional[NonEmptyStr] = None
    title: Optional[NonEmptyStr] = None
    designation: Optional[NonEmptyStr] = None
    phone_number: Optional[int] = None
    username: Optional[NonEmptyStr] = None
    personal_website: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    whatsapp: Optional[str] = None
    youtube: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_picture:Optional[str]=None

    @field_validator('firstname', 'lastname', 'username')
    def reject_empty_strings(cls, v):
        if v == "":
            raise ValueError("Field cannot be empty")
        return v

class UserBlockRequest(BaseModel):
    block: bool

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class RoleResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class UserResponse(UserBase):
    firstname: Optional[str] = None 
    lastname: Optional[str] = None
    username: Optional[str] = None
    id: int 
    role: RoleResponse
    is_active: bool
    is_emailverified: bool
    title: Optional[str]
    designation: Optional[str]
    phone_number: Optional[int]
    personal_website: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    whatsapp: Optional[str] = None
    youtube: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_picture: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class OTPSend(BaseModel):
    email: EmailStr
