from typing import Optional, Literal, Any
from pydantic import BaseModel, EmailStr


class TransactionCreate(BaseModel):
    final_price: Optional[float] = None
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    client_email: Optional[EmailStr] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    property_id: Optional[str]
    property_snapshot: dict[str, Any]
    transaction_type: Literal["sale", "rent"]
    final_price: Optional[float]
    client_name: Optional[str]
    client_phone: Optional[str]
    client_email: Optional[str]
    transaction_date: str
    created_by: Optional[str]
    created_at: str
    notes: Optional[str]