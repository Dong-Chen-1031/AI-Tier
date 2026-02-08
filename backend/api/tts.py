from typing import Any, AsyncGenerator, Optional

import httpx
import opencc
from dotenv import load_dotenv
from fishaudio import AsyncFishAudio
from rich.traceback import install
from settings import FISH_API_KEY

converter_s2t = opencc.OpenCC("s2t")


def s2t(text: str):
    """將簡體中文轉換為繁體中文"""
    if not text:
        return text
    _ = converter_s2t.convert(text)
    # logging.info(f"轉換前: {text} 轉換後: {_}")
    return _


converter_t2s = opencc.OpenCC("t2s")


def t2s(text: str):
    """將繁體中文轉換為簡體中文"""
    if not text:
        return text
    return converter_t2s.convert(text)


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


async def get_models(title: str) -> list[dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        title = t2s(title)
        url = f"https://api.fish.audio/model?page_size=10&page_number=1&sort_by=score&title={title}"

        headers = {"Authorization": f"Bearer {FISH_API_KEY}"}

        response = await client.get(url, headers=headers)
        # logger.info(f"獲取模型列表的響應: {response.text}")
        items = response.json().get("items", [])
        for item in items:
            item["title"] = s2t(item["title"])
            item["description"] = s2t(item["description"])
        return items
