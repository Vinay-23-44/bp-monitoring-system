from dataclasses import dataclass, field
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


SentimentLabel = Literal["positive", "negative", "neutral"]
IntentLabel = Literal["greeting", "casual", "health", "follow_up", "unknown"]


@dataclass
class ChatTurn:
    sender: Literal["user", "bot"]
    text: str


@dataclass
class BloodPressureReading:
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    recorded_at: Optional[str] = None


@dataclass
class AssistantRequest:
    user_id: str
    conversation_id: str
    message: str
    user_name: Optional[str] = None
    profile_snapshot: Dict[str, Any] = field(default_factory=dict)
    risk_level: str = "unknown"
    blood_pressure_status: str = "Unknown"
    missing_fields: List[str] = field(default_factory=list)
    diet_recommendations: List[str] = field(default_factory=list)
    lifestyle_recommendations: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    chat_history: List[ChatTurn] = field(default_factory=list)
    symptoms: List[str] = field(default_factory=list)
    latest_bp: BloodPressureReading = field(default_factory=BloodPressureReading)


@dataclass
class SafetyAssessment:
    level: Literal["emergency", "caution", "routine"]
    reasons: List[str] = field(default_factory=list)


@dataclass
class AssistantResponse:
    reply: str
    sentiment: SentimentLabel
    safety: SafetyAssessment
    active_topic: str
    follow_up_prompts: List[str] = field(default_factory=list)
    priority_actions: List[str] = field(default_factory=list)
    assistance_source: str = "rule-based-fallback"


class StructuredAssistantReply(BaseModel):
    reply: str = Field(
        description="A concise, supportive answer with clear next-step recommendations for the user."
    )
    follow_up_prompts: List[str] = Field(
        default_factory=list,
        description="Up to three short follow-up questions the user may want to ask next.",
    )
    active_topic: str = Field(
        description="The main topic of the reply, such as general, bp, diet, exercise, recovery, weight, or medication."
    )
