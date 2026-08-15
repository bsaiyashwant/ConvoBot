import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseClient';
import { signInWithEmailAndPassword, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import ClickSpark from '../components/reactbits/ClickSpark';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShowResend(false);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Check if email is verified
            if (!userCredential.user.emailVerified) {
                setError('Please verify your email address before logging in. Check your inbox (and spam folder).');
                setShowResend(true);
                await auth.signOut();
            } else {
                navigate('/chat');
            }
        } catch (err) {
            console.error('Login error:', err.code, err.message);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please wait a moment and try again.');
            } else {
                setError(err.message);
            }
        }
        setLoading(false);
    };

    const handleResendVerification = async () => {
        setLoading(true);
        setError('');
        try {
            // Sign in temporarily to get the user object
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            await auth.signOut();
            setError('Verification email sent! Check your inbox (and spam folder).');
            setShowResend(false);
        } catch (err) {
            console.error('Resend error:', err.code, err.message);
            if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please wait a few minutes before trying again.');
            } else {
                setError('Failed to resend: ' + err.message);
            }
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
            <SpotlightCard className="auth-card" spotlightColor="rgba(66, 133, 244, 0.12)">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/convobot_logo_final.png" alt="ConvoBot" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#ececec', fontSize: '1.5rem', fontWeight: '600' }}>
                      <SplitText text="Welcome Back" delay={60} animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }} animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }} threshold={0.1} rootMargin="0px" />
                    </h2>
                    <BlurText text="Sign in to continue to ConvoBot" delay={100} animateBy="words" direction="top" className="auth-blur-subtitle" />
                </div>

                {error && (
                    <div className="error-bubble" style={{ marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                {showResend && (
                    <button onClick={handleResendVerification} disabled={loading} className="auth-btn-resend">
                        📩 Resend Verification Email
                    </button>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <ClickSpark sparkColor="#4285F4" sparkSize={8} sparkRadius={15} sparkCount={6} duration={400}>
                    <button type="submit" disabled={loading} className="auth-btn-primary">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    </ClickSpark>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                    <span style={{ padding: '0 1rem', color: '#666', fontSize: '0.85rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                <button onClick={handleGoogleLogin} disabled={loading} className="auth-btn-google">
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
            </SpotlightCard>
        </div>
    );
}

export default Login;
