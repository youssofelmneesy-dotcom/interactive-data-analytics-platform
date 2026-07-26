"""
Data quality detection and cleaning engine.

Provides functions to analyze dataset quality issues and apply
cleaning transformations to pandas DataFrames.
"""
from typing import Any

import pandas as pd
import numpy as np

from app.core.exceptions import BadRequestError


# ============================================================
# DETECTION FUNCTIONS
# ============================================================

def detect_missing_values(df: pd.DataFrame) -> dict[str, Any]:
    """
    Detect missing values per column including nulls, empty strings,
    and common placeholder patterns.

    Returns:
        Dictionary with per-column null counts and total null rows.
    """
    null_counts = df.isna().sum().to_dict()
    null_counts = {str(k): int(v) for k, v in null_counts.items()}

    # Detect empty strings and common placeholders in string columns
    placeholder_counts: dict[str, dict[str, int]] = {}
    for col in df.select_dtypes(include=["object", "string"]):
        col_str = str(col)
        placeholder_counts[col_str] = {}
        series = df[col].astype(str)
        empty_count = int((series == "").sum())
        if empty_count > 0:
            placeholder_counts[col_str]["empty_string"] = empty_count

    total_null_rows = int(df.isna().any(axis=1).sum())

    return {
        "nullCounts": null_counts,
        "placeholderCounts": placeholder_counts,
        "totalNullRows": total_null_rows,
        "totalRows": len(df),
    }


def detect_duplicate_rows(df: pd.DataFrame) -> dict[str, Any]:
    """
    Detect exact duplicate rows in the dataset.

    Returns:
        Dictionary with duplicate count and affected row indices.
    """
    duplicated = df.duplicated(keep=False)
    duplicate_mask = df.duplicated(keep="first")

    return {
        "duplicateRowCount": int(duplicate_mask.sum()),
        "totalDuplicateGroups": int(df[duplicated].drop_duplicates().shape[0]),
        "totalRows": len(df),
    }


def detect_column_types(df: pd.DataFrame) -> dict[str, str]:
    """
    Infer human-readable data types for each column.

    Returns:
        Mapping of column name to inferred type string.
    """
    types: dict[str, str] = {}
    for col in df.columns:
        dtype = df[col].dtype
        col_name = str(col)
        if pd.api.types.is_datetime64_any_dtype(dtype):
            types[col_name] = "datetime"
        elif pd.api.types.is_integer_dtype(dtype):
            types[col_name] = "integer"
        elif pd.api.types.is_float_dtype(dtype):
            types[col_name] = "float"
        elif pd.api.types.is_bool_dtype(dtype):
            types[col_name] = "boolean"
        else:
            types[col_name] = "string"
    return types


def detect_constant_columns(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Detect columns where all non-null values are identical.

    Returns:
        List of constant column information.
    """
    constant_columns = []
    for col in df.columns:
        series = df[col].dropna()
        if len(series) > 0 and series.nunique() == 1:
            constant_columns.append({
                "column": str(col),
                "value": series.iloc[0],
                "rowCount": len(series),
            })
    return constant_columns


def detect_high_null_columns(df: pd.DataFrame, threshold: float = 0.5) -> list[dict[str, Any]]:
    """
    Detect columns where null percentage exceeds the threshold.

    Args:
        df: Input DataFrame.
        threshold: Null fraction threshold (0.0 to 1.0).

    Returns:
        List of high-null column information.
    """
    high_null = []
    for col in df.columns:
        null_frac = df[col].isna().mean()
        if null_frac > threshold:
            high_null.append({
                "column": str(col),
                "nullCount": int(df[col].isna().sum()),
                "nullPercentage": round(float(null_frac * 100), 2),
                "totalRows": len(df),
            })
    return high_null


def detect_empty_rows(df: pd.DataFrame) -> dict[str, Any]:
    """
    Detect rows where all values are null or empty string.

    Returns:
        Dictionary with empty row count and percentage.
    """
    # Check for all-null rows
    all_null = df.isna().all(axis=1)

    # Check for rows where all string columns are empty strings
    string_cols = df.select_dtypes(include=["object", "string"]).columns
    if len(string_cols) > 0:
        empty_string_rows = (df[string_cols].astype(str) == "").all(axis=1)
        all_null = all_null | empty_string_rows

    empty_count = int(all_null.sum())
    return {
        "emptyRowCount": empty_count,
        "emptyRowPercentage": round(float(empty_count / len(df) * 100), 2) if len(df) > 0 else 0.0,
        "totalRows": len(df),
    }


# ============================================================
# CLEANING FUNCTIONS
# ============================================================

def remove_duplicates(df: pd.DataFrame, keep: str = "first") -> pd.DataFrame:
    """
    Remove duplicate rows from the DataFrame.

    Args:
        df: Input DataFrame.
        keep: Which duplicate to keep ("first", "last", False).

    Returns:
        DataFrame with duplicates removed.
    """
    return df.drop_duplicates(keep=keep).reset_index(drop=True)


def remove_empty_rows(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows where all values are null or empty string.

    Args:
        df: Input DataFrame.

    Returns:
        DataFrame with empty rows removed.
    """
    # Keep rows that are not all-null
    mask = ~df.isna().all(axis=1)

    # Also keep rows where not all string columns are empty
    string_cols = df.select_dtypes(include=["object", "string"]).columns
    if len(string_cols) > 0:
        not_all_empty = ~(df[string_cols].astype(str) == "").all(axis=1)
        mask = mask & not_all_empty

    return df[mask].reset_index(drop=True)


def fill_missing_mean(df: pd.DataFrame, column: str) -> pd.DataFrame:
    """
    Fill missing values in a numeric column with the column mean.

    Args:
        df: Input DataFrame.
        column: Target column name.

    Returns:
        DataFrame with missing values filled.

    Raises:
        BadRequestError: If column is not numeric.
    """
    if column not in df.columns:
        raise BadRequestError(f"Column '{column}' not found.")
    if not pd.api.types.is_numeric_dtype(df[column]):
        raise BadRequestError(f"Column '{column}' is not numeric. Cannot fill with mean.")

    df = df.copy()
    df[column] = df[column].fillna(df[column].mean())
    return df


def fill_missing_median(df: pd.DataFrame, column: str) -> pd.DataFrame:
    """
    Fill missing values in a numeric column with the column median.

    Args:
        df: Input DataFrame.
        column: Target column name.

    Returns:
        DataFrame with missing values filled.

    Raises:
        BadRequestError: If column is not numeric.
    """
    if column not in df.columns:
        raise BadRequestError(f"Column '{column}' not found.")
    if not pd.api.types.is_numeric_dtype(df[column]):
        raise BadRequestError(f"Column '{column}' is not numeric. Cannot fill with median.")

    df = df.copy()
    df[column] = df[column].fillna(df[column].median())
    return df


def fill_missing_mode(df: pd.DataFrame, column: str) -> pd.DataFrame:
    """
    Fill missing values in a column with the most frequent value.

    Args:
        df: Input DataFrame.
        column: Target column name.

    Returns:
        DataFrame with missing values filled.

    Raises:
        BadRequestError: If column not found or mode cannot be computed.
    """
    if column not in df.columns:
        raise BadRequestError(f"Column '{column}' not found.")

    mode_series = df[column].mode()
    if mode_series.empty:
        raise BadRequestError(f"Cannot compute mode for column '{column}'.")

    df = df.copy()
    df[column] = df[column].fillna(mode_series.iloc[0])
    return df


def fill_missing_constant(df: pd.DataFrame, column: str, value: Any) -> pd.DataFrame:
    """
    Fill missing values in a column with a constant value.

    Args:
        df: Input DataFrame.
        column: Target column name.
        value: Constant value to fill.

    Returns:
        DataFrame with missing values filled.

    Raises:
        BadRequestError: If column not found.
    """
    if column not in df.columns:
        raise BadRequestError(f"Column '{column}' not found.")

    df = df.copy()
    df[column] = df[column].fillna(value)
    return df


def drop_missing_rows(df: pd.DataFrame, column: str | None = None) -> pd.DataFrame:
    """
    Drop rows with missing values.

    Args:
        df: Input DataFrame.
        column: If specified, only drop rows missing this column.
                If None, drop rows with any missing value.

    Returns:
        DataFrame with missing rows dropped.
    """
    df = df.copy()
    if column:
        if column not in df.columns:
            raise BadRequestError(f"Column '{column}' not found.")
        return df.dropna(subset=[column]).reset_index(drop=True)
    return df.dropna().reset_index(drop=True)


def drop_missing_columns(df: pd.DataFrame, threshold: float = 0.5) -> pd.DataFrame:
    """
    Drop columns where null percentage exceeds the threshold.

    Args:
        df: Input DataFrame.
        threshold: Null fraction threshold (0.0 to 1.0).

    Returns:
        DataFrame with high-null columns dropped.
    """
    return df.dropna(axis=1, thresh=int(len(df) * (1 - threshold))).copy()


def rename_column(df: pd.DataFrame, old_name: str, new_name: str) -> pd.DataFrame:
    """
    Rename a column in the DataFrame.

    Args:
        df: Input DataFrame.
        old_name: Current column name.
        new_name: New column name.

    Returns:
        DataFrame with renamed column.

    Raises:
        BadRequestError: If old column not found or new name already exists.
    """
    if old_name not in df.columns:
        raise BadRequestError(f"Column '{old_name}' not found.")
    if new_name in df.columns and old_name != new_name:
        raise BadRequestError(f"Column '{new_name}' already exists.")

    df = df.copy()
    df.rename(columns={old_name: new_name}, inplace=True)
    return df


def change_column_type(df: pd.DataFrame, column: str, target_type: str) -> pd.DataFrame:
    """
    Change the data type of a column.

    Args:
        df: Input DataFrame.
        column: Target column name.
        target_type: Target type ("integer", "float", "string", "boolean", "datetime").

    Returns:
        DataFrame with converted column type.

    Raises:
        BadRequestError: If conversion fails.
    """
    if column not in df.columns:
        raise BadRequestError(f"Column '{column}' not found.")

    df = df.copy()
    try:
        if target_type == "integer":
            df[column] = pd.to_numeric(df[column], errors="coerce").astype("Int64")
        elif target_type == "float":
            df[column] = pd.to_numeric(df[column], errors="coerce")
        elif target_type == "string":
            df[column] = df[column].astype(str).replace("nan", pd.NA).replace("None", pd.NA)
        elif target_type == "boolean":
            df[column] = df[column].map({
                True: True, False: False,
                "true": True, "false": False,
                "yes": True, "no": False,
                "1": True, "0": False,
                1: True, 0: False,
            }).astype("boolean")
        elif target_type == "datetime":
            df[column] = pd.to_datetime(df[column], errors="coerce")
        else:
            raise BadRequestError(f"Unsupported target type: {target_type}")
    except Exception as exc:
        raise BadRequestError(f"Failed to convert column '{column}' to {target_type}: {exc}") from exc

    return df
