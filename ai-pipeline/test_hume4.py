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
    # Attempt connecting with config if permitted, or just connect
    try:
        from hume.expression_measurement.stream import types
        # Lets see what types exist over there
        # but let's just use dictionary for config
        config_dict = {"face": {}}
        
        async with client.expression_measurement.stream.connect(configs=config_dict) as s:
            print("Connected! Creating temp file...")
            b64_str = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            # Create a temp file
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
                tf.write(base64.b64decode(b64_str))
                temp_path = tf.name
            
            print("Sending file via stream...")
            res = await s.send_file(temp_path)
            # The send_file method natively waits for the response!
            print("Got response!", str(res)[:300])
            os.remove(temp_path)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
