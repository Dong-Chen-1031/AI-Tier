import httpx
from settings import IMG_API_KEY


async def search_images(query: str) -> list[str]:
    url = "https://google.serper.dev/images"
    payload = {"q": query, "gl": "tw", "hl": "zh-tw"}
    headers = {
        "X-API-KEY": IMG_API_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        data = response.json().get("images", [])
    return [i["imageUrl"] for i in data]
