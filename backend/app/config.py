"""
Configuration settings for the backend application.
"""

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """
    Application Settings
    """
    APP_NAME: str = "Backgraund Removal API"
    APP_VERSION: str = "1.0.0"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    #Cors Settings
    CORS_ORIGINS: List[str] = ["*"]

    #File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024 # 10MB

    #Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()