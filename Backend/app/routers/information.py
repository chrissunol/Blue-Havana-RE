from fastapi import APIRouter, Depends

from app.data.db import get_company_info, reset_company_info, update_company_info
from app.dependencies import get_current_admin
from app.schemas.information import CompanyInfo

router = APIRouter(prefix="/company-info", tags=["company-info"])


@router.get("", response_model=CompanyInfo)
def read_company_info() -> dict:
    return get_company_info()


@router.patch("", response_model=CompanyInfo)
def patch_company_info(payload: CompanyInfo, user: dict = Depends(get_current_admin)) -> dict:
    return update_company_info(payload.model_dump())


@router.post("/reset", response_model=CompanyInfo)
def reset_info(user: dict = Depends(get_current_admin)) -> dict:
    return reset_company_info()
