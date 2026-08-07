"""
FastAPI application entry point.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import router
from app.core.config import settings
from app.db.models import init_db


def create_app() -> FastAPI:
    """
    Factory function for creating the FastAPI application instance.

    Returns:
        Configured FastAPI application with middleware and routers.
    """

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,

        # ✅ Always enable Swagger
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API Routes
    app.include_router(router)

    # Static reports
    reports_dir = Path("reports")
    reports_dir.mkdir(parents=True, exist_ok=True)

    app.mount(
        "/reports",
        StaticFiles(directory=str(reports_dir)),
        name="reports",
    )

    @app.on_event("startup")
    def startup_event() -> None:
        """Initialize database."""
        init_db()

    return app


# ASGI application
app = create_app()

