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

  const switchSession = (id) => {
    setCurrentSession(id);
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
        currentId={currentSession}
        switchSession={switchSession}
        onNewChat={newChat}
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
          <div className="flex-row gap-2" style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ececec', letterSpacing: '0.5px' }}>ConvoBot</span>
            <span className="text-sub font-medium" style={{ fontSize: '0.8rem', opacity: 0.5 }}>v1.0.5-NEON-LIVE</span>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-selector"
          >
            <option value="gemini">⚡ Gemini</option>
            <option value="grok">🧠 Grok</option>
            <option value="groq">🚀 Groq</option>
          </select>
        </header>

        {/* Chat Window */}
        <div className="chat-window" id="chat-window">
          <ChatPanel
            messages={chatSessions[currentSession] || []}
            isTyping={isTyping}
            onSuggestionClick={sendMessage}
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
