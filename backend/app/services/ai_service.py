from fastapi import responses
from app.core.config import settings
from groq import Groq
import os
import json

client = Groq(
    api_key=settings.groq_api_key
)

class AIService:

    def __init__(self):
        self.client = Groq(
            api_key=settings.groq_api_key
        )
    @staticmethod
    def ask(context: str, question: str, history: list = None) -> str:
        if history is None:
            history = []

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a Retrieval-Augmented Generation (RAG) assistant.\n\n"
                    "Answer ONLY using the provided context.\n\n"
                    "Rules:\n"
                    "- Do not use outside knowledge.\n"
                    "- If the answer is not in the context, reply:\n"
                    "  \"I don't know based on the uploaded document.\"\n"
                    "- Keep the answer concise (2-5 sentences).\n"
                    "- Do not repeat the question."
                )
            }
        ]

        # Add conversation history
        messages.extend(history)

        # Add current document context
        messages.append({
            "role": "system",
            "content": f"Document Context:\n{context}"
        })

        # Add current question
        messages.append({
            "role": "user",
            "content": question
        })

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0,
            max_tokens=256,
            top_p=1
        )

        return response.choices[0].message.content

    @staticmethod
    def generate_title(question: str) -> str:
        prompt = (
            "Create a very short title (maximum 4 words) summarizing the following query.\n"
            "Do NOT include quotes, do NOT include markdown, and do NOT include any introductory text. Return only the title.\n\n"
            f"Query: {question}"
        )
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=15,
            )
            title = response.choices[0].message.content.strip().strip('"').strip("'")
            return title
        except Exception:
            return question[:30] + ("..." if len(question) > 30 else "")

    @staticmethod
    def generate_suggested_questions(chunks: list) -> list:
        if not chunks:
            return [
                "Summarize the key information in this document.",
                "What are the main findings or topics discussed?",
                "What action items or next steps are mentioned?"
            ]

        context = "\n\n".join(chunks)[:3000]

        prompt = (
            "Based on the following document context, generate exactly 3 professional, distinct, and high-quality questions "
            "that a user would want to ask about this content.\n"
            "Format the response strictly as a JSON array of strings, without markdown, without codeblocks, and without extra text. Example format:\n"
            '["Question 1?", "Question 2?", "Question 3?"]\n\n'
            f"Context:\n{context}"
        )
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150,
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                lines = content.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                content = "\n".join(lines).strip()

            questions = json.loads(content)
            if isinstance(questions, list) and len(questions) >= 3:
                return questions[:3]
        except Exception as e:
            print("Failed to generate suggested questions:", e)

        return [
            "Summarize the key information in this document.",
            "What are the main findings or topics discussed?",
            "What action items or next steps are mentioned?"
        ]