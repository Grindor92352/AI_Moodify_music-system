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

## 1 — Clone the Repository

```bash
git clone https://github.com/Grindor92352/AI_Moodify_music-system.git
cd AI_Moodify_music-system
```

---

## 2 — Environment Variables

The Python pipeline needs a Hume AI API key. The Node.js server reads it via the pipeline's WebSocket connection — **no key is needed directly in the server**.

### Get a Hume AI API key
1. Sign up at [platform.hume.ai](https://platform.hume.ai)
2. Go to **Settings → API Keys → New Key**
3. Copy the key

### Create the `.env` file

```bash
# From the repo root:
cp server/.env.example server/.env
```

Open `server/.env` and fill in your key:

```env
HUME_API_KEY=your_actual_hume_api_key_here
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
