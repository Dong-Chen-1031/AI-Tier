#!/usr/bin/env python3
from typing import Annotated

import typer
from utils.log import logger

app = typer.Typer(suggest_commands=True)


@app.command()
def models(
    auto_copy: Annotated[bool, typer.Option("--auto-copy/--no-auto-copy")] = True,
    lang: Annotated[
        str, typer.Option("--lang", "-l", help="Language: zh-TW or en")
    ] = "zh-TW",
):
    """獲取模型列表並保存到本地 JSON 文件"""
    import asyncio

    from utils.fish_model import main

    logger.info(f"Start fetching models (lang={lang})...")
    asyncio.run(main(auto_copy, lang=lang))
    logger.info("Finished fetching models.")


if __name__ == "__main__":
    app()
