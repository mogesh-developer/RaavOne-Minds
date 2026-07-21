# RaavOne Minds

A lightweight, secure, local Retrieval-Augmented Generation (RAG) assistant designed for multi-document parsing and semantic search. It integrates a FastAPI backend for local vector database management with a React frontend featuring a custom-built, responsive user interface.

---

## Release: Version 1.0

### Key Features
* **Page-Aware Citations**: Source-tracking chunker maps text segments back to their original document and page (`Page: N`), detailing similarity scores for validation.
* **Dynamic Context Switching**: Toggle queries dynamically between a single selected document or the entire indexed collection.
* **Local Embedding & Indexing**: Uses `all-MiniLM-L6-v2` and FAISS locally for semantic vector storage, keeping raw text local.
* **Groq SDK Integration**: Utilizes Groq (`llama-3.1-8b-instant`) for fast, context-constrained response generation.
* **Session Memory**: Built-in session state management managed through a sidebar navigation pane.

### Planned for Version 2.0
* Drag-and-drop batch upload
* Token-by-token response streaming
* Interactive source preview thumbnails
* Built-in theme switcher (Light / Dark mode)
* Containerized setup via Docker

---

## Tech Stack & Architecture

### Backend (Python/FastAPI)
* **FastAPI**: Core framework for API routes and async event processing.
* **FAISS**: Dense vector database for similarity searches.
* **SentenceTransformers**: Local text vectorization.
* **PyMuPDF (Fitz)**: High-performance PDF parser preserving page geometry.
* **Groq Python SDK**: Connection to cloud inference LLM.

### Frontend (React/Vite)
* **React**: Component structure and reactive state management.
* **Vite**: Ultra-fast bundler and local development server.
* **Custom CSS**: Premium glassmorphic styling, transitions, and responsive grid layouts.

---

## Getting Started

### Prerequisites
* **Python 3.10+**
* **Node.js 18+**
* **Groq API Key**: Set your `GROQ_API_KEY` as a system environment variable.

### 1. Ingest/Backend Service Setup
Navigate to the backend directory:
```bash
cd backend
```

Configure the virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install requirements and run:
```bash
pip install -r requirements.txt
uvicorn app.app:app --reload
```
The API server starts at `http://127.0.0.1:8000`.

### 2. Client Setup
Navigate to the UI directory:
```bash
cd ../frontend/ui
```

Install dependencies and start:
```bash
npm install
npm run dev
```
The client dashboard opens at `http://localhost:5173`.

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/             # API routing
│   │   ├── core/            # Config variables and setup
│   │   ├── routes/          # Conversation endpoints
│   │   ├── services/        # PDF extraction, embedding pipelines, vector search
│   │   └── vectordb/        # FAISS indexes and local persistence
│   └── requirements.txt
│
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx      # Application layout and core state logic
        │   ├── App.css      # Custom stylesheet for glassmorphism UI
        │   └── main.jsx
        └── package.json
```

---

## Development Notes
* **Local Ingestion**: PDFs uploaded in the UI are processed and written directly to the local vector indexes stored in the `backend/app/vectordb` path.
* **Security & Privacy**: Document files remain in local project space. The server transmits context snippets to Groq APIs during chat completion requests.
* **Usage Notes**: 
    1. Upload PDFs via the sidebar.
    2. Use the header dropdown to toggle between querying specific documents or the global store.
    3. Click the "Reset System Context" option in the UI to clear the active FAISS index and local database.
* **License**: Open source.
* **Author**: Mogesh Developer (https://github.com/mogesh-developer/RAG-document-assistant)
