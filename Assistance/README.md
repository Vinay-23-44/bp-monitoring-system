# Hypertension Assistant Service

This folder contains the Python `Assistance` service used by the blood pressure monitoring app.

## What It Does

- exposes a FastAPI `/chat` endpoint for the Node backend,
- runs a LangGraph workflow with specialized analysis steps,
- keeps multi-turn memory per conversation in SQLite,
- applies a rule-based safety router for emergency cases,
- uses `langchain-google-genai` with Gemini for reply generation.

## Current Request Flow

1. React sends the user message and conversation id to the Node backend.
2. The backend loads the user profile and latest BP reading from Prisma.
3. The backend sends structured context to this Python service.
4. LangGraph routes the request through:
   - sentiment analysis,
   - hypertension triage,
   - topic/recommendation planning,
   - emergency response or normal coaching generation.
5. The backend returns the final response to the client in the existing shape.

## Setup

Windows PowerShell:

```powershell
cd Assistance
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Then edit `.env` and configure at least:

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_API_KEY=your_assistance_api_key_here
GEMINI_MODEL=gemini-2.5-flash
ASSISTANCE_MEMORY_DB=./data/assistant_memory.sqlite3
```

Run the service:

```powershell
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

## Backend Environment

The Node backend should point to this service with:

```env
ASSISTANCE_API_URL=http://127.0.0.1:8000
ASSISTANCE_API_KEY=your_assistance_api_key_here
ASSISTANCE_TIMEOUT_MS=10000
```

## Notes

- `GEMINI_API_KEY` is required for the assistant to start.
- Memory is stored in `Assistance/data/assistant_memory.sqlite3` by default.
- Resetting the chat in the frontend creates a new conversation id, so memory starts fresh for that thread.
