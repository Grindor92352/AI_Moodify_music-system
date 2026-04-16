import json
import base64
import sys

# Must run httpx and websockets if using TestClient
try:
    from fastapi.testclient import TestClient
    from main import app
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def run_test():
    client = TestClient(app)
    print("Testing WebSocket connection to /ws/analyze-frame...")
    try:
        with client.websocket_connect("/ws/analyze-frame") as websocket:
            print("WebSocket connected successfully!")
            
            # Tiny 1x1 black JPEG image base64
            # (Just to trigger a valid Hume API pipeline round-trip)
            test_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            
            print("Sending test frame payload to Hume...")
            websocket.send_text(test_img)
            
            response = websocket.receive_json()
            with open("out_response.json", "w", encoding="utf-8") as f:
                json.dump(response, f)
            print("Response saved to out_response.json")
            
            if "error" in response:
                if "No face detected" in response["error"]:
                    print("\nSUCCESS! Integration test passed. Hume API successfully authenticated and processed the frame (expected 'No face detected' for a 1x1 pixel image).")
                else:
                    print("\nWARNING: API returned an unexpected error format. Please check the logs.")
            else:
                print("\nSUCCESS: A face prediction successfully mapped!")
            
    except Exception as e:
        print(f"Test failed with exception: {e}")

if __name__ == "__main__":
    run_test()
