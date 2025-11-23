"""
API endpoint definitions
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import Response, JSONResponse
from datetime import datetime
from app.services.image_processor import ImageProcessor
from app.utils.validators import (
    validate_file_size,
    validate_content_type,
    validate_filename,
    validate_file_content
)
from app.core.logging import get_logger
from app.config import settings

logger = get_logger(__name__)
router = APIRouter()

@router.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "endpoints": {
            "health": "/health",
            "remove_background": "/remove-background (POST)",
            "docs": "/docs"
        }
    }

@router.get("/health")
async def health_check():
    """Check if service is running"""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "service": settings.APP_NAME,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """Remove background from uploaded image"""
    
    start_time = datetime.utcnow()
    
    # Log the request
    logger.info(f"Request: {file.filename}, {file.content_type}")
    
    try:
        # Step 1: Validate filename
        validate_filename(file.filename)
        
        # Step 2: Validate content type
        validate_content_type(file.content_type, file.filename)
        
        # Step 3: Read file
        image_bytes = await file.read()
        
        # Step 4: Validate size
        validate_file_size(len(image_bytes))
        
        # Step 5: Validate content
        validate_file_content(image_bytes)
        
        # Step 6: Process image
        processed_image = ImageProcessor.process(image_bytes)
        
        # Calculate how long it took
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Completed in {processing_time:.2f}s")
        
        # Return the processed image
        return Response(
            content=processed_image,
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="removed_{file.filename}"',
                "X-Processing-Time": str(processing_time)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )
    finally:
        await file.close()