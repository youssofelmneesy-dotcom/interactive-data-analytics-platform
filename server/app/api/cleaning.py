"""
Data quality and cleaning endpoints.
"""
from typing import Any

from fastapi import APIRouter

from app.services.dataset_service import get_dataset_quality, apply_cleaning_operation
from app.db.database import db_session

router = APIRouter()


@router.get("/{dataset_id}/quality")
def read_dataset_quality(dataset_id: str) -> dict[str, Any]:
    """
    Get a comprehensive quality report for a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        Quality metrics including missing values, duplicates,
        constant columns, empty rows, and inferred types.
    """
    return get_dataset_quality(dataset_id)


@router.post("/{dataset_id}/clean")
def clean_dataset(
    dataset_id: str,
    body: dict[str, Any],
) -> dict[str, Any]:
    """
    Apply a cleaning operation to a dataset.

    Request body:
        - operation: Cleaning operation name.
        - column: Target column (optional, required for some operations).
        - value: Additional parameter (optional, required for some operations).

    Supported operations:
        - remove_duplicates
        - remove_empty_rows
        - fill_mean
        - fill_median
        - fill_mode
        - fill_constant
        - drop_missing_rows
        - drop_missing_columns
        - rename_column
        - change_type

    Args:
        dataset_id: Unique dataset identifier.
        body: Cleaning operation configuration.

    Returns:
        Updated dataset metadata with operation results.
    """
    operation = body.get("operation")
    column = body.get("column")
    value = body.get("value")

    return apply_cleaning_operation(
        dataset_id=dataset_id,
        operation=operation,
        column=column,
        value=value,
    )


@router.get("/{dataset_id}/clean/jobs")
def read_cleaning_jobs(dataset_id: str) -> list[dict[str, Any]]:
    """
    List all cleaning jobs for a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of cleaning job records.
    """
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT id, dataset_id, status, rules_json, created_at
            FROM cleaning_jobs
            WHERE dataset_id = ?
            ORDER BY created_at DESC
            """,
            (dataset_id,),
        ).fetchall()

    return [
        {
            "id": row["id"],
            "datasetId": row["dataset_id"],
            "status": row["status"],
            "rules": row["rules_json"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]