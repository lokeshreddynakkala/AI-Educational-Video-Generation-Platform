import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    HF_API_KEY = os.getenv("HF_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
    HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY", "")
    HEYGEN_AVATAR_ID = os.getenv("HEYGEN_AVATAR_ID", "")
    ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    )
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./project.db")
    
    # Storage
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
    OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")
    TEMP_DIR = os.getenv("TEMP_DIR", "./temp")
    FFMPEG_PATH = os.getenv(
        "FFMPEG_PATH",
        r"C:\ffmpeg\ffmpeg-8.1-essentials_build\bin\ffmpeg.exe"
    )


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_URL = "sqlite:///./test.db"


def get_config():
    """Get config based on environment"""
    env = os.getenv("ENVIRONMENT", "development")
    
    if env == "production":
        return ProductionConfig()
    elif env == "testing":
        return TestingConfig()
    else:
        return DevelopmentConfig()
