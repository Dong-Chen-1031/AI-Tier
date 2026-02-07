from tkinter import N
from typing import Literal, Optional
from uuid import uuid4

import settings  # noqa: E402
from api.services import ApiService  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel
from starlette.responses import StreamingResponse
from utils.log import logger  # noqa: E402

app = FastAPI()

# 添加 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # 允許前端來源
    allow_credentials=True,  # 允許攜帶 cookies
    allow_methods=["*"],  # 允許所有 HTTP 方法
    allow_headers=["*"],  # 允許所有 headers
)
logger.info(f"CORS allow origin: {settings.FRONTEND_URL}")

Tiers = Literal["夯", "頂級", "人上人", "NPC", "拉完了"]


def if_exists(string: str, *args, **kwargs) -> str:
    return string.format(*args, **kwargs) if string else ""


class TierRequest(BaseModel):
    subject: str
    role_name: str = "銳評AI"
    role_description: Optional[str] = N
    tier: Optional[Tiers] = None
    suggestion: Optional[str] = None
    tts: Optional[bool] = None
    tts_model: Optional[str] = None
    tts_speed: float = 1.0
    llm_model: str = "arcee-ai/trinity-large-preview:free"
    style: Optional[str] = None

    def __repr__(self):
        nt = "\n\t"
        return f"TierRequest({nt}subject={self.subject}, {nt}role_name={self.role_name}, {nt}role_description={self.role_description}, {nt}tier={self.tier}, {nt}suggestion={self.suggestion}, {nt}tts={self.tts}, {nt}tts_model={self.tts_model}, {nt}tts_speed={self.tts_speed}, {nt}llm_model={self.llm_model}, {nt}style={self.style}\n)"

    def __str__(self):
        return self.__repr__()

    def to_prompt(self) -> str:
        tt = "銳評"

        prompt = (
            f"你是一個扮演{self.subject}的{tt}AI，你會以從夯到拉完了五個等級來{tt}事物，從好到壞為：夯、頂級、人上人、NPC、拉完了，簡稱「從夯到拉」\n"
            f"你可以將從夯到拉{tt}想像成完成一份 Tier List。像那些 youtuber 或是 直播主，會做的那種 Tier List，從夯到拉完了分成五個等級，然後將事物放在不同的等級裡面，並且給出理由。\n"
            f"口氣不應該為理性分析，而是應該為銳評，帶有主觀情緒的評價，盡情發表你的想法，並且要有說服力，讓人信服你的評價。\n"
            f"你應該輸出一段話，不需要過長、不需要換行，更不需要列點，要簡潔有力，不能超過 100 字，來說明你對這個事物的評價，並且在文中給出一個等級，從夯到拉完了其中一個。\n"
            f"應該多使用「夯」和「拉完了」，因為這樣才有銳評的感覺，如果你給的評價都是「人上人」或是「NPC」，那就太中規中矩了，不夠銳評，十分無聊。\n"
            f"希望內容要能搏人眼球，讓人印象深刻，最好能讓人覺得你這個銳評 AI 是有個性的，甚至是有點毒舌的，這樣才有銳評的感覺。\n"
            f"現在有一個重要的提醒：在文內，必須包含一個 `[從夯到拉]` 的標示，表示在這時將前端網頁上的圖標移動至對應評級，並且要用`[夯]`、`[頂級]`、`[人上人]`、`[NPC]`、`[拉完了]` 之一，包含方括號，但不包含`"
            f"一定要包含此項內容，不然前端網頁不知道何時要將該圖是移至對應評級，但只能出現一次，請注意：此項內容將對使用者隱藏，且不會由文字轉語音模型唸出，因此在使用時通常需要搭配普通文字使用，例如：「這真的必須給到夯[夯]」，而不是「這真的必須給到[夯]」，因為這樣使用這看不到也聽不到「夯這個字」\n"
            f"建議不要太早公布評級，要先描述一下對這個事物的看法，然後在最後才公布評級，這樣才有銳評的感覺，不要一開始就說「這必須給到夯[夯]」，那樣就太無聊了，沒有銳評的感覺了。\n"
            f"由於會由語音模型唸出，因此，請不要使用表情符號及 markdown 語法，這樣語音模型才不會唸得很奇怪，請直接用普通文字來表達你的想法。\n"
            f"請使用台灣繁體中文回答，並且盡量使用口語化的表達方式，這樣才有銳評的感覺了，不要使用太過正式或是書面的語言了，那樣就太無聊了，沒有銳評的感覺了。\n"
            f"這裡提供一些常用的揭露{tt}結果的句子範例，供你參考使用：\n"
            f"1. 這個東西真的必須給到夯[夯]\n"
            f"2. 這大概可以給到[頂級]\n"
            f"3. 這只能給個人上人[人上人]\n"
            f"4. 這只能給個NPC[NPC]\n"
            f"5. 這只能給到拉完了[拉完了]\n"
            f"你可以參考以上的句子範例來表達你的想法，但也可以要有自己的創意，這樣才有銳評的感覺。\n"
            f"你是「{self.role_name}」，請以『{self.role_name}』的身份來進行{tt}，你必須以你對他的了解，投入他的角色，並假裝你就是他，以他的身份，站在他的立場，模仿他的語氣發表評論，例如如果他是古人，且他都使用文言文那你也可以使用文言文來{tt}\n"
            f"你必須以「{self.role_name}」的身份來回答，你是「{self.role_name}」，不用特別說什麼「我{self.role_name}先生在此{tt}（某物品）」，但如果有需要可以自稱「我」之類的，但不能說「{self.role_name}認為」或是「{self.role_name}覺得」，這樣就太無聊了，沒有銳評的感覺了，你必須直接以第一人稱來回答，這樣才有銳評的感覺了\n"
            f"{if_exists('你可以根據使用者提供的角色描述來更好地扮演這個角色，並且給出更符合這個角色的評價，讓你的銳評更有個性，更有說服力。角色描述如下：{}。\n', self.role_description)}"
            f"你今天要銳評的東西是 「{self.subject}」{if_exists('使用者已設定他的評級為「{}」，請按照使用者的描述來完成銳評', self.tier)}\n"
            f"{if_exists('使用者請求你以「{}」的風格來進行銳評。希望你能參考其建議來進行。\n', self.style)}"
            f"{if_exists('以下是一些使用者而額外的請求：{}。\n', self.suggestion)}"
            f"現在請開始你的銳評吧！相信你可做到的！"
        )
        return prompt


class UUIDResponse(BaseModel):
    case_id: str


@app.get("/tts/{case_id}")
async def tts(case_id: str) -> StreamingResponse:
    """處理 TTS 請求，根據 case_id 返回對應的音頻流"""
    return StreamingResponse(
        ApiService.get_api_service(case_id).tts_gen(), media_type="audio/mp3"
    )


@app.get("/text/{case_id}")
async def text(case_id: str) -> StreamingResponse:
    """處理文本流請求，根據 case_id 返回對應的文本流"""
    return StreamingResponse(
        ApiService.get_api_service(case_id).llm_gen(), media_type="text/event-stream"
    )


@app.post("/tier", response_model=UUIDResponse)
async def chat(chat_input: TierRequest) -> UUIDResponse:
    """處理聊天請求，返回一個唯一的 UUID 以識別這次對話"""
    uuid = uuid4().hex

    ApiService(
        prompt=chat_input.to_prompt(),
        case_id=uuid,
        tts_model=chat_input.tts_model,
        tts_speed=chat_input.tts_speed,
    ).start()

    # print(f"Received message: {chat_input}")

    logger.info(f"Received request: {chat_input}")

    return UUIDResponse(case_id=uuid)
