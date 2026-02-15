from os import getenv
from typing import Literal, get_args

from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = getenv("FRONTEND_URL", "http://127.0.0.1:3000")

API_SERVICE_TIME_OUT = int(getenv("API_SERVICE_TIME_OUT", "300"))

FISH_API_KEY = getenv("FISH_API_KEY", "")

AI_API_KEY = getenv("AI_API_KEY", "")

IMG_API_KEY = getenv("IMG_API_KEY", "")

DEV_MODE = getenv("APP_MODE", "production") == "dev"

LLMs = Literal[
    "google/gemini-2.5-flash",
    "google/gemini-2-flash",
    "google/gemini-2-flash-lite",
    "google/gemini-2.5-flash-lite",
    "google/gemini-3-flash",
]

LLMs_list = list(get_args(LLMs))


LLMs_to_api = {
    model: model.replace("google", "google-ai-studio") for model in LLMs_list
}
