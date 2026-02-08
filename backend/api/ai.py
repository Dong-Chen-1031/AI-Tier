import re
from typing import Any, AsyncGenerator, Optional

from dotenv import load_dotenv
from openrouter import OpenRouter
from pydantic import BaseModel
from settings import AI_API_KEY

load_dotenv()


class ChatRespond(BaseModel):
    role: str
    content: str


async def stream_messages(
    messages: str, model: Optional[str] = None
) -> AsyncGenerator[str, Any]:
    if not model:
        model = "arcee-ai/trinity-large-preview:free"
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

                    match_ = re.search(r"\[(.*?)\]", text)
                    if match_:
                        rank_content = match_.group(1)
                        if full_content.count(rank_content) == 1:
                            text = text.replace(
                                match_.group(0), f"{rank_content}{match_.group(0)}"
                            )

                    yield text
                if chunk.choices[0].finish_reason:
                    return
