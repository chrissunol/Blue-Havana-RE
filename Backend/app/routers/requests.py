from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.data.db import get_user_by_id, update_user
from app.data.supabase_client import response_data, response_single, supabase
from app.dependencies import get_current_admin, get_current_superadmin
from app.schemas.request import ModificationRequestCreate, ModificationRequestResponse

router = APIRouter(prefix="/requests", tags=["modification-requests"])


@router.post(
    "", response_model=ModificationRequestResponse, status_code=status.HTTP_201_CREATED
)
def create_modification_request(
    payload: ModificationRequestCreate,
    user: dict = Depends(get_current_admin),
) -> dict:
    request_data = {
        "id": str(uuid4()),
        "user_id": user["id"],
        "field": payload.field,
        "new_value": payload.new_value.strip(),
        "status": "pending",
    }
    inserted = supabase.table("modification_requests").insert(request_data).execute()
    return response_single(inserted) or request_data


@router.get("", response_model=list[ModificationRequestResponse])
def list_modification_requests(
    user: dict = Depends(get_current_superadmin),
) -> list[dict]:
    result = (
        supabase.table("modification_requests")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response_data(result)


def _get_pending_request(request_id: str) -> dict:
    request = response_single(
        supabase.table("modification_requests")
        .select("*")
        .eq("id", request_id)
        .eq("status", "pending")
        .limit(1)
        .execute()
    )
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada o ya procesada",
        )
    return request


@router.patch("/{request_id}/approve", response_model=ModificationRequestResponse)
def approve_request(
    request_id: str, user: dict = Depends(get_current_superadmin)
) -> dict:
    request = _get_pending_request(request_id)
    if not get_user_by_id(request["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    try:
        update_user(request["user_id"], {request["field"]: request["new_value"]})
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo aplicar el cambio; revisa si el valor ya está en uso",
        ) from exc

    reviewed_at = datetime.now(timezone.utc).isoformat()
    updated = (
        supabase.table("modification_requests")
        .update(
            {
                "status": "approved",
                "reviewed_by": user["id"],
                "reviewed_at": reviewed_at,
            }
        )
        .eq("id", request_id)
        .execute()
    )
    return response_single(updated) or {
        **request,
        "status": "approved",
        "reviewed_by": user["id"],
        "reviewed_at": reviewed_at,
    }


@router.patch("/{request_id}/deny", response_model=ModificationRequestResponse)
def deny_request(request_id: str, user: dict = Depends(get_current_superadmin)) -> dict:
    request = _get_pending_request(request_id)
    reviewed_at = datetime.now(timezone.utc).isoformat()
    updated = (
        supabase.table("modification_requests")
        .update(
            {"status": "denied", "reviewed_by": user["id"], "reviewed_at": reviewed_at}
        )
        .eq("id", request_id)
        .execute()
    )
    return response_single(updated) or {
        **request,
        "status": "denied",
        "reviewed_by": user["id"],
        "reviewed_at": reviewed_at,
    }
