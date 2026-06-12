# EduVideo Studio - Educational Video Generation Platform

## What it does
AI-powered platform that helps teachers and students create educational videos from a topic, script, or notes.
The project supports both a `no-face` presentation flow and an `avatar` presentation flow in MVP form.
Users can create a project, generate or edit scripts, sync slides to script sections, create narration, preview the output, render a final video, and generate a shareable result.

## Tech Stack
- Backend: FastAPI (Python)
- Frontend: React + Vite
- AI Script: Groq API - LLaMA3 (free)
- Voice: gTTS - Google Text to Speech (free)
- Slides: python-pptx (local, free)
- Video: FFmpeg H.264/AAC (CPU, no GPU needed)

## How to Run
```bash
# Backend
cd backend
pip install -r requirements.txt
venv\Scripts\activate
uvicorn main:app --reload

# Frontend  
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Deployment

### Frontend
- Deploy the `frontend` folder to Vercel
- Add:
  `VITE_API_BASE_URL=https://your-backend-domain/api`
  `VITE_API_ORIGIN=https://your-backend-domain`
- A sample config is included in [frontend/vercel.json](/abs/path/c:/Users/lokes/OneDrive/Desktop/WhiteScholar/Gen ai/project-b10/frontend/vercel.json)

### Backend
- Deploy the `backend` folder to Render
- A sample config is included in [backend/render.yaml](/abs/path/c:/Users/lokes/OneDrive/Desktop/WhiteScholar/Gen ai/project-b10/backend/render.yaml)
- Set backend environment variables:
  `GROQ_API_KEY`
  `HEYGEN_API_KEY`
  `HEYGEN_AVATAR_ID`
  `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`
  `FFMPEG_PATH=/usr/bin/ffmpeg` or the path available in your runtime

### Public Submission Link
- Use your frontend deployment URL as the final public submission link
- Example:
  `https://your-project.vercel.app`

### Avatar Upgrade Path
- The current avatar mode is still a local MVP presenter render
- The backend config now includes `HEYGEN_API_KEY` and `HEYGEN_AVATAR_ID`
- That gives you a clean next step to replace the local avatar renderer with a realistic API-based avatar workflow

## Core Workflow
- Create a video project with topic, audience, creator details, and delivery settings
- Choose `no-face` mode or `avatar` mode
- Generate or edit a script
- Sync script segments into slides or enter slides manually
- Generate narration audio
- Preview the video before final rendering
- Submit the render job and track progress
- Download the output or generate a shareable link

## Implementation Status

### Completed Features
- Multi-step project creation wizard for setup, script, slides, voice, and rendering
- Script generation and segmentation API
- No-face video generation pipeline using slides and AI narration
- Avatar-mode MVP with presenter customization controls
- Avatar customization panel with presenter name, appearance, style, voice type, and speaking pace
- Slide-to-script synchronization interface
- Manual slide entry and AI-assisted slide generation
- Voice synthesis pipeline
- Video preview before final rendering
- Render progress tracking with asynchronous job polling
- Downloadable final video output
- Shareable video link generation
- Local access control with `public`, `private`, and `institution-only` modes
- Local video storage and delivery API
- Creator metadata support for teacher/student workflows

### Partially Implemented Features
- Video library is supported at backend storage and API level, but frontend grouping by creator can still be improved
- Multiple voice and language options are supported in UI and request structure, but backend voice generation is still based on a simple gTTS pipeline
- Slide workflow supports sync and manual entry, but direct upload of external slide decks is not yet added
- Submit-as-deliverable is supported through share links and access control, but there is no separate submission workflow screen

### MVP / Simplified Engineering Choices
- Async rendering is implemented using FastAPI background tasks instead of a production queue like Celery or Redis
- Avatar rendering is implemented as a lightweight local presenter-style visual overlay, not a GPU digital-human pipeline
- Storage and delivery are implemented locally through FastAPI static file serving instead of CDN-backed cloud storage
- Share and access control are managed through local metadata and access codes instead of a full authentication system

### Not Yet Implemented as Production Infrastructure
- Real GPU avatar rendering pipeline
- Distributed render queue
- Cloud storage with CDN delivery
- Persistent database-backed multi-user access control
- Full institutional authentication and authorization

## Creative Enhancements Added
- Manual slide entry option in addition to script-based generation
- Slide-to-script sync editor for better presentation control
- Guided preview-before-render workflow
- Share-link generation with access level and access code support
- Creator metadata for teacher and student use cases

## Architecture Decisions
- Groq over OpenAI: free tier, 300 tokens/sec, no credit card
- gTTS over ElevenLabs: no rate limits, no API key needed
- FFmpeg over cloud: no GPU cost, runs on any CPU/NPU
- python-pptx: fully local, no external service dependency
- Polling over WebSockets: simpler for reliability, works perfectly

## Project Justification
This project is built as a working MVP for an educational video generation platform.
The main user-facing workflow is implemented end to end, while infrastructure-heavy production features such as GPU avatar rendering, distributed queueing, and CDN-backed delivery are represented through simplified local implementations.
This keeps the project functional, explainable, and realistic for an internship-level system design and development scope.

## Pipeline Performance
- Script: ~15 seconds
- Slides: ~10 seconds  
- Voice: ~5 seconds
- Video: ~30 seconds
- Total: ~60 seconds
