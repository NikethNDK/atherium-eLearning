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

class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class UserResponse(UserBase):
    id:int 
    role:RoleResponse
    is_active:bool
    title:Optional[str]
    designation:Optional[str]

    class Config:
        from_attributes=True

class Token(BaseModel):
    access_token:str
    token_type:str