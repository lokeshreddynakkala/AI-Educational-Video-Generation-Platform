from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from groq import Groq
from config import get_config
import re
import uuid

router = APIRouter(prefix="/api/script", tags=["script"])

config = get_config()


def get_groq_client():
    """Create the Groq client only when we actually need it."""
    if not config.GROQ_API_KEY:
        return None

    try:
        return Groq(api_key=config.GROQ_API_KEY)
    except Exception as error:
        print(f"Groq client setup failed, using fallback script generation: {str(error)}")
        return None

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


def clean_narration_script(content: str) -> str:
    """Remove stage directions and labels so TTS gets clean narration text."""
    cleaned = content

    # Remove bracketed stage directions like [Intro Music: ...] or [Slide: ...]
    cleaned = re.sub(r"\[[^\]]*\]", " ", cleaned)

    # Remove common speaker labels that make speech sound unnatural.
    cleaned = re.sub(r"\bNarrator\s*:\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bVoiceover\s*:\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bSlide\s*\d+\s*:\s*", "", cleaned, flags=re.IGNORECASE)

    # Compress extra whitespace left behind after cleanup.
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


def build_fallback_script(request: ScriptRequest, target_words: int) -> str:
    """Create a simple local script when the AI provider is unavailable."""
    topic = request.topic.strip()
    audience = request.audience or "General"
    language = request.language or "English"
    extra_notes = request.extra_notes.strip() if request.extra_notes else ""

    sections = [
        f"Welcome to this {language} lesson on {topic}.",
        f"This video is designed for {audience} learners and will explain the topic in a simple step-by-step way.",
        f"First, let us understand what {topic} means and why it matters in real learning situations.",
        f"Next, we will look at the main ideas, important terms, and practical examples connected to {topic}.",
        f"As we move forward, focus on the key points because they help build a strong conceptual foundation.",
        f"After that, we will connect the topic to real use cases, classroom applications, or project work.",
        f"Finally, we will summarize the important ideas and review what should be remembered from this lesson on {topic}."
    ]

    if extra_notes:
        sections.insert(
            5,
            f"Keep this additional instruction in mind while presenting the lesson: {extra_notes}."
        )

    script = " ".join(sections)

    while len(script.split()) < target_words:
        script += (
            f" Remember that {topic} becomes easier to understand when you break it into small ideas, "
            f"review examples, and connect the concept to practical situations."
        )

    return script


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
6. Do not include stage directions, timestamps, speaker labels, slide labels, or music cues
7. Do not write text like [Intro Music], [Slide: ...], Narrator:, Voiceover:, or timestamps
8. Return plain spoken narration only

Please provide only the script content, without any additional explanations or meta-commentary."""

        script_content = ""

        client = get_groq_client()

        if client:
            try:
                message = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    max_tokens=2048,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                )
                script_content = message.choices[0].message.content.strip()
            except Exception as groq_error:
                print(f"Groq script generation failed, using fallback: {str(groq_error)}")

        if not script_content:
            script_content = build_fallback_script(request, target_words)

        script_content = clean_narration_script(script_content)

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
        
    except HTTPException:
        raise
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
