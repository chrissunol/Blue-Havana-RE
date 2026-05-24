from uuid import uuid4
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.data.supabase_client import supabase
from app.dependencies import get_current_user
from app.schemas.transactions import TransactionCreate

router = APIRouter(tags=["transactions"])


def get_property_or_404(property_id: str):
    res = supabase.table("properties").select("*").eq("id", property_id).limit(1).execute()

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    return res.data[0]


def create_transaction(
    property_id: str,
    transaction_type: str,
    payload: TransactionCreate,
    current_user: dict,
):
    property_data = get_property_or_404(property_id)

    transaction = {
        "id": str(uuid4()),
        "property_id": property_id,
        "property_snapshot": property_data,
        "transaction_type": transaction_type,
        "final_price": payload.final_price,
        "client_name": payload.client_name,
        "client_phone": payload.client_phone,
        "client_email": payload.client_email,
        "transaction_date": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"],
        "notes": payload.notes,
    }

    inserted = supabase.table("property_transactions").insert(transaction).execute()

    if not inserted.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transaction could not be created"
        )

    new_status = "sold" if transaction_type == "sale" else "rented"

    supabase.table("properties").update({
        "status": new_status,
        "is_published": False,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", property_id).execute()

    return inserted.data[0]


@router.post("/properties/{property_id}/mark-sold")
def mark_property_as_sold(
    property_id: str,
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_user),
):
    return create_transaction(property_id, "sale", payload, current_user)


@router.post("/properties/{property_id}/mark-rented")
def mark_property_as_rented(
    property_id: str,
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_user),
):
    return create_transaction(property_id, "rent", payload, current_user)


@router.get("/transactions")
def get_all_transactions(current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("property_transactions")
        .select("*")
        .order("transaction_date", desc=True)
        .execute()
    )
    return res.data


@router.get("/transactions/sales")
def get_sales_history(current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("property_transactions")
        .select("*")
        .eq("transaction_type", "sale")
        .order("transaction_date", desc=True)
        .execute()
    )
    return res.data


@router.get("/transactions/rents")
def get_rents_history(current_user: dict = Depends(get_current_user)):
    res = (
        supabase.table("property_transactions")
        .select("*")
        .eq("transaction_type", "rent")
        .order("transaction_date", desc=True)
        .execute()
    )
    return res.data


@router.get("/transactions/{transaction_id}")
def get_transaction_by_id(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
):
    res = (
        supabase.table("property_transactions")
        .select("*")
        .eq("id", transaction_id)
        .limit(1)
        .execute()
    )

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return res.data[0]