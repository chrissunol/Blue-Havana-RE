from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.data.db import (
    create_user,
    deactivate_user,
    delete_user,
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
def get_users(
    current_user: dict = Depends(get_current_superadmin),
) -> list[dict]:
    return list_users()


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admin(
    payload: UserCreate,
    current_user: dict = Depends(get_current_superadmin),
) -> dict:
    if payload.id and get_user_by_id(payload.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese identificador ya existe",
        )

    if get_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese email ya existe",
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if payload.email:
        existing_email = get_user_by_email(payload.email)

        if existing_email and str(existing_email["id"]) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ese email ya existe",
            )

    if payload.username:
        existing_username = get_user_by_username(payload.username)

        if existing_username and str(existing_username["id"]) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ese nombre de usuario ya existe",
            )

    updated = update_user(
        user_id,
        payload.model_dump(
            exclude_unset=True,
            exclude_none=True,
        ),
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return updated


def _deactivate_user_or_404(
    user_id: str,
    current_user: dict,
) -> dict:
    if (
        str(user_id) == str(current_user.get("id"))
        or user_id == "superadmin"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No puedes desactivar la cuenta principal "
                "de superadministrador"
            ),
        )

    updated = deactivate_user(user_id)

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return updated


def _delete_user_or_404(
    user_id: str,
    current_user: dict,
) -> None:
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if str(user_id) == str(current_user.get("id")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propia cuenta",
        )

    if user_id == "superadmin" or user.get("role") == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No puedes eliminar la cuenta principal "
                "de superadministrador"
            ),
        )

    deleted = delete_user(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo eliminar permanentemente el administrador",
        )


@router.patch(
    "/{user_id}/deactivate",
    response_model=UserResponse,
)
def disable_user(
    user_id: str,
    current_user: dict = Depends(get_current_superadmin),
) -> dict:
    return _deactivate_user_or_404(user_id, current_user)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_user_permanently(
    user_id: str,
    current_user: dict = Depends(get_current_superadmin),
) -> Response:
    _delete_user_or_404(user_id, current_user)

    return Response(status_code=status.HTTP_204_NO_CONTENT)