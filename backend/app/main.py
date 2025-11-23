"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from app.api.endpoints import router
from app.core.middleware import configure_middleware
from app.core.logging import setup_logging
from app.config import settings

# Setup logging first
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Remove backgrounds from images using AI",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup middleware (CORS, etc.)
configure_middleware(app)

# Include our routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )