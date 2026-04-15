from typing import Iterable, List

from ..models import ChatTurn, SafetyAssessment


class EducationAgent:
    """Curates focused guidance based on topic, profile context, and rule-based recommendations."""

    def __init__(self) -> None:
        self._snippets = {
            "bp": (
                "Track blood pressure at consistent times, rest quietly for five minutes before checking, "
                "and share repeated high readings with your clinician."
            ),
            "diet": (
                "Lower-sodium, high-fiber meals with fruits, vegetables, whole grains, and lean protein are "
                "strong fits for blood pressure control."
            ),
            "exercise": (
                "Regular walking and other moderate activity can improve blood pressure when increased gradually "
                "and done consistently."
            ),
            "recovery": (
                "Stress, sleep, and hydration often affect blood pressure control more than people expect, so "
                "steady routines matter."
            ),
            "weight": (
                "Even moderate weight loss can improve blood pressure, energy, and long-term cardiovascular risk."
            ),
            "medication": (
                "Take blood pressure medicines exactly as prescribed and discuss side effects with a clinician "
                "before making any medication changes."
            ),
            "general": (
                "The most effective hypertension plan combines home monitoring, a sustainable food pattern, "
                "consistent movement, stress management, and follow-up with a clinician."
            ),
        }

    def infer_topic(self, user_text: str, history: Iterable[ChatTurn]) -> str:
        current_text = user_text.lower()
        history_text = " ".join(turn.text.lower() for turn in list(history)[-4:])

        if any(keyword in current_text for keyword in ["diet", "meal", "food", "eat", "protein", "salt", "nutrition", "dash"]):
            return "diet"
        if any(keyword in current_text for keyword in ["exercise", "walk", "activity", "workout", "gym"]):
            return "exercise"
        if any(keyword in current_text for keyword in ["sleep", "stress", "anxiety", "recovery", "rest"]):
            return "recovery"
        if any(keyword in current_text for keyword in ["weight", "bmi", "calorie", "fat loss"]):
            return "weight"
        if any(keyword in current_text for keyword in ["medicine", "medication", "tablet", "pill", "side effect"]):
            return "medication"
        if any(
            keyword in current_text
            for keyword in ["bp", "pressure", "hypertension", "systolic", "diastolic", "reading"]
        ):
            return "bp"
        if any(
            keyword in current_text
            for keyword in [
                "fever",
                "weakness",
                "dizziness",
                "dizzy",
                "fatigue",
                "nausea",
                "symptom",
                "headache",
                "cold",
                "cough",
                "runny nose",
                "sore throat",
                "summary",
                "focus",
                "week",
                "plan",
            ]
        ):
            return "general"

        if any(keyword in history_text for keyword in ["diet", "meal", "food", "eat", "protein", "salt", "nutrition"]):
            return "diet"
        if any(keyword in history_text for keyword in ["exercise", "walk", "activity", "workout", "gym"]):
            return "exercise"
        if any(keyword in history_text for keyword in ["sleep", "stress", "anxiety", "recovery", "rest"]):
            return "recovery"
        if any(keyword in history_text for keyword in ["weight", "bmi", "calorie", "fat loss"]):
            return "weight"
        if any(keyword in history_text for keyword in ["medicine", "medication", "tablet", "pill", "side effect"]):
            return "medication"
        if any(
            keyword in history_text
            for keyword in ["bp", "pressure", "hypertension", "systolic", "diastolic", "reading"]
        ):
            return "bp"
        return "general"

    def get_snippets_for_topic(self, topic: str, safety: SafetyAssessment) -> List[str]:
        snippets = [self._snippets.get(topic, self._snippets["general"])]
        if safety.level == "emergency":
            snippets.append(
                "Emergency symptoms or crisis-range blood pressure need immediate in-person medical evaluation."
            )
        elif safety.level == "caution":
            snippets.append(
                "Repeated elevated readings deserve closer monitoring and a timely clinical follow-up."
            )
        return snippets

    def build_priority_actions(
        self,
        topic: str,
        recommendations: List[str],
        missing_fields: List[str],
        safety: SafetyAssessment,
    ) -> List[str]:
        actions: List[str] = []

        if safety.level == "emergency":
            actions.append("Seek urgent in-person medical care now instead of self-managing this at home.")
        elif safety.level == "caution":
            actions.append("Monitor your blood pressure closely and arrange medical follow-up if readings stay high.")

        topic_keywords = {
            "diet": ["diet", "meal", "food", "salt", "protein", "dash"],
            "exercise": ["exercise", "activity", "walk", "training"],
            "recovery": ["sleep", "stress", "hydration", "recovery"],
            "weight": ["weight", "bmi", "calorie", "portion"],
            "medication": ["medication", "medicine", "pill", "adherence"],
            "bp": ["blood pressure", "bp", "reading", "monitor"],
            "general": [],
        }

        selected = []
        for item in recommendations:
            lower_item = item.lower()
            if topic == "general" or any(keyword in lower_item for keyword in topic_keywords[topic]):
                selected.append(item)

        actions.extend(selected[:3])

        if missing_fields:
            actions.append(
                "Complete missing profile details such as "
                + ", ".join(missing_fields[:3])
                + " so the guidance can stay personalized."
            )

        deduped: List[str] = []
        for action in actions:
            clean_action = action.strip()
            if clean_action and clean_action not in deduped:
                deduped.append(clean_action)
        return deduped[:4]

    def get_follow_up_prompts(self, topic: str, safety: SafetyAssessment) -> List[str]:
        if safety.level == "emergency":
            return [
                "What symptoms should I tell the doctor about?",
                "How do I explain my recent blood pressure readings?",
            ]
        if topic == "diet":
            return [
                "Give me a simple low-salt meal plan",
                "What foods should I avoid this week?",
                "How can I add more protein without extra sodium?",
            ]
        if topic == "exercise":
            return [
                "Suggest a beginner walking routine",
                "What exercise is safe with high BP?",
                "How often should I work out each week?",
            ]
        if topic == "recovery":
            return [
                "How can I sleep better for BP control?",
                "Give me a simple stress routine",
                "What daily habit should I fix first?",
            ]
        if topic == "weight":
            return [
                "How can I reduce weight safely?",
                "What BMI goal should I focus on?",
                "Which habits help both weight and BP?",
            ]
        if topic == "medication":
            return [
                "What should I do if I miss a dose?",
                "When should I talk to my doctor about side effects?",
                "How can I improve medication adherence?",
            ]
        if topic == "bp":
            return [
                "How often should I check my BP?",
                "What numbers should worry me?",
                "What daily habit lowers BP the most?",
            ]
        return [
            "Give me a full health summary",
            "What should I focus on this week?",
            "How can I improve my routine?",
        ]
