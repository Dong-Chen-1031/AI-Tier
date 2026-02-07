from typing import Any, AsyncGenerator

from dotenv import load_dotenv
from openrouter import OpenRouter
from pydantic import BaseModel
from settings import AI_API_KEY

load_dotenv()


class ChatRespond(BaseModel):
    role: str
    content: str


async def stream_messages(
    messages: str, model: str = "arcee-ai/trinity-large-preview:free"
) -> AsyncGenerator[str, Any]:
    async with OpenRouter(api_key=AI_API_KEY) as client:
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
        temp = ""
        async for chunk in response:
            if chunk.choices:
                delta = chunk.choices[0].delta
                text = delta.content or ""
                full_content += text
                if text:
                    if ("[" in text and "]" not in text) or (temp and "]" not in text):
                        temp += text
                        continue
                    elif "]" in text and "[" not in text:
                        text = temp + text
                        temp = ""
                    yield text
                if chunk.choices[0].finish_reason:
                    return
