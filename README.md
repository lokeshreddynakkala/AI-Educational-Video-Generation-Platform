# Project B10

A full-stack web application with FastAPI backend and React frontend.

## Project Structure

```
project-b10/
├── backend/          # FastAPI application
│   ├── main.py       # Main FastAPI app
│   ├── requirements.txt
│   └── venv/         # Virtual environment (created after setup)
└── frontend/         # React + Vite application
    ├── src/
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Setup Instructions

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# or: source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/hello` - Hello endpoint

## Tech Stack

- **Backend**: FastAPI, Uvicorn
- **Frontend**: React, Vite, Axios
- **Styling**: CSS
