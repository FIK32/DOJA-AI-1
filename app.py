import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import ai_engine

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="DOJA AI", version="0.1.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


class ChatMessage(BaseModel):
    role: str
    content: str = Field(max_length=12000)


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=12000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


@app.get("/")
def home():
    return FileResponse(BASE_DIR / "index.html")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "DOJA AI",
        "ai_configured": bool(os.getenv("GROQ_API_KEY")),
    }


@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        answer = ai_engine.ask(
            prompt=request.prompt.strip(),
            history=[
                {"role": message.role, "content": message.content}
                for message in request.history
                if message.role in {"user", "assistant"}
            ],
        )
        return {"response": answer}
    except ai_engine.AIConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except ai_engine.AIProviderError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
