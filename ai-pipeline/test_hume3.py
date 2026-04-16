import asyncio
import os
from hume import AsyncHumeClient
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncHumeClient(api_key=os.getenv('HUME_API_KEY'))
    async with client.expression_measurement.stream.connect() as s:
        print("Methods:", [m for m in dir(s) if 'send' in m])

if __name__ == '__main__':
    asyncio.run(main())
