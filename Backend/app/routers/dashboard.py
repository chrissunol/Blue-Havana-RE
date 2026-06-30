from fastapi import APIRouter, Depends

from app.data.reviews_repository import list_admin_reviews
from app.data.transactions_repository import list_transactions
from app.dependencies import get_current_superadmin
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def dashboard_data(user: dict = Depends(get_current_superadmin)) -> dict:
    reviews = list_admin_reviews()
    transactions = list_transactions()
    return {
        "stats": {
            "pendingReviews": sum(review["status"] == "pending" for review in reviews),
            "approvedReviews": sum(
                review["status"] == "approved" for review in reviews
            ),
            "soldProperties": sum(
                item["transactionType"] == "sale" and item["status"] == "active"
                for item in transactions
            ),
            "rentedProperties": sum(
                item["transactionType"] == "rent" and item["status"] == "active"
                for item in transactions
            ),
        },
        "reviews": reviews,
        "transactions": transactions,
    }
