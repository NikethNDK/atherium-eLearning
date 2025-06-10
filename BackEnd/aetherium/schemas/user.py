from pydantic import BaseModel,EmailStr,Field,field_validator
from pydantic import StringConstraints
from typing import Optional,Annotated

NonEmptyStr = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    firstname:str
    lastname:str
    password: str
    role_id:int
    title:Optional[str]=None
    designation:Optional[str]=None
    phone_number:Optional[int]=None

class UserUpdate(BaseModel):
    firstname: Optional[NonEmptyStr] = None
    lastname: Optional[NonEmptyStr] = None
    title: Optional[NonEmptyStr] = None
    designation: Optional[NonEmptyStr] = None
    phone_number:Optional[int]=None

    @field_validator('*')
    def reject_empty_strings(cls, v):
        if v == "":  # Explicitly check for empty string
            raise ValueError("Field cannot be empty")
        return v
class RoleResponse(BaseModel):
    id: int
    name: str

    model_config = {
    "from_attributes": True
    }
    # class Config:
    #     orm_mode = True

class UserResponse(UserBase):
    firstname: Optional[str] = None 
    lastname: Optional[str] = None
    lastname:str
    id:int 
    role:RoleResponse
    is_active:bool
    is_emailverified:bool
    title:Optional[str]
    designation:Optional[str]
    phone_number:Optional[int]

    model_config = {
    "from_attributes": True
    }
    # class Config:
    #     from_attributes=True

class Token(BaseModel):
    access_token:str
    token_type:str

class OTPVerify(BaseModel):
    email:EmailStr
    otp:str

class OTPSend(BaseModel):
    email: EmailStr
