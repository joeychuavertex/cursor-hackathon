# api/transcribe.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Header, Form
from typing import Optional
import httpx
import os
from dotenv import load_dotenv
import tempfile
from pathlib import Path
import asyncio

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))

router = APIRouter(prefix="/elevenlabs", tags=["Transcribe"])

@router.post("/stt")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio file using ElevenLabs Scribe V1 API.
    
    Accepts audio file in various formats (WAV, MP3, WebM, MPEG).
    Returns transcribed text.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY") or os.getenv("NEXT_PUBLIC_ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY not configured in environment variables"
        )
    
    # Create a temporary file to store the uploaded audio
    temp_file = None
    try:
        # Read the uploaded file content
        audio_content = await audio.read()
        
        # Create a temporary file with the appropriate extension
        suffix = Path(audio.filename or "audio.wav").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(audio_content)
            temp_file_path = temp_file.name
        
        # Send the audio to ElevenLabs Scribe V1 API
        async with httpx.AsyncClient(timeout=60.0) as client:
            with open(temp_file_path, 'rb') as f:
                files = {'audio': (audio.filename or 'audio.wav', f, audio.content_type or 'audio/wav')}
                headers = {'xi-api-key': api_key}
                
                response = await client.post(
                    'https://api.elevenlabs.io/v1/speech-to-text',
                    headers=headers,
                    files=files
                )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if response.status_code != 200:
            error_detail = response.text
            raise HTTPException(
                status_code=response.status_code,
                detail=f"ElevenLabs API error: {error_detail}"
            )
        
        # ElevenLabs returns {"text": "transcribed content"}
        result = response.json()
        transcript = result.get('text', '')
        
        return {"transcript": transcript}
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Transcription request timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to ElevenLabs API: {str(e)}")
    except Exception as e:
        # Clean up temp file if it exists
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/audio-with-judge")
async def transcribe_and_generate(
    audio: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    authorization: str = Header(None)
):
    """
    Transcribe audio file and optionally send to judge for response generation.
    
    This endpoint:
    1. Transcribes the audio using ElevenLabs Scribe V1
    2. If conversation_id and authorization are provided, sends transcript to judge
    3. Returns both transcript and judge response (if applicable)
    
    This reduces latency by handling both operations in one request.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY") or os.getenv("NEXT_PUBLIC_ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY not configured in environment variables"
        )
    
    # Create a temporary file to store the uploaded audio
    temp_file = None
    try:
        # Read the uploaded file content
        audio_content = await audio.read()
        
        # Create a temporary file with the appropriate extension
        suffix = Path(audio.filename or "audio.wav").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(audio_content)
            temp_file_path = temp_file.name
        
        # Send the audio to ElevenLabs Scribe V1 API
        async with httpx.AsyncClient(timeout=60.0) as client:
            with open(temp_file_path, 'rb') as f:
                files = {'audio': (audio.filename or 'audio.wav', f, audio.content_type or 'audio/wav')}
                headers = {'xi-api-key': api_key}
                
                response = await client.post(
                    'https://api.elevenlabs.io/v1/speech-to-text',
                    headers=headers,
                    files=files
                )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if response.status_code != 200:
            error_detail = response.text
            raise HTTPException(
                status_code=response.status_code,
                detail=f"ElevenLabs API error: {error_detail}"
            )
        
        # ElevenLabs returns {"text": "transcribed content"}
        result = response.json()
        transcript = result.get('text', '')
        
        # If conversation_id and authorization are provided, send to judge
        judge_reply = None
        if conversation_id and authorization:
            try:
                # Import judge functions
                from api.judge import get_supabase_client, get_openai_client, get_chat_history, format_openai_messages
                
                token = authorization.replace("Bearer ", "")
                supabase = get_supabase_client(token)
                openai_client = get_openai_client()
                
                # Verify user authentication
                user_response = supabase.auth.get_user(token)
                if not user_response or not user_response.user:
                    raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
                
                # Load conversation history
                history_resp = get_chat_history(supabase, conversation_id)
                history = history_resp.data or []
                
                if not history:
                    raise HTTPException(status_code=404, detail="Conversation not found or empty")
                
                # Convert history into OpenAI message format
                messages = format_openai_messages(history)
                messages.append({"role": "user", "content": transcript})
                
                # Save user message to database
                supabase.table("messages").insert({
                    "conversation_id": conversation_id,
                    "sender": "user",
                    "content": transcript
                }).execute()
                
                # Generate judge response
                openai_response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.8,
                )
                judge_reply = openai_response.choices[0].message.content.strip()
                
                # Save assistant reply to database
                supabase.table("messages").insert({
                    "conversation_id": conversation_id,
                    "sender": "assistant",
                    "content": judge_reply
                }).execute()
                
            except Exception as judge_error:
                # Log judge error but still return transcript
                print(f"Judge generation error: {judge_error}")
                # Don't fail the entire request if judge fails
                pass
        
        return {
            "transcript": transcript,
            "judge_reply": judge_reply
        }
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Transcription request timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to ElevenLabs API: {str(e)}")
    except Exception as e:
        # Clean up temp file if it exists
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

