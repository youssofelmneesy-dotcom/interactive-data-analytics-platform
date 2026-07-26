"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.db.models import init_db
from app.api.router import router


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
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routers
    app.include_router(router)

    # Serve static files for reports
    reports_dir = Path("reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/reports", StaticFiles(directory=str(reports_dir)), name="reports")

    # Initialize database on startup
    @app.on_event("startup")
    def startup_event() -> None:
        """Initialize the SQLite database when the application starts."""
        init_db()

    return app


# Application instance for ASGI servers (uvicorn)
app = create_app()

