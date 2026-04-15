import sqlite3
from pathlib import Path
from typing import Any, Dict, List


class ConversationMemoryStore:
    def __init__(self, db_path: str, max_messages: int = 12) -> None:
        self.db_path = Path(db_path)
        self.max_messages = max_messages
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _ensure_schema(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS conversation_messages (
                    conversation_id TEXT NOT NULL,
                    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL
                )
                """
            )

    def load(self, conversation_id: str) -> List[Dict[str, str]]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT role, content
                FROM conversation_messages
                WHERE conversation_id = ?
                ORDER BY sequence ASC
                """,
                (conversation_id,),
            ).fetchall()

        return [
            {
                "role": role,
                "content": content,
            }
            for role, content in rows
        ][-self.max_messages :]

    def save(self, conversation_id: str, messages: List[Any]) -> None:
        serializable = []
        for message in messages[-self.max_messages :]:
            normalized = self._normalize_message(message)
            if normalized:
                serializable.append((conversation_id, normalized["role"], normalized["content"]))

        with self._connect() as connection:
            connection.execute(
                "DELETE FROM conversation_messages WHERE conversation_id = ?",
                (conversation_id,),
            )
            connection.executemany(
                """
                INSERT INTO conversation_messages (conversation_id, role, content)
                VALUES (?, ?, ?)
                """,
                serializable,
            )

    def _normalize_message(self, message: Any) -> Dict[str, str] | None:
        if isinstance(message, dict):
            role = str(message.get("role", "")).strip()
            content = str(message.get("content", "")).strip()
            if role in {"user", "assistant"} and content:
                return {"role": role, "content": content}
            return None

        content = str(getattr(message, "content", "")).strip()
        if not content:
            return None

        message_type = str(getattr(message, "type", "")).lower()
        if message_type == "human":
            return {"role": "user", "content": content}
        if message_type == "ai":
            return {"role": "assistant", "content": content}
        return None
