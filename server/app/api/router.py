"""
Main API router aggregating all application endpoints.
"""
from fastapi import APIRouter

from app.core.config import settings
from app.api import upload, datasets, cleaning, charts, insights, reports

router = APIRouter(prefix="/api")


@router.get("/")
def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns the application status and version.
    """
    return {
        "status": "running",
        "app": settings.app_name,
        "version": settings.app_version,
    }


# Include sub-routers
router.include_router(upload.router, prefix="/upload", tags=["upload"])
router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
router.include_router(cleaning.router, prefix="/datasets", tags=["cleaning"])
router.include_router(charts.router, prefix="/datasets", tags=["charts"])
router.include_router(insights.router, prefix="/datasets", tags=["insights"])
router.include_router(reports.router, prefix="/datasets", tags=["reports"])

