from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.core.config import settings
from app.data.db import (
    create_property,
    delete_property,
    get_any_property,
    get_public_property,
    list_admin_properties,
    list_public_properties,
    update_property,
)
from app.data.supabase_client import supabase
from app.dependencies import get_current_admin
from app.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["properties"])


def property_filters(
    operation: str | None = Query(default=None),
    category: str | None = Query(default=None),
    location: str | None = Query(default=None),
    city: str | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    bedrooms: int | None = Query(default=None, ge=0),
    bathrooms: float | None = Query(default=None, ge=0),
    featured: bool | None = Query(default=None),
    features: list[str] | None = Query(default=None),
) -> dict:
    return {
        "operation": operation,
        "property_type": category,
        "location": location,
        "city": city,
        "min_price": min_price,
        "max_price": max_price,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "featured": featured,
        "features": features or [],
    }


@router.get("", response_model=list[PropertyResponse])
def public_properties(filters: dict = Depends(property_filters)) -> list[dict]:
    """Frontend público: solo devuelve propiedades publicadas."""
    return list_public_properties(filters)


@router.get("/{property_id}", response_model=PropertyResponse)
def public_property_detail(property_id: str) -> dict:
    prop = get_public_property(property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return prop


@router.get("/admin/all", response_model=list[PropertyResponse], dependencies=[Depends(get_current_admin)])
def admin_properties(filters: dict = Depends(property_filters)) -> list[dict]:
    """Panel admin: devuelve publicadas y no publicadas."""
    return list_admin_properties(filters)


@router.get("/admin/{property_id}", response_model=PropertyResponse, dependencies=[Depends(get_current_admin)])
def admin_property_detail(property_id: str) -> dict:
    prop = get_any_property(property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return prop


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property_endpoint(payload: PropertyCreate, user: dict = Depends(get_current_admin)) -> dict:
    return create_property(payload.model_dump(), created_by=user["id"])


@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property_endpoint(property_id: str, payload: PropertyUpdate, user: dict = Depends(get_current_admin)) -> dict:
    if not get_any_property(property_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    updated = update_property(property_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return updated


@router.patch("/{property_id}/publish", response_model=PropertyResponse)
def publish_property(property_id: str, user: dict = Depends(get_current_admin)) -> dict:
    updated = update_property(property_id, {"visible": True, "status": "available"})
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return updated


@router.patch("/{property_id}/unpublish", response_model=PropertyResponse)
def unpublish_property(property_id: str, user: dict = Depends(get_current_admin)) -> dict:
    updated = update_property(property_id, {"visible": False})
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    return updated


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_property(property_id: str, user: dict = Depends(get_current_admin)) -> None:
    if not get_any_property(property_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")
    delete_property(property_id)


@router.post("/{property_id}/images")
async def upload_property_images(
    property_id: str,
    files: list[UploadFile] = File(...),
    user: dict = Depends(get_current_admin),
) -> dict:
    prop = get_any_property(property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propiedad no encontrada")

    uploaded_urls: list[str] = []
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se permiten imágenes")
        content = await file.read()
        extension = (file.filename or "image.jpg").split(".")[-1]
        path = f"properties/{property_id}/{len(uploaded_urls)}-{file.filename or 'image'}.{extension}"
        supabase.storage.from_(settings.supabase_storage_bucket).upload(
            path=path,
            file=content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
        public_url = supabase.storage.from_(settings.supabase_storage_bucket).get_public_url(path)
        uploaded_urls.append(public_url)

    new_images = list(prop.get("images") or []) + uploaded_urls
    update_property(property_id, {"images": new_images})
    return {"images": new_images, "uploaded": uploaded_urls}
