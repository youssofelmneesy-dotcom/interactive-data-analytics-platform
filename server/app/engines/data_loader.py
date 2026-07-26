"""
Data loading engine for parsing CSV and Excel files into pandas DataFrames.
"""
import io
import uuid
from pathlib import Path

import pandas as pd

from app.core.exceptions import BadRequestError

# Allowed file extensions
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

# Maximum file size in bytes (50 MB)
MAX_FILE_SIZE = 50 * 1024 * 1024


def validate_file(filename: str, content: bytes) -> None:
    """
    Validate uploaded file by extension and size.

    Args:
        filename: Original filename including extension.
        content: Raw file bytes.

    Raises:
        BadRequestError: If file extension or size is invalid.
    """
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise BadRequestError(
            f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    if len(content) > MAX_FILE_SIZE:
        raise BadRequestError(
            f"File exceeds maximum size of {MAX_FILE_SIZE // (1024 * 1024)} MB."
        )


def load_dataframe(content: bytes, filename: str) -> pd.DataFrame:
    """
    Parse raw file bytes into a pandas DataFrame.

    Args:
        content: Raw file bytes.
        filename: Original filename to determine parser.

    Returns:
        Parsed pandas DataFrame.

    Raises:
        BadRequestError: If parsing fails.
    """
    ext = Path(filename).suffix.lower()
    buffer = io.BytesIO(content)

    try:
        if ext == ".csv":
            return pd.read_csv(buffer)
        elif ext in {".xlsx", ".xls"}:
            return pd.read_excel(buffer)
    except Exception as exc:
        raise BadRequestError(f"Failed to parse file: {exc}") from exc

    raise BadRequestError(f"Unsupported file extension: {ext}")


def infer_column_types(df: pd.DataFrame) -> dict[str, str]:
    """
    Infer human-readable data types for each DataFrame column.

    Args:
        df: Input DataFrame.

    Returns:
        Mapping of column name to inferred type string.
    """
    types: dict[str, str] = {}
    for col in df.columns:
        dtype = df[col].dtype
        if pd.api.types.is_datetime64_any_dtype(dtype):
            types[str(col)] = "datetime"
        elif pd.api.types.is_integer_dtype(dtype):
            types[str(col)] = "integer"
        elif pd.api.types.is_float_dtype(dtype):
            types[str(col)] = "float"
        elif pd.api.types.is_bool_dtype(dtype):
            types[str(col)] = "boolean"
        else:
            types[str(col)] = "string"
    return types


def generate_dataset_id() -> str:
    """Generate a unique dataset identifier."""
    return str(uuid.uuid4())

