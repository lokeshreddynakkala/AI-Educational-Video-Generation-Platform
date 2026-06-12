from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import routers
from routers import script, slides, voice, video, subtitle
from config import get_config

# Initialize config
config = get_config()

# Create FastAPI app
app = FastAPI(
    title="EduVideo Studio API",
    description="Video generation API with AI-powered script, slides, voice, and video processing",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in config.ALLOWED_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(script.router)
app.include_router(slides.router)
app.include_router(voice.router)
app.include_router(video.router)
app.include_router(subtitle.router)

# Create directories if they don't exist
os.makedirs(config.UPLOAD_DIR, exist_ok=True)
os.makedirs(config.OUTPUT_DIR, exist_ok=True)
os.makedirs(config.TEMP_DIR, exist_ok=True)

# These mounts let the frontend open generated files during preview and delivery.
app.mount("/outputs", StaticFiles(directory=config.OUTPUT_DIR), name="outputs")
app.mount("/temp", StaticFiles(directory=config.TEMP_DIR), name="temp")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to EduVideo Studio API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/hello")
def hello():
    return {"message": "Hello from EduVideo Studio API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
