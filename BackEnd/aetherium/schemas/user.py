from pydantic import BaseModel,EmailStr,Field
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id:int
    title:Optional[str]=None
    designation:Optional[str]=None

class UserUpdate(BaseModel):
    title:Optional[str]=None
    designation:Optional[str]=None


class UserResponse(UserBase):
    id:int
    role:str
    is_active:bool
    title:Optional[str]
    designation:Optional[str]

    class Config:
        from_attributes=True

class Token(BaseModel):
    access_token:str
    token_type:str