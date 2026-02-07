import os
from typing import Any, AsyncGenerator, Optional

from dotenv import load_dotenv
from fishaudio import AsyncFishAudio
from rich.traceback import install

install()

load_dotenv()


async def tts(
    text_gen: AsyncGenerator[str, Any], model: Optional[str] = None
) -> AsyncGenerator[bytes, Any]:
    client = AsyncFishAudio(api_key=os.getenv("FISH_API_KEY"))

    # Stream audio via WebSocket
    audio_stream = client.tts.stream_websocket(
        text_gen,
        reference_id=model,
        format="mp3",
        latency="balanced",  # Use "balanced" for real-time, "normal" for quality
    )

    async for chunk in audio_stream:
        print(f"Received audio chunk of size: {len(chunk)} bytes")
        yield chunk
        # await asyncio.sleep(4)  # Simulate processing delay
    await audio_stream.aclose()
