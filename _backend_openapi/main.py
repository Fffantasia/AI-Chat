from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React por defecto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])

    async def stream_response():
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            stream=True
        )
        async for chunk in response:
            if chunk.choices[0].delta.get("content"):
                yield chunk.choices[0].delta.content

    return StreamingResponse(stream_response(), media_type="text/plain")
