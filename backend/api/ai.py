import re
from typing import Any, AsyncGenerator, Optional

from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic import BaseModel
from settings import AI_API_KEY, LLMs_list, LLMs_to_api

load_dotenv()


client = AsyncOpenAI(
    api_key=AI_API_KEY,
    base_url="https://gateway.ai.cloudflare.com/v1/1429f084605607e09bd1dbb666e25ffc/ai-tier/compat",
)


class ChatRespond(BaseModel):
    role: str
    content: str


async def stream_messages(
    messages: str, model: Optional[str] = None
) -> AsyncGenerator[str, Any]:
    if not model:
        model = LLMs_list[0]
    if model not in LLMs_list:
        raise ValueError(f"Model {model} is not supported. Choose from {LLMs_list}")
    if not messages:
        raise ValueError("Messages cannot be empty.")
    if not model:
        raise ValueError("Model must be specified.")
    model_api = LLMs_to_api.get(model, model)

    response = await client.chat.completions.create(
        model=model_api,
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
