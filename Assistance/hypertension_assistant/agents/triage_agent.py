from typing import List, Optional

from ..config import HypertensionConfig
from ..models import SafetyAssessment
from ..safety_policies import RED_FLAG_SYMPTOMS


class TriageAgent:
    """Rule-based safety / triage agent for hypertension."""

    def __init__(self, config: Optional[HypertensionConfig] = None) -> None:
        self.config = config or HypertensionConfig()

    def assess(
        self,
        systolic: Optional[int],
        diastolic: Optional[int],
        symptoms: List[str],
    ) -> SafetyAssessment:
        reasons: List[str] = []
        level: str = "routine"

        normalized_symptoms = {s.lower().strip() for s in symptoms}

        if systolic is not None and diastolic is not None:
            if (
                systolic >= self.config.emergency_systolic_threshold
                or diastolic >= self.config.emergency_diastolic_threshold
            ):
                level = "emergency"
                reasons.append(
                    f"Very high blood pressure reported: {systolic}/{diastolic} mm Hg (possible hypertensive crisis)."
                )

        symptom_hits = normalized_symptoms.intersection(RED_FLAG_SYMPTOMS)
        if symptom_hits:
            level = "emergency"
            reasons.append(
                "Red-flag symptom(s) reported: " + ", ".join(sorted(symptom_hits))
            )

        if level != "emergency" and systolic is not None and diastolic is not None:
            if systolic >= 140 or diastolic >= 90:
                if level != "caution":
                    level = "caution"
                reasons.append(
                    f"Elevated blood pressure reported: {systolic}/{diastolic} mm Hg."
                )

        if not reasons:
            reasons.append("No emergency signs detected based on provided information.")

        return SafetyAssessment(level=level, reasons=reasons)