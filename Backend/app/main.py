from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.data.db import ensure_superadmin
from app.routers.auth import router as auth_router
from app.routers.properties import router as properties_router
from app.routers.users import router as users_router
from app.routers.transactions import router as transactions_router
from app.routers.information import router as information_router

app = FastAPI(
    title=settings.app_name,
    description="API Blue Havana RS",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(properties_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(information_router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    ensure_superadmin()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
