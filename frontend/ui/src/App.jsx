import { useState, useRef, useEffect } from 'react';
import './App.css';
import MarkdownRenderer from './MarkdownRenderer';
import {
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Plus,
  Upload,
  Download,
  Sun,
  Moon,
  Trash2,
  ChevronRight,
  BrainCircuit,
  Eye,
  RefreshCw
} from 'lucide-react';

function App() {
  const [activePdf, setActivePdf] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [documents, setDocuments] = useState([]); // Array of { name, chunks, pages }
  const [selectedDocName, setSelectedDocName] = useState('all');

  const [sidebarTab, setSidebarTab] = useState('chats'); // 'chats' | 'docs' | 'images'
  const [imgFiles, setImgFiles] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [sessions, setSessions] = useState([]); // Array of { chat_id, title, document_name }
  const [chatId, setChatId] = useState(() => Math.random().toString(36).substring(2, 11));
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

  const [queryText, setQueryText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImgFiles(Array.from(e.target.files));
    }
  };

  const handleImgUpload = async (e) => {
    e.preventDefault();
    if (!imgFiles || imgFiles.length === 0) return;

    setUploadingImg(true);
    const formData = new FormData();
    imgFiles.forEach(f => formData.append('files', f));

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Image upload failed');
      await response.json();
      await fetchDocuments();
      if (imgFiles.length === 1) {
        setSelectedDocName(imgFiles[0].name);
      }
      setImgFiles([]);
      setSidebarTab('images');
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImg(false);
    }
  };

  const isImgFile = (name) => ['.png', '.jpg', '.jpeg', '.webp', '.bmp'].some(ext => name.toLowerCase().endsWith(ext));
  const textDocuments = documents.filter(doc => !isImgFile(doc.name));
  const imageDocuments = documents.filter(doc => isImgFile(doc.name));

  const [isMono, setIsMono] = useState(() => localStorage.getItem('theme-mono') === 'true');

  useEffect(() => {
    if (isMono) {
      document.body.classList.add('theme-bw');
    } else {
      document.body.classList.remove('theme-bw');
    }
    localStorage.setItem('theme-mono', isMono);
  }, [isMono]);

  const toggleMonoTheme = () => {
    setIsMono(prev => !prev);
  };

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('theme-dark', isDark);
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  const chatEndRef = useRef(null);

  const BACKEND_URL = 'http://localhost:8000';

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/history/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const loadSessionMessages = async (id) => {
    setLoadingAnswer(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/history/sessions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setLoadingAnswer(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchSessions();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingAnswer]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setUploading(true);

    const formData = new FormData();
    files.forEach(f => {
      formData.append('files', f);
    });

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      await response.json();
      await fetchDocuments();
      if (files.length === 1) {
        setSelectedDocName(files[0].name);
      }
      setFiles([]);
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const startNewChat = () => {
    const newId = Math.random().toString(36).substring(2, 11);
    setChatId(newId);
    setMessages([]);
    setSelectedDocName('all');
    setActivePdf(null);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const selectSession = (session) => {
    setChatId(session.chat_id);
    setSelectedDocName(session.document_name || 'all');
    setActivePdf(null);
    loadSessionMessages(session.chat_id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (e, idToDelete) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/history/sessions/${idToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        if (chatId === idToDelete) {
          startNewChat();
        }
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuery = async (text) => {
    if (!text.trim() || loadingAnswer) return;

    const userMessage = {
      role: 'user',
      text: text
    };

    setMessages(prev => [...prev, userMessage]);
    setQueryText('');
    setLoadingAnswer(true);

    try {
      const url = new URL(`${BACKEND_URL}/api/v1/chat/query`);
      url.searchParams.append('question', userMessage.text);
      url.searchParams.append('chat_id', chatId);

      if (selectedDocName && selectedDocName !== 'all') {
        url.searchParams.append('document_name', selectedDocName);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Query failed');

      const data = await response.json();
      setLoadingAnswer(false);

      const fullAnswer = data.answer;
      const words = fullAnswer.split(" ");
      let currentText = "";
      let wordIdx = 0;

      // Add temporary streaming assistant message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: '',
          sources: [],
          isStreaming: true
        }
      ]);

      const interval = setInterval(() => {
        if (wordIdx < words.length) {
          currentText += (wordIdx === 0 ? "" : " ") + words[wordIdx];
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.text = currentText;
            }
            return updated;
          });
          wordIdx++;
        } else {
          clearInterval(interval);
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.text = fullAnswer;
              lastMsg.sources = data.sources || [];
              delete lastMsg.isStreaming;
            }
            return updated;
          });
          fetchSessions();
        }
      }, 30);

    } catch (err) {
      console.error(err);
      setLoadingAnswer(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Error processing request. Ensure the backend is running.',
          sources: []
        }
      ]);
    }
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    submitQuery(queryText);
  };

  const handleClearChat = () => {
    startNewChat();
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    let markdown = `# Chat Session History\n\n`;
    messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? 'You' : 'Assistant';
      markdown += `### ${roleName}\n${msg.text}\n\n`;
      if (msg.role === 'assistant' && msg.sources && msg.sources.length > 0) {
        markdown += `**Sources:**\n`;
        const uniqueSources = Array.from(new Set(msg.sources.map(src => `${src.document} (Page ${src.page || 1})`)));
        uniqueSources.forEach((srcStr) => {
          markdown += `- ${srcStr}\n`;
        });
        markdown += `\n`;
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chat_history_${chatId}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDatabase = async () => {
    if (!confirm('Clear chat memory and reset all documents?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/v1/chat/clear`, {
        method: 'POST',
      });
      setMessages([]);
      setFile(null);
      setDocuments([]);
      setSessions([]);
      setSelectedDocName('all');
      startNewChat();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSource = (idx) => {
    setExpandedSources(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const activeDocStats = documents.find(doc => doc.name === selectedDocName);

  const [sampleQuestions, setSampleQuestions] = useState([
    "Summarize the key information in this document.",
    "What are the main findings or topics discussed?",
    "What action items or next steps are mentioned?"
  ]);

  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      try {
        const url = new URL(`${BACKEND_URL}/api/v1/chat/suggested-questions`);
        if (selectedDocName && selectedDocName !== 'all') {
          url.searchParams.append('document_name', selectedDocName);
        }
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setSampleQuestions(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch suggested questions:', err);
      }
    };

    fetchSuggestedQuestions();
  }, [selectedDocName, documents]);

  return (
    <div className={`app-layout ${activePdf ? 'has-pdf-view' : ''}`}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Panel */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span>RaavOne Minds</span>
          <button onClick={startNewChat} className="new-chat-btn" title="Start New Chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} /> New
          </button>
        </div>

        {/* Sidebar Nav Tabs */}
        <div className="sidebar-tabs-nav">
          <button
            onClick={() => setSidebarTab('chats')}
            className={`sidebar-tab-pill ${sidebarTab === 'chats' ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MessageSquare size={13} /> Chats ({sessions.length})
          </button>
          <button
            onClick={() => setSidebarTab('docs')}
            className={`sidebar-tab-pill ${sidebarTab === 'docs' ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={13} /> Docs ({textDocuments.length})
          </button>
          <button
            onClick={() => setSidebarTab('images')}
            className={`sidebar-tab-pill ${sidebarTab === 'images' ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ImageIcon size={13} /> Images ({imageDocuments.length})
          </button>
        </div>

        {/* Upload Action Panel */}
        {sidebarTab !== 'chats' && (
          <div className="sidebar-upload-section" style={{ padding: '12px 14px', borderBottom: 'var(--neo-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sidebarTab === 'docs' && (
              <form onSubmit={handleUpload} className="sidebar-upload-form">
                <input
                  type="file"
                  id="sidebar-doc-upload"
                  accept=".pdf,.docx,.doc,.txt,.md,.csv,.json,.html"
                  multiple
                  onChange={handleFileChange}
                  className="hidden-input"
                />
                <label htmlFor="sidebar-doc-upload" className="upload-label-btn upload-label-doc" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <Upload size={13} />
                  {files.length > 0
                    ? (files.length === 1 ? (files[0].name.length > 18 ? `${files[0].name.substring(0, 15)}...` : files[0].name) : `${files.length} Docs Selected`)
                    : 'Upload Documents'}
                </label>
                {files.length > 0 && (
                  <button type="submit" className="sidebar-upload-btn" style={{ padding: '8px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <Upload size={12} /> {uploading ? 'Uploading...' : 'Confirm Docs Upload'}
                  </button>
                )}
              </form>
            )}

            {sidebarTab === 'images' && (
              <form onSubmit={handleImgUpload} className="sidebar-upload-form">
                <input
                  type="file"
                  id="sidebar-img-upload"
                  accept=".png,.jpg,.jpeg,.webp,.bmp"
                  multiple
                  onChange={handleImgChange}
                  className="hidden-input"
                />
                <label htmlFor="sidebar-img-upload" className="upload-label-btn upload-label-img" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <Upload size={13} />
                  {imgFiles.length > 0
                    ? (imgFiles.length === 1 ? (imgFiles[0].name.length > 18 ? `${imgFiles[0].name.substring(0, 15)}...` : imgFiles[0].name) : `${imgFiles.length} Images Selected`)
                    : 'Upload Images'}
                </label>
                {imgFiles.length > 0 && (
                  <button type="submit" className="sidebar-upload-btn" style={{ backgroundColor: 'var(--accent-purple)', padding: '8px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <Upload size={12} /> {uploadingImg ? 'Uploading...' : 'Confirm Images Upload'}
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* Sidebar Main Content List */}
        <div className="sidebar-list">
          {sidebarTab === 'chats' && (
            sessions.length === 0 ? (
              <div className="sidebar-empty">No past chats</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.chat_id}
                  onClick={() => selectSession(sess)}
                  className={`sidebar-item ${chatId === sess.chat_id ? 'active' : ''}`}
                >
                  <span className="sidebar-item-title" title={sess.title} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={13} /> {sess.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(e, sess.chat_id)}
                    className="sidebar-delete-btn"
                    title="Delete Chat"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )
          )}

          {sidebarTab === 'docs' && (
            textDocuments.length === 0 ? (
              <div className="sidebar-empty">No text documents uploaded</div>
            ) : (
              textDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDocName(doc.name);
                    setActivePdf({ document: doc.name, page: 1 });
                  }}
                  className={`doc-item-card ${selectedDocName === doc.name ? 'active' : ''}`}
                >
                  <div className="doc-item-header">
                    <span className="doc-item-name" title={doc.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} /> {doc.name}
                    </span>
                    <span className="doc-item-badge">{doc.pages}p</span>
                  </div>
                  <span style={{ fontSize: '10.5px', opacity: 0.65, fontWeight: 600 }}>
                    {doc.chunks} vectors indexed
                  </span>
                </div>
              ))
            )
          )}

          {sidebarTab === 'images' && (
            imageDocuments.length === 0 ? (
              <div className="sidebar-empty">No image documents uploaded</div>
            ) : (
              <div className="image-gallery-grid">
                {imageDocuments.map((imgDoc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDocName(imgDoc.name);
                      setActivePdf({ document: imgDoc.name, page: 1 });
                    }}
                    className={`image-gallery-card ${selectedDocName === imgDoc.name ? 'active' : ''}`}
                    title={`Click to view & query ${imgDoc.name}`}
                  >
                    <div className="image-thumb-wrapper">
                      <img
                        src={`${BACKEND_URL}/api/v1/documents/${encodeURIComponent(imgDoc.name)}`}
                        alt={imgDoc.name}
                        className="image-thumb-img"
                      />
                    </div>
                    <span className="image-card-title">
                      {imgDoc.name}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
        <div className="sidebar-footer">
          {documents.length > 0 && (
            <button onClick={handleResetDatabase} className="reset-db-btn">
              Reset System Context
            </button>
          )}
        </div>
      </aside>

      {/* Main chat window container */}
      <div className="main-content">
        {/* Top Header */}
        <header className="header">
          <div className="header-left">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mobile-menu-toggle"
              aria-label="Toggle Menu"
            >
              ☰
            </button>
            <span className="brand-title">
              RaavOne Minds
            </span>
            <select
              value={selectedDocName}
              onChange={(e) => setSelectedDocName(e.target.value)}
              className="doc-selector"
            >
              {documents.length === 0 ? (
                <option value="all">No documents uploaded</option>
              ) : (
                <>
                  <option value="all">All Documents ({documents.length})</option>
                  <optgroup label="Documents">
                    {textDocuments.map((doc, idx) => (
                      <option key={`doc-${idx}`} value={doc.name}>
                        {doc.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Images">
                    {imageDocuments.map((doc, idx) => (
                      <option key={`img-${idx}`} value={doc.name}>
                        {doc.name}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
            {selectedDocName !== 'all' && activeDocStats && (
              <span className="doc-stats-label">
                {activeDocStats.pages}p • {activeDocStats.chunks}c
              </span>
            )}

            {/* Header Document Uploader */}
            <form onSubmit={handleUpload} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
              <input
                type="file"
                id="header-doc-upload"
                accept=".pdf,.docx,.doc,.txt,.md,.csv,.json,.html"
                multiple
                onChange={handleFileChange}
                className="hidden-input"
              />
              <label htmlFor="header-doc-upload" className="text-button" style={{ margin: 0, padding: '4px 8px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Upload size={12} /> {files.length > 0 ? files.length : '+ Doc'}
              </label>
              {files.length > 0 && (
                <button type="submit" className="text-button" style={{ backgroundColor: 'var(--accent-green)', color: '#000', margin: 0, padding: '4px 8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Upload size={12} /> {uploading ? '...' : 'Upload'}
                </button>
              )}
            </form>

            {/* Header Image Uploader */}
            <form onSubmit={handleImgUpload} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="file"
                id="header-img-upload"
                accept=".png,.jpg,.jpeg,.webp,.bmp"
                multiple
                onChange={handleImgChange}
                className="hidden-input"
              />
              <label htmlFor="header-img-upload" className="text-button" style={{ margin: 0, padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Upload size={12} /> {imgFiles.length > 0 ? imgFiles.length : '+ Img'}
              </label>
              {imgFiles.length > 0 && (
                <button type="submit" className="text-button" style={{ backgroundColor: 'var(--accent-purple)', color: '#fff', margin: 0, padding: '4px 8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Upload size={12} /> {uploadingImg ? '...' : 'Upload'}
                </button>
              )}
            </form>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {messages.length > 0 && (
              <button onClick={handleExportChat} className="text-button theme-toggle-btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Download size={13} /> Export
              </button>
            )}
            <button onClick={toggleDarkMode} className="text-button theme-toggle-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />} {isDark ? 'Light' : 'Dark'}
            </button>
            {messages.length > 0 && (
              <button onClick={handleClearChat} className="action-link text-button">
                Clear
              </button>
            )}
          </div>
        </header>

        {/* Main chat window */}
        <main className="chat-window">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h1 className="title-large">
                {selectedDocName === 'all'
                  ? 'Ask your documents.'
                  : `Ask ${selectedDocName.replace('.pdf', '')}.`}
              </h1>
              <p className="subtitle">
                {selectedDocName === 'all'
                  ? 'Upload PDFs, Word docs, text files, or images to begin querying.'
                  : `Querying specifically inside "${selectedDocName}".`}
              </p>
              {documents.length > 0 && (
                <div className="samples-grid">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitQuery(q)}
                      className="sample-card"
                    >
                      <span className="sample-text">{q}</span>
                      <span className="sample-arrow">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="meta-label">
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="content">
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer text={msg.text} />
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="sources-container">
                      <div className="sources-simple-list" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontWeight: '900', fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Sources (Click to open)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '4px' }}>
                          {Array.from(
                            new Map(msg.sources.map(src => [`${src.document}-${src.page || 1}`, src])).values()
                          ).map((src, sIdx) => {
                            const isImg = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'].some(ext => src.document.toLowerCase().endsWith(ext));
                            return (
                              <button
                                key={sIdx}
                                onClick={() => setActivePdf({ document: src.document, page: src.page || 1 })}
                                className="source-chip-btn"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {isImg ? <ImageIcon size={12} /> : <FileText size={12} />} {src.document.length > 20 ? `${src.document.substring(0, 17)}...` : src.document} (P. {src.page || 1})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSource(idx)}
                        className="sources-toggle"
                      >
                        {expandedSources[idx] ? 'Hide details' : `View detailed chunks (${msg.sources.length})`}
                      </button>
                      {expandedSources[idx] && (
                        <div className="sources-details">
                          {msg.sources.map((src, sIdx) => {
                            const isImg = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'].some(ext => src.document.toLowerCase().endsWith(ext));
                            return (
                              <div
                                key={sIdx}
                                className="source-block clickable-source"
                                onClick={() => setActivePdf({ document: src.document, page: src.page || 1 })}
                                title="Click to view document side-by-side"
                              >
                                <div className="source-meta">
                                  <span className="source-doc" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    {isImg ? <ImageIcon size={12} /> : <FileText size={12} />} {src.document}
                                  </span>
                                  {src.page && <span className="source-page">Page: {src.page}</span>}
                                  <span className="source-score">Hybrid: {src.score?.toFixed(3) ?? ''}</span>
                                  <span className="source-score">Semantic: {src.semantic_score?.toFixed(3) ?? '0.000'}</span>
                                  <span className="source-score">Keyword: {src.keyword_score?.toFixed(3) ?? '0.000'}</span>
                                </div>
                                <p className="source-body">"{src.text}"</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {loadingAnswer && (
                <div className="message assistant processing">
                  <div className="meta-label">Assistant</div>
                  <div className="content loading-text">thinking...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </main>

        {/* Query Bar */}
        <footer className="footer">
          <form onSubmit={handleQuerySubmit} className="input-container">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                selectedDocName === 'all'
                  ? "Ask a question across all documents..."
                  : `Ask a question about ${selectedDocName}...`
              }
              disabled={loadingAnswer}
              className="minimal-input"
            />
            <button
              type="submit"
              className={`send-arrow-circle ${!queryText.trim() || loadingAnswer ? 'hidden' : ''}`}
            >
              ↑
            </button>
          </form>
        </footer>
      </div>

      {/* Document / Image Viewer Side Panel */}
      {activePdf && (
        <aside className="pdf-viewer-panel">
          <div className="pdf-viewer-header">
            <span className="pdf-viewer-title">
              {['.png', '.jpg', '.jpeg', '.webp', '.bmp'].some(ext => activePdf.document.toLowerCase().endsWith(ext)) ? '🖼️' : '📄'} {activePdf.document.length > 25 ? `${activePdf.document.substring(0, 22)}...` : activePdf.document} (P. {activePdf.page})
            </span>
            <button onClick={() => setActivePdf(null)} className="pdf-viewer-close-btn" title="Close Panel">
              ×
            </button>
          </div>
          <div className="pdf-viewer-body">
            {['.png', '.jpg', '.jpeg', '.webp', '.bmp'].some(ext => activePdf.document.toLowerCase().endsWith(ext)) ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', gap: '12px' }}>
                <img
                  src={`${BACKEND_URL}/api/v1/documents/${encodeURIComponent(activePdf.document)}`}
                  alt={activePdf.document}
                  style={{ maxWidth: '100%', maxHeight: '85%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                />
                <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 600 }}>{activePdf.document}</span>
              </div>
            ) : (
              <iframe
                src={`${BACKEND_URL}/api/v1/documents/${encodeURIComponent(activePdf.document)}#page=${activePdf.page}`}
                className="pdf-iframe"
                title="Document Viewer"
              />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
