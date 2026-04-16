import asyncio
import os
import sys

from hume import AsyncHumeClient
from dotenv import load_dotenv
load_dotenv()

async def main():
    print("Testing client instantiation...")
    try:
        client = AsyncHumeClient(api_key=os.getenv("HUME_API_KEY", "dummy"))
        config_dict = {"face": {}}
        async with client.expression_measurement.stream.connect(config=config_dict) as hume_socket:
            print("Connected to Hume WebSocket!")
            print("Socket methods:", [m for m in dir(hume_socket) if not m.startswith("_")])
            print("Sending test frame...")
            try:
                # tiny valid JPEG base64 payload
                test_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                import json
                payload = json.dumps({"data": test_img, "models": {"face": {}}})
                await hume_socket.send_text(payload)
                print("Sent text!")
            except Exception as e:
                print("send_text failed:", e)
                try:
                    await hume_socket.send(payload)
                    print("send payload worked!")
                except Exception as e2:
                    print("send failed:", e2)

            print("Waiting for response...")
            import asyncio
            try:
                resp = await asyncio.wait_for(hume_socket.recv(), timeout=5.0)
                print("Got response:", str(resp)[:300])
            except Exception as e:
                print("recv failed/timeout:", e)
    except Exception as e:
        print(f"Failed globally: {e}")

if __name__ == "__main__":
    asyncio.run(main())
