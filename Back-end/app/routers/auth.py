from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, verify_password
from app.data.db import get_user_by_username, sanitize_user
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    user = get_user_by_username(payload.username.strip())
    if not user or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas"
        )
    if not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas"
        )

    token = create_access_token(
        subject=user["id"],
        extra_claims={"role": user["role"], "username": user.get("username")},
    )
    return TokenResponse(access_token=token, user=sanitize_user(user) or {})
