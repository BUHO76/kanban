from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None