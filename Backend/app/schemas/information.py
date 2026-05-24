from pydantic import BaseModel, EmailStr


class CompanyInfo(BaseModel):
    phone: str = ""
    whatsapp: str = ""
    email: EmailStr | str = ""
    address: str = ""
    facebook: str = ""
    instagram: str = ""
    x: str = ""
    originText: str = ""
    todayText: str = ""
    futureText: str = ""
    whereText: str = ""
