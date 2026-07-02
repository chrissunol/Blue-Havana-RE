from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.data.supabase_client import response_data, response_single, supabase


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


def _to_frontend(
    review: dict | None,
    user_names: dict[str, str] | None = None,
    *,
    public: bool = False,
) -> dict | None:
    if not review:
        return None
    reviewer_id = review.get("reviewed_by")
    names = user_names or {}
    return {
        "id": review.get("id"),
        "name": review.get("name", ""),
        "email": None if public else review.get("email"),
        "rating": int(review.get("rating") or 0),
        "comment": review.get("comment", ""),
        "status": review.get("status", "pending"),
        "reviewedBy": names.get(str(reviewer_id), str(reviewer_id))
        if reviewer_id
        else None,
        "reviewedById": reviewer_id,
        "reviewedAt": str(review.get("reviewed_at"))
        if review.get("reviewed_at")
        else None,
        "createdAt": str(review.get("created_at")),
        "updatedAt": str(review.get("updated_at"))
        if review.get("updated_at")
        else None,
    }


def create_review(payload: dict) -> dict:
    data = {
        "id": str(uuid4()),
        "name": payload["name"].strip(),
        "email": str(payload["email"]).lower() if payload.get("email") else None,
        "rating": payload["rating"],
        "comment": payload["comment"].strip(),
        "status": "pending",
    }
    inserted = supabase.table("reviews").insert(data).execute()
    return _to_frontend(response_single(inserted)) or {}


def list_public_reviews(limit: int = 20) -> list[dict]:
    rows = response_data(
        supabase.table("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [item for item in (_to_frontend(row, public=True) for row in rows) if item]


def list_admin_reviews(status: str | None = None) -> list[dict]:
    query = supabase.table("reviews").select("*")
    if status:
        query = query.eq("status", status)
    rows = response_data(query.order("created_at", desc=True).execute())
    reviewer_ids = {str(row["reviewed_by"]) for row in rows if row.get("reviewed_by")}
    names = _user_names(reviewer_ids)
    return [item for item in (_to_frontend(row, names) for row in rows) if item]


def moderate_review(review_id: str, new_status: str, user_id: str) -> dict | None:
    data = {
        "status": new_status,
        "reviewed_by": user_id,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
    }
    updated = supabase.table("reviews").update(data).eq("id", review_id).execute()
    review = response_single(updated)
    if not review:
        return None
    names = _user_names({user_id})
    return _to_frontend(review, names)


def delete_review(review_id: str) -> bool:
    existing = response_single(
        supabase.table("reviews").select("id").eq("id", review_id).limit(1).execute()
    )
    if not existing:
        return False
    supabase.table("reviews").delete().eq("id", review_id).execute()
    return True
