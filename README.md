<<<<<<< HEAD
# 🎵 AI Moodify — Music Therapy System

An AI-powered music therapy web app that detects your facial emotion in real time and curates a personalised Bollywood playlist to match or lift your mood.

---

## Architecture Overview

```
┌─────────────────────┐      HTTP/REST       ┌──────────────────────┐
│  React Frontend     │ ◄──────────────────► │  Node.js / Express   │
│  Vite · port 3000   │                      │  Backend · port 5000 │
└─────────────────────┘                      └──────────┬───────────┘
                                                         │  WebSocket
                                                         ▼
                                             ┌──────────────────────┐
                                             │  Python / FastAPI    │
                                             │  AI Pipeline · 8000  │
                                             └──────────┬───────────┘
                                                         │
                                                         ▼
                                             ┌──────────────────────┐
                                             │  Hume AI             │
                                             │  Streaming API       │
                                             └──────────────────────┘
```

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | React + Vite + TailwindCSS | `3000` |
| Backend | Node.js + Express | `5000` |
| AI Pipeline | Python + FastAPI + Uvicorn | `8000` |
| Emotion AI | Hume AI Streaming WebSocket | external |

---

## Prerequisites

Make sure the following are installed on your machine before you begin:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| **Node.js** | v18+ | `node -v` |
| **npm** | v9+ | `npm -v` |
| **Python** | 3.10+ | `python --version` |
| **pip** | bundled with Python | `pip --version` |
| **Git** | any | `git --version` |

---
=======
Moodify Therapy: AI-Based Music and Mood Therapy System

Overview:
Moodify Therapy is a full-stack web application designed for real-time emotional analysis and adaptive Bollywood music curation.
The system captures a frame from the user's webcam upon a manual button trigger, analyzes their facial expression to determine their
current emotional state, and dynamically recommends therapeutic Bollywood tracks to either elevate or ground their mood.

Features
  -- Real-Time Emotion Detection: Utilizes Hume AI's expression measurement models to analyze 48 dimensions of emotional expression from facial movements.

  -- Therapeutic Mood Mapping: Aggregates granular emotion scores into 5 core proxy states: Happiness, Sadness, Anger, Stress/Anxiety, and Fatigue.

  -- Dynamic Music Curation: Maps the detected mood to specific Bollywood music search queries using the YouTube Data API v3.

  -- Playable UI: Embeds playable YouTube video iframes directly into the dashboard for an immediate, seamless listening experience.

  -- Secure API Architecture: Environment variables and API keys are securely managed in the Node.js backend, ensuring sensitive data never reaches the client-side React application.

Technology Stack :
 # Frontend: React (Vite), TypeScript, Tailwind CSS

 # Backend Orchestration: Node.js, Express, Axios

 # AI Inference Pipeline: Python, FastAPI, Hume AI Python SDK

 # External APIs: YouTube Data API v3, Hume AI Expression Measurement API

Setup and Installation:
1. Prerequisites
Node.js (v16 or higher)

Python (v3.10 or higher)

API Keys for Hume AI and Google Cloud (YouTube Data API v3)

2. Environment Variables
Create a .env file in both the /server and /ai-pipeline directories.

Security Note: These files are explicitly included in the .gitignore file to prevent your private API keys from being uploaded to GitHub or exposed to the client side.

/server/.env

Code snippet
PORT=5000
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
/ai-pipeline/.env

Code snippet
HUME_API_KEY=your_hume_ai_api_key_here
3. Running the Application
The project is structured as a monorepo. From the root directory, install the global dependencies and run the start script. This utilizes the concurrently package to launch the React frontend, Node.js backend, and Python inference pipeline simultaneously:

Bash
npm install
npm run dev
4. Usage
Allow browser permissions for webcam access.

Click the "Detect My Mood" button. The camera will briefly activate, capture a single frame after a short delay (to adjust lighting/focus), and then immediately shut down.

The AI pipeline will analyze your expression and display your dominant mood.

A curated list of 4 playable Bollywood tracks matching your mood will render on the screen.

Use the "Refresh Songs" button to randomize and fetch a new batch of songs for your currently detected mood without needing to turn the camera back on


## To run the project on your local server you need to do the following steps :
>>>>>>> e5b90fd7c792dc63fa5a5d9d1d59f597fe0c3437

## 1 — Clone the Repository

```bash
git clone https://github.com/Grindor92352/AI_Moodify_music-system.git
cd AI_Moodify_music-system
```

---

## 2 — Environment Variables

<<<<<<< HEAD
The Python pipeline needs a Hume AI API key, and the Node.js server needs a YouTube Data API v3 key.

### Get the API keys
1. **Hume AI**: Sign up at [platform.hume.ai](https://platform.hume.ai) → Settings → API Keys.
2. **YouTube**: Go to [Google Cloud Console](https://console.cloud.google.com/) → Library → Enable "YouTube Data API v3" → Credentials → Create API Key.
=======
The Python pipeline needs a Hume AI API key. The Node.js server reads it via the pipeline's WebSocket connection — **no key is needed directly in the server**.

### Get a Hume AI API key
1. Sign up at [platform.hume.ai](https://platform.hume.ai)
2. Go to **Settings → API Keys → New Key**
3. Copy the key
>>>>>>> e5b90fd7c792dc63fa5a5d9d1d59f597fe0c3437

### Create the `.env` file

```bash
# From the repo root:
cp server/.env.example server/.env
```

<<<<<<< HEAD
Open `server/.env` and fill in your keys:

```env
HUME_API_KEY=your_hume_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
=======
Open `server/.env` and fill in your key:

```env
HUME_API_KEY=your_actual_hume_api_key_here
>>>>>>> e5b90fd7c792dc63fa5a5d9d1d59f597fe0c3437
```

> **Note:** The Python pipeline reads this key directly from `ai-pipeline/.env` **or** from `server/.env` (both are checked). The simplest setup is a single `.env` inside `server/` — the pipeline's `load_dotenv()` call walks up the directory tree automatically.

---

## 3 — Install Node.js Dependencies

```bash
# Install root-level dev tools (concurrently)
npm install

# Install the Express server dependencies
npm install --prefix server

# Install the React client dependencies
npm install --prefix client
```

---

## 4 — Set Up the Python Virtual Environment

```bash
cd ai-pipeline

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Return to root
cd ..
```

> ⚠️ The `venv/` folder must be named exactly **`venv`** and located inside `ai-pipeline/`. The root `npm run dev` script launches the Python process using the path `ai-pipeline\venv\Scripts\python` on Windows.

---

## 5 — Run the Full Stack

From the **repo root**, run:

```bash
npm run dev
```

This single command starts all three services in parallel using `concurrently`:

| Terminal label | Service | URL |
|---------------|---------|-----|
| `[0]` | React frontend (Vite) | http://localhost:3000 |
| `[1]` | Express backend | http://localhost:5000 |
| `[2]` | Python AI pipeline | http://localhost:8000 |

Open **http://localhost:3000** in your browser.
<<<<<<< HEAD

---

## 6 — How to Use the App

1. Click **"Detect My Mood"** — the webcam activates.
2. Wait 2 seconds for auto-exposure to stabilise (a status message counts down).
3. The AI captures a single frame, sends it to Hume AI, and detects your dominant emotion.
4. 4 Bollywood songs are loaded automatically based on your mood.
5. Click the **▶ play button** on any song card to load the YouTube embed.
6. Click **"Refresh Songs"** (no camera) to get a fresh batch for the same mood.
7. Click **"Detect My Mood"** again at any time to re-scan.

### Emotion → Playlist Mapping

| Detected Mood | Music Curation |
|--------------|----------------|
| **Happiness** | Upbeat Bollywood dance tracks |
| **Fatigue** | High-energy mood-lifters |
| **Sadness** | Emotional Arijit Singh / Atif Aslam songs |
| **Stress** | Calming Sufi / acoustic tracks |
| **Anxiety** | Slow, meditative Bollywood |
| **Anger** | Peaceful, mellow Hindi songs |

---

## 7 — Project Structure

```
AI_Moodify_music-system/
├── ai-pipeline/                # Python FastAPI — emotion detection
│   ├── main.py                 # WebSocket endpoint + Hume AI integration
│   ├── requirements.txt        # Python dependencies
│   ├── .gitignore              # ignores venv/ and .env
│   └── venv/                   # (git-ignored) Python virtual environment
│
├── client/                     # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   └── components/
│   │       ├── TherapyDashboard.tsx   # Main UI — camera, mood, player
│   │       └── MusicPlayer.tsx        # YouTube click-to-load player
│   └── vite.config.ts          # Locked to port 3000 (strictPort)
│
├── server/                     # Node.js Express backend
│   ├── app.js                  # Entry point — CORS, middleware, routes
│   ├── routes/
│   │   └── musicRoutes.js      # POST /analyze · POST /refresh
│   ├── controllers/
│   │   └── musicController.js  # Orchestrates mood → songs pipeline
│   ├── services/
│   │   ├── moodService.js      # Calls Python pipeline via HTTP
│   │   └── youtubeService.js   # Curated Bollywood song library
│   ├── .env                    # (git-ignored) your real API keys
│   └── .env.example            # Template to copy from
│
├── package.json                # Root — runs all three services via concurrently
└── README.md                   # This file
```

---

## 8 — Running Services Individually

If `npm run dev` has issues, you can start each service separately in three terminal windows:

**Terminal 1 — React frontend:**
```bash
cd client
npm run dev
```

**Terminal 2 — Express backend:**
```bash
cd server
npm run dev
```

**Terminal 3 — Python AI pipeline:**
```bash
cd ai-pipeline
venv\Scripts\activate        # Windows
# or: source venv/bin/activate  (macOS/Linux)
uvicorn main:app --reload --port 8000
```

---

## 9 — Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `venv\Scripts\python` not found | venv not created or wrong name | Run `python -m venv venv` inside `ai-pipeline/` |
| `Port 3000 is in use` | Another process is on port 3000 | Kill it: `npx kill-port 3000` |
| `CORS error` in browser | Frontend not on port 3000 | `vite.config.ts` has `strictPort: true` — ensure the client starts on 3000 |
| `No face detected` | Poor lighting or camera too far | Move closer to the camera, improve lighting |
| YouTube cards show "Video unavailable" | Label embedding restriction | Click **▶** to trigger a user-gesture load, or click **YouTube** to open in a new tab |
| Hume error: `API key invalid` | Wrong or missing HUME_API_KEY | Double-check `server/.env` has the correct key |
| Python pipeline not starting | Wrong Python version | Use Python 3.10+ — check with `python --version` |

---

## 10 — Tech Stack Summary

| Area | Technology |
|------|-----------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | TailwindCSS v4 |
| HTTP Client | Axios |
| Backend Framework | Express.js |
| Process Runner | concurrently |
| Server Watcher | nodemon |
| AI Pipeline | FastAPI + Uvicorn |
| Emotion AI | Hume AI Expression Measurement API |
| WebSocket | Python `websockets` library |
| Music | Dynamic Bollywood search via YouTube Data API v3 (with static fallback) |

---

## 11 — Contributing

1. **Branch** off `main` for every feature or fix.
2. Keep the `.env` out of commits — it is git-ignored.
3. The `venv/` folder is also git-ignored — every collaborator creates their own.
4. Test all three services are running before submitting a PR.
=======
>>>>>>> e5b90fd7c792dc63fa5a5d9d1d59f597fe0c3437
