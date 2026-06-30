from pydantic import BaseModel

from app.schemas.reviews import ReviewResponse
from app.schemas.transactions import TransactionResponse


class DashboardStats(BaseModel):
    pendingReviews: int
    approvedReviews: int
    soldProperties: int
    rentedProperties: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    reviews: list[ReviewResponse]
    transactions: list[TransactionResponse]
