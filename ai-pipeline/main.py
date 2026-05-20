from contextlib import asynccontextmanager
import os
import json
import base64
import hashlib
import traceback
from collections import OrderedDict

import anyio
import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import model_from_json

WEIGHTS_PATH = os.environ.get("MODEL_WEIGHTS_PATH", "model.weights.h5")
ARCH_PATH = os.environ.get("MODEL_ARCH_PATH", "model_arch.json")

MODEL_READY = False
model = None
face_detector = None

CACHE = OrderedDict()
MAX_CACHE_SIZE = 150

emotion_mapping = {
    0: "Anger",
    1: "Anger",
    2: "Anxiety",
    3: "Happiness",
    4: "Sadness",
    5: "Happiness",
    6: "Fatigue",
}

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
]


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


def _load_cnn_model():
    global model, MODEL_READY
    if not os.path.isfile(ARCH_PATH):
        print(f"[AI Pipeline] WARN: {ARCH_PATH} not found. CNN inference disabled.")
        return
    with open(ARCH_PATH, "r", encoding="utf-8") as json_file:
        model_data = json.load(json_file)
    if "config" in model_data:
        clean_keras_config(model_data["config"])
    loaded_model_json = json.dumps(model_data)
    model = model_from_json(loaded_model_json)
    if not os.path.isfile(WEIGHTS_PATH):
        print(
            f"[AI Pipeline] WARN: {WEIGHTS_PATH} not found. "
            "Place trained weights in ai-pipeline/ or set MODEL_WEIGHTS_PATH. "
            "Using fallback mood heuristics until weights are available."
        )
        return
    model.load_weights(WEIGHTS_PATH)
    MODEL_READY = True
    print("[AI Pipeline] CNN model and weights loaded.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global face_detector
    limiter = anyio.to_thread.current_default_thread_limiter()
    limiter.total_tokens = 100
    _load_cnn_model()
    mp_face_detection = mp.solutions.face_detection
    face_detector = mp_face_detection.FaceDetection(
        model_selection=1, min_detection_confidence=0.55
    )
    yield
    face_detector = None


app = FastAPI(title="AI Moodify - Local Emotion Detection", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FrameRequest(BaseModel):
    image_base64: str


def _get_cache(key: str):
    value = CACHE.get(key)
    if value is not None:
        CACHE.move_to_end(key)
    return value


def _set_cache(key: str, value: dict):
    CACHE[key] = value
    CACHE.move_to_end(key)
    if len(CACHE) > MAX_CACHE_SIZE:
        CACHE.popitem(last=False)


def _normalize_bbox(bbox, width, height, padding_ratio=0.1):
    x = int(max(bbox.xmin * width, 0))
    y = int(max(bbox.ymin * height, 0))
    w = int(min(bbox.width * width, width - x))
    h = int(min(bbox.height * height, height - y))
    padding_x = int(w * padding_ratio)
    padding_y = int(h * padding_ratio)
    x1 = max(0, x - padding_x)
    y1 = max(0, y - padding_y)
    x2 = min(width, x + w + padding_x)
    y2 = min(height, y + h + padding_y)
    return x1, y1, x2, y2


def _predict_emotion(face_image):
    emotions = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]
    if not MODEL_READY or model is None:
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))
        if brightness < 85:
            max_index = 4
        elif brightness > 170:
            max_index = 3
        else:
            max_index = 6
        probs = {emotions[i]: (0.7 if i == max_index else 0.05) for i in range(7)}
        return max_index, probs

    gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    gray = cv2.resize(gray, (48, 48))
    gray = gray / 255.0
    gray = np.reshape(gray, (1, 48, 48, 1))
    prediction = model.predict(gray, verbose=0)
    probs = {emotions[i]: float(prediction[0][i]) for i in range(7)}
    max_index = int(np.argmax(prediction))
    return max_index, probs


def _build_face_result(detection, image):
    height, width, _ = image.shape
    bbox = detection.location_data.relative_bounding_box
    x1, y1, x2, y2 = _normalize_bbox(bbox, width, height)
    face_crop = image[y1:y2, x1:x2]
    if face_crop.size == 0:
        return None
    max_index, probs = _predict_emotion(face_crop)
    mood = emotion_mapping.get(max_index, "Happiness")
    confidence = float(np.max(list(probs.values())))
    return {
        "mood": mood,
        "confidence": confidence,
        "probabilities": probs,
        "detection_score": float(detection.score[0]) if detection.score else 0.0,
        "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_ready": MODEL_READY}


@app.post("/analyze-frame")
def analyze_frame(payload: FrameRequest):
    try:
        base64_string = payload.image_base64
        encoded_data = base64_string.split(",")[1] if "," in base64_string else base64_string
        cache_key = hashlib.sha256(encoded_data.encode("utf-8")).hexdigest()

        cached_response = _get_cache(cache_key)
        if cached_response:
            return {**cached_response, "cached": True}

        try:
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        except Exception as e:
            return {"error": f"Base64 decoding failed: {str(e)}"}

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"error": "OpenCV could not decode the image bytes."}

        rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        detection_result = face_detector.process(rgb_image)

        if not detection_result.detections:
            response = {
                "dominant_mood": "Fatigue",
                "confidence": 0.0,
                "probabilities": {},
                "faces": [],
                "face_count": 0,
                "warning": "No face detected. Returning fallback mood.",
            }
            _set_cache(cache_key, response)
            return {**response, "cached": False}

        face_results = []
        for detection in detection_result.detections:
            face_data = _build_face_result(detection, img)
            if face_data is not None:
                face_results.append(face_data)

        if not face_results:
            response = {
                "dominant_mood": "Fatigue",
                "confidence": 0.0,
                "probabilities": {},
                "faces": [],
                "face_count": 0,
                "warning": "Face detected but extraction failed. Returning fallback mood.",
            }
            _set_cache(cache_key, response)
            return {**response, "cached": False}

        dominant_face = max(face_results, key=lambda face: face["confidence"])
        response = {
            "dominant_mood": dominant_face["mood"],
            "confidence": dominant_face["confidence"],
            "probabilities": dominant_face["probabilities"],
            "faces": face_results,
            "face_count": len(face_results),
            "cached": False,
        }
        _set_cache(cache_key, response)
        return response

    except Exception as e:
        print(traceback.format_exc())
        return {"error": str(e)}
