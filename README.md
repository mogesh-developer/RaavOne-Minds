<div align="center">

<h1>🧠 RaavOne Minds v1.2</h1>

</div>

<div align="center">

<h3>✨ Local-First Multi-Format RAG & OCR Assistant with a Beautiful Interactive GUI</h3>

<p>
  <img alt="Version" src="https://img.shields.io/badge/Version-v1.2-blue">
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white">
  <img alt="FAISS" src="https://img.shields.io/badge/VectorDB-FAISS-1f2937">
  <img alt="OCR" src="https://img.shields.io/badge/OCR-OCR.space-orange">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
</p>

<p><b>Multi-Format Uploads • OCR for Scans & Images • Batch Processing • Page-Level Citations • Local Privacy</b></p>

</div>

---

## 🆕 What's New in v1.3
- 🏁 **Minimal Monochrome UI**: Upgraded the design system to a clean, black-and-white (monochrome) theme completely free of gradients.
- 🎯 **Polished Font Stack**: Integrated Sora (headings/logos), Inter (body/tables/sidebar), and JetBrains Mono (code blocks/outputs).
- 🧩 **Professional Vector Icons**: Replaced emoji indicators with clean SVG icons via `lucide-react`.
- 🎛️ **Decluttered Dynamic Sidebar**: Upload buttons now appear contextually under their respective tabs, and tab pill text wrapping is resolved.
- ⚡ **Dynamic suggested questions**: Quick actions are dynamically generated using the LLM based on the active document/project context instead of being hardcoded.
- 🔧 **Layout Fixes**: Corrected line overlaps and overflow wrapping for extremely long filenames.

---

## 🆕 What's New in v1.2

- 📄 **Multi-Format Support**: Upload PDFs, Word documents (`.docx`), Plain Text/Markdown (`.txt`, `.md`), Code/Data (`.py`, `.js`, `.json`, `.csv`, `.html`).
- 🖼️ **OCR Integration**: Built-in Optical Character Recognition (OCR.space API) to extract text from images (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`) and scanned/image-only PDFs.
- 📦 **Batch File Upload**: Upload multiple files simultaneously in a single click.
- 🛠️ **Unified Document Processing Engine**: Modular `DocumentReaderService` for smart text extraction with automated OCR fallback.
- 🎨 **Enhanced UI Feedback**: Multi-file select UI, dynamic batch status indicators, and file type handling.

---

## 🚀 Why RaavOne Minds?

**RaavOne Minds** is a fast, secure, and UI-first **Retrieval-Augmented Generation (RAG)** assistant designed for understanding multiple documents with clarity and trust.

✅ Built for smooth research workflows  
✅ Designed with a clean dashboard-like interface  
✅ Provides page-level citations for every answer  
✅ Smart OCR engine for image-heavy & scanned documents  

---

## 🖼️ GUI Highlights

### 🎛️ Sidebar & Header Workspace
- Batch upload single or multiple documents of various formats (`.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, etc.)
- View and manage indexed files instantly in real-time
- Reset context with one click

### 🔍 Smart Search Modes
- **Single Document Mode** → Deep focus on one selected file  
- **Global Mode** → Search across all indexed documents simultaneously

### 📌 Citation-Rich Responses
Every answer includes:
- Source document name
- Page reference (`Page: N`)
- Relevance/similarity confidence

### 💬 Smooth Chat Experience
- Persistent session-like conversation flow
- Rich Markdown code & table rendering
- Clean interaction for iterative Q&A and research loops

---

## ✨ Core Features

- ✅ **Multi-Format & Image Support**: PDFs, Word, Markdown, Code, Plain Text, and Images
- ✅ **Automated OCR Integration**: Extract text from scans & images via OCR.space
- ✅ **Batch File Processing**: Select and process multiple files at once
- ✅ **Page-aware citation mapping**: Pinpoint exact sources for retrieved content
- ✅ **Dynamic context switching**: Easily target a single document or search globally
- ✅ **Local embeddings + FAISS vector indexing**: High-speed, local similarity search
- ✅ **Groq-powered low-latency LLM**: Rapid, accurate responses
- ✅ **Responsive React UI**: Clean glassmorphism styling and smooth layout

---

## 🧱 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       User (GUI)                            │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       React + Vite Frontend                   │
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                      FastAPI Backend                        │
├─────────────────────────────────────────────────────────────┤
│ Document Reader Engine ──► PyMuPDF / docx / Plain Text       │
│ OCR Engine             ──► OCR.space API (Scans & Images)   │
│ Text Chunking          ──► Recursive Text Splitter          │
│ Text Embedding         ──► MiniLM (SentenceTransformers)    │
│ Vector Retrieval       ──► FAISS Local Index                │
│ LLM Response           ──► Groq API                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React** & **Vite**
- **Custom CSS** (glassmorphism + responsive layout)
- **Lucide Icons** & **React Markdown**

### Backend
- **FastAPI**
- **FAISS** (Vector Indexing)
- **SentenceTransformers** (`all-MiniLM-L6-v2`)
- **PyMuPDF (Fitz)** & **python-docx**
- **OCR.space API** Integration
- **Groq Python SDK**

---

## ⚡ Quick Start

### 1) Backend

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
uvicorn app.app:main --reload
```

Backend runs at: `http://127.0.0.1:8000`

---

### 2) Frontend

```bash
cd ../frontend/ui
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Setup

Configure your API keys in `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
OCR_SPACE_API_KEY=your_ocr_space_api_key_here
```

---

## 📂 Project Structure

```text
RaavOne-Minds/
├── backend/
│   ├── app/
│   │   ├── api/          # API routing (upload, chat, retrieve)
│   │   ├── core/         # Config and setup
│   │   ├── services/     # Parsing, OCR, embedding, search pipeline
│   │   │   ├── document_reader_service.py # Multi-format document parser
│   │   │   ├── ocr_service.py             # OCR.space API handler
│   │   │   ├── chunk_service.py           # Text chunking logic
│   │   │   └── embedding_service.py       # SentenceTransformers integration
│   │   └── vectordb/     # FAISS local index persistence
│   └── requirements.txt
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx   # Main UI + batch state management
        │   ├── App.css   # Theme, layout, transitions
        │   └── main.jsx
        └── package.json
```

---

## 🧪 Typical User Journey

1. Launch the dashboard in browser  
2. Upload single or multiple documents/images from sidebar or header  
3. Automatic OCR runs on images and scanned document pages  
4. Choose query mode (single document focus or global search)  
5. Ask natural language questions in chat  
6. Validate answers using page-level citations  
7. Reset context and continue new research  

---

## 🔒 Privacy & Security

- Your documents remain in your local environment
- Embeddings and FAISS index are stored locally
- OCR image parsing uses secure API connections
- Only relevant retrieved chunks are sent for answer generation

---

## 🛣️ Roadmap

- Token streaming responses
- Source preview thumbnails & document reader modal
- Dark / Light theme customizer
- Dockerized container setup

---

## 📄 License

Open source project under the MIT License.

---

## 👨‍💻 Author

**Mogesh Developer**  
GitHub: https://github.com/mogesh-developer/RaavOne-Minds

---

## ⭐ Support

If this project helped you, please **star the repo** on GitHub!
