# api/performance.py
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from supabase import create_client, Client
from openai import OpenAI
import os
import json
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))

router = APIRouter(prefix="/performance", tags=["Performance"])

# Initialize OpenAI client
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY in environment.")
    return OpenAI(api_key=api_key)

def get_supabase_client(user_token: str) -> Client:
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not anon_key:
        raise RuntimeError("Missing Supabase configuration")

    return create_client(url, anon_key)

# --- Data Models ---
class AnalyzePerformanceRequest(BaseModel):
    conversation_id: str

class InvestmentMemo(BaseModel):
    recommendation: str
    summary: str
    valueProposition: str
    market: str
    product: str
    metrics: str
    risks: str
    team: str
    deal: str
    scenarioAnalysis: str
    conclusion: str

class PresentationMetrics(BaseModel):
    clarity: float
    confidence: float
    engagement: float
    structure: float
    delivery: float
    overall: float

class PerformanceAnalysisResponse(BaseModel):
    investmentMemo: InvestmentMemo
    presentationMetrics: PresentationMetrics
    overallScore: float

def get_conversation_history(supabase: Client, conversation_id: str) -> List[Dict]:
    """Fetch all messages from a conversation."""
    history_resp = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return history_resp.data or []

def format_conversation_for_analysis(messages: List[Dict]) -> str:
    """Format conversation messages into readable text for LLM analysis."""
    formatted_lines = []

    for msg in messages:
        sender = msg.get("sender", "")
        content = msg.get("content", "")

        # Skip system messages
        if sender == "system":
            continue

        # Format as Entrepreneur or Judge dialogue
        role = "Entrepreneur" if sender == "user" else "Judge"
        formatted_lines.append(f"{role}: {content}")

    return "\n\n".join(formatted_lines)

@router.post("/analyze", response_model=PerformanceAnalysisResponse)
async def analyze_performance(request: AnalyzePerformanceRequest, authorization: str = Header(...)):
    """
    Analyze pitch performance based on conversation history.
    Returns investment memo and presentation metrics.
    """
    print(f"🎯 /performance/analyze called with conversation_id: {request.conversation_id}")

    # Extract token
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.replace("Bearer ", "")

    try:
        # Initialize clients
        supabase = get_supabase_client(token)
        openai_client = get_openai_client()

        # Verify user authentication
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

        # Fetch conversation history
        print(f"📚 Fetching conversation history...")
        messages = get_conversation_history(supabase, request.conversation_id)

        if not messages or len(messages) == 0:
            raise HTTPException(status_code=404, detail="No conversation history found. Please complete a pitch session first.")

        # Format conversation
        conversation_history = format_conversation_for_analysis(messages)
        print(f"✅ Formatted {len(messages)} messages into conversation history")

        if not conversation_history.strip():
            raise HTTPException(status_code=404, detail="No valid conversation content found")

        # Enhanced prompt for investment memo
        investment_memo_prompt = f"""
You are an experienced venture capital analyst who has just witnessed a Shark Tank pitch session.
Below is the complete conversation between the entrepreneur and the judges:

{conversation_history}

Based on this conversation, create a comprehensive investment memo. Analyze the pitch quality, business viability, market opportunity, team competence, and financial projections discussed.

Provide your response in this exact JSON format:
{{
  "recommendation": "A clear BUY/HOLD/PASS recommendation with 1-2 sentence justification",
  "summary": "2-3 sentence executive summary of the business and pitch performance",
  "valueProposition": "What unique value does this business offer? What problem does it solve?",
  "market": "Market size, target audience, growth potential, and competitive landscape discussed",
  "product": "Product/service description, unique features, technology, and differentiation",
  "metrics": "Key business metrics mentioned (revenue, growth rate, customers, retention, etc.) formatted with bullet points using • symbol",
  "risks": "Major risks and challenges identified, formatted with bullet points using • symbol",
  "team": "Team background, expertise, and capability assessment based on the conversation",
  "deal": "Investment ask, valuation, equity offer, and use of funds if mentioned",
  "scenarioAnalysis": "Revenue projections or growth scenarios discussed, formatted as Conservative/Base/Optimistic cases",
  "conclusion": "Final assessment of investment worthiness and key takeaways"
}}

Be specific and reference actual details from the conversation. If information wasn't provided, note that in your analysis.
Return ONLY valid JSON, no markdown formatting.
"""

        # Enhanced prompt for presentation metrics
        presentation_metrics_prompt = f"""
You are a professional pitch coach and communication expert. Analyze the following pitch conversation:

{conversation_history}

Evaluate the ENTREPRENEUR'S performance (not the judges) on these dimensions:

1. **Clarity** (0-10): How clearly did they communicate their idea? Were explanations easy to understand?
2. **Confidence** (0-10): How confident and assertive were they? Did they handle questions well?
3. **Engagement** (0-10): How engaging and compelling was their delivery? Did they capture attention?
4. **Structure** (0-10): How well-organized was their pitch? Did they cover all key points logically?
5. **Delivery** (0-10): Quality of communication - pace, enthusiasm, professionalism, handling objections
6. **Overall** (0-10): Overall pitch performance considering all factors

Provide your response in this exact JSON format:
{{
  "clarity": 8.5,
  "confidence": 7.8,
  "engagement": 9.2,
  "structure": 8.0,
  "delivery": 8.7,
  "overall": 8.4
}}

Use decimals (0.0 to 10.0) for precise scoring. Be objective and fair in your assessment.
Return ONLY valid JSON, no markdown formatting.
"""

        print(f"🤖 Generating investment memo...")
        # Generate investment memo
        memo_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a venture capital analyst. Respond only with valid JSON, no markdown."},
                {"role": "user", "content": investment_memo_prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        memo_text = memo_response.choices[0].message.content.strip()
        print(f"✅ Investment memo generated")

        print(f"🤖 Generating presentation metrics...")
        # Generate presentation metrics
        metrics_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a pitch coach. Respond only with valid JSON, no markdown."},
                {"role": "user", "content": presentation_metrics_prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        metrics_text = metrics_response.choices[0].message.content.strip()
        print(f"✅ Presentation metrics generated")

        # Parse responses
        try:
            memo_data = json.loads(memo_text)
            investment_memo = InvestmentMemo(**memo_data)
        except Exception as parse_error:
            print(f"⚠️ Error parsing investment memo: {parse_error}")
            # Fallback memo
            investment_memo = InvestmentMemo(
                recommendation="HOLD - Additional information needed for full assessment",
                summary="Unable to generate detailed analysis from conversation.",
                valueProposition="Not available from conversation",
                market="Not discussed in detail",
                product="Product details not fully articulated",
                metrics="• No specific metrics mentioned",
                risks="• Unable to assess from limited information",
                team="Team background not discussed",
                deal="Investment terms not specified",
                scenarioAnalysis="No financial projections provided",
                conclusion="Additional information needed for comprehensive evaluation"
            )

        try:
            metrics_data = json.loads(metrics_text)
            presentation_metrics = PresentationMetrics(**metrics_data)
        except Exception as parse_error:
            print(f"⚠️ Error parsing presentation metrics: {parse_error}")
            # Fallback metrics
            presentation_metrics = PresentationMetrics(
                clarity=7.0,
                confidence=7.0,
                engagement=7.0,
                structure=7.0,
                delivery=7.0,
                overall=7.0
            )

        overall_score = presentation_metrics.overall

        print(f"🎉 Analysis complete! Overall score: {overall_score}")

        return PerformanceAnalysisResponse(
            investmentMemo=investment_memo,
            presentationMetrics=presentation_metrics,
            overallScore=overall_score
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error analyzing performance: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing performance: {str(e)}")
