# api/judge_api/judges.py
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from supabase import create_client, Client
from typing import List, Literal
from openai import OpenAI
import os
import json
from pathlib import Path
from dotenv import load_dotenv
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from services.elevenlabs_service import text_to_speech_base64

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(prefix="/judges", tags=["Judges"])

# Initialize client lazily
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY in environment.")
    return OpenAI(api_key=api_key)

def get_supabase_client(user_token: str) -> Client:
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_KEY")
    client = create_client(url, anon_key)
    client.postgrest.auth(user_token)
    return client

def load_personas() -> dict:
    """Load judge personas from the local JSON file."""
    path = os.path.join(os.path.dirname(__file__), "../placeholder/personas.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_chat_history(supabase_session, conversation_id):
    history_resp = (
        supabase_session.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )

def format_openai_messages(history):
    messages = []
    for msg in history:
        messages.append({"role": msg["sender"], "content": msg["content"]})
    return messages

personas = load_personas()

# --- Data Models ---
class JudgePersona(BaseModel):
    name: str
    specialties: List[str]
    investment_style: Literal["conservative", "risk-taker", "analytical", "emotional", "balanced"]
    causes: List[str] = []
    personality_traits: List[str]
    catchphrases: List[str] = []

def get_judge_persona(name: str, personas: dict) -> JudgePersona:
    return JudgePersona(**personas[name])

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ConversationHistory(BaseModel):
    messages: List[Message] = []

class NewMessageRequest(BaseModel):
    conversation_id: str
    new_message: str


def get_judge_system_prompt(name: str) -> str:
    personas = load_personas()
    judge_persona: JudgePersona = get_judge_persona(name, personas)

    return f"""
    You are {judge_persona.name}, an investor on Shark Tank.
    Personality traits: {', '.join(judge_persona.personality_traits)}.
    Investment style: {judge_persona.investment_style}.
    Specialties: {', '.join(judge_persona.specialties)}.
    Causes: {', '.join(judge_persona.causes)}.
    Catchphrases: {', '.join(judge_persona.catchphrases)}.

    Stay in character. Be direct, insightful, and occasionally use your catchphrases.
    """

class SelectJudgeRequest(BaseModel):
    judge: Literal["altman", "elon", "zuck"]

class EndConversationRequest(BaseModel):
    conversation_id: str

# --- Endpoint 1: Select a judge and start conversation ---
@router.post("/select")
async def select_judge(request: SelectJudgeRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client(token)    
    user_id = supabase.auth.get_user()

    # Validate judge
    judge = request.judge.lower().strip()
    allowed_judges = {"altman", "elon", "zuck"}
    if judge not in allowed_judges:
        raise HTTPException(status_code=400, detail=f"Invalid judge '{judge}'")

    # Create new conversation
    convo_resp = supabase.table("conversations").insert({
        "user_id": user_id,
        "judge_name": judge
    }).execute()
    conversation_id = convo_resp.data[0]["id"]

    # Insert the judge system prompt as the first message
    system_prompt = get_judge_system_prompt(judge)
    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "sender": "system",
        "content": system_prompt
    }).execute()

    return {"conversation_id": conversation_id, "judge": judge}

@router.post("/generate")
async def generate_text(request: NewMessageRequest, authorization: str = Header(...)):
    """
    Endpoint for a judge persona to respond to a pitch, keeping conversational history.
    Returns both text and audio URL.
    """
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client(token)
    client = get_openai_client()

    # 🧠 Load existing conversation history
    history_resp = get_chat_history(supabase, request.conversation_id)
    history = history_resp.data or []

    if not history:
        raise HTTPException(status_code=404, detail="Conversation not found or empty")

    # 🔍 Get the judge name from the conversation
    convo_resp = supabase.table("conversations").select("judge_name").eq("id", request.conversation_id).execute()
    if not convo_resp.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    judge_name = convo_resp.data[0].get("judge_name", "altman")

    # 🧩 Convert history into OpenAI message format
    messages = format_openai_messages(history)
    messages.append({"role": "user", "content": request.new_message})

    supabase.table("messages").insert({
        "conversation_id": request.conversation_id,
        "sender": "user",
        "content": request.new_message
    }).execute()

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.8,
        )
        reply = response.choices[0].message.content.strip()

        # 🎙️ Convert text to speech using ElevenLabs (no file storage)
        try:
            audio_base64 = text_to_speech_base64(reply, judge_name)
        except Exception as audio_error:
            print(f"Warning: Failed to generate audio: {audio_error}")
            audio_base64 = None

        # 💾 Save assistant reply
        supabase.table("messages").insert({
            "conversation_id": request.conversation_id,
            "sender": "assistant",
            "content": reply
        }).execute()

        return {
            "judge_reply": reply,
            "audio_base64": audio_base64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating judge response: {e}")


# --- Endpoint 3: Serve audio files ---
@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """
    Serve generated audio files.
    """
    audio_dir = Path(__file__).parent.parent / "audio_files"
    audio_path = audio_dir / filename

    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=filename
    )


# --- Endpoint 4: End conversation and delete all messages ---
@router.post("/end")
async def end_conversation(request: EndConversationRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client(token)

    try:

        # 🗑️ Delete all messages
        supabase.table("messages").delete().eq("conversation_id", request.conversation_id).execute()

        # (Optional) Delete the conversation itself
        # supabase.table("conversations").delete().eq("id", request.conversation_id).execute()

        return {"message": "Conversation and messages deleted successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending conversation: {e}")