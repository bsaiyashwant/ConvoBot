import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadChatAsPDF } from "./pdfExport";

function ChatPanel({ messages, isTyping, onSuggestionClick, chatTitle }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleDownloadSingle = (msg) => {
    downloadChatAsPDF([msg], chatTitle || "ConvoBot Chat");
  };

  const handleDownloadAll = () => {
    const validMessages = messages.filter(m => m.bot && m.bot !== "...");
    downloadChatAsPDF(validMessages, chatTitle || "ConvoBot Chat");
  };

  return (
    <div className="chat-history-container">
      {messages.length === 0 ? (
        <div className="greeting-container animate-in">
          <img src="/convobot_logo_final.png" alt="ConvoBot" className="greeting-logo" />
          <h1 className="greeting-text">How can I help you study today?</h1>

          <div className="suggestion-grid">
            <div className="suggestion-card" onClick={() => onSuggestionClick("Summarize my notes: ")}>
              <h3>📑 Summarize Notes</h3>
              <p>Turn long chapters into brief, effective study points.</p>
            </div>
            <div className="suggestion-card" onClick={() => onSuggestionClick("Explain a complex science concept simply.")}>
              <h3>🧪 Explain Science</h3>
              <p>Break down complex formulas and concepts simply.</p>
            </div>
            <div className="suggestion-card" onClick={() => onSuggestionClick("Generate a practice quiz to test my knowledge.")}>
              <h3>🧠 Practice Quiz</h3>
              <p>Generate questions to test your knowledge.</p>
            </div>
            <div className="suggestion-card" onClick={() => onSuggestionClick("Can you provide tips on how to improve my academic writing?")}>
              <h3>✍️ Essay Feedback</h3>
              <p>Get tips on how to improve your academic writing.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <div key={i} className="message-wrapper animate-in">
              {/* User Message */}
              <div className="user-message">
                {msg.user}
              </div>

              {/* Bot Message */}
              <div className="bot-message" style={{ marginTop: '2rem' }}>
                <div className="bot-card">
                  <div className="bot-avatar-wrapper">
                  <div className="bot-avatar-circle">
                    <img src="/bot_response_logo.png" alt="" className="bot-avatar-img" />
                  </div>
                  <span className="bot-name">ConvoBot</span>
                </div>

                <div className="bot-content markdown-body">
                  {msg.bot === "..." ? (
                    <div style={{ display: 'flex', gap: '6px', padding: '0.5rem 0' }}>
                      <div className="typing-dot"></div>
                      <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                      <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : msg.bot.includes("Sorry, I encountered an error") || msg.bot.includes("offline or busy") || msg.bot.includes("Error:") ? (
                    <div className="error-bubble">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>{msg.bot}</span>
                    </div>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.bot}
                    </ReactMarkdown>
                  )}
                </div>

                {msg.bot !== "..." && !msg.bot.includes("error") && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
                    <button className="icon-btn">👍</button>
                    <button className="icon-btn">👎</button>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        navigator.clipboard.writeText(msg.bot);
                        const btn = e.target;
                        btn.innerText = 'Copied!';
                        setTimeout(() => btn.innerText = 'Copy', 2000);
                      }}
                      style={{ fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', width: '56px' }}>Copy</button>
                    <button
                      className="icon-btn pdf-single-btn"
                      onClick={() => handleDownloadSingle(msg)}
                      title="Download this response as PDF"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <polyline points="9 15 12 18 15 15"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
                  </div>
                </div>
              </div>
          ))}
        </>
      )}
      <div ref={scrollRef} style={{ height: '4rem' }} />
    </div>
  );
}

export default ChatPanel;

