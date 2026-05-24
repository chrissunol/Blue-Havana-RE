from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.data.db import modification_requests, users
from app.dependencies import get_current_admin, get_current_superadmin
from app.schemas.request import ModificationRequestCreate, ModificationRequestResponse

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=ModificationRequestResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
def create_modification_request(payload: ModificationRequestCreate, user: dict = Depends(get_current_admin)) -> ModificationRequestResponse:
    request = payload.model_dump()
    request["id"] = str(uuid4())
    request["user_id"] = user["id"]
    request["status"] = "pending"
    modification_requests.append(request)
    return ModificationRequestResponse(**request)


@router.get("", response_model=list[ModificationRequestResponse], dependencies=[Depends(get_current_superadmin)])
def list_modification_requests() -> list[ModificationRequestResponse]:
    return [ModificationRequestResponse(**r) for r in modification_requests]


@router.patch("/{request_id}/approve", dependencies=[Depends(get_current_superadmin)])
def approve_request(request_id: str) -> dict:
    request = next((r for r in modification_requests if r["id"] == request_id), None)
    if not request or request["status"] != "pending":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada o no pendiente")

    user = next((u for u in users if u["id"] == request["user_id"]), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Aplicar cambio
    user[request["field"]] = request["new_value"]
    request["status"] = "approved"
    return {"message": "Solicitud aprobada"}


@router.patch("/{request_id}/deny", dependencies=[Depends(get_current_superadmin)])
def deny_request(request_id: str) -> dict:
    request = next((r for r in modification_requests if r["id"] == request_id), None)
    if not request or request["status"] != "pending":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada o no pendiente")

    request["status"] = "denied"
    return {"message": "Solicitud denegada"}