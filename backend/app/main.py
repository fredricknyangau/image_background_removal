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

# Warm heavy model/session in background to avoid blocking first request
@app.on_event("startup")
async def warm_model_session():
    """Start warming the rembg session in a background task so the
    model download or initialization doesn't block user requests and
    cause upstream proxies to return 502 or drop CORS headers.
    """
    import asyncio

    try:
        # Import locally to avoid heavy imports at module import time
        from app.core.background_remover import get_rembg_session

        # Run the synchronous get_rembg_session in a thread so startup
        # doesn't block the event loop. Use create_task so it runs in
        # background while the server is already accepting connections.
        asyncio.create_task(asyncio.to_thread(get_rembg_session))
    except Exception:
        # If warming fails, we don't want to prevent the app from starting;
        # the lazy import still allows on-demand initialization later.
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )