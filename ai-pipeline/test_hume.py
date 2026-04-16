import asyncio
import os
import sys

from hume import AsyncHumeClient

async def main():
    print("Testing client instantiation...")
    try:
        client = AsyncHumeClient(api_key=os.getenv("HUME_API_KEY", "dummy"))
        print(dir(client.expression_measurement.stream.connect))
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
