# api/judge_api/judges.py
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from supabase import create_client, Client
from typing import List, Literal
from openai import OpenAI
import os
import json
import time
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

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
    
    client = create_client(url, anon_key)
    # Set the user token for authentication
    client.auth.set_session(user_token, "")
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
    judge: Literal["altman", "elon", "zuck"] = None

class EndConversationRequest(BaseModel):
    conversation_id: str

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
async def select_judge(request: SelectJudgeRequest = None, authorization: str = Header(None)):
    """
    Endpoint to either:
    1. Get list of available judges (no auth required)
    2. Select a judge and start conversation (auth required)
    """
    
    # If a specific judge is requested, require authentication and start conversation
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required to select a judge")
    
    token = authorization.replace("Bearer ", "")
    print("TOKEN INCOMING")
    print(token)
    
    # For now, bypass Supabase authentication and return a mock response
    # TODO: Fix Supabase authentication properly
    try:
        supabase = get_supabase_client(token)   
        print(supabase) 
        user_response = supabase.auth.get_user()
        print(12344)
        print(user_response)
        
        if not user_response or not user_response.user:
            # Return mock response for now
            print("Using mock response due to auth failure")
            judge = request.judge.lower().strip()
            allowed_judges = {"altman", "elon", "zuck"}
            if judge not in allowed_judges:
                raise HTTPException(status_code=400, detail=f"Invalid judge '{judge}'")
            
            # Return a mock conversation ID
            mock_conversation_id = f"mock_conversation_{judge}_{int(time.time())}"
            return {"conversation_id": mock_conversation_id, "judge": judge}
        
        user_id = user_response.user.id

        # Validate judge
        judge = request.judge.lower().strip()
        allowed_judges = {"altman", "elon", "zuck"}
        if judge not in allowed_judges:
            raise HTTPException(status_code=400, detail=f"Invalid judge '{judge}'")

        # Create new conversation
        convo_resp = supabase.table("conversations").insert({
            "user_id": user_id
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
    
    except Exception as e:
        print(f"Supabase error: {e}")
        # Return mock response on any error
        judge = request.judge.lower().strip()
        allowed_judges = {"altman", "elon", "zuck"}
        if judge not in allowed_judges:
            raise HTTPException(status_code=400, detail=f"Invalid judge '{judge}'")
        
        # Return a mock conversation ID
        import time
        mock_conversation_id = f"mock_conversation_{judge}_{int(time.time())}"
        return {"conversation_id": mock_conversation_id, "judge": judge}

@router.post("/generate")
async def generate_text(request: NewMessageRequest, authorization: str = Header(...)):
    """
    Endpoint for a judge persona to respond to a pitch, keeping conversational history.
    """
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase_client(token)  
    client = get_openai_client()

    # 🧠 Load existing conversation history
    history_resp = get_chat_history(supabase, request.conversation_id)
    history = history_resp.data or []

    if not history:
        raise HTTPException(status_code=404, detail="Conversation not found or empty")

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
        # 💾 Save assistant reply
        supabase.table("messages").insert({
            "conversation_id": request.conversation_id,
            "sender": "assistant",
            "content": reply
        }).execute()

        return {
            "judge_reply": response.choices[0].message.content.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating judge response: {e}")


# --- Endpoint 3: End conversation and delete all messages ---
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