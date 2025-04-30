from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from dotenv import load_dotenv
import torch, os, asyncio

# Load environment variables
load_dotenv()
hf_token = os.getenv("HF_TOKEN")

# Model
model_id = "tiiuae/falcon-7b-instruct"
device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = None
model = None
is_generating = False

app = FastAPI()

# Allow petitions from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and tokenizes it
def load_model():
    global model, tokenizer
    if model is None or tokenizer is None:
        print("Cargando modelo...")
        tokenizer_local = AutoTokenizer.from_pretrained(model_id, token=hf_token)
        model_local = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto",
            token=hf_token
        )
        tokenizer = tokenizer_local
        model = model_local
        print("Modelo cargado")

# Initializes the model
@app.on_event("startup")
async def startup_event():
    try:
        load_model()
    except Exception as e:
        print("Error al cargar modelo:", e)

# Check if the AI is ready
@app.get("/status")
def status():
    return {
        "ready": model is not None and tokenizer is not None,
        "busy": is_generating
    }

# Send the stream to the AI while the client is connected
@app.post("/chat")
async def chat(request: Request):
    global is_generating
    is_generating = True

    try:
        body = await request.json()
        messages = body.get("messages", [])
        prompt = build_prompt(messages)

        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

        generation_kwargs = dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=256,
            do_sample=True,
            temperature=0.7,
            top_p=0.95,
            eos_token_id=tokenizer.eos_token_id,
        )

        generation_task = asyncio.to_thread(model.generate, **generation_kwargs)

        async def stream_gen():
            await generation_task
            for token in streamer:
                if await request.is_disconnected():
                    print("⚠️ Cliente desconectado durante generación.")
                    break
                yield token
                await asyncio.sleep(0.01)

        return StreamingResponse(stream_gen(), media_type="text/plain")

    finally:
        is_generating = False

# Chat Definition
def build_prompt(messages):
    prompt = ""
    for msg in messages:
        if msg["role"] == "user":
            # prompt += f"User: {msg['content']}\n"
            prompt += f"{msg['content']}\n"
        elif msg["role"] == "assistant":
            # prompt += f"Assistant: {msg['content']}\n"
            prompt += f"{msg['content']}\n"
    prompt += "Assistant: "
    return prompt