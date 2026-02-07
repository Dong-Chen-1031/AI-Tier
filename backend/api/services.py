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
            # print(f"Publishing chunk: {chunk}")
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
        tts: bool = True,
        tts_speed: Optional[float] = None,
    ):
        self.prompt = prompt
        self.tts_model = tts_model
        self.llm_model = llm_model
        self.tts_speed = tts_speed
        self.case_id = case_id or uuid4().hex
        self.tts = tts
        self.llm_broadcaster = Broadcaster()
        self.queue_for_tts = self.llm_broadcaster.subscribe()
        self.queue_for_text = self.llm_broadcaster.subscribe()
        if self.tts:
            self.tts_broadcaster = Broadcaster()
            self.tts_queue_audio = self.tts_broadcaster.subscribe()
            self.tts_queue_save = self.tts_broadcaster.subscribe()
        self.__class__.all_services[self.case_id] = self

    @classmethod
    def get_api(cls, case_id: str):
        if case_id in cls.all_services:
            return cls.all_services[case_id]

    @staticmethod
    async def queue_to_async_gen(queue: asyncio.Queue) -> AsyncGenerator[str, None]:
        while True:
            chunk = await queue.get()
            if chunk is None:
                break
            yield chunk

    async def _gen_for_tts(self) -> AsyncGenerator[str, None]:
        while True:
            chunk = await self.queue_for_tts.get()
            if chunk is None:
                break
            yield chunk

    def start(self):
        asyncio.create_task(
            self.llm_broadcaster.publish(
                ai.stream_messages(self.prompt, self.llm_model)
            )
        )
        if self.tts:
            asyncio.create_task(
                self.tts_broadcaster.publish(
                    tts.websocket_tts(
                        self._gen_for_tts(), model=self.tts_model, speed=self.tts_speed
                    )
                )
            )

    def tts_gen(self) -> AsyncGenerator[bytes, None]:
        if not self.tts:
            return None
        return self.queue_to_async_gen(self.tts_queue_audio)

    def llm_gen(self) -> AsyncGenerator[str, None]:
        return self.queue_to_async_gen(self.queue_for_text)
