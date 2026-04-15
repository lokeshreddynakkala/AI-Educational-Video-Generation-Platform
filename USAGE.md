# How to Use EduVideo Platform (Project B10)

## Before You Start
Make sure both servers are running:

Terminal 1 (Backend):
  cd backend
  venv\Scripts\activate
  uvicorn main:app --reload
  → Backend runs at http://localhost:8000

Terminal 2 (Frontend):
  cd frontend
  npm run dev
  → Frontend runs at http://localhost:5173

Open http://localhost:5173 in your browser.

---

## Step-by-Step Guide

### Step 1 — Dashboard
- You land on the home page
- Click the "Create New Video" button
- This opens the 5-step wizard

### Step 2 — Setup (Wizard Step 1)
Fill in these fields:
  - Topic: What your video is about
    Example: "Introduction to Python Programming"
  - Mode: Choose No-Face (slides + voice only)
  - Duration: Short (2 min) / Medium (5 min) / Long (10 min)
  - Language: English, Hindi, Telugu, French, etc.
  - Audience: Students / Beginners / Professionals
  - Extra Notes: Any special instructions (optional)
Click "Next"

### Step 3 — Script (Wizard Step 2)
- Click "Generate Script with AI"
- Wait 10-15 seconds
- A full lecture script appears automatically
- You can edit the script if you want
- Click "Next"

### Step 4 — Slides (Wizard Step 3)
Two options:
  Option A - No slides? Click "Generate Slides"
    → AI creates a professional PowerPoint automatically
    → Choose a theme: Professional / Dark / Colorful / Minimal
  Option B - Have slides? Click "Upload My Slides"
    → Upload your .pptx or .pdf file
Click "Next"

### Step 5 — Voice (Wizard Step 4)
- Choose voice style
- Set speaking pace (slow / normal / fast)
- Toggle subtitles ON or OFF
- Click "Generate Voice Narration"
- Wait 5-10 seconds per segment
- Audio is created for each slide
Click "Next"

### Step 6 — Render (Wizard Step 5)
- Click "Render Video"
- Watch the progress bar: Slides → Audio → Merge → Subtitles
- Takes about 30 seconds
- When done, two buttons appear:
    ⬇️ Download MP4 — saves video to your computer
    🔗 Copy Share Link — copies the download URL

### Step 7 — Your Video
- Open the downloaded .mp4 file in any video player
- It contains: slides as visuals + AI voice narration + subtitles (if enabled)
- Share it, submit it, or upload it anywhere

---

## API Testing (for developers)
Open http://localhost:8000/docs
This shows all API endpoints with interactive testing.
You can test each endpoint directly from the browser.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Error connecting to backend" | Start backend: uvicorn main:app --reload |
| Script not generating | Check GROQ_API_KEY in backend/.env |
| Voice slow or failing | gTTS needs internet connection |
| Video not rendering | Check FFmpeg is installed: ffmpeg -version |
| Frontend blank page | Run: cd frontend && npm run dev |

---