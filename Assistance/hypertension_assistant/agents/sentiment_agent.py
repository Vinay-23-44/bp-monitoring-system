from typing import Optional

try:
    from transformers import pipeline
except Exception:  # pragma: no cover - optional dependency
    pipeline = None

from ..config import SentimentConfig
from ..models import SentimentLabel


class SentimentAgent:
    """Wraps a sentiment analysis model to classify user messages."""

    def __init__(self, config: Optional[SentimentConfig] = None) -> None:
        self.config = config or SentimentConfig()
        self._pipeline = None

        if self.config.use_transformers and pipeline is not None:
            self._pipeline = pipeline(
                "sentiment-analysis",
                model=self.config.model_name,
            )

    def analyze(self, text: str) -> SentimentLabel:
        if not text.strip():
            return "neutral"

        if self._pipeline is None:
            lowered = text.lower()
            if any(w in lowered for w in ["worried", "scared", "afraid", "anxious", "upset", "sad"]):
                return "negative"
            if any(w in lowered for w in ["happy", "relieved", "better", "good"]):
                return "positive"
            return "neutral"

        result = self._pipeline(text[:512])[0]
        label = result["label"].lower()
        if "neg" in label:
            return "negative"
        if "pos" in label:
            return "positive"
        return "neutral"