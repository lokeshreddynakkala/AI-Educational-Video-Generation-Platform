# Project B10 - Educational Video Generation Platform

## What it does
AI-powered platform that generates complete educational videos from just a topic.
Users get a full MP4 video with professional slides, AI voice narration, in ~60 seconds.
No camera, no GPU, no studio required.

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
venv\Scripts\activate
uvicorn main:app --reload

# Frontend  
cd frontend
npm run dev
```

Open http://localhost:5173

## Features Beyond Original Spec (Upgrades)
- Auto slide generation when user has no slides
- Duration selection: 2, 5, or 10 minute videos
- Multi-language script and voice support
- Subtitle burn-in option

## Architecture Decisions
- Groq over OpenAI: free tier, 300 tokens/sec, no credit card
- gTTS over ElevenLabs: no rate limits, no API key needed
- FFmpeg over cloud: no GPU cost, runs on any CPU/NPU
- python-pptx: fully local, no external service dependency
- Polling over WebSockets: simpler for reliability, works perfectly

## Pipeline Performance
- Script: ~15 seconds
- Slides: ~10 seconds  
- Voice: ~5 seconds
- Video: ~30 seconds
- Total: ~60 seconds
