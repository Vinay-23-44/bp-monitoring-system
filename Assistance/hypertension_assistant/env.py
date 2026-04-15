import logging
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / ".env"
_ENV_LOADED = False


def load_environment() -> Path:
    global _ENV_LOADED

    if not _ENV_LOADED:
        load_dotenv(ENV_PATH)
        _ENV_LOADED = True
        logger.info("Loaded Assistance environment from %s", ENV_PATH)

    return ENV_PATH
