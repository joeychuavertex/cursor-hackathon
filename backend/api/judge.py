# api/judge_api/judges.py
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from supabase import create_client, Client
from typing import List, Literal
from openai import OpenAI
import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from services.elevenlabs_service import text_to_speech_base64


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))

router = APIRouter(prefix="/judges", tags=["Judges"])

# Initialize client lazily
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY in environment.")
    return OpenAI(api_key=api_key)

def get_supabase_client(user_token: str) -> Client:
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not url or not anon_key:
        raise RuntimeError("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    # Create client with anon key - we'll verify the user token separately
    client = create_client(url, anon_key)
    
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
    return history_resp

def format_openai_messages(history):
    messages = []
    for msg in history:
        messages.append({"role": msg["sender"], "content": msg["content"]})
    return messages

def extract_judge_key_from_history(history):
    """Extract judge key from the system prompt in conversation history."""
    personas = load_personas()
    for msg in history:
        if msg["sender"] == "system":
            content = msg["content"]
            # Match against each persona's name
            for key, persona_data in personas.items():
                judge_persona = JudgePersona(**persona_data)
                if f"You are {judge_persona.name}" in content:
                    return key
    return None

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

class GetScoreRequest(BaseModel):
    conversation_id: str

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
    judge: Literal["altman", "elon", "zuck"] = None

class EndConversationRequest(BaseModel):
    conversation_id: str

from pydantic import BaseModel, Field

class InvestmentMemo(BaseModel):
    recommendation: str = Field(..., description="Investment recommendation summary and rationale.")
    summary: str = Field(..., description="Brief overview of the investment opportunity.")
    valueProposition: str = Field(..., description="Description of what makes the product or service unique.")
    market: str = Field(..., description="Market size, segment, and opportunity details.")
    product: str = Field(..., description="Overview of the product, its features, and technology.")
    metrics: str = Field(..., description="Performance and traction metrics, formatted with bullet points if needed.")
    risks: str = Field(..., description="Key risks and challenges associated with the investment.")
    team: str = Field(..., description="Information about the founding or executive team.")
    deal: str = Field(..., description="Deal terms, valuation, and funding details.")
    scenarioAnalysis: str = Field(..., description="Revenue projections or scenarios (conservative, base, optimistic).")
    conclusion: str = Field(..., description="Final investment conclusion and outlook.")

class PresentationMetrics(BaseModel):
    clarity: float = Field(..., description="How clear the presentation is, on a scale from 0–10.")
    confidence: float = Field(..., description="Perceived confidence of the presenter, 0–10.")
    engagement: float = Field(..., description="Audience engagement level, 0–10.")
    structure: float = Field(..., description="Organization and flow of content, 0–10.")
    delivery: float = Field(..., description="Effectiveness of delivery and communication, 0–10.")
    overall: float = Field(..., description="Overall presentation quality, 0–10.")

class InvestmentMemoOutput(BaseModel):
    memo: InvestmentMemo
    metrics: PresentationMetrics


@router.get("/get_judges")
async def get_judges():
    
    try:
        personas = load_personas()
        judges = []
        for judge_id, persona in personas.items():
            # Map investment_style to scoring criteria
            scoring_criteria = {
                "innovation": 0.2,
                "marketPotential": 0.2,
                "team": 0.2,
                "financials": 0.2,
                "presentation": 0.2
            }
            
            # Adjust scoring based on investment style
            if persona["investment_style"] == "risk-taker":
                scoring_criteria["innovation"] = 0.4
                scoring_criteria["marketPotential"] = 0.3
                scoring_criteria["financials"] = 0.1
            elif persona["investment_style"] == "analytical":
                scoring_criteria["financials"] = 0.4
                scoring_criteria["innovation"] = 0.1
            elif persona["investment_style"] == "emotional":
                scoring_criteria["team"] = 0.4
                scoring_criteria["presentation"] = 0.3
            elif persona["investment_style"] == "balanced":
                # Keep default balanced scoring
                pass
            
            judge = {
                "id": judge_id,
                "name": persona["name"],
                "personality": ", ".join(persona["personality_traits"]),
                "expertise": persona["specialties"],
                "investmentStyle": persona["investment_style"],
                "causes": persona["causes"],
                "catchphrases": persona["catchphrases"]
            }
            judges.append(judge)
        
        return {"judges": judges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading judges: {e}")

# --- Endpoint 1: Get judges list or select a judge ---
@router.post("/select")
async def select_judge(request: SelectJudgeRequest, authorization: str = Header(...)):
    """
    Endpoint to select a judge and start conversation (auth required)
    """
    
    if not request or not request.judge:
        raise HTTPException(status_code=400, detail="Judge selection is required")
    
    # Extract and validate authorization token
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Initialize Supabase client
        supabase = get_supabase_client(token)
        
        # Verify user authentication using the token directly
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
        
        user_id = user_response.user.id

        # Validate judge selection
        judge = request.judge.lower().strip()
        allowed_judges = {"altman", "elon", "zuck"}
        if judge not in allowed_judges:
            raise HTTPException(status_code=400, detail=f"Invalid judge '{judge}'. Must be one of: {', '.join(allowed_judges)}")

        # Create new conversation in database
        convo_resp = supabase.table("conversations").insert({
            "user_id": user_id
        }).execute()
        
        if not convo_resp.data or len(convo_resp.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
            
        conversation_id = convo_resp.data[0]["id"]

        # Insert the judge system prompt as the first message
        system_prompt = get_judge_system_prompt(judge)
        message_resp = supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "sender": "system",
            "content": system_prompt
        }).execute()
        
        if not message_resp.data:
            raise HTTPException(status_code=500, detail="Failed to initialize conversation with judge")

        return {"conversation_id": conversation_id, "judge": judge}
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error in select_judge: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/generate")
async def generate_text(request: NewMessageRequest, authorization: str = Header(...)):
    """
    Endpoint for a judge persona to respond to a pitch, keeping conversational history.
    Returns both text and audio URL.
    """
    print(f"🎯 /judges/generate endpoint called with conversation_id: {request.conversation_id}")
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client(token)
    client = get_openai_client()
    
    # Verify user authentication
    user_response = supabase.auth.get_user(token)
    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

    # 🧠 Load existing conversation history
    history_resp = get_chat_history(supabase, request.conversation_id)
    history = history_resp.data or []

    if not history:
        raise HTTPException(status_code=404, detail="Conversation not found or empty")

    # Extract judge key from conversation history
    print(f"🔍 Extracting judge key from history (history length: {len(history)})")
    judge_key = extract_judge_key_from_history(history)
    print(f"🎭 Judge key extracted: {judge_key}")
    if not judge_key:
        raise HTTPException(status_code=400, detail="Could not determine judge from conversation history")

    # 🧩 Convert history into OpenAI message format
    messages = format_openai_messages(history)
    messages.append({"role": "user", "content": request.new_message})

    supabase.table("messages").insert({
        "conversation_id": request.conversation_id,
        "sender": "user",
        "content": request.new_message
    }).execute()

    try:
        print(f"🤖 Calling OpenAI with {len(messages)} messages")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.8,
        )
        reply = response.choices[0].message.content.strip()
        print(f"✅ OpenAI response received (length: {len(reply)})")

        # 🎙️ Convert text to speech using ElevenLabs (no file storage)
        try:
            print(f"🎙️ Generating audio for judge: {judge_key}")
            audio_base64 = text_to_speech_base64(reply, judge_key)
            print(f"✅ Audio generated successfully")
        except Exception as audio_error:
            print(f"⚠️ Warning: Failed to generate audio: {audio_error}")
            audio_base64 = None

        # 💾 Save assistant reply
        print(f"💾 Saving assistant reply to database")
        supabase.table("messages").insert({
            "conversation_id": request.conversation_id,
            "sender": "assistant",
            "content": reply
        }).execute()

        print(f"🎉 Response generated successfully, returning to client")
        return {
            "judge_reply": response.choices[0].message.content.strip(),
            "audio_base64": audio_base64
        }
    except Exception as e:
        print(f"❌ Error generating judge response: {e}")
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
    
    # Verify user authentication
    user_response = supabase.auth.get_user(token)
    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

    try:

        # 🗑️ Delete all messages
        supabase.table("messages").delete().eq("conversation_id", request.conversation_id).execute()

        # (Optional) Delete the conversation itself
        # supabase.table("conversations").delete().eq("id", request.conversation_id).execute()

        return {"message": "Conversation and messages deleted successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending conversation: {e}")


@router.post("/get_score")
async def end_conversation(request: GetScoreRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client(token)  
    client = get_openai_client()

    # 🧠 Load existing conversation history
    history_resp = get_chat_history(supabase, request.conversation_id)
    history = history_resp.data or []

    if not history:
        raise HTTPException(status_code=404, detail="Conversation not found or empty")


    instructions: str = "Now given all of the above chat history, i want you to give a comprehensive overview of how well this pitch preformed using the given structure"

    # 🧩 Convert history into OpenAI message format
    messages = format_openai_messages(history)
    messages.append({"role": "user", "content": instructions})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.8,
            response_format=InvestmentMemoOutput,
        )
        reply = response.choices[0].message.content.strip()

        return {
            "memo": reply.memo,
            "metrics": reply.metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating judge response: {e}")