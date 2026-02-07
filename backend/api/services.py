import asyncio
from typing import AsyncGenerator, Optional
from uuid import uuid4

from api import ai, tts


class Broadcaster:
    def __init__(self):
        self.subscribers: set[asyncio.Queue] = set()

    def subscribe(self):
        queue = asyncio.Queue()
        self.subscribers.add(queue)
        return queue

    async def publish(self, async_gen):
        async for chunk in async_gen:
            print(f"Publishing chunk: {chunk}")
            for queue in list(self.subscribers):
                await queue.put(chunk)

        for queue in self.subscribers:
            await queue.put(None)


class ApiService:
    all_services: dict[str, "ApiService"] = dict()

    def __init__(
        self,
        prompt: str,
        llm_model: Optional[str] = "arcee-ai/trinity-large-preview:free",
        case_id: Optional[str] = None,
        tts_model: Optional[str] = None,
        tts: Optional[bool] = None,
    ):
        self.prompt = prompt
        self.tts_model = tts_model
        self.llm_model = llm_model
        self.case_id = case_id or uuid4().hex
        self.tts = tts
        self.broadcaster = Broadcaster()
        self.queue_for_tts = self.broadcaster.subscribe()
        self.queue_for_text = self.broadcaster.subscribe()
        self.__class__.all_services[self.case_id] = self

    @classmethod
    def get_api(cls, case_id: str):
        if case_id in cls.all_services:
            return cls.all_services[case_id]

    async def _gen_for_tts(self) -> AsyncGenerator[str, None]:
        while True:
            chunk = await self.queue_for_tts.get()
            if chunk is None:
                break
            yield chunk

    def start(self):
        asyncio.create_task(
            self.broadcaster.publish(ai.stream_messages(self.prompt, self.llm_model))
        )

    def tts_gen(self) -> AsyncGenerator[bytes, None]:
        return tts.tts(self._gen_for_tts(), self.tts_model)

    async def llm_gen(self) -> AsyncGenerator[str, None]:
        while True:
            chunk = await self.queue_for_text.get()
            if chunk is None:
                break
            yield chunk
