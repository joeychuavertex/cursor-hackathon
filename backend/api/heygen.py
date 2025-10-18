# api/heygen.py
from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

router = APIRouter(prefix="/heygen", tags=["HeyGen"])

@router.post("/token")
async def get_heygen_token():
    """
    Exchange HeyGen API key for a session token.
    This token is used by the frontend to initialize the streaming avatar.
    """
    api_key = os.getenv("HEYGEN_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="HEYGEN_API_KEY not configured in environment variables"
        )
    
    base_url = os.getenv("HEYGEN_API_URL", "https://api.heygen.com")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/v1/streaming.create_token",
                headers={"x-api-key": api_key},
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_detail = response.text
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Failed to get HeyGen token: {error_detail}"
                )
            
            data = response.json()
            return {"token": data["data"]["token"]}
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="HeyGen API request timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to HeyGen API: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

