import asyncio
import json
import pathlib
import shutil

from api.Tts import get_models
from utils.log import logger


async def fetch_one(sort_by: str = "score", auto_copy: bool = True) -> None:
    """從 Fish API 根據指定的排序方式獲取模型列表並保存到本地 JSON 文件"""
    logger.info(f"Fetching models sorted by {sort_by}...")

    output_path = f"storage/fish_model/{sort_by}.json"

    with open(output_path, "w", encoding="utf-8") as f:
        for attempt in range(5):
            try:
                models = await get_models(sort_by=sort_by)
                break
            except Exception as e:
                logger.error(f"Error fetching models sorted by {sort_by}: {e}")
                if attempt == 2:
                    logger.error(
                        f"Failed to fetch models sorted by {sort_by} after 3 attempts."
                    )
                    return
                continue
        json.dump(models, f, ensure_ascii=False)

    if auto_copy:
        frontend_json = f"../frontend/assets/fish_model/{sort_by}.json"
        path2 = pathlib.Path(__file__).parent.parent / frontend_json
        # logger.info(f"Checking if frontend path {path2} exists for copying...")

        if path2.parent.exists():
            shutil.copyfile(pathlib.Path(output_path), path2)
            logger.info(
                f"model JSON file has been copied to {frontend_json} successfully."
            )


async def main(auto_copy: bool = True):
    await asyncio.gather(
        *[
            fetch_one(sort_by=sort_by, auto_copy=auto_copy)
            for sort_by in ["task_count", "created_at", "score"]
        ]
    )


if __name__ == "__main__":
    asyncio.run(main())
