import os
from dataclasses import dataclass, field
from pathlib import Path


def _float_env(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def _int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


@dataclass
class LLMConfig:
    provider: str = field(default_factory=lambda: os.getenv("LLM_PROVIDER", "gemini"))
    model_name: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    temperature: float = field(default_factory=lambda: _float_env("GEMINI_TEMPERATURE", 0.7))
    max_tokens: int = field(default_factory=lambda: _int_env("GEMINI_MAX_TOKENS", 600))


@dataclass
class SentimentConfig:
    use_transformers: bool = field(
        default_factory=lambda: os.getenv("USE_TRANSFORMERS", "false").lower() == "true"
    )
    model_name: str = field(
        default_factory=lambda: os.getenv(
            "SENTIMENT_MODEL",
            "distilbert-base-uncased-finetuned-sst-2-english",
        )
    )


@dataclass
class HypertensionConfig:
    emergency_systolic_threshold: int = field(
        default_factory=lambda: _int_env("EMERGENCY_SYSTOLIC_THRESHOLD", 180)
    )
    emergency_diastolic_threshold: int = field(
        default_factory=lambda: _int_env("EMERGENCY_DIASTOLIC_THRESHOLD", 120)
    )


@dataclass
class MemoryConfig:
    db_path: str = field(
        default_factory=lambda: os.getenv(
            "ASSISTANCE_MEMORY_DB",
            str(Path(__file__).resolve().parents[1] / "data" / "assistant_memory.sqlite3"),
        )
    )
    max_messages: int = field(default_factory=lambda: _int_env("ASSISTANCE_MEMORY_MAX_MESSAGES", 12))


@dataclass
class AppConfig:
    llm: LLMConfig = field(default_factory=LLMConfig)
    sentiment: SentimentConfig = field(default_factory=SentimentConfig)
    hypertension: HypertensionConfig = field(default_factory=HypertensionConfig)
    memory: MemoryConfig = field(default_factory=MemoryConfig)
    system_name: str = "Hypertension Assistant"
    system_version: str = "0.3.0"


def get_default_config() -> AppConfig:
    return AppConfig()
