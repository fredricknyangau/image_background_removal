"""
Input validation utilities
"""

from fastapi import HTTPException, status
from typing import Optional
from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

def validate_file_size(file_size: int) -> None:
    """Validate the size of the uploaded file"""
    if file_size > settings.MAX_FILE_SIZE:
        max_size_mb = settings.MAX_FILE_SIZE / 1024 / 1024
        logger.warning(f"File size {file_size} exceeds maximum allowed size of {settings.MAX_FILE_SIZE}")
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the maximum allowed size of {max_size_mb} MB."
        )
    
def validate_content_type(content_type: Optional[str], filename: str) -> None:
    """Validate file content type"""
    allowed_types = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"]
    }
    
    if not content_type or content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Allowed: JPG, PNG, WEBP"
        )


def validate_filename(filename: Optional[str]) -> None:
    """Validate filename exists"""
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )


def validate_file_content(file_bytes: bytes) -> None:
    """Validate file is not empty"""
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded"
        )    