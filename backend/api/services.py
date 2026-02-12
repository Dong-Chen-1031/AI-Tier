import asyncio
from collections import OrderedDict
from re import sub
from typing import Any, AsyncGenerator, Optional, TypeVar
from uuid import uuid4

import aiofiles
from api import ai
from api import tts as Tts
from fastapi import HTTPException
from settings import API_SERVICE_TIME_OUT, LLMs, LLMs_list
from utils.log import logger

NO_VOICE = r"\[夯\]|\[頂級\]|\[人上人\]|\[NPC\]|\[拉完了\]"


class Broadcaster:
    def __init__(self):
        self.subscribers: set[asyncio.Queue[Any]] = set()

    def subscribe(self) -> asyncio.Queue[Any]:
        queue = asyncio.Queue()
        self.subscribers.add(queue)
        return queue

    async def publish(self, async_gen: AsyncGenerator[Any, None]):
        async for chunk in async_gen:
            # print(f"Publishing chunk: {len(chunk)}")
            for queue in list(self.subscribers):
                queue.put_nowait(chunk)

        for queue in self.subscribers:
            queue.put_nowait(None)


class ApiService:
    all_services: OrderedDict[str, "ApiService"] = OrderedDict()
    auto_cleanup_task_started = False

    def __init__(
        self,
        prompt: str,
        llm_model: LLMs = LLMs_list[0],
        case_id: Optional[str] = None,
        tts_model: Optional[str] = None,
        tts: bool = True,
        tts_speed: Optional[float] = None,
    ):
        self.prompt = prompt
        self.tts_model = tts_model or None
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

        # for get api service by case_id and auto cleanup
        self.created_at = asyncio.get_event_loop().time()
        self.__class__.all_services[self.case_id] = self
        if not self.__class__.auto_cleanup_task_started:
            self.__class__.auto_cleanup_task_started = True
            asyncio.create_task(self.__class__.cleanup_api_service())

    @classmethod
    def get_api_service(cls, case_id: str) -> "ApiService":
        if case_id in cls.all_services:
            return cls.all_services[case_id]

        logger.error(f"ApiService with case_id {case_id} not found")
        raise HTTPException(status_code=404, detail="Case not found")

    @classmethod
    async def cleanup_api_service(cls):
        while True:
            await asyncio.sleep(API_SERVICE_TIME_OUT)
            time_before = asyncio.get_event_loop().time() - API_SERVICE_TIME_OUT
            for case_id, service in list(cls.all_services.items()):
                if service.created_at < time_before:
                    cls.all_services.pop(case_id)
                else:
                    break

    T = TypeVar("T")

    @staticmethod
    async def queue_to_async_gen(queue: asyncio.Queue[T]) -> AsyncGenerator[T, None]:
        while True:
            chunk = await queue.get()
            if chunk is None:
                break
            if not chunk:
                continue
            yield chunk

    async def _gen_for_tts(self) -> AsyncGenerator[str, None]:
        temp = ""
        while True:
            chunk: str = await self.queue_for_tts.get()

            if chunk is None:
                if temp:
                    # logger.info(f"供 TTS 使用的片段: {temp}")
                    yield temp
                break

            chunk = sub(NO_VOICE, "", chunk)
            if not chunk.strip():
                continue

            temp += chunk
            if len(temp) < 5:
                continue
            # logger.info(f"供 TTS 使用的片段: {temp}")
            yield temp
            temp = ""

    def start(self):
        asyncio.create_task(
            self.llm_broadcaster.publish(
                ai.stream_messages(self.prompt, self.llm_model)
            )
        )
        if self.tts:
            asyncio.create_task(
                self.tts_broadcaster.publish(
                    Tts.websocket_tts(
                        self._gen_for_tts(), model=self.tts_model, speed=self.tts_speed
                    )
                )
            )
            asyncio.create_task(self.save_tts())

    def tts_gen(self) -> AsyncGenerator[bytes, None]:
        if not self.tts:
            raise HTTPException(status_code=400, detail="TTS is disabled for this case")
        return self.queue_to_async_gen(self.tts_queue_audio)

    def llm_gen(self) -> AsyncGenerator[str, None]:
        return self.queue_to_async_gen(self.queue_for_text)

    async def save_tts(self):
        async with aiofiles.open(f"storage/audio/{self.case_id}.mp3", "wb") as f:
            async for chunk in self.queue_to_async_gen(self.tts_queue_save):
                await f.write(chunk)
