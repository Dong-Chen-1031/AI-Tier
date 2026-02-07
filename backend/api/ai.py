import os
from typing import Any, AsyncGenerator

from dotenv import load_dotenv
from openrouter import OpenRouter
from pydantic import BaseModel

load_dotenv()


class ChatRespond(BaseModel):
    role: str
    content: str


async def stream_messages(
    messages: str, model: str = "arcee-ai/trinity-large-preview:free"
) -> AsyncGenerator[str, Any]:
    async with OpenRouter(api_key=os.getenv("AI_API_KEY")) as client:
        response = await client.chat.send_async(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": messages,
                }
            ],
            stream=True,
        )

        full_content = ""
        async for chunk in response:
            if chunk.choices:
                delta = chunk.choices[0].delta
                if delta.content:
                    content = delta.content
                    full_content += content
                    yield content
                if chunk.choices[0].finish_reason:
                    return
