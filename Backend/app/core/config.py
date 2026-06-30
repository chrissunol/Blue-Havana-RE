from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Inmobiliaria API"
    app_env: str = "development"
    port: int = 4000

    jwt_secret: str = Field(min_length=32)
    access_token_expire_minutes: int = 120

    supabase_url: str
    supabase_service_role_key: str
    supabase_storage_bucket: str = "property-images"
    supabase_blog_storage_bucket: str = "blog-images"

    admin_email: str
    admin_username: str | None = None
    admin_password: str = Field(min_length=8)
    admin_full_name: str = "Super Admin"

    cors_origins: str = (
        "http://localhost:4200,"
        "http://127.0.0.1:4200,"
        "https://bluehavanars.csunol73.workers.dev"
    )

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
