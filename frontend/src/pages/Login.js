import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseClient';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Check if email is verified
            if (!userCredential.user.emailVerified) {
                setError('Please verify your email address before logging in.');
                await auth.signOut();
            } else {
                navigate('/chat');
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/chat');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message);
            }
        }
        setLoading(false);
    };

    return (
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="suggestion-card" style={{ maxWidth: '400px', width: '100%', margin: '0 1rem', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/convobot_logo_final.png" alt="ConvoBot" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#ececec', fontSize: '1.5rem', fontWeight: '600' }}>Welcome Back</h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Sign in to continue to ConvoBot</p>
                </div>

                {error && <div className="error-bubble" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#ececec', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="gpt-input"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px' }}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#ececec', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="gpt-input"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '0.85rem',
                            background: '#ececec',
                            color: '#0f172a',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            border: 'none',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                    <span style={{ padding: '0 1rem', color: '#666', fontSize: '0.85rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.85rem',
                        background: 'transparent',
                        color: '#ececec',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        border: '1px solid #444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#aaa', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: '#ececec', textDecoration: 'underline' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
