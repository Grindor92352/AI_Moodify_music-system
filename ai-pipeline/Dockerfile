# ─────────────────────────────────────────────────────────────────────────────
# AI Moodify — Python FastAPI AI Pipeline Dockerfile
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.10-slim

WORKDIR /app

# Install system libraries required by OpenCV (GLX and GLib helper libraries)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and pre-trained Keras model weights
COPY . .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
