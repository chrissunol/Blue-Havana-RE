from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.data.blog_repository import (
    create_article,
    delete_article,
    get_admin_article,
    get_public_article_by_slug,
    list_admin_articles,
    list_public_articles,
    update_article,
    upload_blog_image,
)
from app.dependencies import get_current_admin
from app.schemas.blog import (
    BlogArticleCreate,
    BlogArticleResponse,
    BlogArticleUpdate,
    BlogFeaturedUpdate,
    BlogStatusUpdate,
)

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("/articles", response_model=list[BlogArticleResponse])
def public_articles(
    category: str | None = Query(default=None),
) -> list[dict]:
    return list_public_articles(category=category)


@router.get("/articles/{slug}", response_model=BlogArticleResponse)
def public_article(slug: str) -> dict:
    article = get_public_article_by_slug(slug)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado"
        )
    return article


@router.get("/admin/articles", response_model=list[BlogArticleResponse])
def admin_articles(
    article_status: str | None = Query(default=None, alias="status"),
    category: str | None = Query(default=None),
    user: dict = Depends(get_current_admin),
) -> list[dict]:
    return list_admin_articles(status=article_status, category=category)


@router.get("/admin/articles/{article_id}", response_model=BlogArticleResponse)
def admin_article(article_id: str, user: dict = Depends(get_current_admin)) -> dict:
    article = get_admin_article(article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado"
        )
    return article


@router.post(
    "/admin/articles",
    response_model=BlogArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_blog_article(
    payload: BlogArticleCreate, user: dict = Depends(get_current_admin)
) -> dict:
    return create_article(payload.model_dump(), user["id"])


@router.patch("/admin/articles/{article_id}", response_model=BlogArticleResponse)
def patch_blog_article(
    article_id: str,
    payload: BlogArticleUpdate,
    user: dict = Depends(get_current_admin),
) -> dict:
    article = update_article(
        article_id, payload.model_dump(exclude_unset=True), user["id"]
    )
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado"
        )
    return article


@router.patch("/admin/articles/{article_id}/status", response_model=BlogArticleResponse)
def change_blog_article_status(
    article_id: str,
    payload: BlogStatusUpdate,
    user: dict = Depends(get_current_admin),
) -> dict:
    article = update_article(article_id, {"status": payload.status}, user["id"])
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado"
        )
    return article


@router.patch(
    "/admin/articles/{article_id}/featured", response_model=BlogArticleResponse
)
def change_blog_article_featured(
    article_id: str,
    payload: BlogFeaturedUpdate,
    user: dict = Depends(get_current_admin),
) -> dict:
    article = update_article(article_id, {"featured": payload.featured}, user["id"])
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado"
        )
    return article


@router.delete("/admin/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_blog_article(
    article_id: str, user: dict = Depends(get_current_admin)
) -> None:
    if not delete_article(article_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado"
        )


@router.post("/admin/images", status_code=status.HTTP_201_CREATED)
async def upload_blog_cover(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_admin),
) -> dict[str, str]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se permiten imágenes"
        )
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="La imagen está vacía"
        )
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen supera 10 MB",
        )
    return {"url": upload_blog_image(content, file.content_type, file.filename)}
