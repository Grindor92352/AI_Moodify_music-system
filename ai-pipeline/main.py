import json
import os
import asyncio
import traceback
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import websockets

load_dotenv()

app = FastAPI(title="AI Moodify - Emotion Detection Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Hume 48-emotion → 5 proxy composite buckets ──────────────────────────
# Each composite state aggregates semantically related Hume emotions.
# Highest aggregated score wins → avoids single-emotion false positives.

EMOTION_BUCKETS = {
    "Happiness":  ["Joy", "Amusement", "Satisfaction", "Excitement", "Contentment", "Elation", "Enthusiasm"],
    "Fatigue":    ["Tiredness", "Boredom", "Calmness"],
    "Sadness":    ["Sadness", "Disappointment", "Grief", "Nostalgia", "Sympathy"],
    "Stress":     ["Anxiety", "Distress", "Confusion", "Nervousness", "Fear", "Worry"],
    "Anger":      ["Anger", "Annoyance", "Contempt", "Disgust", "Frustration"],
}

def aggregate_emotions(emotions: list) -> dict:
    """
    Build a score-map from the Hume prediction list, then
    sum scores by composite bucket. Returns { "Happiness": 0.42, ... }.
    """
    # Build a flat lookup: { "Joy": 0.81, "Anxiety": 0.12, ... }
    score_map = {e["name"]: e["score"] for e in emotions}

    composite = {}
    for proxy_name, hume_names in EMOTION_BUCKETS.items():
        composite[proxy_name] = sum(score_map.get(h, 0.0) for h in hume_names)

    return composite


@app.websocket("/ws/analyze-frame")
async def analyze_frame_ws(websocket: WebSocket):
    """
    WebSocket endpoint for low-latency facial expression analysis.
    Accepts base64 image payloads, forwards to Hume Streaming API,
    aggregates scores across 5 composite mood buckets, and returns
    the dominant mood with confidence.
    """
    await websocket.accept()

    api_key = os.getenv("HUME_API_KEY")
    if not api_key:
        await websocket.send_json({"error": "HUME_API_KEY is not set in environment."})
        await websocket.close()
        return

    try:
        uri = f"wss://api.hume.ai/v0/stream/models?apikey={api_key}"
        async with websockets.connect(uri) as hume_socket:
            while True:
                # Receive frame from Node.js client
                payload = await websocket.receive_text()

                # Strip data URI prefix if present
                if "base64," in payload:
                    payload = payload.split("base64,")[1]

                if not payload.strip():
                    await websocket.send_json({"error": "Empty frame payload received."})
                    continue

                # Build Hume request
                hume_request = {
                    "data": payload,
                    "models": {"face": {}}
                }

                try:
                    await hume_socket.send(json.dumps(hume_request))

                    # Await Hume prediction — 8 second timeout (up from 5s)
                    result_string = await asyncio.wait_for(
                        hume_socket.recv(), timeout=8.0
                    )
                    result_dict = json.loads(result_string)

                    # Check for Hume-level errors
                    if "error" in result_dict:
                        await websocket.send_json({"error": result_dict["error"]})
                        continue

                    # Parse predictions
                    predictions = result_dict.get("face", {}).get("predictions", [])

                    if not predictions:
                        await websocket.send_json({"error": "No face detected in frame"})
                        continue

                    emotions = predictions[0].get("emotions", [])

                    if not emotions:
                        await websocket.send_json({"error": "No emotion data in prediction"})
                        continue

                    # ── Core fix: aggregate into 5 composite buckets ──────────
                    composite_scores = aggregate_emotions(emotions)

                    # Print all scores for debugging in the terminal
                    print("\n[Hume] Composite scores:")
                    for k, v in sorted(composite_scores.items(), key=lambda x: -x[1]):
                        bar = "█" * int(v * 20)
                        print(f"  {k:<12} {v:.3f}  {bar}")

                    # Pick the highest-scoring composite mood
                    dominant_mood = max(composite_scores, key=composite_scores.get)
                    confidence = composite_scores[dominant_mood]

                    print(f"[Hume] → Dominant mood: {dominant_mood} (score: {confidence:.3f})\n")

                    await websocket.send_json({
                        "dominant_mood": dominant_mood,
                        "confidence": round(float(confidence), 4),
                        "all_scores": {k: round(float(v), 4) for k, v in composite_scores.items()}
                    })

                except asyncio.TimeoutError:
                    await websocket.send_json({"error": "Hume API timed out. Check network or API key."})
                except json.JSONDecodeError:
                    await websocket.send_json({"error": "Invalid JSON from Hume response."})
                except Exception as e:
                    traceback.print_exc()
                    await websocket.send_json({"error": f"Pipeline error: {repr(e)}"})

    except WebSocketDisconnect:
        pass  # Normal client disconnect
    except Exception as e:
        print(f"[Fatal] WebSocket error: {e}")
        traceback.print_exc()
        try:
            await websocket.send_json({"error": f"Fatal connection error: {str(e)}"})
            await websocket.close()
        except Exception:
            pass
