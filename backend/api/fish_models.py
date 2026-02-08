import asyncio
import logging
from typing import Literal, Optional

import opencc
import settings
from fish_audio_sdk import ModelEntity, PaginatedResponse, Session

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


def dict_to_hashable(d: dict) -> tuple[tuple, ...]:
    """將字典轉換為可哈希的形式"""
    return tuple(sorted((k, v) for k, v in d.items()))


fish_session = Session(settings.FISH_API_KEY)


def model_s2t(models: PaginatedResponse[ModelEntity]) -> PaginatedResponse[ModelEntity]:
    """將模型的簡體中文轉換為繁體中文"""
    for i, model in enumerate(models.items):
        model.title = s2t(model.title)
        model.description = s2t(model.description)
        for sample in model.samples:
            sample.text = s2t(sample.text)
            sample.title = s2t(sample.title)
        # logging.info(f"Processed model {i+1}: {model.title}")
    return models


class FishAudioModels:
    models_cache: dict[tuple[tuple, ...], PaginatedResponse[ModelEntity]] = {}
    chiness_models_cache: dict[tuple[tuple, ...], PaginatedResponse[ModelEntity]] = {}

    def __init__(self, models_args: dict):
        self.models_args = models_args

    async def get_models(self) -> PaginatedResponse[ModelEntity]:
        """獲取模型列表 (非同步)"""
        self.models = await self._get_models(self.models_args)
        return self.models

    @classmethod
    async def chiness_models(
        cls, models_args: dict
    ) -> Optional[PaginatedResponse[ModelEntity]]:
        title = models_args.get("title", "")
        title_s = t2s(title)
        title_t = s2t(title)
        # 中文同時搜尋繁體和簡體
        if title_s != title_t:
            logging.info(f"搜尋繁體: {title_s} 簡體: {title_t}")
            # 正確創建兩個參數字典
            args_s = models_args.copy()
            args_s["title"] = title_s

            args_t = models_args.copy()
            args_t["title"] = title_t

            loop = asyncio.get_running_loop()
            # 獲取兩種語言的模型 (非同步)
            # 使用 lambda 包裝函數呼叫以傳遞關鍵字參數
            models_s = await loop.run_in_executor(
                None, lambda: fish_session.list_models(**args_s)
            )
            models_t = await loop.run_in_executor(
                None, lambda: fish_session.list_models(**args_t)
            )

            models_args_with_out_page = models_args.copy()
            models_args_with_out_page.pop("page_number", None)
            models_args_with_out_page.pop("page_size", None)
            # 將模型快取
            models_hash_chiness = dict_to_hashable(models_args_with_out_page)

            # 合併結果
            all_models = combine_models(
                models_s,
                models_t,
                cls.chiness_models_cache.get(
                    models_hash_chiness,
                    PaginatedResponse[ModelEntity](total=0, items=[]),
                ),
                sort_by=models_args.get("sort_by", "task_count"),
            )

            cls.chiness_models_cache[models_hash_chiness] = all_models

            page_number = models_args.get("page_number", 1)
            page_size = models_args.get("page_size", 9)
            start_index = (page_number - 1) * page_size
            end_index = start_index + page_size
            end_models = PaginatedResponse[ModelEntity](
                total=len(all_models.items),
                items=all_models.items[start_index:end_index],
            )
            end_models = model_s2t(end_models)
            end_models_hash = dict_to_hashable(models_args)
            cls.models_cache[end_models_hash] = end_models
            return end_models
        else:
            return None

    @classmethod
    async def _get_models(cls, models_args: dict) -> PaginatedResponse[ModelEntity]:
        """獲取模型列表 (非同步)"""
        # 檢查是否有快取的模型
        models_args["page_size"] = models_args.get("page_size", 9)
        models_args["page_number"] = models_args.get("page_number", 1)
        models_hash = dict_to_hashable(models_args)
        # logging.info(models_hash  )
        if models_hash in cls.models_cache:
            logging.info(f"使用快取的模型: {models_hash}")
            return cls.models_cache[models_hash]
        chiness_models = await cls.chiness_models(models_args)  # await 新增
        if chiness_models is not None:
            return chiness_models

        loop = asyncio.get_running_loop()
        # 使用 run_in_executor 執行同步函數
        # 使用 lambda 包裝函數呼叫以傳遞關鍵字參數
        models = await loop.run_in_executor(
            None, lambda: fish_session.list_models(**models_args)
        )
        models = model_s2t(models)
        # 將模型快取
        cls.models_cache[models_hash] = models
        return models

    async def change_page(self, n: int) -> PaginatedResponse[ModelEntity]:
        """獲取下一頁模型列表 (非同步)"""
        self.models_args["page_number"] = self.models_args.get("page_number", 1) + n
        self.models = await self._get_models(self.models_args)  # await 新增
        return self.models


def combine_models(
    *models: PaginatedResponse[ModelEntity],
    sort_by: Literal["task_count", "created_at"] = "task_count",
    size: Optional[int] = None,
) -> PaginatedResponse[ModelEntity]:
    """將多個模型合併為一個模型列表"""
    all_models: list[ModelEntity] = []
    for model in models:
        all_models.extend(model.items)
    if size is not None:
        all_models = all_models[:size]
    all_models.sort(key=lambda x: getattr(x, sort_by), reverse=True)
    return PaginatedResponse[ModelEntity](total=len(all_models), items=all_models)
