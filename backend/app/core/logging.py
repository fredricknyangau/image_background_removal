"""
Logging configuration
"""

import logging
from app.config import settings

def setup_logging():
    """Configure application settings"""
    logging.basicConfig(
      level=getattr(logging, settings.LOG_LEVEL),
      format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
      datefmt='%Y-%m-%d %H:%M:%S' 
    )

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance"""
    return logging.getLogger(name)