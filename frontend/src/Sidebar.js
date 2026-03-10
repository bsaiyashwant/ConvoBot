import React, { useState } from "react";
import { auth } from "./firebaseClient";
import { signOut } from "firebase/auth";

function Sidebar({ chats, currentId, switchSession, onNewChat, user, isMobileOpen, toggleMobileSidebar }) {
  const [showMenu, setShowMenu] = useState(false);

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : "User");
  const avatarText = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'visible' : ''}`}
        onClick={toggleMobileSidebar}
      />

      <div className={`chatgpt-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo & Close Button (Mobile Only) */}
        <div className="logo-sidebar-container" style={{ position: 'relative' }}>
          <img src="/convobot_logo_final.png" alt="ConvoBot" className="sidebar-logo-img" />

          <button
            className="icon-btn close-sidebar-btn"
            onClick={toggleMobileSidebar}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1.5rem',
              display: window.innerWidth <= 768 ? 'flex' : 'none'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="new-chat-container">
          <button onClick={onNewChat} className="new-chat-trigger">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="new-chat-icon-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span style={{ fontSize: '0.875rem' }}>New Chat</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#676767" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>

        {/* Navigation / History */}
        <div className="sidebar-nav">
          <div className="nav-group-title">Chat History</div>

          {Object.keys(chats).length === 0 ? (
            <div style={{ padding: '1rem', fontSize: '0.75rem', color: '#676767', fontStyle: 'italic' }}>
              No recent conversations
            </div>
          ) : (
            Object.keys(chats).map((id) => (
              <button
                key={id}
                onClick={() => {
                  switchSession(id);
                  if (window.innerWidth <= 768) toggleMobileSidebar();
                }}
                className={`chat-history-item ${id === currentId ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chats[id][0]?.user || "New Session"}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer / Profile */}
        <div className="sidebar-footer" style={{ position: 'relative' }}>
          {showMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '0.75rem',
              right: '0.75rem',
              marginBottom: '0.5rem',
              background: '#2f2f2f',
              borderRadius: '8px',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 10
            }}>
              <button
                onClick={() => signOut(auth)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  textAlign: 'left',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          )}

          <button
            className="footer-item"
            onClick={() => setShowMenu(!showMenu)}
            style={{ width: '100%' }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} referrerPolicy="no-referrer" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ab68ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>
                {avatarText}
              </div>
            )}
            <span style={{ fontWeight: 500 }}>{displayName}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
