# 🧠 RaavOne Minds

<div align="center">

### Local RAG Assistant with a Clean, Interactive GUI

Upload PDFs • Search Semantically • Chat with Citations • Stay Local-First

</div>

---

## 🎯 What is RaavOne Minds?

**RaavOne Minds** is a lightweight, secure, and visually driven **RAG (Retrieval-Augmented Generation)** assistant built for multi-document understanding.

It provides a modern GUI where users can:

- Upload and parse PDF documents
- Ask natural-language questions
- Retrieve semantically relevant chunks
- View page-aware citations (`Page: N`)
- Switch context between one file or all indexed files

---

## 🖼️ GUI-First Experience

### Sidebar Controls
- Upload PDF documents
- Manage indexed files
- Reset system context quickly

### Smart Query Scope
- **Single-Document Mode**: Focus answers on one selected document
- **Global Mode**: Search across the full indexed document set

### Citation-Aware Answers
- Each response includes:
  - Source document name
  - Page reference
  - Similarity relevance (for trust and verification)

### Session-Friendly Interaction
- Conversational flow with maintained UI state
- Smooth interaction pattern for iterative research

---

## ✨ Key Features (v1.0)

- ✅ **Page-Aware Citation Mapping**
- ✅ **Dynamic Context Switching**
- ✅ **Local Embedding + Local FAISS Indexing**
- ✅ **Groq-Powered Fast Response Generation**
- ✅ **Responsive React Interface with Custom Styling**

---

## 🧱 Architecture at a Glance

```text
User (GUI)
   ↓
React + Vite Frontend
   ↓
FastAPI Backend
   ├─ PDF Parsing (PyMuPDF)
   ├─ Chunking + Embeddings (SentenceTransformers)
   ├─ Vector Search (FAISS)
   └─ LLM Response (Groq SDK - llama-3.1-8b-instant)
```

---

## 🛠️ Tech Stack

### Frontend (GUI)
- **React**
- **Vite**
- **Custom CSS (Glassmorphism + Responsive Layout)**

### Backend (RAG Engine)
- **FastAPI**
- **FAISS**
- **SentenceTransformers (`all-MiniLM-L6-v2`)**
- **PyMuPDF (Fitz)**
- **Groq Python SDK**

---

## 🚀 Quick Start

## 1) Backend Setup

```bash
cd backend
```

Create virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install and run backend:

```bash
pip install -r requirements.txt
uvicorn app.app:app --reload
```

Backend URL: `http://127.0.0.1:8000`

---

## 2) Frontend Setup

```bash
cd ../frontend/ui
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## 🔑 Environment Variable

Set your Groq key before running:

```bash
# macOS/Linux
export GROQ_API_KEY="your_api_key"

# Windows (PowerShell)
setx GROQ_API_KEY "your_api_key"
```

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/             # API routing
│   │   ├── core/            # Config and setup
│   │   ├── routes/          # Chat and retrieval endpoints
│   │   ├── services/        # Parsing, embedding, search pipeline
│   │   └── vectordb/        # FAISS local index persistence
│   └── requirements.txt
│
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx      # Main UI structure and state
        │   ├── App.css      # Visual theme and transitions
        │   └── main.jsx
        └── package.json
```

---

## 🧪 Typical User Flow (GUI)

1. Open dashboard in browser
2. Upload one or more PDFs from sidebar
3. Select query scope (single document / all documents)
4. Ask question in chat panel
5. Validate response with page-cited sources
6. Reset context when starting a new session

---

## 🔒 Privacy & Security

- Document files stay in your local environment
- Embeddings and vector indexes are stored locally
- Only selected text context is sent for LLM completion

---

## 🛣️ Planned in v2.0

- Drag-and-drop multi-file upload
- Token streaming in chat
- Source preview thumbnails
- Light/Dark theme switcher
- Dockerized deployment

---

## 📄 License

Open source.  
(Recommended: add a dedicated `LICENSE` file, e.g., MIT)

---

## 👨‍💻 Author

**Mogesh Developer**  
GitHub: https://github.com/mogesh-developer/RAG-document-assistant

---

## ⭐ Support

If this project helps you, give it a **star** and share feedback for future UI improvements.
