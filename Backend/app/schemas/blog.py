from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LocalizedContent(BaseModel):
    es: str = ""
    en: str = ""
    fr: str = ""


class BlogArticleBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    slug: str | None = Field(default=None, max_length=180)
    title: LocalizedContent
    excerpt: LocalizedContent
    content: LocalizedContent
    category: Literal["market", "renovation", "investment", "architecture", "tips"]
    author: str = Field(min_length=2, max_length=120)
    coverImage: str = Field(
        default="assets/images/placeholder.svg", max_length=5_000_000
    )
    status: Literal["draft", "published"] = "draft"
    featured: bool = False
    readingTime: int = Field(default=5, ge=1, le=120)


class BlogArticleCreate(BlogArticleBase):
    pass


class BlogArticleUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    slug: str | None = Field(default=None, max_length=180)
    title: LocalizedContent | None = None
    excerpt: LocalizedContent | None = None
    content: LocalizedContent | None = None
    category: (
        Literal["market", "renovation", "investment", "architecture", "tips"] | None
    ) = None
    author: str | None = Field(default=None, min_length=2, max_length=120)
    coverImage: str | None = Field(default=None, max_length=5_000_000)
    status: Literal["draft", "published"] | None = None
    featured: bool | None = None
    readingTime: int | None = Field(default=None, ge=1, le=120)


class BlogStatusUpdate(BaseModel):
    status: Literal["draft", "published"]


class BlogFeaturedUpdate(BaseModel):
    featured: bool


class BlogArticleResponse(BlogArticleBase):
    id: str
    slug: str
    publishedAt: str | None = None
    createdAt: str
    updatedAt: str | None = None
    createdBy: str | None = None
    updatedBy: str | None = None
