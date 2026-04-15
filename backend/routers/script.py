from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from groq import Groq
import os
from config import get_config
import uuid

router = APIRouter(prefix="/api/script", tags=["script"])

# Initialize Groq client
config = get_config()
client = Groq(api_key=config.GROQ_API_KEY)

# Duration to word count mapping
DURATION_MAPPING = {
    "short": 260,      # 2 minutes
    "medium": 650,     # 5 minutes
    "long": 1300       # 10 minutes
}


class ScriptRequest(BaseModel):
    topic: str
    duration: str  # "short", "medium", or "long"
    language: Optional[str] = "English"
    audience: Optional[str] = "General"
    extra_notes: Optional[str] = ""


class ScriptSegment(BaseModel):
    slide_number: int
    content: str
    word_count: int


class ScriptResponse(BaseModel):
    script_id: str
    topic: str
    duration: str
    content: str
    word_count: int
    segments: List[ScriptSegment]


def split_script_into_segments(content: str, target_words_per_segment: int = 80) -> List[ScriptSegment]:
    """Split script content into segments for slides"""
    sentences = content.split(". ")
    segments = []
    current_segment = ""
    current_word_count = 0
    slide_number = 1
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        sentence_words = len(sentence.split())
        
        # If adding this sentence would exceed target, start new segment
        if current_word_count + sentence_words > target_words_per_segment and current_segment:
            segments.append(ScriptSegment(
                slide_number=slide_number,
                content=current_segment.strip() + ".",
                word_count=current_word_count
            ))
            slide_number += 1
            current_segment = ""
            current_word_count = 0
        
        current_segment += sentence + ". "
        current_word_count += sentence_words
    
    # Add remaining content
    if current_segment.strip():
        segments.append(ScriptSegment(
            slide_number=slide_number,
            content=current_segment.strip(),
            word_count=current_word_count
        ))
    
    return segments


@router.post("/generate", response_model=ScriptResponse)
async def generate_script(request: ScriptRequest):
    """Generate a script from topic using Groq API"""
    try:
        # Validate duration
        if request.duration not in DURATION_MAPPING:
            raise HTTPException(
                status_code=400,
                detail=f"Duration must be 'short', 'medium', or 'long'. Got: {request.duration}"
            )
        
        target_words = DURATION_MAPPING[request.duration]
        
        # Build the prompt
        prompt = f"""Create a comprehensive, engaging script for a video presentation with the following requirements:

Topic: {request.topic}
Target Word Count: {target_words} words
Duration: {request.duration} (approximately {target_words // 130} minutes)
Language: {request.language}
Audience: {request.audience}
{"Additional Notes: " + request.extra_notes if request.extra_notes else ""}

Important guidelines:
1. Write in a clear, engaging, and professional tone suitable for video narration
2. Keep sentences concise and easy to follow (15-20 words per sentence)
3. Use natural transitions between ideas
4. Make it engaging and maintain viewer interest
5. Aim for approximately {target_words} words total

Please provide only the script content, without any additional explanations or meta-commentary."""

        # Call Groq API with llama3-70b model
        message = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Using available Groq model
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # Extract the generated script
        script_content = message.choices[0].message.content.strip()
        word_count = len(script_content.split())
        
        # Split into segments for slides
        segments = split_script_into_segments(script_content)
        
        # Generate unique script ID
        script_id = f"script_{uuid.uuid4().hex[:8]}"
        
        return ScriptResponse(
            script_id=script_id,
            topic=request.topic,
            duration=request.duration,
            content=script_content,
            word_count=word_count,
            segments=segments
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)}")


@router.get("/scripts/{script_id}", response_model=ScriptResponse)
async def get_script(script_id: str):
    """Get a specific script by ID"""
    try:
        # TODO: Fetch script from database
        return {
            "script_id": script_id,
            "topic": "Sample Topic",
            "duration": "medium",
            "content": "Script content...",
            "word_count": 150,
            "segments": []
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Script not found")


@router.put("/scripts/{script_id}")
async def update_script(script_id: str, request: ScriptRequest):
    """Update an existing script"""
    try:
        # TODO: Update script in database
        return {"message": f"Script {script_id} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/scripts/{script_id}")
async def delete_script(script_id: str):
    """Delete a script"""
    try:
        # TODO: Delete script from database
        return {"message": f"Script {script_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
