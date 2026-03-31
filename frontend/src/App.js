import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Team from "./pages/Team";
import { auth } from "./firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { downloadChatAsPDF } from "./pdfExport";

function Chat({ user }) {
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem(`convobot_sessions_${user.uid}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [currentSession, setCurrentSession] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [chatNames, setChatNames] = useState(() => {
    const saved = localStorage.getItem(`convobot_chatnames_${user.uid}`);
    return saved ? JSON.parse(saved) : {};
  });

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  useEffect(() => {
    if (Object.keys(chatSessions).length === 0) {
      const id = uuidv4();
      setCurrentSession(id);
      setChatSessions({ [id]: [] });
    } else if (!currentSession) {
      setCurrentSession(Object.keys(chatSessions)[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      localStorage.setItem(`convobot_sessions_${user.uid}`, JSON.stringify(chatSessions));
    }
  }, [chatSessions, user]);

  useEffect(() => {
    if (user && user.uid) {
      localStorage.setItem(`convobot_chatnames_${user.uid}`, JSON.stringify(chatNames));
    }
  }, [chatNames, user]);

  const switchSession = (id) => {
    setCurrentSession(id);
  };

  const deleteChat = (id) => {
    setChatSessions((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setChatNames((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (currentSession === id) {
      const remaining = Object.keys(chatSessions).filter((k) => k !== id);
      if (remaining.length > 0) {
        setCurrentSession(remaining[0]);
      } else {
        const newId = uuidv4();
        setCurrentSession(newId);
        setChatSessions((prev) => ({ ...prev, [newId]: [] }));
      }
    }
  };

  const renameChat = (id, newName) => {
    setChatNames((prev) => ({ ...prev, [id]: newName }));
  };

  const sendMessage = async (presetMessage) => {
    const textToSend = typeof presetMessage === "string" ? presetMessage : input;
    if (!textToSend.trim() || isTyping) return;

    const userPrompt = textToSend;
    const userMsg = { user: userPrompt, bot: "..." };

    setChatSessions((prev) => ({
      ...prev,
      [currentSession]: [...(prev[currentSession] || []), userMsg],
    }));
    if (typeof presetMessage !== "string") setInput("");
    setIsTyping(true);

    try {
      // Use proxy for local dev, direct for Vercel
      const apiUrl = process.env.NODE_ENV === "production" ? "/api/chat" : "http://127.0.0.1:5000/api/chat";
      const res = await axios.post(apiUrl, {
        prompt: userPrompt,
        session_id: currentSession,
        uid: user.uid,
        model: selectedModel,
      });

      const botReply = res.data.reply || res.data.error || "No response from Gemini.";

      setChatSessions((prev) => {
        const sessionHistory = [...(prev[currentSession] || [])];
        if (sessionHistory.length > 0) {
          sessionHistory[sessionHistory.length - 1].bot = botReply;
        }
        return { ...prev, [currentSession]: sessionHistory };
      });
    } catch (e) {
      console.error("Backend Connection Error:", e);
      let errorMessage = "ConvoBot is offline or busy. ";

      if (e.response) {
        // The server responded with a status code
        errorMessage += `(Server Error ${e.response.status}: ${e.response.data.error || e.message})`;
      } else if (e.request) {
        // The request was made but no response was received
        errorMessage += "(No response from server. Check Vercel logs or internet.)";
      } else {
        // Something else happened
        errorMessage += `(Request Error: ${e.message})`;
      }

      setChatSessions((prev) => {
        const sessionHistory = [...(prev[currentSession] || [])];
        if (sessionHistory.length > 0) {
          sessionHistory[sessionHistory.length - 1].bot = errorMessage;
        }
        return { ...prev, [currentSession]: sessionHistory };
      });
    } finally {
      setIsTyping(false);
    }
  };
  const newChat = () => {
    const id = uuidv4();
    setCurrentSession(id);
    setChatSessions((prev) => ({ ...prev, [id]: [] }));
  };

  return (
    <div className="app-container">
      <Sidebar
        chats={chatSessions}
        chatNames={chatNames}
        currentId={currentSession}
        switchSession={switchSession}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        user={user}
        isMobileOpen={isMobileOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      <main className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={toggleMobileSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <img src="/convobot_logo_final.png" alt="ConvoBot" className="mobile-logo-img" />
          <div style={{ width: '24px' }}></div> {/* Spacer */}
        </div>

        {/* Logo Header (Desktop) */}
        <header className="logo-header">
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ececec', letterSpacing: '0.5px' }}>ConvoBot</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.5, color: '#94a3b8' }}>v2.0</span>
          </div>
          <div className="model-dropdown-wrapper">
            <button className="model-dropdown-trigger" onClick={() => setModelDropdownOpen(!modelDropdownOpen)}>
              {selectedModel === 'gemini' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#4285F4"/></svg>
              )}
              {selectedModel === 'mistral' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="6" height="6" fill="#FF7000"/><rect x="9" y="2" width="6" height="6" fill="#FF7000"/><rect x="16" y="2" width="6" height="6" fill="#FF7000"/><rect x="2" y="9" width="6" height="6" fill="#FF7000"/><rect x="16" y="9" width="6" height="6" fill="#FF7000"/><rect x="2" y="16" width="6" height="6" fill="#FF7000"/><rect x="9" y="16" width="6" height="6" fill="#FF7000"/><rect x="16" y="16" width="6" height="6" fill="#FF7000"/></svg>
              )}
              {selectedModel === 'groq' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#F55036" strokeWidth="2.5" fill="none"/><path d="M12 6v8l4 4" stroke="#F55036" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              <span>{selectedModel === 'gemini' ? 'Gemini' : selectedModel === 'mistral' ? 'Mistral' : 'Groq'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {modelDropdownOpen && (
              <div className="model-dropdown-menu">
                {[
                  {id: 'gemini', name: 'Gemini', desc: 'Google AI', color: '#4285F4', icon: 'sparkle'},
                  {id: 'mistral', name: 'Mistral', desc: 'Mistral AI', color: '#FF7000', icon: 'mistral'},
                  {id: 'groq', name: 'Groq', desc: 'Llama 3.3 70B', color: '#F55036', icon: 'groq'}
                ].map((m) => (
                  <button key={m.id} className={`model-dropdown-item ${selectedModel === m.id ? 'active' : ''}`}
                    onClick={() => { setSelectedModel(m.id); setModelDropdownOpen(false); }}>
                    {m.icon === 'sparkle' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={m.color}/></svg>}
                    {m.icon === 'mistral' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="6" height="6" fill={m.color}/><rect x="9" y="2" width="6" height="6" fill={m.color}/><rect x="16" y="2" width="6" height="6" fill={m.color}/><rect x="2" y="9" width="6" height="6" fill={m.color}/><rect x="16" y="9" width="6" height="6" fill={m.color}/><rect x="2" y="16" width="6" height="6" fill={m.color}/><rect x="9" y="16" width="6" height="6" fill={m.color}/><rect x="16" y="16" width="6" height="6" fill={m.color}/></svg>}
                    {m.icon === 'groq' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={m.color} strokeWidth="2.5" fill="none"/><path d="M12 6v8l4 4" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    <div>
                      <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{m.name}</div>
                      <div style={{fontSize: '0.75rem', color: '#888'}}>{m.desc}</div>
                    </div>
                    {selectedModel === m.id && <span style={{marginLeft: 'auto', color: 'var(--neon-blue)'}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* PDF Download Button */}
          <button
            className="header-pdf-btn"
            onClick={() => {
              const msgs = (chatSessions[currentSession] || []).filter(m => m.bot && m.bot !== "...");
              const title = chatNames[currentSession] || (chatSessions[currentSession]?.[0]?.user) || "ConvoBot Chat";
              if (msgs.length === 0) return;
              downloadChatAsPDF(msgs, title);
            }}
            disabled={!(chatSessions[currentSession] || []).some(m => m.bot && m.bot !== "...")}
            title="Download chat as PDF"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <polyline points="9 15 12 18 15 15"></polyline>
            </svg>
            <span>PDF</span>
          </button>
        </header>

        {/* Chat Window */}
        <div className="chat-window" id="chat-window">
          <ChatPanel
            messages={chatSessions[currentSession] || []}
            isTyping={isTyping}
            onSuggestionClick={sendMessage}
            chatTitle={chatNames[currentSession] || (chatSessions[currentSession]?.[0]?.user) || "ConvoBot Chat"}
          />
        </div>

        {/* Floating Input Area */}
        <div className="input-area-fixed">
          <div className="input-container-gpt">
            <div className="input-pill">
              <img src="/convobot_logo_final.png" alt="" className="input-brand-logo" />
              <input
                type="text"
                className="gpt-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Message ConvoBot..."
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={isTyping || !input.trim()}
                className="gpt-send-btn"
              >
                {isTyping ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem', color: '#676767', letterSpacing: '0.3px' }}>
              Made with ❤️ by team <button onClick={() => window.location.href = '/team'} style={{ background: 'none', border: 'none', color: '#4285f4', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>podmAAn</button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ececec', background: '#0f172a' }}>Loading ConvoBot...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/chat" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/chat" />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/team" element={<Team />} />
        <Route
          path="/chat"
          element={
            user ? (
              user.emailVerified ? <Chat user={user} /> : <Navigate to="/verify-email" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
