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
