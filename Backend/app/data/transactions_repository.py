from __future__ import annotations

from datetime import date, datetime, time, timezone

from app.data.supabase_client import response_data, response_single, supabase


def _iso_datetime(value: datetime | date | None) -> str:
    if value is None:
        return datetime.now(timezone.utc).isoformat()
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    return datetime.combine(value, time.min, tzinfo=timezone.utc).isoformat()


def _title_from_snapshot(snapshot: dict | None) -> str:
    snapshot = snapshot or {}
    title = snapshot.get("title") or ""
    if isinstance(title, dict):
        return title.get("es") or title.get("en") or title.get("fr") or ""
    return str(title)


def _user_names(user_ids: set[str]) -> dict[str, str]:
    if not user_ids:
        return {}
    rows = response_data(
        supabase.table("users")
        .select("id,full_name")
        .in_("id", list(user_ids))
        .execute()
    )
    return {str(row["id"]): row.get("full_name") or str(row["id"]) for row in rows}


def transaction_to_frontend(
    transaction: dict | None, names: dict[str, str] | None = None
) -> dict | None:
    if not transaction:
        return None
    creator_id = transaction.get("created_by")
    cancelled_by_id = transaction.get("cancelled_by")
    user_names = names or {}
    snapshot = transaction.get("property_snapshot") or {}
    closed_at = (
        transaction.get("closed_at")
        or transaction.get("transaction_date")
        or transaction.get("created_at")
    )
    return {
        "id": transaction.get("id"),
        "propertyId": transaction.get("property_id"),
        "propertyTitle": _title_from_snapshot(snapshot),
        "propertySnapshot": snapshot,
        "transactionType": transaction.get("transaction_type"),
        "status": transaction.get("status", "active"),
        "finalAmount": float(transaction["final_price"])
        if transaction.get("final_price") is not None
        else None,
        "clientName": transaction.get("client_name"),
        "clientPhone": transaction.get("client_phone"),
        "clientEmail": transaction.get("client_email"),
        "closedAt": str(closed_at),
        "notes": transaction.get("notes"),
        "createdBy": user_names.get(str(creator_id), str(creator_id))
        if creator_id
        else None,
        "createdById": creator_id,
        "createdAt": str(transaction.get("created_at")),
        "cancelledAt": str(transaction.get("cancelled_at"))
        if transaction.get("cancelled_at")
        else None,
        "cancelledBy": user_names.get(str(cancelled_by_id), str(cancelled_by_id))
        if cancelled_by_id
        else None,
        "cancelledById": cancelled_by_id,
        "cancellationReason": transaction.get("cancellation_reason"),
    }


def create_transaction(
    property_id: str, transaction_type: str, payload, user_id: str
) -> dict:
    rpc_payload = {
        "p_property_id": property_id,
        "p_transaction_type": transaction_type,
        "p_final_price": payload.final_price,
        "p_client_name": payload.client_name,
        "p_client_phone": payload.client_phone,
        "p_client_email": str(payload.client_email) if payload.client_email else None,
        "p_closed_at": _iso_datetime(payload.closed_at),
        "p_created_by": user_id,
        "p_notes": payload.notes,
    }
    result = supabase.rpc("complete_property_transaction", rpc_payload).execute()
    transaction = response_single(result)
    names = _user_names({user_id})
    return transaction_to_frontend(transaction, names) or {}


def list_transactions(
    transaction_type: str | None = None, status: str | None = None
) -> list[dict]:
    query = supabase.table("property_transactions").select("*")
    if transaction_type:
        query = query.eq("transaction_type", transaction_type)
    if status:
        query = query.eq("status", status)
    rows = response_data(
        query.order("closed_at", desc=True)
        .order("transaction_date", desc=True)
        .execute()
    )
    ids = {
        str(user_id)
        for row in rows
        for user_id in (row.get("created_by"), row.get("cancelled_by"))
        if user_id
    }
    names = _user_names(ids)
    return [
        item for item in (transaction_to_frontend(row, names) for row in rows) if item
    ]


def get_transaction(transaction_id: str) -> dict | None:
    row = response_single(
        supabase.table("property_transactions")
        .select("*")
        .eq("id", transaction_id)
        .limit(1)
        .execute()
    )
    if not row:
        return None
    ids = {
        str(value)
        for value in (row.get("created_by"), row.get("cancelled_by"))
        if value
    }
    return transaction_to_frontend(row, _user_names(ids))


def cancel_transaction(
    transaction_id: str, user_id: str, reason: str | None = None
) -> dict | None:
    existing = get_transaction(transaction_id)
    if not existing:
        return None
    result = supabase.rpc(
        "cancel_property_transaction",
        {
            "p_transaction_id": transaction_id,
            "p_cancelled_by": user_id,
            "p_reason": reason,
        },
    ).execute()
    row = response_single(result)
    ids = {user_id}
    if row and row.get("created_by"):
        ids.add(str(row["created_by"]))
    return transaction_to_frontend(row, _user_names(ids))


def restore_property_availability(
    property_id: str, user_id: str, reason: str | None = None
) -> dict | None:
    row = response_single(
        supabase.table("property_transactions")
        .select("id")
        .eq("property_id", property_id)
        .eq("status", "active")
        .order("closed_at", desc=True)
        .limit(1)
        .execute()
    )
    if not row:
        return None
    return cancel_transaction(row["id"], user_id, reason)
