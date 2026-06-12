from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from config import get_config
from gtts import gTTS
import os
import uuid

router = APIRouter(prefix="/api/voice", tags=["voice"])

# Initialize config
config = get_config()


class VoiceSegment(BaseModel):
    slide_number: int
    text: str
    duration_secs: Optional[int] = None


class VoiceSynthesizeRequest(BaseModel):
    segments: List[VoiceSegment]
    language: Optional[str] = "English"
    speaker: Optional[str] = "default"
    pace: Optional[str] = "normal"


class VoiceAudioFile(BaseModel):
    slide_number: int
    file_path: str
    file_name: str
    duration_secs: Optional[int] = None


class VoiceSynthesizeResponse(BaseModel):
    voice_id: str
    total_segments: int
    audio_files: List[VoiceAudioFile]
    temp_dir: str


def synthesize_text_to_speech(text: str, file_path: str) -> bool:
    """Synthesize text to speech using gTTS and save a single MP3 file."""
    try:
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(file_path)
        return True
    except Exception as e:
        print(f"Error synthesizing speech: {str(e)}")
        return False


@router.post("/synthesize-all", response_model=VoiceSynthesizeResponse)
async def synthesize_all(request: VoiceSynthesizeRequest):
    """
    Synthesize each script segment to an MP3 file with gTTS.
    """
    try:
        if not request.segments:
            raise HTTPException(
                status_code=400,
                detail="segments cannot be empty"
            )
        
        # Create temp directory if it doesn't exist
        temp_dir = config.TEMP_DIR
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate unique voice ID
        voice_id = f"voice_{uuid.uuid4().hex[:8]}"
        
        audio_files = []
        
        # Process each segment
        for segment in request.segments:
            print(f"Synthesizing segment {segment.slide_number}: {segment.text[:50]}...")
            
            try:
                file_name_mp3 = f"{voice_id}_segment_{segment.slide_number}.mp3"
                file_path_mp3 = os.path.join(temp_dir, file_name_mp3)
                success = synthesize_text_to_speech(segment.text, file_path_mp3)
                
                if not success or not os.path.exists(file_path_mp3):
                    raise Exception(f"Failed to create audio file for segment {segment.slide_number}")
                
                print(f"✓ Saved segment {segment.slide_number}: {file_name_mp3}")
                
                audio_files.append(
                    VoiceAudioFile(
                        slide_number=segment.slide_number,
                        file_path=f"temp/{file_name_mp3}",
                        file_name=file_name_mp3,
                        duration_secs=segment.duration_secs
                    )
                )
                
            except Exception as segment_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to synthesize segment {segment.slide_number}: {str(segment_error)}"
                )
        
        # Verify all files were created
        if not audio_files:
            raise Exception("No audio files were generated")
        
        return VoiceSynthesizeResponse(
            voice_id=voice_id,
            total_segments=len(request.segments),
            audio_files=audio_files,
            temp_dir=temp_dir
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Voice synthesis failed: {str(e)}"
        )


@router.get("/voice/{voice_id}")
async def get_voice(voice_id: str):
    """Get voice audio metadata by ID"""
    try:
        temp_dir = config.TEMP_DIR
        
        audio_files = []
        if os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                if file.startswith(voice_id) and file.endswith('.mp3'):
                    audio_files.append({
                        "file_name": file,
                        "file_path": os.path.join(temp_dir, file),
                        "file_size": os.path.getsize(os.path.join(temp_dir, file))
                    })
        
        if not audio_files:
            raise HTTPException(
                status_code=404,
                detail=f"Voice ID {voice_id} not found"
            )
        
        return {
            "voice_id": voice_id,
            "total_segments": len(audio_files),
            "audio_files": sorted(audio_files, key=lambda x: x["file_name"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve voice: {str(e)}"
        )
