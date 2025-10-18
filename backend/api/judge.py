# api/judge_api/judges.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
from pydantic import BaseModel, Field
from typing import List, Literal
from openai import OpenAI
import os
import json
import json
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(prefix="/judges", tags=["Judges"])

# Initialize client lazily
def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY in environment.")
    return OpenAI(api_key=api_key)

def load_personas() -> dict:
    """Load judge personas from the local JSON file."""
    path = os.path.join(os.path.dirname(__file__), "../placeholder/personas.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

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

class MessageRequest(BaseModel):
    judge: str
    conversation_history: ConversationHistory
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
# Initialize client lazily
def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY in environment.")
    return OpenAI(api_key=api_key)

def load_personas() -> dict:
    """Load judge personas from the local JSON file."""
    path = os.path.join(os.path.dirname(__file__), "../placeholder/personas.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

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

class MessageRequest(BaseModel):
    judge: str
    conversation_history: ConversationHistory
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

@router.post("/generate")
async def generate_text(request: MessageRequest):
    """
    Endpoint for a judge persona to respond to a pitch, keeping conversational history.
    """
    allowed_judges = {"altman", "elon", "zuck"}
    judge = request.judge.lower().strip()
    if judge not in allowed_judges:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid judge '{request.judge}'. Must be one of {', '.join(allowed_judges)}."
        )

    client = get_client()

    #placeholder
    system_prompt = get_judge_system_prompt(judge)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(m.dict() for m in request.conversation_history.messages)
    messages.append({"role": "user", "content": request.new_message})

async def generate_text(request: MessageRequest):
    """
    Endpoint for a judge persona to respond to a pitch, keeping conversational history.
    """
    allowed_judges = {"altman", "elon", "zuck"}
    judge = request.judge.lower().strip()
    if judge not in allowed_judges:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid judge '{request.judge}'. Must be one of {', '.join(allowed_judges)}."
        )

    client = get_client()

    #placeholder
    system_prompt = get_judge_system_prompt(judge)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(m.dict() for m in request.conversation_history.messages)
    messages.append({"role": "user", "content": request.new_message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.8,
            messages=messages,
            temperature=0.8,
        )
        return {
            "judge_reply": response.choices[0].message.content.strip()
        }
        return {
            "judge_reply": response.choices[0].message.content.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating judge response: {e}")
