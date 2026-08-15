import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadChatAsPDF } from "./pdfExport";
import SplitText from './components/reactbits/SplitText';
import RotatingText from './components/reactbits/RotatingText';
import GradientText from './components/reactbits/GradientText';
import SpotlightCard from './components/reactbits/SpotlightCard';
import DecryptedText from './components/reactbits/DecryptedText';

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
          <h1 className="greeting-text">
            <SplitText
              text="How can I help you"
              className="greeting-split"
              delay={50}
              animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
              animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
              threshold={0.1}
              rootMargin="0px"
            />
            {' '}
            <GradientText
              colors={['#4285F4', '#c678dd', '#4285F4', '#c678dd']}
              animationSpeed={4}
              className="greeting-gradient-word"
            >
              <RotatingText
                texts={['study', 'learn', 'practice', 'master']}
                rotationInterval={2500}
                staggerDuration={0.03}
                staggerFrom="first"
                mainClassName="greeting-rotating"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            </GradientText>
            {' '}
            <SplitText
              text="today?"
              className="greeting-split"
              delay={50}
              animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
              animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
              threshold={0.1}
              rootMargin="0px"
            />
          </h1>

          <div className="suggestion-grid">
            <SpotlightCard className="suggestion-card" spotlightColor="rgba(66, 133, 244, 0.15)">
              <div onClick={() => onSuggestionClick("Summarize my notes: ")} style={{cursor: 'pointer'}}>
                <h3>📑 Summarize Notes</h3>
                <p>Turn long chapters into brief, effective study points.</p>
              </div>
            </SpotlightCard>
            <SpotlightCard className="suggestion-card" spotlightColor="rgba(198, 120, 221, 0.15)">
              <div onClick={() => onSuggestionClick("Explain a complex science concept simply.")} style={{cursor: 'pointer'}}>
                <h3>🧪 Explain Science</h3>
                <p>Break down complex formulas and concepts simply.</p>
              </div>
            </SpotlightCard>
            <SpotlightCard className="suggestion-card" spotlightColor="rgba(66, 133, 244, 0.15)">
              <div onClick={() => onSuggestionClick("Generate a practice quiz to test my knowledge.")} style={{cursor: 'pointer'}}>
                <h3>🧠 Practice Quiz</h3>
                <p>Generate questions to test your knowledge.</p>
              </div>
            </SpotlightCard>
            <SpotlightCard className="suggestion-card" spotlightColor="rgba(198, 120, 221, 0.15)">
              <div onClick={() => onSuggestionClick("Can you provide tips on how to improve my academic writing?")} style={{cursor: 'pointer'}}>
                <h3>✍️ Essay Feedback</h3>
                <p>Get tips on how to improve your academic writing.</p>
              </div>
            </SpotlightCard>
          </div>

          <div className="model-tips-banner">
            <div className="model-tip">
              <span className="tip-icon">⚡</span>
              <span>Gemini runs on premium credits — use it thoughtfully for the best results.</span>
            </div>
            <div className="model-tip">
              <span className="tip-icon">🚀</span>
              <span>Switch to Groq or Mistral for in-depth explanations, deep learning, and complex coding tasks.</span>
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
                  <span className="bot-name">
                    <DecryptedText
                      text="CONVOBOT"
                      speed={60}
                      maxIterations={15}
                      sequential={true}
                      revealDirection="start"
                      animateOn="view"
                      className="bot-name-revealed"
                      encryptedClassName="bot-name-encrypted"
                    />
                  </span>
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

