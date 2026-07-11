import json
from pathlib import Path

class MemoryService:
    def __init__(self):
        self.dir_path = Path("app/vectordb")
        self.dir_path.mkdir(exist_ok=True)
        self.file_path = self.dir_path / "chat_history.json"

    def _load_history(self) -> dict:
        if not self.file_path.exists():
            return {}
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_history(self, data: dict):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving chat history: {e}")

    def get_sessions(self) -> list:
        history = self._load_history()
        sessions = []
        for chat_id, session_data in history.items():
            sessions.append({
                "chat_id": chat_id,
                "title": session_data.get("title", "Untitled Chat"),
                "document_name": session_data.get("document_name", "all")
            })
        return sessions

    def get_session_messages(self, chat_id: str) -> list:
        history = self._load_history()
        session_data = history.get(chat_id, {})
        return session_data.get("messages", [])

    def get_history(self, chat_id: str) -> list:
        """Returns the format expected by Groq: list of {'role', 'content'}"""
        messages = self.get_session_messages(chat_id)
        # Convert internal structure to Groq's role/content structure
        return [
            {
                "role": msg["role"],
                "content": msg["text"]
            }
            for msg in messages
        ]

    def add_user(self, message: str, chat_id: str, document_name: str = None):
        history = self._load_history()
        
        if chat_id not in history:
            # First question sets the title
            title = message[:40] + ("..." if len(message) > 40 else "")
            history[chat_id] = {
                "title": title,
                "document_name": document_name or "all",
                "messages": []
            }
            
        history[chat_id]["messages"].append({
            "role": "user",
            "text": message
        })
        self._save_history(history)

    def add_assistant(self, message: str, chat_id: str, sources: list = None):
        history = self._load_history()
        if chat_id in history:
            history[chat_id]["messages"].append({
                "role": "assistant",
                "text": message,
                "sources": sources or []
            })
            self._save_history(history)

    def delete_session(self, chat_id: str):
        history = self._load_history()
        if chat_id in history:
            del history[chat_id]
            self._save_history(history)

    def clear(self, chat_id: str = None):
        if chat_id:
            history = self._load_history()
            if chat_id in history:
                history[chat_id]["messages"] = []
                self._save_history(history)
        else:
            # Reset all history
            self._save_history({})