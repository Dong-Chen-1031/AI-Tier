import asyncio
from collections import OrderedDict
from typing import Any, AsyncGenerator, NoReturn, Optional
from uuid import uuid4

from api import ai, tts
from settings import API_SERVICE_TIME_OUT
from utils.log import logger


class Broadcaster:
    def __init__(self):
        self.subscribers: set[asyncio.Queue[Any]] = set()

    def subscribe(self) -> asyncio.Queue[Any]:
        queue = asyncio.Queue()
        self.subscribers.add(queue)
        return queue

    async def publish(self, async_gen: AsyncGenerator[Any, None]):
        async for chunk in async_gen:
            # print(f"Publishing chunk: {chunk}")
            for queue in list(self.subscribers):
                queue.put_nowait(chunk)

        for queue in self.subscribers:
            queue.put_nowait(None)


class ApiService:
    all_services: OrderedDict[str, "ApiService"] = OrderedDict()

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

        # text broadcaster
        self.llm_broadcaster = Broadcaster()
        self.queue_for_tts = self.llm_broadcaster.subscribe()
        self.queue_for_text = self.llm_broadcaster.subscribe()

        # tts broadcaster
        if self.tts:
            self.tts_broadcaster = Broadcaster()
            self.tts_queue_audio = self.tts_broadcaster.subscribe()
            self.tts_queue_save = self.tts_broadcaster.subscribe()

        # for cleanup
        self.created_at = asyncio.get_event_loop().time()
        self.__class__.all_services[self.case_id] = self

    @classmethod
    def get_api_service(cls, case_id: str) -> "ApiService" | None:
        if case_id in cls.all_services:
            return cls.all_services[case_id]

        logger.error(f"ApiService with case_id {case_id} not found")

    @classmethod
    def cleanup_api_service(cls, case_id: str):
        time_before = asyncio.get_event_loop().time() - API_SERVICE_TIME_OUT
        for case_id in cls.all_services:
            if cls.all_services[case_id].created_at < time_before:
                cls.all_services.pop(case_id)
            else:
                break

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


async def auto_cleanup(interval) -> NoReturn:
    while True:
        ApiService.cleanup_api_service()
        await asyncio.sleep(API_SERVICE_TIME_OUT)
