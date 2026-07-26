"""
Dataset service for CRUD operations and data retrieval.
"""
import json
from pathlib import Path
from typing import Any

import pandas as pd

from app.core.exceptions import NotFoundError, BadRequestError
from app.db.database import db_session
from app.engines.data_loader import load_dataframe, infer_column_types
from app.engines.statistics_engine import compute_all_stats, compute_dataset_summary
from app.engines import cleaning_engine

UPLOAD_DIR = Path("uploads")


def create_dataset(metadata: dict) -> dict:
    """
    Persist dataset metadata to the database.

    Args:
        metadata: Dictionary with id, name, filePath, rowCount, columnCount.

    Returns:
        The persisted dataset record.
    """
    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO datasets (id, name, file_path, row_count, column_count)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                metadata["id"],
                metadata["name"],
                metadata["filePath"],
                metadata["rowCount"],
                metadata["columnCount"],
            ),
        )
    return metadata


def list_datasets() -> list[dict]:
    """
    Retrieve all dataset records from the database.

    Returns:
        List of dataset dictionaries.
    """
    with db_session() as conn:
        rows = conn.execute(
            "SELECT id, name, file_path, row_count, column_count, created_at FROM datasets ORDER BY created_at DESC"
        ).fetchall()

    datasets = []
    for row in rows:
        file_path = Path(row["file_path"])
        # Load DataFrame to get columns and types
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            df = load_dataframe(content, row["name"])
            columns = list(df.columns)
            column_types = infer_column_types(df)
            file_size = file_path.stat().st_size if file_path.exists() else 0
        except Exception:
            # Fallback if file cannot be loaded
            columns = []
            column_types = {}
            file_size = 0

        datasets.append({
            "id": row["id"],
            "name": row["name"],
            "fileName": row["name"],
            "fileType": file_path.suffix.lower().replace(".", ""),
            "fileSize": file_size,
            "filePath": row["file_path"],
            "rowCount": row["row_count"],
            "columnCount": row["column_count"],
            "columns": columns,
            "columnTypes": column_types,
            "createdAt": row["created_at"],
            "updatedAt": row["created_at"],
        })
    return datasets


def get_dataset(dataset_id: str) -> dict:
    """
    Retrieve a single dataset by ID.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        Dataset dictionary.

    Raises:
        NotFoundError: If dataset does not exist.
    """
    with db_session() as conn:
        row = conn.execute(
            "SELECT id, name, file_path, row_count, column_count, created_at FROM datasets WHERE id = ?",
            (dataset_id,),
        ).fetchone()

    if row is None:
        raise NotFoundError(f"Dataset '{dataset_id}' not found.")

    file_path = Path(row["file_path"])
    # Load DataFrame to get columns and types
    try:
        with open(file_path, "rb") as f:
            content = f.read()
        df = load_dataframe(content, row["name"])
        columns = list(df.columns)
        column_types = infer_column_types(df)
        file_size = file_path.stat().st_size if file_path.exists() else 0
    except Exception:
        # Fallback if file cannot be loaded
        columns = []
        column_types = {}
        file_size = 0

    return {
        "id": row["id"],
        "name": row["name"],
        "fileName": row["name"],
        "fileType": file_path.suffix.lower().replace(".", ""),
        "fileSize": file_size,
        "filePath": row["file_path"],
        "rowCount": row["row_count"],
        "columnCount": row["column_count"],
        "columns": columns,
        "columnTypes": column_types,
        "createdAt": row["created_at"],
        "updatedAt": row["created_at"],
    }


def get_dataset_dataframe(dataset_id: str) -> pd.DataFrame:
    """
    Load a dataset's DataFrame from its stored file.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        Parsed pandas DataFrame.

    Raises:
        NotFoundError: If dataset or file does not exist.
    """
    dataset = get_dataset(dataset_id)
    file_path = Path(dataset["filePath"])

    if not file_path.exists():
        raise NotFoundError(f"File for dataset '{dataset_id}' not found.")

    with open(file_path, "rb") as f:
        content = f.read()

    return load_dataframe(content, dataset["name"])


def get_dataset_preview(dataset_id: str, page: int = 1, page_size: int = 50) -> dict:
    """
    Get a paginated preview of dataset rows.

    Args:
        dataset_id: Unique dataset identifier.
        page: Page number (1-indexed).
        page_size: Number of rows per page.

    Returns:
        Dictionary with rows, columns, pagination info.
    """
    df = get_dataset_dataframe(dataset_id)
    total_rows = len(df)
    total_pages = max(1, (total_rows + page_size - 1) // page_size)

    if page < 1:
        page = 1
    if page > total_pages:
        page = total_pages

    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    # Convert to JSON-safe format
    rows = json.loads(page_df.to_json(orient="records", date_format="iso"))

    return {
        "rows": rows,
        "columns": list(df.columns),
        "page": page,
        "pageSize": page_size,
        "totalRows": total_rows,
        "totalPages": total_pages,
    }


def get_dataset_column_stats(dataset_id: str) -> list[dict[str, Any]]:
    """
    Compute statistics for all columns of a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of column statistics.
    """
    df = get_dataset_dataframe(dataset_id)
    return compute_all_stats(df)


# ============================================================
# STAGE 3: QUALITY & CLEANING
# ============================================================

def get_dataset_quality(dataset_id: str) -> dict[str, Any]:
    """
    Analyze dataset quality and return a comprehensive report.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        Dictionary with quality metrics.
    """
    df = get_dataset_dataframe(dataset_id)

    missing = cleaning_engine.detect_missing_values(df)
    duplicates = cleaning_engine.detect_duplicate_rows(df)
    constant = cleaning_engine.detect_constant_columns(df)
    high_null = cleaning_engine.detect_high_null_columns(df)
    empty = cleaning_engine.detect_empty_rows(df)
    types = cleaning_engine.detect_column_types(df)

    return {
        "missingValues": missing,
        "duplicateRows": duplicates,
        "constantColumns": constant,
        "highNullColumns": high_null,
        "emptyRows": empty,
        "inferredTypes": types,
        "totalRows": len(df),
        "totalColumns": len(df.columns),
    }


def apply_cleaning_operation(
    dataset_id: str,
    operation: str,
    column: str | None = None,
    value: Any = None,
) -> dict:
    """
    Apply a cleaning operation to a dataset and save the result.

    Args:
        dataset_id: Unique dataset identifier.
        operation: Cleaning operation name.
        column: Target column (if applicable).
        value: Additional value parameter (if applicable).

    Returns:
        Updated dataset metadata.

    Raises:
        BadRequestError: If operation is invalid.
    """
    df = get_dataset_dataframe(dataset_id)
    original_rows = len(df)

    # Apply the requested operation
    if operation == "remove_duplicates":
        df = cleaning_engine.remove_duplicates(df)
    elif operation == "remove_empty_rows":
        df = cleaning_engine.remove_empty_rows(df)
    elif operation == "fill_mean":
        if not column:
            raise BadRequestError("Column is required for fill_mean operation.")
        df = cleaning_engine.fill_missing_mean(df, column)
    elif operation == "fill_median":
        if not column:
            raise BadRequestError("Column is required for fill_median operation.")
        df = cleaning_engine.fill_missing_median(df, column)
    elif operation == "fill_mode":
        if not column:
            raise BadRequestError("Column is required for fill_mode operation.")
        df = cleaning_engine.fill_missing_mode(df, column)
    elif operation == "fill_constant":
        if not column:
            raise BadRequestError("Column is required for fill_constant operation.")
        df = cleaning_engine.fill_missing_constant(df, column, value)
    elif operation == "drop_missing_rows":
        df = cleaning_engine.drop_missing_rows(df, column)
    elif operation == "drop_missing_columns":
        df = cleaning_engine.drop_missing_columns(df)
    elif operation == "rename_column":
        if not column or value is None:
            raise BadRequestError("Both column and value are required for rename_column.")
        df = cleaning_engine.rename_column(df, column, str(value))
    elif operation == "change_type":
        if not column or value is None:
            raise BadRequestError("Both column and value are required for change_type.")
        df = cleaning_engine.change_column_type(df, column, str(value))
    else:
        raise BadRequestError(f"Unknown cleaning operation: {operation}")

    # Save cleaned dataset back to file
    dataset = get_dataset(dataset_id)
    file_path = Path(dataset["filePath"])
    ext = file_path.suffix.lower()

    if ext == ".csv":
        df.to_csv(file_path, index=False)
    elif ext in {".xlsx", ".xls"}:
        df.to_excel(file_path, index=False)

    # Update metadata in database
    new_row_count = len(df)
    new_col_count = len(df.columns)

    with db_session() as conn:
        conn.execute(
            """
            UPDATE datasets
            SET row_count = ?, column_count = ?
            WHERE id = ?
            """,
            (new_row_count, new_col_count, dataset_id),
        )

    return {
        "datasetId": dataset_id,
        "operation": operation,
        "column": column,
        "value": value,
        "originalRows": original_rows,
        "newRows": new_row_count,
        "rowsRemoved": original_rows - new_row_count,
        "newColumns": new_col_count,
    }
    