from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class ReviewCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr | None = None
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=10, max_length=600)

    @field_validator("name", "comment")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El campo no puede estar vacío")
        return value


class ReviewResponse(BaseModel):
    id: str
    name: str
    email: str | None = None
    rating: int
    comment: str
    status: Literal["pending", "approved", "rejected"]
    reviewedBy: str | None = None
    reviewedById: str | None = None
    reviewedAt: str | None = None
    createdAt: str
    updatedAt: str | None = None
