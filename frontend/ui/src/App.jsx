import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
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
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const selectSession = (session) => {
    setChatId(session.chat_id);
    setSelectedDocName(session.document_name || 'all');
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
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          sources: data.sources || []
        }
      ]);
      
      fetchSessions();
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Error processing request. Ensure the backend is running.',
          sources: []
        }
      ]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    submitQuery(queryText);
  };

  const handleClearChat = () => {
    setMessages([]);
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
    <div className="app-layout">
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
                      {doc.name.length > 15 ? `${doc.name.substring(0, 12)}...` : doc.name}
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
                    {msg.text}
                  </div>
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="sources-container">
                      <button 
                        onClick={() => toggleSource(idx)} 
                        className="sources-toggle"
                      >
                        {expandedSources[idx] ? 'Hide sources' : `${msg.sources.length} sources`}
                      </button>
                      {expandedSources[idx] && (
                        <div className="sources-details">
                          {msg.sources.map((src, sIdx) => (
                            <div key={sIdx} className="source-block">
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
    </div>
  );
}

export default App;
