from fastapi import APIRouter, Depends, HTTPException, status

from app.data.db import (
    create_user,
    deactivate_user,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    list_users,
    update_user,
)
from app.dependencies import get_current_superadmin
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def get_users(current_user: dict = Depends(get_current_superadmin)) -> list[dict]:
    return list_users()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    payload: UserCreate, current_user: dict = Depends(get_current_superadmin)
) -> dict:
    if payload.id and get_user_by_id(payload.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Ese identificador ya existe"
        )
    if get_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Ese email ya existe"
        )
    if payload.username and get_user_by_username(payload.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese nombre de usuario ya existe",
        )
    return create_user(payload.model_dump(exclude_none=True))


@router.patch("/{user_id}", response_model=UserResponse)
def edit_user(
    user_id: str,
    payload: UserUpdate,
    current_user: dict = Depends(get_current_superadmin),
) -> dict:
    current = get_user_by_id(user_id)
    if not current:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    if payload.email:
        existing_email = get_user_by_email(payload.email)
        if existing_email and existing_email["id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Ese email ya existe"
            )
    if payload.username:
        existing_username = get_user_by_username(payload.username)
        if existing_username and existing_username["id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ese nombre de usuario ya existe",
            )
    updated = update_user(
        user_id, payload.model_dump(exclude_unset=True, exclude_none=True)
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return updated


def _deactivate_user_or_404(user_id: str, current_user: dict) -> dict:
    if user_id == current_user["id"] or user_id == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar la cuenta principal de superadministrador",
        )
    updated = deactivate_user(user_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return updated


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
def disable_user(
    user_id: str, current_user: dict = Depends(get_current_superadmin)
) -> dict:
    return _deactivate_user_or_404(user_id, current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_compatibility(
    user_id: str, current_user: dict = Depends(get_current_superadmin)
) -> None:
    """Compatibilidad con Angular: DELETE realiza borrado lógico, no elimina historial."""
    _deactivate_user_or_404(user_id, current_user)
