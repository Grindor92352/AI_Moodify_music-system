from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import anyio
from tensorflow.keras.models import model_from_json
import traceback

app = FastAPI(title="AI Moodify - Local Emotion Detection")

@app.on_event("startup")
async def startup_event():
    # Boost threadpool size for 100 concurrent users performing synchronous OpenCV/Keras operations
    limiter = anyio.to_thread.current_default_thread_limiter()
    limiter.total_tokens = 100

# Keep the CORS middleware so the frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json

# 1. Load your custom CNN Model Architecture and Weights
with open("model_arch.json", "r") as json_file:
    model_data = json.load(json_file)

# Dynamic cleaner for Keras 3 compatibility (strips unrecognized quantization_config fields)
def clean_keras_config(config_dict):
    if not isinstance(config_dict, dict):
        return
    if "layers" in config_dict:
        for layer in config_dict["layers"]:
            if "config" in layer:
                layer["config"].pop("quantization_config", None)
    for key, value in config_dict.items():
        if isinstance(value, dict):
            clean_keras_config(value)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    clean_keras_config(item)

if "config" in model_data:
    clean_keras_config(model_data["config"])

loaded_model_json = json.dumps(model_data)
model = model_from_json(loaded_model_json)
model.load_weights("model.weights.h5")

# 2. Load OpenCV's built-in Face Detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# 3. Map FER2013 baseline emotions to your Bollywood Music logic
emotion_mapping = {
    0: "Anger",
    1: "Anger",
    2: "Anxiety",
    3: "Happiness",
    4: "Sadness",
    5: "Happiness",
    6: "Fatigue" # Neutral triggers relaxing music
}

class FrameRequest(BaseModel):
    image_base64: str

# Use standard `def` (not async) so FastAPI runs this in a separate thread pool!
@app.post("/analyze-frame")
def analyze_frame(payload: FrameRequest):
    try:
        base64_string = payload.image_base64
        
        # Strip the metadata prefix if it exists
        encoded_data = base64_string.split(',')[1] if ',' in base64_string else base64_string
        
        # Safely attempt to decode the base64 string
        try:
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        except Exception as e:
            return {"error": f"Base64 decoding failed: {str(e)}"}
        
        # Convert directly to Grayscale
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        # Catch OpenCV's silent failure if the image data is corrupted
        if img is None:
            return {"error": "OpenCV could not decode the image bytes."}
        
        # Detect the face in the image
        faces = face_cascade.detectMultiScale(img, scaleFactor=1.3, minNeighbors=5)
        
        # If no face is found, return a relaxing fallback mood
        if len(faces) == 0:
            return {"dominant_mood": "Fatigue"}
            
        # Process the first detected face safely
        (x, y, w, h) = faces[0]
        
        # Add a slight padding to the bounding box to capture the whole face
        padding = int(w * 0.1) # 10% padding
        y1 = max(0, y - padding)
        y2 = min(img.shape[0], y + h + padding)
        x1 = max(0, x - padding)
        x2 = min(img.shape[1], x + w + padding)
        
        roi_gray = img[y1:y2, x1:x2]
        
        # Histogram Equalization: This fixes bad lighting/shadows which often confuse the CNN into predicting 'Sadness'
        roi_gray = cv2.equalizeHist(roi_gray)
        
        # Resize to 48x48 pixels to match the CNN input shape
        roi_gray = cv2.resize(roi_gray, (48, 48))
        
        # Normalize pixel values between 0 and 1
        roi_gray = roi_gray / 255.0
        
        # Reshape to match the Keras input format: (batch_size, height, width, channels)
        roi_gray = np.reshape(roi_gray, (1, 48, 48, 1))
        
        # Predict the emotion
        prediction = model.predict(roi_gray, verbose=0) 
        
        # Log the raw probabilities to help debug bias
        emotions = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]
        probs = {emotions[i]: float(prediction[0][i]) for i in range(7)}
        print(f"Raw CNN Probabilities: {probs}")
        
        max_index = int(np.argmax(prediction))
        final_mood = emotion_mapping.get(max_index, "Happiness")
        
        return {"dominant_mood": final_mood}
        
    except Exception as e:
        print(traceback.format_exc())
        return {"error": str(e)}
