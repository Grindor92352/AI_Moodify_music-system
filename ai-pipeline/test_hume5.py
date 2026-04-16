import asyncio
import os
import tempfile
import base64
from hume import AsyncHumeClient
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncHumeClient(api_key=os.getenv('HUME_API_KEY'))
    print("Connecting to Stream...")
    try:
        async with client.expression_measurement.stream.connect() as s:
            print("Connected!")
            b64_str = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
                tf.write(base64.b64decode(b64_str))
                temp_path = tf.name
            
            print("Sending file via stream...")
            # Let's try passing the models in the second argument
            # In Hume 0.x, models is required
            res = await s.send_file(temp_path, models={"face": {}})
            print("Got response!", str(res)[:300])
            os.remove(temp_path)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
