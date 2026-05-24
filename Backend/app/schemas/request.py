from pydantic import BaseModel, Field


class ModificationRequestBase(BaseModel):
    field: str  # e.g., "full_name", "email"
    new_value: str = Field(min_length=1, max_length=200)


class ModificationRequestCreate(ModificationRequestBase):
    pass


class ModificationRequestResponse(ModificationRequestBase):
    id: str
    user_id: str
    status: str = "pending"  # pending, approved, denied