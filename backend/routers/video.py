from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from config import get_config
from pptx import Presentation
from pptx.util import Inches
import os
import uuid
import subprocess
import tempfile

router = APIRouter(prefix="/api/video", tags=["video"])

# Initialize config
config = get_config()

# FFmpeg path
FFMPEG_PATH = r"C:\ffmpeg\ffmpeg-8.1-essentials_build\bin\ffmpeg.exe"


class VideoRequest(BaseModel):
    voice_id: str
    slides_id: str
    add_subtitles: Optional[bool] = False
    project_title: Optional[str] = "Project Video"


class VideoResponse(BaseModel):
    video_id: str
    voice_id: str
    slides_id: str
    file_path: str
    file_name: str
    duration_secs: Optional[int] = None
    status: str


def extract_slides_as_images(pptx_path: str, output_dir: str) -> List[str]:
    """Extract slides from PPTX as PNG images"""
    try:
        prs = Presentation(pptx_path)
        image_paths = []
        
        for i, slide in enumerate(prs.slides):
            # Create image file path
            image_path = os.path.join(output_dir, f"slide_{i+1}.png")
            
            # Create image with slide content
            from PIL import Image, ImageDraw, ImageFont
            
            # Create a blank image with slide dimensions (16:9 aspect ratio)
            width, height = 1920, 1080
            img = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(img)
            
            # Try to load a font
            try:
                font_title = ImageFont.truetype("arial.ttf", 80)
                font_text = ImageFont.truetype("arial.ttf", 40)
            except:
                font_title = ImageFont.load_default()
                font_text = ImageFont.load_default()
            
            # Extract text from slide
            slide_text = []
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    slide_text.append(shape.text.strip())
            
            # Draw title (first text box, usually the title)
            y_position = 100
            if slide_text:
                # First text as title
                title = slide_text[0][:50]  # Limit title length
                draw.text((width//2, y_position), title, fill='black', anchor='mm', font=font_title)
                y_position += 150
                
                # Remaining text as bullet points
                for text in slide_text[1:]:
                    if y_position > height - 100:
                        break
                    # Wrap text
                    words = text.split()
                    line = ""
                    for word in words:
                        if draw.textlength(line + word, font=font_text) < width - 200:
                            line += word + " "
                        else:
                            draw.text((100, y_position), "• " + line.strip(), fill='black', font=font_text)
                            y_position += 60
                            line = word + " "
                            if y_position > height - 100:
                                break
                    if line.strip():
                        draw.text((100, y_position), "• " + line.strip(), fill='black', font=font_text)
                        y_position += 60
            
            # If no text found, add slide number
            if not slide_text:
                draw.text((width//2, height//2), f"Slide {i+1}", fill='black', anchor='mm', font=font_title)
            
            img.save(image_path)
            image_paths.append(image_path)
        
        return image_paths
        
    except Exception as e:
        raise Exception(f"Failed to extract slides: {str(e)}")


def create_video_clip(image_path: str, audio_path: str, output_path: str, duration: Optional[int] = None) -> bool:
    """Create a video clip from image and audio using FFmpeg"""
    try:
        cmd = [
            FFMPEG_PATH,
            '-loop', '1',
            '-i', image_path,
            '-i', audio_path,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-shortest',
            '-pix_fmt', 'yuv420p',
            '-t', str(duration) if duration else '10',  # Default 10 seconds if no duration
            '-y',  # Overwrite output
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg failed: {result.stderr}")
        
        return True
        
    except subprocess.TimeoutExpired:
        raise Exception("FFmpeg timed out")
    except Exception as e:
        raise Exception(f"Failed to create video clip: {str(e)}")


def concatenate_videos(clip_paths: List[str], output_path: str) -> bool:
    """Concatenate multiple video clips into one using FFmpeg"""
    try:
        # Create a temporary file list
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            for clip_path in clip_paths:
                # Use absolute path
                abs_path = os.path.abspath(clip_path)
                f.write(f"file '{abs_path}'\n")
            filelist_path = f.name
        
        cmd = [
            FFMPEG_PATH,
            '-f', 'concat',
            '-safe', '0',
            '-i', filelist_path,
            '-c', 'copy',
            '-y',
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        # Clean up filelist
        os.unlink(filelist_path)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg concat failed: {result.stderr}")
        
        return True
        
    except Exception as e:
        raise Exception(f"Failed to concatenate videos: {str(e)}")


@router.post("/generate", response_model=VideoResponse)
async def generate_video(request: VideoRequest):
    """Generate video from slides and voice audio"""
    try:
        # Create temp directory for processing
        temp_dir = os.path.join(config.TEMP_DIR, f"video_{uuid.uuid4().hex[:8]}")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Paths
        pptx_path = os.path.join(config.OUTPUT_DIR, f"{request.slides_id}.pptx")
        video_id = f"video_{uuid.uuid4().hex[:8]}"
        final_video_path = os.path.join(config.OUTPUT_DIR, f"{video_id}.mp4")
        
        # Check if PPTX exists
        if not os.path.exists(pptx_path):
            raise HTTPException(
                status_code=404,
                detail=f"PPTX file not found: {request.slides_id}.pptx"
            )
        
        # Extract slides as images
        print(f"Extracting slides from {pptx_path}...")
        slide_images = extract_slides_as_images(pptx_path, temp_dir)
        print(f"Extracted {len(slide_images)} slides")
        
        # Get audio files for this voice_id
        audio_files = []
        if os.path.exists(config.TEMP_DIR):
            for file in os.listdir(config.TEMP_DIR):
                if file.startswith(request.voice_id) and file.endswith('.mp3'):
                    audio_files.append(os.path.join(config.TEMP_DIR, file))
        
        if not audio_files:
            raise HTTPException(
                status_code=404,
                detail=f"No audio files found for voice_id: {request.voice_id}"
            )
        
        # Sort audio files by segment number
        audio_files.sort(key=lambda x: int(os.path.basename(x).split('_')[-1].split('.')[0]))
        
        print(f"Found {len(audio_files)} audio files")
        
        # Create video clips
        clip_paths = []
        total_duration = 0
        
        for i, (image_path, audio_path) in enumerate(zip(slide_images, audio_files)):
            clip_path = os.path.join(temp_dir, f"clip_{i+1}.mp4")
            
            # Estimate duration from audio file size (rough approximation)
            # MP3: ~10KB per second roughly
            audio_size = os.path.getsize(audio_path)
            estimated_duration = max(5, min(30, audio_size // 10000))  # 5-30 seconds
            
            print(f"Creating clip {i+1}: {os.path.basename(image_path)} + {os.path.basename(audio_path)}")
            create_video_clip(image_path, audio_path, clip_path, estimated_duration)
            clip_paths.append(clip_path)
            total_duration += estimated_duration
        
        # Concatenate all clips
        print(f"Concatenating {len(clip_paths)} clips...")
        concatenate_videos(clip_paths, final_video_path)
        
        # Clean up temp directory
        import shutil
        shutil.rmtree(temp_dir)
        
        # Get file size
        file_size = os.path.getsize(final_video_path)
        
        print(f"Video generated successfully: {final_video_path} ({file_size} bytes)")
        
        return VideoResponse(
            video_id=video_id,
            voice_id=request.voice_id,
            slides_id=request.slides_id,
            file_path=final_video_path,
            file_name=f"{video_id}.mp4",
            duration_secs=total_duration,
            status="completed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Video generation failed: {str(e)}"
        )


@router.get("/video/{video_id}")
async def get_video(video_id: str):
    """Get video metadata by ID"""
    try:
        video_path = os.path.join(config.OUTPUT_DIR, f"{video_id}.mp4")
        
        if not os.path.exists(video_path):
            raise HTTPException(
                status_code=404,
                detail=f"Video not found: {video_id}"
            )
        
        file_size = os.path.getsize(video_path)
        
        return {
            "video_id": video_id,
            "file_path": video_path,
            "file_name": f"{video_id}.mp4",
            "file_size": file_size,
            "status": "completed",
            "exists": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve video: {str(e)}"
        )


@router.get("/video/{video_id}/status")
async def get_video_status(video_id: str):
    """Get video processing status"""
    try:
        # TODO: Get status from database/processing service
        return {
            "video_id": video_id,
            "status": "processing",
            "progress": 50
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Video not found")


@router.delete("/video/{video_id}")
async def delete_video(video_id: str):
    """Delete a video"""
    try:
        # TODO: Delete video from database and storage
        return {"message": f"Video {video_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{filename}")
async def download_video(filename: str):
    """Download a video file"""
    try:
        # Validate filename format
        if not filename.endswith('.mp4') or not filename.startswith('video_'):
            raise HTTPException(status_code=400, detail="Invalid filename format")
        
        file_path = os.path.join(config.OUTPUT_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Video file not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='video/mp4'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
