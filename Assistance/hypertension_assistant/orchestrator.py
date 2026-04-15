import logging
from typing import TYPE_CHECKING, Annotated, Any, Dict, List, Literal, TypedDict

try:
    from langchain_core.messages import AIMessage, HumanMessage
    from langgraph.graph import END, START, StateGraph
    from langgraph.graph.message import add_messages

    HAS_LANGGRAPH = True
except Exception:  # pragma: no cover - lets the service fall back gracefully if deps are missing
    AIMessage = None
    HumanMessage = None
    StateGraph = None
    START = None
    END = None
    HAS_LANGGRAPH = False

    def add_messages(value):  # type: ignore[no-redef]
        return value

from .agents import EducationAgent, IntentRouter, LLMAgent, SentimentAgent, TriageAgent
from .config import AppConfig, get_default_config
from .memory import ConversationMemoryStore
from .models import AssistantRequest, AssistantResponse, ChatTurn, SafetyAssessment

if TYPE_CHECKING:
    from langchain_core.messages import BaseMessage
else:
    BaseMessage = Any

logger = logging.getLogger(__name__)


class AssistantState(TypedDict, total=False):
    messages: Annotated[List[BaseMessage], add_messages]
    request: AssistantRequest
    intent: str
    sentiment: str
    safety: SafetyAssessment
    active_topic: str
    knowledge_snippets: List[str]
    priority_actions: List[str]
    reply: str
    follow_up_prompts: List[str]
    assistance_source: str


class HypertensionOrchestrator:
    """LangGraph-first orchestrator with a safe sequential fallback path."""

    def __init__(self, config: AppConfig | None = None) -> None:
        self.config = config or get_default_config()
        self.sentiment_agent = SentimentAgent(self.config.sentiment)
        self.triage_agent = TriageAgent(self.config.hypertension)
        self.education_agent = EducationAgent()
        self.intent_router = IntentRouter()
        self.llm_agent = LLMAgent(self.config.llm)
        self.memory_store = ConversationMemoryStore(
            db_path=self.config.memory.db_path,
            max_messages=self.config.memory.max_messages,
        )
        self.graph = self._build_graph() if HAS_LANGGRAPH else None

    def _build_graph(self):
        builder = StateGraph(AssistantState)
        builder.add_node("analyze", self._analyze_node)
        builder.add_node("coach_response", self._coach_response_node)
        builder.add_edge(START, "analyze")
        builder.add_edge("analyze", "coach_response")
        builder.add_edge("coach_response", END)
        return builder.compile()

    def handle_message(self, request: AssistantRequest) -> AssistantResponse:
        normalized_request = AssistantRequest(
            **{
                **request.__dict__,
                "message": request.message.strip() or self._default_user_message(),
            }
        )

        if self.graph is not None:
            return self._handle_with_graph(normalized_request)
        return self._handle_without_graph(normalized_request)

    def _handle_with_graph(self, request: AssistantRequest) -> AssistantResponse:
        history_messages = self._history_to_langgraph_messages(self._load_history(request))
        input_messages = [*history_messages, HumanMessage(content=request.message)]
        final_state = self.graph.invoke(
            {
                "messages": input_messages,
                "request": request,
            }
        )

        final_messages = self._limit_messages(final_state["messages"])
        self.memory_store.save(request.conversation_id, final_messages)

        return AssistantResponse(
            reply=final_state["reply"],
            sentiment=final_state["sentiment"],
            safety=final_state["safety"],
            active_topic=final_state["active_topic"],
            follow_up_prompts=final_state["follow_up_prompts"],
            priority_actions=final_state["priority_actions"],
            assistance_source=final_state["assistance_source"],
        )

    def _handle_without_graph(self, request: AssistantRequest) -> AssistantResponse:
        history_messages = self._load_history(request)
        messages = [*history_messages, {"role": "user", "content": request.message}]
        analysis = self._analysis_payload(request, history_messages)

        reply_payload, source = self.llm_agent.generate_reply(
            request=request,
            messages=messages,
            intent=analysis["intent"],
            sentiment=analysis["sentiment"],
            safety_level=analysis["safety"].level,
            safety_reasons=analysis["safety"].reasons,
            active_topic=analysis["active_topic"],
            knowledge_snippets=analysis["knowledge_snippets"],
            priority_actions=analysis["priority_actions"],
        )
        reply = self._finalize_reply(reply_payload.reply)
        follow_up_prompts = reply_payload.follow_up_prompts
        analysis["active_topic"] = reply_payload.active_topic

        updated_messages = self._limit_messages(
            [
                *messages,
                {"role": "assistant", "content": reply},
            ]
        )
        self.memory_store.save(request.conversation_id, updated_messages)

        return AssistantResponse(
            reply=reply,
            sentiment=analysis["sentiment"],
            safety=analysis["safety"],
            active_topic=analysis["active_topic"],
            follow_up_prompts=follow_up_prompts,
            priority_actions=analysis["priority_actions"],
            assistance_source=source,
        )

    def _analysis_payload(self, request: AssistantRequest, history_messages: List[Dict[str, str]]) -> Dict[str, Any]:
        history_turns = self._messages_to_chat_turns(history_messages)
        intent = self.intent_router.classify(request.message, history_turns)
        sentiment = self.sentiment_agent.analyze(request.message)
        active_topic = self.education_agent.infer_topic(request.message, history_turns)
        safety = self._assess_safety(request, intent)
        knowledge_snippets = self.education_agent.get_snippets_for_topic(active_topic, safety)
        priority_actions = self.education_agent.build_priority_actions(
            topic=active_topic,
            recommendations=request.recommendations,
            missing_fields=request.missing_fields,
            safety=safety,
        )
        return {
            "intent": intent,
            "sentiment": sentiment,
            "safety": safety,
            "active_topic": active_topic,
            "knowledge_snippets": knowledge_snippets,
            "priority_actions": priority_actions,
        }

    def _analyze_node(self, state: AssistantState) -> AssistantState:
        history_messages = self._normalize_state_messages(state.get("messages", []))
        return self._analysis_payload(state["request"], history_messages)

    def _coach_response_node(self, state: AssistantState) -> AssistantState:
        reply_payload, source = self.llm_agent.generate_reply(
            request=state["request"],
            messages=self._limit_messages(state["messages"]),
            intent=state["intent"],
            sentiment=state["sentiment"],
            safety_level=state["safety"].level,
            safety_reasons=state["safety"].reasons,
            active_topic=state["active_topic"],
            knowledge_snippets=state["knowledge_snippets"],
            priority_actions=state["priority_actions"],
        )
        finalized_reply = self._finalize_reply(reply_payload.reply)
        return {
            "messages": [AIMessage(content=finalized_reply)],
            "reply": finalized_reply,
            "follow_up_prompts": reply_payload.follow_up_prompts,
            "active_topic": reply_payload.active_topic,
            "priority_actions": state["priority_actions"],
            "assistance_source": source,
        }

    def _load_history(self, request: AssistantRequest) -> List[Dict[str, str]]:
        stored_messages = self.memory_store.load(request.conversation_id)
        if stored_messages:
            return stored_messages

        seed_messages = []
        for turn in request.chat_history[-self.config.memory.max_messages :]:
            text = turn.text.strip()
            if not text:
                continue
            seed_messages.append(
                {
                    "role": "user" if turn.sender == "user" else "assistant",
                    "content": text,
                }
            )
        return seed_messages

    def _history_to_langgraph_messages(self, messages: List[Dict[str, str]]) -> List[BaseMessage]:
        converted = []
        for message in messages:
            role = message.get("role")
            content = message.get("content", "")
            if role == "user":
                converted.append(HumanMessage(content=content))
            elif role == "assistant":
                converted.append(AIMessage(content=content))
        return converted

    def _normalize_state_messages(self, messages: List[Any]) -> List[Dict[str, str]]:
        normalized: List[Dict[str, str]] = []
        for message in messages:
            role = getattr(message, "type", None) or message.get("role", "")
            content = getattr(message, "content", None) or message.get("content", "")
            if not content:
                continue
            if role == "human":
                role = "user"
            elif role == "ai":
                role = "assistant"
            if role in {"user", "assistant"}:
                normalized.append({"role": role, "content": str(content)})
        return normalized

    def _messages_to_chat_turns(self, messages: List[Dict[str, str]]) -> List[ChatTurn]:
        turns: List[ChatTurn] = []
        for message in messages:
            role = message.get("role")
            content = message.get("content", "").strip()
            if role in {"user", "assistant"} and content:
                turns.append(ChatTurn(sender="user" if role == "user" else "bot", text=content))
        return turns

    def _assess_safety(self, request: AssistantRequest, intent: str) -> SafetyAssessment:
        if intent not in {"health", "follow_up"}:
            return SafetyAssessment(level="routine", reasons=["No urgent health risk detected from this message."])
        return self.triage_agent.assess(
            systolic=request.latest_bp.systolic,
            diastolic=request.latest_bp.diastolic,
            symptoms=request.symptoms,
        )

    def _limit_messages(self, messages: List[Any]) -> List[Any]:
        return messages[-self.config.memory.max_messages :]

    def _default_user_message(self) -> str:
        return "Give me a personalized health summary and the next best actions for blood pressure control."

    def _finalize_reply(self, raw_reply: str) -> str:
        # Preserve LLM output as-is except for whitespace cleanup.
        cleaned = (raw_reply or "").strip()
        if cleaned:
            logger.info("orchestrator.final_reply len=%s", len(cleaned))
            return cleaned
        return "I'm having trouble generating a full answer right now. Please try again with a little more detail."
