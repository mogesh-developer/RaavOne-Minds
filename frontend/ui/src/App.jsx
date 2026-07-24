import { useState, useRef, useEffect } from 'react';
import './App.css';
import MarkdownRenderer from './MarkdownRenderer';

function App() {
  const [activePdf, setActivePdf] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [documents, setDocuments] = useState([]); // Array of { name, chunks, pages }
  const [selectedDocName, setSelectedDocName] = useState('all');

  const [sessions, setSessions] = useState([]); // Array of { chat_id, title, document_name }
  const [chatId, setChatId] = useState(() => Math.random().toString(36).substring(2, 11));
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

  const [queryText, setQueryText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      await response.json();
      await fetchDocuments();
      setSelectedDocName(file.name);
      setFile(null);
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

  const sampleQuestions = [
    "What projects did he do during internship?",
    "Summarize his core accomplishments.",
    "What AI agents or platforms did he build?"
  ];

  return (
    <div className={`app-layout ${activePdf ? 'has-pdf-view' : ''}`}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Panel */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span>Conversations</span>
          <button onClick={startNewChat} className="new-chat-btn" title="Start New Chat">
            ＋
          </button>
        </div>

        {/* PDF Uploader in Sidebar */}
        <div className="sidebar-upload-section">
          <form onSubmit={handleUpload} className="sidebar-upload-form">
            <input
              type="file"
              id="sidebar-file-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden-input"
            />
            <label htmlFor="sidebar-file-upload" className="sidebar-upload-label">
              {file ? (file.name.length > 20 ? `${file.name.substring(0, 17)}...` : file.name) : '＋ Add Document'}
            </label>
            {file && (
              <button type="submit" className="sidebar-upload-btn">
                {uploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            )}
          </form>
        </div>

        <div className="sidebar-list">
          {sessions.length === 0 ? (
            <div className="sidebar-empty">No past chats</div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.chat_id}
                onClick={() => selectSession(sess)}
                className={`sidebar-item ${chatId === sess.chat_id ? 'active' : ''}`}
              >
                <span className="sidebar-item-title" title={sess.title}>
                  {sess.title}
                </span>
                <button
                  onClick={(e) => handleDeleteSession(e, sess.chat_id)}
                  className="sidebar-delete-btn"
                  title="Delete Chat"
                >
                  ×
                </button>
              </div>
            ))
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
            <span className="brand-title">RaavOne Minds</span>
            <select
              value={selectedDocName}
              onChange={(e) => setSelectedDocName(e.target.value)}
              className="doc-selector"
            >
              {documents.length === 0 ? (
                <option value="all">No documents uploaded</option>
              ) : (
                <>
                  <option value="all">All Documents</option>
                  {documents.map((doc, idx) => (
                    <option key={idx} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {selectedDocName !== 'all' && activeDocStats && (
              <span className="doc-stats-label">
                {activeDocStats.pages}p • {activeDocStats.chunks}c
              </span>
            )}

            {/* Quick Header Uploader */}
            <form onSubmit={handleUpload} className="header-upload-form" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
              <input
                type="file"
                id="header-file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden-input"
              />
              <label htmlFor="header-file-upload" className="text-button header-upload-label" style={{ margin: 0, padding: '6px 12px', fontWeight: 800 }}>
                {file ? (file.name.length > 15 ? `${file.name.substring(0, 12)}...` : file.name) : '＋ Add PDF'}
              </label>
              {file && (
                <button type="submit" className="text-button header-upload-btn" style={{ backgroundColor: 'var(--accent-green)', color: '#000', margin: 0, padding: '6px 12px', fontWeight: 800 }}>
                  {uploading ? '...' : 'Upload'}
                </button>
              )}
            </form>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {messages.length > 0 && (
              <button onClick={handleExportChat} className="text-button theme-toggle-btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 700 }}>
                📥 Export
              </button>
            )}
            <button onClick={toggleDarkMode} className="text-button theme-toggle-btn">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button onClick={toggleMonoTheme} className="text-button theme-toggle-btn">
              {isMono ? '🎨 Color Mode' : '🏁 B&W Mode'}
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
                  ? 'Upload PDFs to begin querying their contents collectively.'
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
                          📚 Sources (Click to open)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '4px' }}>
                          {Array.from(
                            new Map(msg.sources.map(src => [`${src.document}-${src.page || 1}`, src])).values()
                          ).map((src, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setActivePdf({ document: src.document, page: src.page || 1 })}
                              className="source-chip-btn"
                            >
                              📄 {src.document.length > 20 ? `${src.document.substring(0, 17)}...` : src.document} (P. {src.page || 1})
                            </button>
                          ))}
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
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="source-block clickable-source"
                              onClick={() => setActivePdf({ document: src.document, page: src.page || 1 })}
                              title="Click to view PDF page side-by-side"
                            >
                              <div className="source-meta">
                                <span className="source-doc">📄 {src.document}</span>
                                {src.page && <span className="source-page">Page: {src.page}</span>}
                                <span className="source-score">Similarity: {src.score?.toFixed(3) ?? ''}</span>
                              </div>
                              <p className="source-body">"{src.text}"</p>
                            </div>
                          ))}
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

      {/* PDF Viewer Side Panel */}
      {activePdf && (
        <aside className="pdf-viewer-panel">
          <div className="pdf-viewer-header">
            <span className="pdf-viewer-title">
              📄 {activePdf.document.length > 25 ? `${activePdf.document.substring(0, 22)}...` : activePdf.document} (P. {activePdf.page})
            </span>
            <button onClick={() => setActivePdf(null)} className="pdf-viewer-close-btn" title="Close Panel">
              ×
            </button>
          </div>
          <div className="pdf-viewer-body">
            <iframe
              src={`${BACKEND_URL}/api/v1/documents/${encodeURIComponent(activePdf.document)}#page=${activePdf.page}`}
              className="pdf-iframe"
              title="PDF Viewer"
            />
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
