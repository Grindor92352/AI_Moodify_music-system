# 🎵 AI Moodify — Music Therapy System

An AI-powered music therapy web app that detects your facial emotion in real time using a local computer vision model and curates a personalised Bollywood playlist to match or lift your mood.

---

## Architecture Overview

```
┌─────────────────────┐      HTTP/REST       ┌──────────────────────┐
│  React Frontend     │ ◄──────────────────► │  Node.js / Express   │
│  Vite · port 3000   │                      │  Backend · port 5000 │
└─────────────────────┘                      └──────────┬───────────┘
                                                        │  HTTP/REST
                                                        ▼
                                             ┌──────────────────────┐
                                             │  Python / FastAPI    │
                                             │  AI Pipeline · 8000  │
                                             └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │  OpenCV & Keras CNN  │
                                             │  Local Emotion AI    │
                                             └──────────────────────┘
```

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, TailwindCSS, Lucide Icons |
| **Backend** | Node.js, Express, PostgreSQL, JWT Auth |
| **AI Pipeline** | Python, FastAPI, OpenCV, TensorFlow/Keras |
| **Database** | PostgreSQL |

---

## 🚀 Features

- **3D Animated Landing Page**: Interactive, scroll-responsive 3D aesthetics using raw CSS animations.
- **Secure Authentication**: JWT-based login and signup with secure HTTP-only cookies and bcryptjs password hashing.
- **Local Emotion Detection**: Private, high-performance facial emotion recognition running locally using OpenCV Haarcascades and a custom FER2013 CNN model.
- **Dynamic Music Curation**: Automatically maps the detected mood (Happiness, Sadness, Anger, Stress, Fatigue) to specific Bollywood tracks using the YouTube Data API.
- **High Concurrency Architecture**: The Node.js backend utilizes CPU clustering to load balance across all available cores, supporting 100+ concurrent users seamlessly.

---

## 🛠️ Prerequisites

Make sure the following are installed on your machine:
- **Node.js** (v18+)
- **Python** (3.10+)
- **PostgreSQL** (Running locally on port 5432)

---

## ⚙️ Setup and Installation

### 1. Database Setup
Create a PostgreSQL database named `moodify`. The backend will automatically create the required `users` table upon the first connection.

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and configure your credentials:
```env
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=moodify
JWT_SECRET=moodify_super_secret_key_123
```

### 3. Install Dependencies
Install all required Node.js dependencies across the monorepo:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 4. Setup Python Environment
Create and activate the Python virtual environment for the AI Pipeline:
```bash
cd ai-pipeline
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

---

## ▶️ Running the Application

### Option A: Running Locally (Development)
From the root directory, start all three services (React, Node.js, Python) simultaneously using concurrently:

```bash
npm run dev
```

The application will be available at **http://localhost:3000**.

### Option B: Running with Docker (Recommended)
You can run the entire stack (React Nginx build, Node, FastAPI AI pipeline) containerized in a single command.

1. Make sure you have created and configured the `server/.env` file with your credentials (database connection string, YouTube API key, JWT secret, and cluster setting).
2. Build and start the services from the root directory:
   ```bash
   docker-compose up --build
   ```
3. Access the app:
   * **Frontend**: `http://localhost:3000`
   * **Backend API**: `http://localhost:5000`
   * **AI Pipeline**: `http://localhost:8000`

---

## 🧠 Emotion → Playlist Mapping

| Detected Mood | Music Curation Strategy |
|--------------|-------------------------|
| **Happiness** | Upbeat Bollywood dance tracks |
| **Fatigue** | High-energy mood-lifters |
| **Sadness** | Emotional Arijit Singh / Atif Aslam songs |
| **Stress** | Calming Sufi / acoustic tracks |
| **Anxiety** | Slow, meditative Bollywood |
| **Anger** | Peaceful, mellow Hindi songs |

---

## 🤝 Contributing
1. Create a feature branch.
2. Ensure you do not commit `.env` or `venv/` directories (they are included in `.gitignore`).
3. Verify that the PostgreSQL database connects correctly before pushing.
