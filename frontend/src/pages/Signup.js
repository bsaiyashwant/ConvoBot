import React, { useState } from 'react';
import { auth, db, googleProvider } from '../firebaseClient';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create the user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update their display name
            await updateProfile(user, { displayName: name });

            // 3. Send Email Verification IMMEDIATELY (before Firestore)
            await sendEmailVerification(user);

            // 4. Try to save profile to Firestore (non-blocking for auth flow)
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: name,
                    email: email,
                    createdAt: new Date().toISOString()
                });
            } catch (firestoreErr) {
                console.warn('Firestore profile save failed (non-critical):', firestoreErr.message);
                // Don't block signup — user is created and verification email is sent
            }

            // 5. Sign them out so they must verify
            await auth.signOut();

            // 6. Redirect to verification page
            navigate('/verify-email');

        } catch (err) {
            console.error('Signup error:', err.code, err.message);
            // Show user-friendly error messages
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Try logging in instead.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError(err.message);
            }
        }

        setLoading(false);
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Save basic profile to Firestore
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    createdAt: user.metadata.creationTime
                }, { merge: true });
            } catch (firestoreErr) {
                console.warn('Firestore profile save failed:', firestoreErr.message);
            }

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
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/convobot_logo_final.png" alt="ConvoBot" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#ececec', fontSize: '1.5rem', fontWeight: '600' }}>Create an Account</h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Join ConvoBot to save your chats</p>
                </div>

                {error && <div className="error-bubble" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="auth-label">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="auth-input"
                            placeholder="John Doe"
                            required
                        />
                    </div>
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
                            minLength={6}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="auth-btn-primary">
                        {loading ? 'Creating Account...' : 'Continue'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                    <span style={{ padding: '0 1rem', color: '#666', fontSize: '0.85rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                <button onClick={handleGoogleSignup} disabled={loading} className="auth-btn-google">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#aaa', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#ececec', textDecoration: 'underline' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
