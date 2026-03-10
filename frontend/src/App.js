import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from "axios";
import html2pdf from "html2pdf.js";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
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
      setChatSessions((prev) => {
        const sessionHistory = [...(prev[currentSession] || [])];
        if (sessionHistory.length > 0) {
          sessionHistory[sessionHistory.length - 1].bot = "ConvoBot is offline or busy. Please ensure the backend server is running.";
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
      />

      <main className="main-content">
        {/* Logo Header */}
        <header className="logo-header">
          <div className="flex-row gap-2" style={{ display: 'flex', alignItems: 'baseline', flex: 1 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ececec', letterSpacing: '0.5px' }}>ConvoBot</span>
            <span className="text-sub font-medium" style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '0.5rem' }}>v1.0.1</span>
          </div>
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
              Made with ❤️ by team podmAAn
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
