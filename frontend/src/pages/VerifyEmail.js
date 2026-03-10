import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseClient';
import { signOut } from 'firebase/auth';

function VerifyEmail() {
    const navigate = useNavigate();
    return (
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="suggestion-card" style={{ maxWidth: '400px', width: '100%', margin: '0 1rem', padding: '2.5rem 2rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ececec" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>

                <h2 style={{ color: '#ececec', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Check your email</h2>
                <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    We sent a verification link to your email address. Please click the link inside to verify your account and start chatting.
                </p>

                <button
                    onClick={async () => {
                        try {
                            await signOut(auth);
                        } catch (e) {
                            console.error(e);
                        }
                        navigate('/login');
                    }}
                    style={{ display: 'block', width: '100%', padding: '0.85rem', background: '#2f2f2f', color: '#ececec', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.target.style.background = '#3f3f3f'}
                    onMouseOut={(e) => e.target.style.background = '#2f2f2f'}
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
}

export default VerifyEmail;
