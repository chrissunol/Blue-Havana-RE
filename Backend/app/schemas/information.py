from pydantic import BaseModel, EmailStr


class CompanyInfo(BaseModel):
    phone: str = ""
    whatsapp: str = ""
    email: EmailStr | str = ""
    address: str = ""
    facebook: str = ""
    instagram: str = ""
    x: str = ""
    telegram: str = ""
    youtube: str = ""
    originText: str = ""
    todayText: str = ""
    futureText: str = ""
    whereText: str = ""


class CompanyInfoUpdate(BaseModel):
    phone: str | None = None
    whatsapp: str | None = None
    email: EmailStr | str | None = None
    address: str | None = None
    facebook: str | None = None
    instagram: str | None = None
    x: str | None = None
    telegram: str | None = None
    youtube: str | None = None
    originText: str | None = None
    todayText: str | None = None
    futureText: str | None = None
    whereText: str | None = None
