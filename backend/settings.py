from os import getenv

from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = getenv("FRONTEND_URL", "http://127.0.0.1:3000")
