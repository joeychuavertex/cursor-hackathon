# services/elevenlabs_service.py
import os
import uuid
import time
import base64
from pathlib import Path
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from io import BytesIO

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

# Initialize ElevenLabs client
def get_elevenlabs_client():
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise RuntimeError("Missing ELEVENLABS_API_KEY in environment.")
    return ElevenLabs(api_key=api_key)

# Voice ID mapping for each judge
JUDGE_VOICE_IDS = {
    "altman": "21m00Tcm4TlvDq8ikWAM",  # Default voice - you can replace with specific voices
    "elon": "pNInz6obpgDQGcFmaJgB",     # Default voice - you can replace with specific voices
    "zuck": "ErXwobaYiN019PkySvjV"      # Default voice - you can replace with specific voices
}

def get_voice_id_for_judge(judge_name: str) -> str:
    """Get the appropriate ElevenLabs voice ID for a judge."""
    return JUDGE_VOICE_IDS.get(judge_name.lower(), JUDGE_VOICE_IDS["altman"])

def text_to_speech_base64(text: str, judge_name: str) -> str:
    """
    Convert text to speech using ElevenLabs API and return as base64 string.
    No file storage needed - audio data is returned directly.

    Args:
        text: The text to convert to speech
        judge_name: The name of the judge (to select appropriate voice)

    Returns:
        Base64 encoded audio data
    """
    client = get_elevenlabs_client()
    voice_id = get_voice_id_for_judge(judge_name)

    # Generate speech
    response = client.text_to_speech.convert(
        voice_id=voice_id,
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_turbo_v2_5",
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    # Collect audio bytes in memory
    audio_bytes = BytesIO()
    for chunk in response:
        if chunk:
            audio_bytes.write(chunk)

    # Convert to base64
    audio_bytes.seek(0)
    base64_audio = base64.b64encode(audio_bytes.read()).decode('utf-8')

    return base64_audio


def text_to_speech_bytes(text: str, judge_name: str) -> bytes:
    """
    Convert text to speech using ElevenLabs API and return raw bytes.
    No file storage needed - audio data is returned directly.

    Args:
        text: The text to convert to speech
        judge_name: The name of the judge (to select appropriate voice)

    Returns:
        Audio data as bytes
    """
    client = get_elevenlabs_client()
    voice_id = get_voice_id_for_judge(judge_name)

    # Generate speech
    response = client.text_to_speech.convert(
        voice_id=voice_id,
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_turbo_v2_5",
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    # Collect audio bytes in memory
    audio_bytes = BytesIO()
    for chunk in response:
        if chunk:
            audio_bytes.write(chunk)

    audio_bytes.seek(0)
    return audio_bytes.read()


def cleanup_old_audio_files(max_age_hours: int = 24):
    """
    Delete audio files older than max_age_hours.

    Args:
        max_age_hours: Maximum age of files to keep in hours (default: 24)
    """
    audio_dir = Path(__file__).parent.parent / "audio_files"
    if not audio_dir.exists():
        return

    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    deleted_count = 0

    for audio_file in audio_dir.glob("*.mp3"):
        file_age = current_time - audio_file.stat().st_mtime
        if file_age > max_age_seconds:
            try:
                audio_file.unlink()
                deleted_count += 1
            except Exception as e:
                print(f"Failed to delete {audio_file}: {e}")

    if deleted_count > 0:
        print(f"Cleaned up {deleted_count} old audio files")


def delete_audio_file(filename: str):
    """
    Delete a specific audio file.

    Args:
        filename: Name of the audio file to delete
    """
    audio_dir = Path(__file__).parent.parent / "audio_files"
    audio_path = audio_dir / filename

    if audio_path.exists():
        try:
            audio_path.unlink()
        except Exception as e:
            print(f"Failed to delete audio file {filename}: {e}")
