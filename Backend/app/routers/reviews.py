from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.data.reviews_repository import (
    create_review,
    delete_review,
    list_admin_reviews,
    list_public_reviews,
    moderate_review,
)
from app.dependencies import get_current_superadmin
from app.schemas.reviews import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(payload: ReviewCreate) -> dict:
    return create_review(payload.model_dump())


@router.get("/public", response_model=list[ReviewResponse])
def public_reviews(limit: int = Query(default=20, ge=1, le=100)) -> list[dict]:
    return list_public_reviews(limit=limit)


@router.get("/admin", response_model=list[ReviewResponse])
def admin_reviews(
    review_status: Literal["pending", "approved", "rejected"] | None = Query(
        default=None, alias="status"
    ),
    user: dict = Depends(get_current_superadmin),
) -> list[dict]:
    return list_admin_reviews(status=review_status)


@router.patch("/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: str, user: dict = Depends(get_current_superadmin)
) -> dict:
    review = moderate_review(review_id, "approved", user["id"])
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada"
        )
    return review


@router.patch("/{review_id}/reject", response_model=ReviewResponse)
def reject_review(review_id: str, user: dict = Depends(get_current_superadmin)) -> dict:
    review = moderate_review(review_id, "rejected", user["id"])
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada"
        )
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_review(review_id: str, user: dict = Depends(get_current_superadmin)) -> None:
    if not delete_review(review_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada"
        )
