from typing import Any, AsyncGenerator, Optional

from dotenv import load_dotenv
from fishaudio import AsyncFishAudio
from rich.traceback import install
from settings import FISH_API_KEY

install()

load_dotenv()


def websocket_tts(
    text_gen: AsyncGenerator[str, Any],
    model: Optional[str] = None,
    speed: Optional[float] = None,
) -> AsyncGenerator[bytes, Any]:
    client = AsyncFishAudio(api_key=FISH_API_KEY)

    # Stream audio via WebSocket
    audio_stream = client.tts.stream_websocket(
        text_gen,
        reference_id=model,
        format="mp3",
        latency="balanced",
        speed=speed,
    )

    return audio_stream
