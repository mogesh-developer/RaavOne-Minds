from app.services import search_service
from fastapi import APIRouter
from app.services.search_service import SearchService
from app.services.ai_service import AIService
from app.services.memory_service import MemoryService

router = APIRouter()
search_service = SearchService()
ai = AIService()
memory = MemoryService()

@router.get("/history/sessions")
def get_sessions():
    return memory.get_sessions()

@router.get("/history/sessions/{chat_id}")
def get_session_messages(chat_id: str):
    return memory.get_session_messages(chat_id)

@router.delete("/history/sessions/{chat_id}")
def delete_session(chat_id: str):
    memory.delete_session(chat_id)
    return {"success": True}

@router.post("/query")
def query(question: str, document_name: str = None, chat_id: str = None):
    # Fetch previous history for this session
    history = memory.get_history(chat_id)
    is_new = len(history) == 0
    title = None
    if is_new:
        title = AIService.generate_title(question)

    results = search_service.search(question, document_name=document_name)
    if not results:
        answer = "sorry da, nee search pandrathu nee kudutha pdf la illa da 😅"
        memory.add_user(question, chat_id, document_name, title=title)
        memory.add_assistant(answer, chat_id, [])
        return {
            "question": question,
            "answer": answer,
            "sources": []
        }

    context = "\n\n".join(
        chunk["text"]
        for chunk in results
    )

    answer = AIService.ask(context, question, history=history)

    # Save current exchange to memory
    memory.add_user(question, chat_id, document_name, title=title)
    memory.add_assistant(answer, chat_id, results)

    return {
        "question": question,
        "answer": answer,
        "sources": results
    }

@router.post("/clear")
def clear_memory(chat_id: str = None):
    memory.clear(chat_id)
    return {"message": f"Memory cleared for session: {chat_id or 'default'}"}