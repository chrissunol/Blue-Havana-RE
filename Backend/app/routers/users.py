from fastapi import APIRouter, Depends, HTTPException, status

from app.data.db import create_user, deactivate_user, get_user_by_email, get_user_by_id, get_user_by_username, list_users, update_user
from app.dependencies import get_current_superadmin
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse], dependencies=[Depends(get_current_superadmin)])
def get_users() -> list[dict]:
    return list_users()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_superadmin)])
def create_admin(payload: UserCreate) -> dict:
    if payload.id and get_user_by_id(payload.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese identificador ya existe")
    if get_user_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese email ya existe")
    if payload.username and get_user_by_username(payload.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese nombre de usuario ya existe")
    return create_user(payload.model_dump(exclude_none=True))


@router.patch("/{user_id}", response_model=UserResponse, dependencies=[Depends(get_current_superadmin)])
def edit_user(user_id: str, payload: UserUpdate) -> dict:
    current = get_user_by_id(user_id)
    if not current:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if payload.email:
        existing_email = get_user_by_email(payload.email)
        if existing_email and existing_email["id"] != user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese email ya existe")
    if payload.username:
        existing_username = get_user_by_username(payload.username)
        if existing_username and existing_username["id"] != user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese nombre de usuario ya existe")
    updated = update_user(user_id, payload.model_dump(exclude_unset=True, exclude_none=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return updated


@router.patch("/{user_id}/deactivate", response_model=UserResponse, dependencies=[Depends(get_current_superadmin)])
def disable_user(user_id: str) -> dict:
    updated = deactivate_user(user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return updated
