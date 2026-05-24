from typing import Literal
from pydantic import BaseModel, Field


class TranslatedText(BaseModel):
    es: str
    en: str | None = None
    fr: str | None = None


class PropertyFeatures(BaseModel):
    garage: bool | None = False
    terrace: bool | None = False
    pool: bool | None = False
    garden: bool | None = False
    ranchon: bool | None = False
    balcony: bool | None = False
    jacuzzi: bool | None = False
    furnished: bool | None = False
    other: bool | None = False
    otherText: str | None = None


class PropertyBase(BaseModel):
    title: TranslatedText
    category: TranslatedText
    price: float = Field(gt=0)
    annualPrice: float | None = None
    pricePerM2: float | None = None
    operation: Literal["rent", "sale"]
    location: TranslatedText
    bedrooms: int = Field(ge=0)
    bathrooms: float = Field(ge=0)
    floors: int | None = Field(default=None, ge=1)
    area: float | None = Field(default=None, gt=0)
    images: list[str] = Field(default_factory=list)
    visible: bool = False
    featured: bool = False
    description: TranslatedText | None = None
    features: PropertyFeatures | None = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: TranslatedText | None = None
    category: TranslatedText | None = None
    price: float | None = Field(default=None, gt=0)
    annualPrice: float | None = None
    pricePerM2: float | None = None
    operation: Literal["rent", "sale"] | None = None
    location: TranslatedText | None = None
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: float | None = Field(default=None, ge=0)
    floors: int | None = Field(default=None, ge=1)
    area: float | None = Field(default=None, gt=0)
    images: list[str] | None = None
    visible: bool | None = None
    featured: bool | None = None
    description: TranslatedText | None = None
    features: PropertyFeatures | None = None


class PropertyResponse(PropertyBase):
    id: str
    code: str | None = None
    created_by: str | None = None
    created_at: str | None = None
    updated_at: str | None = None