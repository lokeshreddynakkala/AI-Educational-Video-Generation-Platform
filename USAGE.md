# How to Use EduVideo Platform

## Before You Start
Make sure both servers are running.

Terminal 1: Backend
```powershell
cd "c:\Users\lokes\OneDrive\Desktop\WhiteScholar\Gen ai\project-b10\backend"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

Terminal 2: Frontend
```powershell
cd "c:\Users\lokes\OneDrive\Desktop\WhiteScholar\Gen ai\project-b10\frontend"
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

Open `http://localhost:5173` in your browser.

## Step-by-Step Guide

### Step 1 - Dashboard
- Open the frontend and land on the dashboard.
- Click `Create New Video` or open `Create Project`.
- This starts the guided wizard flow.

### Step 2 - Create Project
Fill in the basic project details:
- Project name
- Video topic
- Duration
- Language
- Creator name
- Creator role: teacher or student
- Institution
- Audience
- Extra notes

Click `Create Project and Open Wizard`.

### Step 3 - Setup
In the setup step, configure the production options:
- Choose presentation mode:
  `No-Face Mode` for slide-based videos
  `Avatar Mode` for presenter-style videos
- Set access control:
  `Public`, `Private`, or `Institution Only`
- Enter access code if needed
- Set resolution, format, FPS, and subtitle option
- Choose voice type and speaking pace

If you select `Avatar Mode`, you can also customize:
- Presenter name
- Avatar appearance
- Avatar style

Click `Next: Script Generation`.

### Step 4 - Script
- Click `Generate Script with AI` to create a script from your topic.
- Wait for the script to be generated.
- Edit the script if you want.
- The backend automatically segments the script for slide creation.

Click `Next: Slides`.

### Step 5 - Slides
You have two options in the slides step.

Option 1: Script Sync
- Use the `Script Sync` tab.
- Set the number of slides.
- Review each script segment.
- Edit the slide title and slide content for each segment.
- Click `Create From Script`.

Option 2: Manual Slide Entry
- Use the `Enter Slides Manually` tab.
- Add or remove slides.
- Enter the title and content for each slide.
- Click `Create Slides`.

After slide creation, a preview list of slides appears.

Click `Next: Voice`.

### Step 6 - Voice
- Review the selected mode, voice type, and speaking pace.
- Click `Generate Voice`.
- The system creates one narration audio file per slide section.
- Audio previews appear in the page.

Click `Next: Render`.

### Step 7 - Preview and Render
In the render step, you can preview the output before final rendering.

Actions available:
- `Generate Preview`
  Creates a short preview video
- `Start Final Render`
  Sends the render to the async background job queue

While rendering:
- A progress bar is shown
- The frontend polls the backend for job status

When rendering finishes:
- The final video player appears
- You can download the MP4
- You can generate a share link

### Step 8 - Sharing and Access Control
After final rendering:
- Click `Generate Share Link`
- The app creates:
  a share URL
  a share token
  access restrictions based on the project setup

Supported access modes:
- `Public`
- `Private`
- `Institution Only`

If an access code was configured, viewers need that code to open the shared result.

## Features in This Version

### Implemented
- No-face video workflow
- Avatar-mode MVP
- Avatar customization panel
- Script generation and segmentation
- Slide-to-script sync interface
- Manual slide entry
- Voice generation
- Preview before final render
- Async render queue with polling
- Share link generation
- Local access control
- Local storage and file delivery

### MVP Notes
- Avatar mode is a lightweight presenter-style render, not a full GPU avatar engine
- Async queue uses FastAPI background tasks, not Redis or Celery
- Storage is local file storage, not cloud CDN
- Access control is local metadata plus access code logic

## API Testing
Open:
`http://localhost:8000/docs`

This shows the FastAPI Swagger UI for testing endpoints directly in the browser.

## Troubleshooting

| Problem | Fix |
|---|---|
| Frontend not opening | Run `npm run dev` inside `frontend` |
| Backend not starting | Activate backend virtual environment and run `uvicorn main:app --reload` |
| Script generation fails | Check `GROQ_API_KEY` in `backend/.env` |
| Voice generation fails | gTTS requires internet access |
| Preview or render fails | Check FFmpeg installation and backend logs |
| Share link not opening | Make sure backend is running on `http://localhost:8000` |
| Audio not playing | Verify files are being served from `/temp` |

## Developer Notes
- Generated videos are served from `/outputs`
- Generated audio is served from `/temp`
- Video metadata and share metadata are stored locally in backend output JSON files
- Render jobs are stored in memory for the current backend session

## Deployment Notes

### Frontend Deployment
- Deploy `frontend` to Vercel
- Add:
  `VITE_API_BASE_URL=https://your-backend-domain/api`
  `VITE_API_ORIGIN=https://your-backend-domain`

### Backend Deployment
- Deploy `backend` to Render
- Use:
  build command: `pip install -r requirements.txt`
  start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add:
  `GROQ_API_KEY`
  `HEYGEN_API_KEY`
  `HEYGEN_AVATAR_ID`
  `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`

### Submission Link
- Submit the frontend public URL
- Example:
  `https://your-project.vercel.app`
