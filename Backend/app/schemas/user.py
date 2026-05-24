from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    id: str | None = Field(default=None, min_length=1, max_length=50)
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=1, max_length=80)
    phone: str | None = Field(default='', max_length=30)
    password: str = Field(min_length=8)
    role: Literal["admin", "superadmin"] = "admin"
    is_active: bool = True


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    username: str | None = Field(default=None, max_length=80)
    phone: str | None = Field(default=None, max_length=30)
    role: Literal["admin", "superadmin"] | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    username: str | None = None
    phone: str | None = ''
    role: Literal["admin", "superadmin"]
    is_active: bool
