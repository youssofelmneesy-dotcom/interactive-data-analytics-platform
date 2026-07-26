"""
Dataset CRUD and preview endpoints.
"""
from fastapi import APIRouter, Query

from app.services.dataset_service import (
    list_datasets,
    get_dataset,
    get_dataset_preview,
    get_dataset_column_stats,
)

router = APIRouter()


@router.get("/")
def read_datasets() -> list[dict]:
    """
    List all uploaded datasets.

    Returns:
        List of dataset metadata records.
    """
    return list_datasets()


@router.get("/{dataset_id}")
def read_dataset(dataset_id: str) -> dict:
    """
    Get a single dataset by ID.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        Dataset metadata record.
    """
    return get_dataset(dataset_id)


@router.get("/{dataset_id}/preview")
def read_dataset_preview(
    dataset_id: str,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=500, description="Rows per page"),
) -> dict:
    """
    Get a paginated preview of dataset rows.

    Args:
        dataset_id: Unique dataset identifier.
        page: Page number (1-indexed).
        page_size: Number of rows per page.

    Returns:
        Paginated preview with rows, columns, and pagination metadata.
    """
    return get_dataset_preview(dataset_id, page=page, page_size=page_size)


@router.get("/{dataset_id}/stats")
def read_dataset_stats(dataset_id: str) -> list[dict]:
    """
    Get descriptive statistics for all columns of a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of column statistics.
    """
    return get_dataset_column_stats(dataset_id)


