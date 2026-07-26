"""
Upload service for handling file storage and initial parsing.
"""
from pathlib import Path

from app.core.exceptions import InternalServerError
from app.engines.data_loader import (
    generate_dataset_id,
    load_dataframe,
    validate_file,
    infer_column_types,
)
from app.engines.statistics_engine import compute_dataset_summary

# Base upload directory
UPLOAD_DIR = Path("uploads")


def save_uploaded_file(filename: str, content: bytes) -> dict:
    """
    Validate, parse, and store an uploaded file.

    Args:
        filename: Original uploaded filename.
        content: Raw file bytes.

    Returns:
        Dictionary with dataset metadata.

    Raises:
        InternalServerError: If file storage fails.
    """
    validate_file(filename, content)

    dataset_id = generate_dataset_id()
    dataset_dir = UPLOAD_DIR / dataset_id
    dataset_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(filename).suffix.lower()
    stored_name = f"data{ext}"
    file_path = dataset_dir / stored_name

    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except OSError as exc:
        raise InternalServerError(f"Failed to save file: {exc}") from exc

    # Parse DataFrame for metadata
    df = load_dataframe(content, filename)
    summary = compute_dataset_summary(df)
    column_types = infer_column_types(df)
    file_size = len(content)

    return {
        "id": dataset_id,
        "name": filename,
        "fileName": filename,
        "fileType": Path(filename).suffix.lower().replace(".", ""),
        "fileSize": file_size,
        "filePath": str(file_path),
        "rowCount": summary["rowCount"],
        "columnCount": summary["columnCount"],
        "memoryBytes": summary["memoryBytes"],
        "columns": summary["columns"],
        "columnTypes": column_types,
        "createdAt": None,  # Will be set by database
        "updatedAt": None,
    }
    