#!/usr/bin/env python3
from typing import Annotated

import typer
from utils.log import logger

app = typer.Typer(suggest_commands=True)


@app.command()
def models(
    auto_copy: Annotated[bool, typer.Option("--auto-copy/--no-auto-copy")] = True,
):
    """獲取模型列表並保存到本地 JSON 文件"""
    import asyncio

    from utils.fish_model import main

    logger.info("Start fetching models...")
    asyncio.run(main(auto_copy))
    logger.info("Finished fetching models.")


if __name__ == "__main__":
    app()
