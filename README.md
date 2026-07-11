# DocuChat — Local RAG Document Assistant

DocuChat is a lightweight, responsive, and citation-aware Retrieval-Augmented Generation (RAG) assistant. It allows you to upload multiple PDF documents locally, switch query contexts dynamically, and chat with your documents using a modern, liquid-glass developer UI.

---

## Key Features

* **Page-Aware Citations**: DocuChat chunks documents page-by-page, preserving the exact source page number (`Page: X`) and similarity score for each citation.
* **Liquid Glassmorphism UI**: Built with a sleek space-indigo gradient, transparency overlays, blurred backdrops, and compact responsive layouts for both mobile and desktop.
* **Multi-Document Selector**: Switch query focus dynamically between a single target PDF or query all uploaded documents at once.
* **Persistent Conversation History**: Save and resume past chat sessions via a sliding sidebar drawer.
* **Offline Vector Database**: Local vector searches powered by FAISS and SentenceTransformers (`all-MiniLM-L6-v2`).
* **Fast LLM Integration**: Generates concise, context-constrained answers in real time using Groq (`llama-3.1-8b-instant`).

---

## Tech Stack

### Backend
* **FastAPI**: Asynchronous Python web API framework.
* **FAISS**: High-performance local vector similarity search.
* **PyMuPDF (Fitz)**: Superfast PDF text and page extraction.
* **Groq SDK**: Connects with Llama-3.1 for high-speed response generation.
* **SentenceTransformers**: Local open-source embeddings.

### Frontend
* **React + Vite**: High-speed, component-driven client workspace.
* **Vanilla CSS**: Clean, responsive, glassmorphic layout shell (no bulky CSS dependencies).

---

## Installation & Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+**
* **Groq API Key** (Set your `GROQ_API_KEY` environment variable in the backend configuration)

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI backend server:
```bash
uvicorn app.app:app --reload
```
*The backend will start running at `http://127.0.0.1:8000`.*

### 2. Frontend Setup
Navigate to the `frontend/ui` directory:
```bash
cd ../frontend/ui
```

Install packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The client application will start running at `http://localhost:5173`.*

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/             # API Router definitions
│   │   ├── core/            # Configuration management
│   │   ├── routes/          # Chat and memory endpoints
│   │   ├── services/        # RAG pipelines (PDF, embeddings, FAISS, AI, Memory)
│   │   └── vectordb/        # Local index storage (index.faiss, metadata.json)
│   └── requirements.txt
│
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx      # Clean app-shell and layout logic
        │   ├── App.css      # Glassmorphic and responsive styling
        │   └── main.jsx
        └── package.json
```

---

## Usage Guide
1. **Open the App**: Access `http://localhost:5173` in your browser.
2. **Upload PDF**: Click the menu (`☰`) on mobile or access the sidebar on desktop, select `Choose PDF` to load your document, and click `Upload`.
3. **Chat**: Select your document from the header dropdown to ask specific questions about it, or choose `All Documents` to query all PDFs.
4. **Sources**: Click on `[X] sources` under any assistant response to view the exact text chunks, similarity scores, and page numbers cited.
5. **Manage History**: Click `＋` in the sidebar to start a new chat, switch between old ones, or click `Reset System Context` to clear all uploaded data.