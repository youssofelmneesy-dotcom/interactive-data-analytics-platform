"""
Statistics engine for computing column-level descriptive statistics.
"""
from typing import Any

import pandas as pd

from app.core.exceptions import BadRequestError


def compute_column_stats(df: pd.DataFrame, column: str) -> dict[str, Any]:
    """
    Compute descriptive statistics for a single column.

    Args:
        df: Input DataFrame.
        column: Column name to analyze.

    Returns:
        Dictionary with statistics fields.

    Raises:
        BadRequestError: If column does not exist.
    """
    if column not in df.columns:
        raise BadRequestError(f"Column '{column}' not found in dataset.")

    series = df[column]
    dtype = series.dtype

    stats: dict[str, Any] = {
        "name": column,
        "type": str(dtype),
        "nullCount": int(series.isna().sum()),
        "nullPercentage": round(float(series.isna().mean() * 100), 2),
        "uniqueCount": int(series.nunique(dropna=False)),
        "totalRows": len(series),
    }

    if pd.api.types.is_numeric_dtype(dtype):
        stats["min"] = _safe_float(series.min())
        stats["max"] = _safe_float(series.max())
        stats["mean"] = _safe_float(series.mean())
        stats["median"] = _safe_float(series.median())
        stats["std"] = _safe_float(series.std())
    elif pd.api.types.is_datetime64_any_dtype(dtype):
        stats["min"] = str(series.min()) if pd.notna(series.min()) else None
        stats["max"] = str(series.max()) if pd.notna(series.max()) else None
    else:
        stats["mostFrequent"] = str(series.mode().iloc[0]) if not series.mode().empty else None

    return stats


def compute_all_stats(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Compute statistics for every column in the DataFrame.

    Args:
        df: Input DataFrame.

    Returns:
        List of column statistics dictionaries.
    """
    return [compute_column_stats(df, col) for col in df.columns]


def compute_dataset_summary(df: pd.DataFrame) -> dict[str, Any]:
    """
    Compute high-level dataset summary.

    Args:
        df: Input DataFrame.

    Returns:
        Dictionary with row count, column count, and memory usage.
    """
    return {
        "rowCount": len(df),
        "columnCount": len(df.columns),
        "memoryBytes": int(df.memory_usage(deep=True).sum()),
        "columns": list(df.columns),
    }


def _safe_float(value) -> float | None:
    """Safely convert a value to float, returning None on failure."""
    try:
        return float(value) if pd.notna(value) else None
    except (TypeError, ValueError):
        return None
    
    