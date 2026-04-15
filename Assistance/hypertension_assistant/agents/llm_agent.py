import logging
import os
import re
import time

from typing import Any, List, Optional

try:
    from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:  # pragma: no cover - optional dependency guard
    AIMessage = None
    HumanMessage = None
    SystemMessage = None
    ChatGoogleGenerativeAI = None

from ..config import LLMConfig
from ..models import AssistantRequest, StructuredAssistantReply
from ..safety_policies import HYPO_ASSISTANT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class LLMAgent:
    """Generates the final reply from intent, memory, and health context."""

    RETRY_DELAYS_SECONDS = (2, 4, 6)

    def __init__(self, config: Optional[LLMConfig] = None) -> None:
        self.config = config or LLMConfig()
        api_key = os.getenv("GEMINI_API_KEY")

        logger.info("API key present: %s", bool(api_key))
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found. Check .env loading.")

        self.model = None

        if ChatGoogleGenerativeAI is None or SystemMessage is None:
            raise RuntimeError(
                "Gemini LangChain dependencies are unavailable. Install langchain-google-genai."
            )

        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=self.config.temperature,
            max_output_tokens=self.config.max_tokens,
            google_api_key=api_key,
        )

        logger.info("LLM initialized: %s", self.model is not None)

    def generate_reply(
        self,
        request: AssistantRequest,
        messages: List[Any],
        intent: str,
        sentiment: str,
        safety_level: str,
        safety_reasons: List[str],
        active_topic: str,
        knowledge_snippets: List[str],
        priority_actions: List[str],
    ) -> tuple[StructuredAssistantReply, str]:
        logger.info(
            "llm.generate_reply input=%r intent=%s topic=%s safety=%s",
            request.message,
            intent,
            active_topic,
            safety_level,
        )

        dynamic_context = self._build_context_block(
            request=request,
            messages=messages,
            intent=intent,
            sentiment=sentiment,
            safety_level=safety_level,
            safety_reasons=safety_reasons,
            active_topic=active_topic,
            knowledge_snippets=knowledge_snippets,
            priority_actions=priority_actions,
        )

        safe_messages = [
            SystemMessage(content=HYPO_ASSISTANT_SYSTEM_PROMPT + "\n\n" + dynamic_context),
            *self._normalize_messages(messages),
        ]
        logger.info("Invoking Gemini with %s messages", len(safe_messages))

        max_attempts = 1 + len(self.RETRY_DELAYS_SECONDS)
        for attempt in range(1, max_attempts + 1):
            try:
                response = self.model.invoke(safe_messages)
                reply_text = getattr(response, "content", str(response)).strip()
                result = StructuredAssistantReply(
                    reply=reply_text or self._minimal_fallback_reply(intent).reply,
                    follow_up_prompts=[],
                    active_topic=self._normalize_topic(active_topic, active_topic),
                )
                logger.info("llm.generate_reply output=%r", result.reply[:400])
                return (result, "langgraph-gemini")
            except Exception as exc:
                status_code = self._extract_retryable_status_code(exc)
                can_retry = (
                    status_code in {429, 503} and attempt < max_attempts
                )
                if can_retry:
                    delay_seconds = self.RETRY_DELAYS_SECONDS[attempt - 1]
                    logger.warning(
                        "Gemini invoke attempt %s/%s failed with retryable status %s. Retrying in %ss.",
                        attempt,
                        max_attempts,
                        status_code,
                        delay_seconds,
                    )
                    time.sleep(delay_seconds)
                    continue

                logger.exception("Gemini invoke failed, using minimal fallback: %s", exc)
                return (self._minimal_fallback_reply(intent), "minimal-fallback")

    def _build_context_block(
        self,
        request: AssistantRequest,
        messages: List[Any],
        intent: str,
        sentiment: str,
        safety_level: str,
        safety_reasons: List[str],
        active_topic: str,
        knowledge_snippets: List[str],
        priority_actions: List[str],
    ) -> str:
        query_mode = self._detect_query_mode(request.message)
        latest_bp = "Not available"
        if request.latest_bp.systolic and request.latest_bp.diastolic:
            latest_bp = f"{request.latest_bp.systolic}/{request.latest_bp.diastolic}"

        response_guidance = {
            "greeting": "Reply in 1 short sentence. Sound warm and human.",
            "casual": "Reply briefly and naturally in 1-2 short sentences.",
            "follow_up": "Use recent conversation to answer the follow-up directly. Do not restart the topic.",
            "health": "Address the actual health concern with relevant detail. Only discuss BP when it is relevant.",
            "unknown": "Reply briefly, be honest about scope, and gently redirect if helpful.",
        }.get(intent, "Reply naturally and directly.")

        query_mode_instructions = {
            "summary": (
                "The user asked for a summary. Give a structured overview with concise sections only relevant to this request."
            ),
            "diet": (
                "The user asked about diet. Focus only on food, meal pattern, sodium, hydration, and practical diet steps."
            ),
            "improve": (
                "The user asked how to improve BP. Focus on habits, activity, monitoring consistency, and sustainable routine upgrades."
            ),
            "weekly_plan": (
                "The user asked for a weekly focus. Provide a short, actionable week plan with concrete daily actions."
            ),
            "general": "Answer directly and only for the user question. Keep structure natural.",
        }[query_mode]

        mode_context_lines = self._build_mode_context_lines(
            query_mode=query_mode,
            request=request,
            latest_bp=latest_bp,
            active_topic=active_topic,
            knowledge_snippets=knowledge_snippets,
            priority_actions=priority_actions,
            safety_level=safety_level,
        )

        logger.info(
            "llm.prompt_context question=%r query_mode=%s context_lines=%s",
            request.message,
            query_mode,
            len(mode_context_lines),
        )

        return "\n".join(
            [
                f"User question: {request.message}",
                "Answer the question first, then optionally use context.",
                "Use app context only as support, never as the primary output driver.",
                "Generate the final response dynamically. Do not use canned openings or repeated wrappers.",
                "Do not start with phrases like 'You asked', 'Here is the most relevant guidance', or similar templates.",
                "Do not start with or repeat the phrase 'your current focus should be'.",
                "Use recent conversation memory when the latest message is a follow-up or summary request.",
                "Keep the answer short for greetings and casual chat. Expand only when health guidance is requested.",
                "Only include safety or emergency advice when symptoms, readings, or risk make it relevant.",
                "Answer only what the user asked. Do not force a generic recommendation block.",
                "Do NOT repeat the same recommendation block in every response.",
                "Only include advice relevant to the specific question.",
                "Do not reuse the same response structure for every request.",
                "Use profile and BP context only when relevant to the question.",
                "If the user is out of scope, answer briefly and redirect without inventing medical advice.",
                response_guidance,
                query_mode_instructions,
                f"Query mode: {query_mode}",
                f"Detected intent: {intent}",
                f"Detected topic: {active_topic}",
                f"Detected sentiment: {sentiment}",
                f"Safety level: {safety_level}",
                "Safety reasons: " + ("; ".join(safety_reasons) if safety_reasons else "None"),
                f"User name: {request.user_name or 'Unknown'}",
                *mode_context_lines,
                "Recent conversation: " + self._summarize_history(messages),
                "Return JSON with keys reply, follow_up_prompts, active_topic.",
            ]
        )

    def _detect_query_mode(self, message: str) -> str:
        text = (message or "").strip().lower()
        if not text:
            return "general"

        if any(keyword in text for keyword in ["summary", "summarize", "overview", "recap"]):
            return "summary"

        if any(keyword in text for keyword in ["diet", "meal", "food", "nutrition", "eat", "sodium"]):
            return "diet"

        if (
            "focus" in text and "week" in text
            or "this week" in text
            or "weekly plan" in text
            or "week plan" in text
        ):
            return "weekly_plan"

        if any(
            keyword in text
            for keyword in ["improve", "better", "reduce", "lower", "control", "optimize", "routine", "habits"]
        ):
            return "improve"

        return "general"

    def _build_mode_context_lines(
        self,
        query_mode: str,
        request: AssistantRequest,
        latest_bp: str,
        active_topic: str,
        knowledge_snippets: List[str],
        priority_actions: List[str],
        safety_level: str,
    ) -> List[str]:
        lines: List[str] = []

        if safety_level in {"emergency", "caution"}:
            lines.append(f"Risk level: {request.risk_level}")
            lines.append(f"Blood pressure status: {request.blood_pressure_status}")
            lines.append(f"Latest BP reading: {latest_bp}")
            lines.append("Symptoms: " + (", ".join(request.symptoms) if request.symptoms else "None"))

        if query_mode == "summary":
            lines.extend(
                [
                    "Summary context mode: full",
                    f"Risk level: {request.risk_level}",
                    f"Blood pressure status: {request.blood_pressure_status}",
                    f"Latest BP reading: {latest_bp}",
                    "Symptoms: " + (", ".join(request.symptoms) if request.symptoms else "None"),
                    "Missing profile fields: " + (", ".join(request.missing_fields) if request.missing_fields else "None"),
                    "Profile snapshot: " + str(request.profile_snapshot),
                    "Diet recommendations: " + self._format_list(request.diet_recommendations, limit=5),
                    "Lifestyle recommendations: " + self._format_list(request.lifestyle_recommendations, limit=5),
                    "Action recommendations: " + self._format_list(priority_actions or request.recommendations, limit=5),
                ]
            )
            return lines

        if query_mode == "diet":
            lines.extend(
                [
                    "Summary context mode: diet-only",
                    "Diet recommendations: " + self._format_list(request.diet_recommendations, limit=6),
                    "Relevant knowledge: " + self._format_list(
                        [snippet for snippet in knowledge_snippets if "salt" in snippet.lower() or "meal" in snippet.lower()]
                        or knowledge_snippets,
                        limit=2,
                    ),
                ]
            )
            return lines

        if query_mode == "improve":
            lines.extend(
                [
                    "Summary context mode: improvement-focused",
                    f"Risk level: {request.risk_level}",
                    f"Blood pressure status: {request.blood_pressure_status}",
                    f"Latest BP reading: {latest_bp}",
                    "Lifestyle recommendations: " + self._format_list(request.lifestyle_recommendations, limit=6),
                    "Action recommendations: " + self._format_list(priority_actions or request.recommendations, limit=5),
                ]
            )
            return lines

        if query_mode == "weekly_plan":
            lines.extend(
                [
                    "Summary context mode: weekly-plan",
                    f"Risk level: {request.risk_level}",
                    f"Latest BP reading: {latest_bp}",
                    "Plan inputs (diet): " + self._format_list(request.diet_recommendations, limit=4),
                    "Plan inputs (lifestyle): " + self._format_list(request.lifestyle_recommendations, limit=4),
                    "Plan priorities: " + self._format_list(priority_actions or request.recommendations, limit=4),
                ]
            )
            return lines

        lines.extend(
            [
                "Summary context mode: minimal",
                f"Detected topic: {active_topic}",
                "Relevant knowledge: " + self._format_list(knowledge_snippets, limit=1),
            ]
        )
        return lines

    def _format_list(self, items: List[str], limit: int = 4) -> str:
        cleaned: List[str] = []
        for item in items:
            candidate = str(item).strip()
            if candidate and candidate not in cleaned:
                cleaned.append(candidate)
        if not cleaned:
            return "None"
        return " | ".join(cleaned[:limit])

    def _extract_retryable_status_code(self, exc: Exception) -> Optional[int]:
        candidates: List[Any] = [exc, getattr(exc, "__cause__", None), getattr(exc, "__context__", None)]
        for candidate in candidates:
            if not candidate:
                continue

            for attr in ("status_code", "status", "code", "http_status"):
                value = getattr(candidate, attr, None)
                if value is None:
                    continue
                try:
                    status_code = int(value)
                except (TypeError, ValueError):
                    continue
                if status_code in {429, 503}:
                    return status_code

            response = getattr(candidate, "response", None)
            if response is not None:
                response_status = getattr(response, "status_code", None)
                try:
                    status_code = int(response_status)
                except (TypeError, ValueError):
                    status_code = None
                if status_code in {429, 503}:
                    return status_code

            match = re.search(r"\b(429|503)\b", str(candidate))
            if match:
                return int(match.group(1))

        return None

    def _minimal_fallback_reply(self, intent: str) -> StructuredAssistantReply:
        if intent == "greeting":
            reply = "Hi! How can I help today?"
        elif intent == "casual":
            reply = "I'm here with you. Tell me what you'd like help with."
        elif intent == "unknown":
            reply = "I can help with health questions and follow-up guidance. Tell me a bit more about what you need."
        else:
            reply = "I'm having trouble generating a full answer right now. Please try again with a little more detail."
        return StructuredAssistantReply(reply=reply, follow_up_prompts=[], active_topic="general")

    def _normalize_topic(self, topic: str, default: str) -> str:
        normalized = (topic or "").strip().lower()
        allowed = {"general", "bp", "diet", "exercise", "recovery", "weight", "medication"}
        return normalized if normalized in allowed else default

    def _summarize_history(self, messages: List[Any]) -> str:
        if not messages:
            return "None"
        summary = []
        for message in messages[-8:]:
            role = getattr(message, "type", None) or message.get("role", "unknown")
            content = getattr(message, "content", None) or message.get("content", "")
            if content:
                summary.append(f"{role}: {content}")
        return " | ".join(summary) if summary else "None"

    def _normalize_messages(self, messages: List[Any]) -> List[Any]:
        normalized: List[Any] = []
        for msg in messages[-8:]:
            role = getattr(msg, "type", None) or (msg.get("role", "user") if isinstance(msg, dict) else "user")
            content = getattr(msg, "content", None) or (msg.get("content", "") if isinstance(msg, dict) else "")

            if not content:
                continue

            if role in {"human", "user"} and HumanMessage is not None:
                normalized.append(HumanMessage(content=str(content)))
            elif role in {"ai", "assistant"} and AIMessage is not None:
                normalized.append(AIMessage(content=str(content)))
            elif HumanMessage is not None:
                normalized.append(HumanMessage(content=str(content)))
            else:
                normalized.append({"role": "user", "content": str(content)})

        return normalized
