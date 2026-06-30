from typing import Literal

from pydantic import BaseModel, Field


class ModificationRequestCreate(BaseModel):
    field: Literal["full_name", "email", "username", "phone"]
    new_value: str = Field(min_length=1, max_length=200)


class ModificationRequestResponse(ModificationRequestCreate):
    id: str
    user_id: str
    status: Literal["pending", "approved", "denied"] = "pending"
    reviewed_by: str | None = None
    reviewed_at: str | None = None
    created_at: str | None = None
