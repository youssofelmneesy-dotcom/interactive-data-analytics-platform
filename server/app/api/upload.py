"""
File upload endpoints.
"""
from fastapi import APIRouter, UploadFile, File

from app.services.upload_service import save_uploaded_file
from app.services.dataset_service import create_dataset

router = APIRouter()


@router.post("/")
async def upload_file(file: UploadFile = File(...)) -> dict:
    """
    Upload a CSV or Excel file.

    Args:
        file: Uploaded file from multipart form.

    Returns:
        Dataset metadata including ID, name, row count, and column count.
    """
    content = await file.read()
    metadata = save_uploaded_file(file.filename or "unknown", content)
    create_dataset(metadata)
    return metadata


