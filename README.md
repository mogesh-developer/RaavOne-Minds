<div align="center">

# 🌌 DocuChat  
### *Local RAG Document Assistant*  
## 🚀 Version 1.0 (V1)

<p align="center">
  <img src="https://img.shields.io/badge/Release-v1.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Stable-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/React-Frontend-20232A?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/FAISS-Vector_Search-5C2D91?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Groq-LLM-orange?style=for-the-badge" />
</p>

<p>
  <b>DocuChat v1.0</b> is the first stable release of a local-first, citation-aware RAG assistant for PDF-based question answering with a modern glassmorphism UI.
</p>

</div>

---

## 📌 Release: Version 1.0

### ✅ What's included in V1
- Page-aware PDF chunking with citation metadata (`Page: N`)
- Multi-document querying (single doc / all docs)
- Local semantic retrieval with FAISS
- Groq-powered answer generation (`llama-3.1-8b-instant`)
- Persistent chat history sidebar
- Fully responsive glassmorphism UI

### 🎯 V1 Scope
This release focuses on a **fast, clean, developer-friendly baseline** for local RAG workflows with transparent citation tracking.

### 🔜 Planned for V2
- Drag-and-drop upload
- Streaming responses
- Citation preview modal with thumbnails
- Theme switcher (dark/light)
- Docker one-command setup



## ✨ Highlights

- **Page-Level Citations** — Every answer is grounded with exact source page references (`Page: N`) and similarity scores.
- **Multi-Document Querying** — Ask questions against one selected PDF or all uploaded files at once.
- **Local Vector Search** — FAISS + SentenceTransformers for fast, offline semantic retrieval.
- **Conversation Memory** — Create, resume, and manage chat sessions via sidebar history.
- **Responsive Glass UI** — Clean “liquid glass” interface optimized for desktop and mobile.
- **Low-Latency Generation** — Groq-powered responses using `llama-3.1-8b-instant`.

---

## 🧱 Architecture Overview

### Backend (FastAPI)
- PDF ingestion and page-wise chunking
- Embedding generation (`all-MiniLM-L6-v2`)
- FAISS index creation and retrieval
- Prompt construction with retrieved context
- LLM response generation via Groq
- Session and memory endpoints

### Frontend (React + Vite)
- Chat interface with source expansion
- Document selection dropdown (single/all docs mode)
- Upload and history management sidebar
- Responsive app shell with glassmorphism styling

---

## 🛠 Tech Stack

### Backend
- **FastAPI** — Async Python API framework
- **FAISS** — High-performance vector similarity search
- **PyMuPDF (Fitz)** — PDF text extraction with page granularity
- **SentenceTransformers** — Local embedding model support
- **Groq SDK** — Fast LLM inference integration

### Frontend
- **React + Vite** — Fast, component-driven UI development
- **Vanilla CSS** — Lightweight custom responsive styling

---

## ✅ Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Groq API Key** exposed as environment variable:

```bash
GROQ_API_KEY=your_api_key_here
```

---

## 🚀 Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/mogesh-developer/RAG-document-assistant.git
cd RAG-document-assistant
```

### 2) Backend setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Install dependencies and run server:

```bash
pip install -r requirements.txt
uvicorn app.app:app --reload
```

Backend runs at: **http://127.0.0.1:8000**

### 3) Frontend setup

```bash
cd ../frontend/ui
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```text
RAG-document-assistant/
├── backend/
│   ├── app/
│   │   ├── api/          # API router definitions
│   │   ├── core/         # Configuration and settings
│   │   ├── routes/       # Chat and memory endpoints
│   │   ├── services/     # PDF parsing, embeddings, retrieval, generation
│   │   └── vectordb/     # FAISS index + metadata storage
│   └── requirements.txt
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx   # Main UI shell
        │   ├── App.css   # Glassmorphism + responsive styles
        │   └── main.jsx
        └── package.json
```

---

## 🧭 Usage

1. Open **http://localhost:5173**
2. Upload one or more PDF files from the sidebar.
3. Choose a target scope:
   - **Single document** for focused Q&A
   - **All documents** for broad retrieval
4. Ask questions in chat.
5. Expand **sources** below answers to inspect:
   - source snippet
   - similarity score
   - page number

---

## 📌 Citation Behavior

DocuChat uses page-based chunking to preserve source traceability.  
This means each retrieved chunk carries document + page metadata, making responses easier to verify and debug in development workflows.

---

## 🔒 Privacy & Local-First Notes

- Vector indexing and retrieval run locally (FAISS + local embeddings).
- Uploaded files remain in your local project/runtime context.
- Only prompt/response generation uses the configured LLM provider (Groq).

---

## 🧪 Development Notes

- Keep chunk sizes page-aware to maintain citation accuracy.
- Rebuild index metadata if document parsing logic changes.
- Use smaller embedding models for faster local iteration, larger ones for better semantic recall.

---

## 📈 Roadmap Ideas

- Drag-and-drop multi-file upload
- Citation preview modal with page thumbnails
- Streaming token responses
- Role-based prompt presets (research, legal, technical)
- Dockerized one-command local deployment

---

## 🤝 Contributing

Contributions, refactors, and UI improvements are welcome.  
If you’d like, open an issue with:
- feature proposal
- UX enhancement
- retrieval quality improvement
- bug report with reproduction steps

---

## 📄 License

Add your preferred license here (e.g., MIT).

---

## 👤 Author

**Mogesh Developer**  
Project: [RAG-document-assistant](https://github.com/mogesh-developer/RAG-document-assistant)
