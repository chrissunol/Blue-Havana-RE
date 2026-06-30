from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.data.db import ensure_superadmin
from app.routers.auth import router as auth_router
from app.routers.properties import router as properties_router
from app.routers.users import router as users_router
from app.routers.transactions import router as transactions_router
from app.routers.information import router as information_router
from app.routers.blog import router as blog_router
from app.routers.reviews import router as reviews_router
from app.routers.dashboard import router as dashboard_router
from app.routers.requests import router as requests_router

app = FastAPI(
    title=settings.app_name,
    description="API Blue Havana RS",
    version="2.0.0",
)

allowed_origins = list(settings.cors_origin_list)

extra_origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://bluehavanare.csunol73.workers.dev",
    "https://bluehavanars.csunol73.workers.dev",
]

for origin in extra_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(properties_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(information_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(requests_router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    ensure_superadmin()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/debug-cors")
def debug_cors() -> dict:
    return {
        "allowed_origins": allowed_origins,
        "settings_cors_origin_list": settings.cors_origin_list,
    }
