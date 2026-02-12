from os import getenv

from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = getenv("FRONTEND_URL", "https://tier.doong.me/")

API_SERVICE_TIME_OUT = int(getenv("API_SERVICE_TIME_OUT", "300"))

FISH_API_KEY = getenv("FISH_API_KEY", "")

AI_API_KEY = getenv("AI_API_KEY", "")

IMG_API_KEY = getenv("IMG_API_KEY", "")
