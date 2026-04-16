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


# To run the project on your local server you need to do the following steps :

1. Clone the Repository
First, the user needs to download the code to their local machine and navigate into the root workspace directory:

git clone <your-github-repo-url>

cd therapy-monorepo

2. Restore the Environment Variables
Because we correctly configured the .gitignore file to hide your private keys, the fetched repository will only have the .env.example files. The user must create the actual .env files and inject their own API keys:

Inside the /server directory, create a .env file and add:
PORT=5000
YOUTUBE_API_KEY=their_youtube_api_key_here

Inside the /ai-pipeline directory, create a .env file and add:
HUME_API_KEY=their_hume_api_key_here

3. Initialize the Python Virtual Environment
Because the concurrently start script in Windows relies on the specific venv\\Scripts\\uvicorn path we configured, the user must build the Python environment identically:

cd ai-pipeline

python -m venv venv

Activate it (venv\Scripts\activate on Windows or source venv/bin/activate on Mac/Linux)

pip install fastapi uvicorn python-dotenv hume

cd.. (to return to the root workspace)

4. Install the Node.js and React Dependencies
From the root directory, the user must install all the package dependencies for the Express backend and the Vite frontend:

npm install

5. Launch the Application
With the environments built and the keys in place, the user can utilize the global script to launch the React frontend (port 3000), the Node backend (port 5000), and the Python API (port 8000) simultaneously:

npm run dev

6. Run the Hardware and UI

Open a web browser to http://localhost:3000.

When prompted, grant the browser permission to access the webcam.

Click the purple "Detect My Mood" button visible in the UI. Just like in your final screenshots, the system will capture the frame, shut off the camera to return to "Camera idle", display the dominant emotion (e.g., "Fatigue", "Anger"), and natively render the 4 playable Bollywood YouTube tracks.
