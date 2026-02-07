import datetime
import logging
import os

from rich.console import Console
from rich.logging import RichHandler
from rich.theme import Theme

# 設定Rich主題
custom_theme = Theme({"info": "cyan", "warning": "yellow", "error": "bold red"})
console = Console(theme=custom_theme)

# 設定日誌系統
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

current_time = datetime.datetime.now().strftime("%Y-%m-%d")
log_file = f"{log_dir}/{current_time}.log"

# 設定logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 設定Rich handler (控制台輸出)
rich_handler = RichHandler(
    console=console, rich_tracebacks=True, tracebacks_show_locals=False
)
rich_handler.setLevel(logging.INFO)

# 設定File handler (檔案輸出)
file_handler = logging.FileHandler(filename=log_file, encoding="utf-8", mode="a")
file_handler.setLevel(logging.DEBUG)
file_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(file_format)

# 添加handlers
logger.addHandler(rich_handler)
logger.addHandler(file_handler)

for _, old_logger in logging.root.manager.loggerDict.items():
    old_logger.handlers = []  # type: ignore
