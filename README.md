<div align="center">

<h1>🧠 RaavOne Minds</h1>

</div>

<div align="center">


<h3>✨ Local-First RAG Assistant with a Beautiful Interactive GUI</h3>

<p>
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white">
  <img alt="FAISS" src="https://img.shields.io/badge/VectorDB-FAISS-1f2937">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
</p>

<p><b>Upload PDFs • Semantic Search • Chat with Citations • 100% Local Document Control</b></p>

</div>

---

## 🚀 Why RaavOne Minds?

**RaavOne Minds** is a fast, secure, and UI-first **Retrieval-Augmented Generation (RAG)** assistant designed for understanding multiple documents with clarity and trust.

✅ Built for smooth research workflows  
✅ Designed with a clean dashboard-like interface  
✅ Provides page-level citations for every answer  

---

## 🖼️ GUI Highlights

### 🎛️ Sidebar Workspace
- Upload one or multiple PDF files
- See and manage indexed files instantly
- Reset context with one click

### 🔍 Smart Search Modes
- **Single Document Mode** → Deep focus on one selected file  
- **Global Mode** → Search across all indexed documents

### 📌 Citation-Rich Responses
Every answer includes:
- Source document name
- Page reference (`Page: N`)
- Relevance/similarity confidence

### 💬 Smooth Chat Experience
- Persistent session-like conversation flow
- Clean interaction for iterative Q&A and research loops

---

## ✨ Core Features

- ✅ Page-aware citation mapping
- ✅ Dynamic context switching (single/all docs)
- ✅ Local embeddings + FAISS vector indexing
- ✅ Groq-powered low-latency answer generation
- ✅ Responsive React UI with modern styling
- ✅ Local-first document handling for privacy

---

## 🧱 System Architecture

```text
┌─────────────────────────────┐
│         User (GUI)          │
└──────────────┬──────────────┘
               │
      React + Vite Frontend
               │
┌──────────────▼──────────────┐
│       FastAPI Backend       │
├─────────────────────────────┤
│ PDF Parsing      → PyMuPDF  │
│ Text Embedding   → MiniLM   │
│ Vector Retrieval → FAISS    │
│ LLM Response     → Groq API │
└─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React**
- **Vite**
- **Custom CSS** (glassmorphism + responsive layout)

### Backend
- **FastAPI**
- **FAISS**
- **SentenceTransformers** (`all-MiniLM-L6-v2`)
- **PyMuPDF (Fitz)**
- **Groq Python SDK**

---

## ⚡ Quick Start

## 1) Backend

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

Install dependencies and run server:

```bash
pip install -r requirements.txt
uvicorn app.app:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

---

## 2) Frontend

```bash
cd ../frontend/ui
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Setup

Set your Groq API key:

```bash
# macOS/Linux
export GROQ_API_KEY="your_api_key"

# Windows PowerShell
setx GROQ_API_KEY "your_api_key"
```

---

## 📂 Project Structure

```text
RaavOne-Minds/
├── backend/
│   ├── app/
│   │   ├── api/          # API routing
│   │   ├── core/         # Config and setup
│   │   ├── routes/       # Chat and retrieval endpoints
│   │   ├── services/     # Parsing, embedding, search pipeline
│   │   └── vectordb/     # FAISS local index persistence
│   └── requirements.txt
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx   # Main UI + state management
        │   ├── App.css   # Theme, layout, transitions
        │   └── main.jsx
        └── package.json
```

---

## 🧪 Typical User Journey

1. Launch the dashboard in browser  
2. Upload one or more PDFs from sidebar  
3. Choose query mode (single file or global)  
4. Ask natural language questions in chat  
5. Validate answers using page-level citations  
6. Reset context and continue new research  

---

## 🔒 Privacy & Security

- Your PDFs remain in your local environment
- Embeddings and FAISS index are stored locally
- Only selected retrieved text is sent for answer generation

---

## 🛣️ Roadmap (v2.0)

- Drag-and-drop multi-file upload
- Token streaming responses
- Source preview thumbnails
- Light/Dark theme toggle
- Dockerized setup

---

## 📄 License

Open source project.  
Recommended: add a `LICENSE` file (MIT preferred).

---

## 👨‍💻 Author

**Mogesh Developer**  
GitHub: https://github.com/mogesh-developer/RaavOne-Minds

---

## ⭐ Support

If this project helped you, please **star the repo** and share feedback to improve the UI experience further.
