from datetime import date, datetime
from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field


class TransactionCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    final_price: float | None = Field(
        default=None,
        gt=0,
        validation_alias=AliasChoices("final_price", "finalAmount"),
    )
    client_name: str | None = Field(
        default=None,
        max_length=120,
        validation_alias=AliasChoices("client_name", "clientName"),
    )
    client_phone: str | None = Field(
        default=None,
        max_length=40,
        validation_alias=AliasChoices("client_phone", "clientPhone"),
    )
    client_email: EmailStr | None = Field(
        default=None,
        validation_alias=AliasChoices("client_email", "clientEmail"),
    )
    closed_at: datetime | date | None = Field(
        default=None,
        validation_alias=AliasChoices("closed_at", "closedAt"),
    )
    notes: str | None = Field(default=None, max_length=600)


class TransactionCancel(BaseModel):
    reason: str | None = Field(default=None, max_length=600)


class TransactionResponse(BaseModel):
    id: str
    propertyId: str | None = None
    propertyTitle: str = ""
    propertySnapshot: dict[str, Any] = Field(default_factory=dict)
    transactionType: Literal["sale", "rent"]
    status: Literal["active", "cancelled"] = "active"
    finalAmount: float | None = None
    clientName: str | None = None
    clientPhone: str | None = None
    clientEmail: str | None = None
    closedAt: str
    notes: str | None = None
    createdBy: str | None = None
    createdById: str | None = None
    createdAt: str
    cancelledAt: str | None = None
    cancelledBy: str | None = None
    cancelledById: str | None = None
    cancellationReason: str | None = None
