import re
from typing import Iterable

from ..models import ChatTurn, IntentLabel


class IntentRouter:
    """Small intent layer for conversational routing, not response generation."""

    def __init__(self) -> None:
        self._greetings = {
            "hi",
            "hii",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
        }
        self._casual_phrases = {
            "how are you",
            "how's it going",
            "how is it going",
            "whats up",
            "what's up",
            "thanks",
            "thank you",
            "ok",
            "okay",
        }
        self._follow_up_markers = {
            "what about",
            "and what about",
            "can you explain more",
            "tell me more",
            "why is that",
            "what should i do",
            "is that normal",
        }
        self._health_terms = {
            "bp",
            "blood pressure",
            "pressure",
            "hypertension",
            "systolic",
            "diastolic",
            "reading",
            "diet",
            "food",
            "meal",
            "exercise",
            "walk",
            "workout",
            "sleep",
            "stress",
            "medication",
            "medicine",
            "pill",
            "doctor",
            "symptom",
            "health",
            "summary",
            "plan",
            "focus",
            "week",
            "cold",
            "cough",
            "fever",
            "weakness",
            "dizziness",
            "headache",
            "fatigue",
            "pain",
            "chest pain",
            "shortness of breath",
            "runny nose",
            "sore throat",
            "nausea",
        }
        self._health_context_terms = {
            "bp",
            "blood pressure",
            "diet",
            "food",
            "exercise",
            "sleep",
            "stress",
            "medicine",
            "symptom",
            "fever",
            "cough",
            "cold",
            "summary",
            "plan",
        }

    def classify(self, message: str, history: Iterable[ChatTurn] | None = None) -> IntentLabel:
        compact = self._normalize(message)
        if not compact:
            return "unknown"

        if compact in self._greetings:
            return "greeting"

        if compact in self._casual_phrases:
            return "casual"

        if self._is_health_query(compact):
            return "health"

        if self._is_follow_up(compact, history or []):
            return "follow_up"

        if len(compact.split()) <= 4 and any(phrase == compact for phrase in self._greetings):
            return "greeting"

        return "unknown"

    def _normalize(self, text: str) -> str:
        lowered = (text or "").strip().lower()
        cleaned = re.sub(r"[^\w\s'?]", " ", lowered)
        return " ".join(cleaned.split())

    def _is_health_query(self, compact: str) -> bool:
        if any(term in compact for term in self._health_terms):
            return True
        if any(
            phrase in compact
            for phrase in [
                "full health summary",
                "what should i focus on this week",
                "what diet should i follow",
                "i have",
                "i am having",
                "my symptoms",
            ]
        ):
            return True
        return False

    def _is_follow_up(self, compact: str, history: Iterable[ChatTurn]) -> bool:
        recent_turns = [turn.text.lower() for turn in list(history)[-4:] if turn.text.strip()]
        if not recent_turns:
            return False

        if compact in {"why", "how", "what next", "what now", "and?", "then?", "more"}:
            return True

        if any(marker in compact for marker in self._follow_up_markers):
            return True

        if len(compact.split()) <= 6 and any(word in compact for word in {"that", "it", "this", "those", "them"}):
            return True

        recent_context = " ".join(recent_turns)
        if any(term in recent_context for term in self._health_context_terms):
            if compact.startswith(("and ", "so ", "what about ", "should i ", "can i ")):
                return True

        return False
