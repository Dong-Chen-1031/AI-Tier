# AI-Tier

Ever wanted a brutally honest AI to tier literally anything and rank it on a tier list? That is exactly what AI-Tier does. Type in a subject — a person, food, concept, whatever — input a character for the AI to roleplay as (Trump, Steve Jobs, you name it), and watch it roast or praise your subject in real time. The verdict arrives with a matching image, an animated tier placement, and optionally read aloud in the voice of almost any public figure on the planet.

Live demo: https://ai-tier.doong.me

## Features

- **AI-generated tier reviews** — Feed the AI a subject and choose who delivers the verdict. Make Trump rank your lunch choices. Have Steve Jobs critique your productivity habits. The AI fully commits to the persona and streams back an in-character review with a final tier assignment.
- **Animated tier placement** — The moment the AI reaches its verdict, the subject's image physically slides into its tier column. Powered by Motion, so it looks satisfying every single time.
- **Text-to-speech with celebrity voices** — Because reading "bottom tier" is one thing; hearing Elon Musk say it is another. Fish Audio gives you access to an enormous library of public-figure voice models — Trump, Jobs, Musk, and countless others — so the persona the AI writes can also be the voice that reads it.
- **Automatic image search** — No need to upload anything. The app finds a relevant image for your subject automatically via the Serper Google Images API.
- **Shareable results** — Judged your entire friend group? Save the whole tier list as a shareable link and let the chaos begin.
- **Multiple LLM models** — Pick from several Google Gemini models routed through Cloudflare AI Gateway, in case you need a second opinion.
- **Internationalization** — The UI is fully translated into English and Traditional Chinese, with automatic language detection via `i18next-browser-languagedetector`.
- **Bot protection** — Cloudflare Turnstile keeps automated abuse away so the AI's opinions stay yours.

## Tech Stack

**Frontend**

- React 19, TypeScript, Vite
- Tailwind CSS v4, shadcn/ui, Radix UI
- React Router v7, React Hook Form, Axios
- Framer Motion (animation)
- Cloudflare Turnstile (`@marsidev/react-turnstile`)

**Backend**

- FastAPI (Python, async)
- OpenAI SDK — calls Google Gemini via Cloudflare AI Gateway
- Fish Audio SDK — WebSocket TTS streaming
- httpx, aiofiles, OpenCC, pyturnstile, python-dotenv

## Project Structure

```
.
├── frontend/          # React + Vite frontend
│   ├── pages/         # home.tsx (main tier list), shared.tsx
│   ├── components/    # UI components (shadcn-based)
│   ├── contexts/      # ReviewCaseContext — global state
│   └── config/        # constants.ts (tiers, API endpoint)
└── backend/           # FastAPI backend
    ├── main.py        # App entry, routes, request models
    ├── settings.py    # Environment variable loading
    ├── api/
    │   ├── services.py  # ApiService — dual-stream broadcaster
    │   ├── ai.py        # LLM streaming (SSE)
    │   ├── tts.py       # Fish Audio TTS streaming
    │   └── img.py       # Image search (Serper)
    └── storage/         # Persisted audio files and share cases
```

## API Endpoints

| Method | Path                | Description                                              |
| ------ | ------------------- | -------------------------------------------------------- |
| `POST` | `/tier`             | Create a review request; returns `case_id` and image URL |
| `GET`  | `/text/{case_id}`   | SSE stream of the AI-generated review text               |
| `GET`  | `/tts/{case_id}`    | MP3 audio stream of the TTS reading                      |
| `GET`  | `/models`           | List available Fish Audio TTS models                     |
| `POST` | `/save-cases`       | Save review cases and return a share ID                  |
| `GET`  | `/share/{share_id}` | Retrieve cases for a given share ID                      |

In development mode (`APP_MODE=dev`), interactive API docs are available at `/docs` and `/redoc`.

## Getting Started

### Prerequisites

- Node.js with [Bun](https://bun.sh)
- Python 3.11+

### Installation

```bash
# Install frontend dependencies
bun install

# Install backend dependencies
cd backend && pip install -r requirements.txt
```

### Environment Variables

Create `backend/.env`:

```env
FRONTEND_URL=http://127.0.0.1:3000
API_SERVICE_TIME_OUT=300
FISH_API_KEY=          # Fish Audio API key (TTS)
AI_API_KEY=            # AI API key (Cloudflare AI Gateway)
IMG_API_KEY=           # Serper API key (image search)
TURNSTILE_SECRET_KEY=  # Cloudflare Turnstile secret key
APP_MODE=dev           # Set to "dev" to enable /docs
```

Create `.env` in the project root:

```env
VITE_API_ENDPOINT=http://127.0.0.1:8000
VITE_TURNSTILE_SITE_KEY=   # Cloudflare Turnstile site key
```

### Running in Development

```bash
bun run dev
```

This starts both services concurrently:

- Frontend (Vite) on `http://127.0.0.1:3000`
- Backend (FastAPI) on `http://127.0.0.1:8000`

You can also run them separately:

```bash
bun run frontend   # Vite dev server
bun run backend    # FastAPI dev server
```

## Architecture Notes

**Dual-stream broadcaster** — The LLM produces one stream of tokens, but two consumers need it at the same time: the frontend for live text display, and Fish Audio for TTS input. `ApiService` solves this with a pub/sub queue that fans the stream out to both without either side waiting on the other.

**Tier marker protocol** — The AI sneaks bracket markers like `[S]` or `[D]` into its output at the moment of judgment. The frontend watches for these, fires the tier placement animation, then silently drops the marker before rendering text or sending audio to TTS. The user never sees the brackets; they only see the drama.

**TTS audio persistence** — Every voice reading is saved to `storage/audio/{case_id}.mp3` as it streams, so it can be served as a static file afterward without re-generating anything.

**Fish Audio model caching** — TTS model metadata lives in `storage/fish_model/` so the app does not hammer the Fish Audio API on every request.

## License

MIT License. See [LICENSE](LICENSE) for details.
