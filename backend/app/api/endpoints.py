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


@router.get("/ready")
async def readiness_check():
    """Readiness probe: returns 200 when the rembg session has been initialized.

    This helps load balancers or the frontend detect whether the heavy model
    is ready to serve requests. If the session hasn't been created yet we
    return 503 so callers can retry or wait.
    """
    try:
        from app.core.background_remover import get_rembg_session

        # `get_rembg_session` is lru_cached; check cache size to infer readiness
        info = get_rembg_session.cache_info()
        if info.currsize > 0:
            return JSONResponse(status_code=status.HTTP_200_OK, content={"ready": True})
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"ready": False})
    except Exception:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"ready": False})


@router.post("/warm")
async def warm_model():
    """Trigger asynchronous warming of the rembg session.

    This endpoint starts the cached session initialization in a background
    thread and returns 202 Accepted immediately. Callers should poll
    `/ready` to detect when warming is complete.
    """
    import asyncio

    try:
        from app.core.background_remover import get_rembg_session

        # If already warmed, return 200
        if get_rembg_session.cache_info().currsize > 0:
            return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": "Already warmed"})

        # Start warming in background thread and return immediately
        asyncio.create_task(asyncio.to_thread(get_rembg_session))
        return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content={"detail": "Warming started"})
    except Exception as e:
        logger.error(f"Warm trigger failed: {str(e)}")
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Failed to start warming"})

@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """Remove background from uploaded image"""
    # If the heavy model session hasn't been initialized yet, return 503
    try:
        from app.core.background_remover import get_rembg_session

        if get_rembg_session.cache_info().currsize == 0:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"detail": "Model not ready. Please retry shortly."}
            )
    except Exception:
        # If readiness check fails for any reason, fall back to allowing
        # processing to proceed so we don't block legitimate requests.
        pass

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