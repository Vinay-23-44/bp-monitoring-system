import os
import logging
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

from hypertension_assistant import HypertensionOrchestrator
from hypertension_assistant.models import (
    AssistantRequest,
    BloodPressureReading,
    ChatTurn,
)
logging.basicConfig(level=os.getenv("ASSISTANCE_LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

API_KEY_HEADER_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_HEADER_NAME, auto_error=False)


def get_api_key(api_key: Optional[str] = Depends(api_key_header)) -> str:
    expected = os.environ.get("APP_API_KEY")
    if expected is None:
        return "dev-no-auth"

    if api_key is None or api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return api_key


class ChatHistoryItem(BaseModel):
    sender: str
    text: str


class LatestBPItem(BaseModel):
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    recorded_at: Optional[str] = None


class ChatRequest(BaseModel):
    user_id: str
    conversation_id: Optional[str] = None
    message: str = ""
    user_name: Optional[str] = None
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    symptoms: List[str] = Field(default_factory=list)
    chat_history: List[ChatHistoryItem] = Field(default_factory=list)
    profile_snapshot: Dict[str, Any] = Field(default_factory=dict)
    risk_level: str = "unknown"
    blood_pressure_status: str = "Unknown"
    missing_fields: List[str] = Field(default_factory=list)
    diet_recommendations: List[str] = Field(default_factory=list)
    lifestyle_recommendations: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    latest_bp: Optional[LatestBPItem] = None


class ChatResponse(BaseModel):
    reply: str
    sentiment: str
    safety_level: str
    safety_reasons: List[str]
    active_topic: str
    follow_up_prompts: List[str]
    priority_actions: List[str]
    conversation_id: str
    assistance_source: str


app = FastAPI(title="Hypertension Assistant API", version="0.3.0")
_orchestrator = HypertensionOrchestrator()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "hypertension-assistant", "version": "0.3.0"}


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest, api_key: str = Depends(get_api_key)) -> ChatResponse:
    _ = api_key
    logger.info("chat_endpoint input user_id=%s conversation_id=%s message=%r", payload.user_id, payload.conversation_id or payload.user_id, payload.message)

    latest_bp = payload.latest_bp or LatestBPItem(
        systolic=payload.systolic,
        diastolic=payload.diastolic,
    )

    response = _orchestrator.handle_message(
        AssistantRequest(
            user_id=payload.user_id,
            conversation_id=payload.conversation_id or payload.user_id,
            message=payload.message,
            user_name=payload.user_name,
            profile_snapshot=payload.profile_snapshot,
            risk_level=payload.risk_level,
            blood_pressure_status=payload.blood_pressure_status,
            missing_fields=payload.missing_fields,
            diet_recommendations=payload.diet_recommendations,
            lifestyle_recommendations=payload.lifestyle_recommendations,
            recommendations=payload.recommendations,
            chat_history=[ChatTurn(sender=item.sender, text=item.text) for item in payload.chat_history],
            symptoms=payload.symptoms,
            latest_bp=BloodPressureReading(
                systolic=latest_bp.systolic,
                diastolic=latest_bp.diastolic,
                recorded_at=latest_bp.recorded_at,
            ),
        )
    )

    logger.info("chat_endpoint output source=%s topic=%s", response.assistance_source, response.active_topic)

    return ChatResponse(
        reply=response.reply,
        sentiment=response.sentiment,
        safety_level=response.safety.level,
        safety_reasons=response.safety.reasons,
        active_topic=response.active_topic,
        follow_up_prompts=response.follow_up_prompts,
        priority_actions=response.priority_actions,
        conversation_id=payload.conversation_id or payload.user_id,
        assistance_source=response.assistance_source,
    )
