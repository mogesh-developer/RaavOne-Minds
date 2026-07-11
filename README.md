<div align="center">

# 🌌 DocuChat  
### *Local RAG Document Assistant with Citation Intelligence*

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/React-Frontend-20232A?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/FAISS-Vector_Search-5C2D91?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Groq-LLM-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
</p>

<p>
  <b>DocuChat</b> is a modern, local-first RAG assistant that lets you upload PDFs, query them semantically, and receive concise answers with <b>page-aware citations</b> — all inside a sleek glassmorphism UI.
</p>

</div>

---

## 🖼️ Interface Preview

> Replace the image paths below with your actual screenshots from `assets/` or `docs/images/`.

<table>
  <tr>
    <td align="center"><b>Desktop Chat View</b></td>
    <td align="center"><b>Mobile Responsive View</b></td>
  </tr>
  <tr>
    <td><img src="./assets/desktop-preview.png" alt="Desktop UI" width="100%"/></td>
    <td><img src="./assets/mobile-preview.png" alt="Mobile UI" width="100%"/></td>
  </tr>
</table>

---

## ✨ GUI-Centric Feature Panel

| UI Element | Description | Benefit |
|---|---|---|
| 🧊 **Glassmorphism Layout** | Blur + transparency + gradient surfaces | Modern, premium visual feel |
| 📂 **Document Scope Selector** | Switch between one PDF or all documents | Flexible retrieval context |
| 🧠 **Citation Drawer** | Expand `[X] sources` per response | Transparent answer grounding |
| 🕘 **Session Sidebar** | Resume previous chat threads instantly | Better continuity |
| ➕ **Quick New Chat** | One-click reset and fresh context | Faster workflows |
| 📱 **Responsive UI Shell** | Mobile + desktop optimized spacing | Clean UX on all devices |

---

## 🧩 Product Walkthrough (Visual Flow)

```mermaid
flowchart LR
    A[Upload PDF(s)] --> B[Extract Page Text]
    B --> C[Create Embeddings]
    C --> D[Index in FAISS]
    D --> E[User Query]
    E --> F[Retrieve Top Chunks]
    F --> G[Generate Answer via Groq LLM]
    G --> H[Render Answer + Page Citations]
```

---

## 🏗️ System Architecture

<div align="center">

```text
┌─────────────────────────────── Frontend (React + Vite) ───────────────────────────────┐
│  Chat UI  │  Sidebar History  │  PDF Selector  │  Source Expanders  │  Responsive CSS │
└───────────────────────────────────────┬─────────────────────────────────────────────────┘
                                        │ HTTP
┌─────────────────────────────── Backend (FastAPI) ──────────────────────────────────────┐
│ Upload API │ Chunking Service │ Embedding Service │ Retrieval Service │ Chat Route      │
└───────────────────────────────────────┬─────────────────────────────────────────────────┘
                                        │
                           ┌────────────▼────────────┐
                           │ FAISS + Metadata Store  │
                           │  (local vector index)   │
                           └────────────┬────────────┘
                                        │
                             ┌──────────▼──────────┐
                             │ Groq LLM Inference  │
                             │ llama-3.1-8b-instant│
                             └─────────────────────┘
```

</div>

---

## ⚙️ Tech Stack

<div align="center">

| Layer | Technologies |
|---|---|
| **Backend** | FastAPI, FAISS, PyMuPDF, SentenceTransformers, Groq SDK |
| **Frontend** | React, Vite, Vanilla CSS |
| **Embedding Model** | `all-MiniLM-L6-v2` |
| **LLM** | `llama-3.1-8b-instant` |

</div>

---

## 🚀 Quick Start

### 1) Clone Repository
```bash
git clone https://github.com/mogesh-developer/RAG-document-assistant.git
cd RAG-document-assistant
```

### 2) Backend Setup
```bash
cd backend
python -m venv venv
```

Activate venv:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Install + run:
```bash
pip install -r requirements.txt
uvicorn app.app:app --reload
```

Backend URL: `http://127.0.0.1:8000`

### 3) Frontend Setup
```bash
cd ../frontend/ui
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## 🧭 UI Usage Guide

1. Open the app in browser.
2. Use sidebar → **Choose PDF** → **Upload**.
3. Select scope from top dropdown:
   - specific document
   - **All Documents**
4. Ask a question in chat.
5. Expand **sources** to inspect:
   - chunk text
   - similarity score
   - page number

---

## 📁 Project Layout

```text
RAG-document-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── routes/
│   │   ├── services/
│   │   └── vectordb/
│   └── requirements.txt
└── frontend/
    └── ui/
        ├── src/
        │   ├── App.jsx
        │   ├── App.css
        │   └── main.jsx
        └── package.json
```

---

## 🔐 Privacy & Data Behavior

- Retrieval pipeline runs locally (embeddings + FAISS).
- Documents remain in local runtime/project environment.
- External call is only for LLM generation (Groq), based on your configuration.

---

## 🛣️ GUI Upgrade Roadmap

- [ ] Drag-and-drop upload zone with progress bar  
- [ ] Animated citation side panel  
- [ ] Light/Dark/Neon theme switcher  
- [ ] Streaming typing indicator  
- [ ] PDF page thumbnail in source viewer  
- [ ] Keyboard shortcut palette (`⌘K` / `Ctrl+K`)

---

## 🤝 Contributing

Contributions are welcome — especially for:
- UI polish
- retrieval quality
- citation UX
- performance improvements

---

## 📄 License

Add your preferred license (MIT recommended).

---

<div align="center">

### 👨‍💻 Built by [mogesh-developer](https://github.com/mogesh-developer)

</div>
