"""
Custom HTTP exceptions for the application.
"""
from fastapi import HTTPException, status


class BadRequestError(HTTPException):
    """Raised when the request contains invalid data."""

    def __init__(self, detail: str = "Bad request") -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class NotFoundError(HTTPException):
    """Raised when a requested resource is not found."""

    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InternalServerError(HTTPException):
    """Raised when an unexpected server error occurs."""

    def __init__(self, detail: str = "Internal server error") -> None:
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)
        
        