import React from 'react';
import { auth, loginWithGoogle, logout } from '../utils/firebase';
// import { useAuthState } from 'react-firebase-hooks/auth'; // Not installed, using native SDk

export const Auth = ({ onLogin, onLogout }) => {
    // Basic implementation using standard Firebase listeners
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        let mounted = true;
        const unsubscribe = auth.onAuthStateChanged((u) => {
            if (mounted) {
                // Only trigger login/logout if the state actually changes from our perspective
                setUser(prevUser => {
                    if (prevUser?.uid !== u?.uid) {
                        if (u) onLogin(u);
                        else onLogout();
                    }
                    return u;
                });
            }
        });
        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [onLogin, onLogout]);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="auth-section no-print">
            {user ? (
                <div className="user-profile">
                    <img src={user.photoURL} alt={user.displayName} className="avatar" />
                    <span className="user-name">{user.displayName}</span>
                    <button onClick={logout} className="btn btn-neutral btn-sm">Salir</button>
                </div>
            ) : (
                <button onClick={handleGoogleLogin} className="btn btn-secondary">
                    <span>🔑</span> Entrar con Google
                </button>
            )}

            <style jsx>{`
                .auth-section {
                    display: flex;
                    justify-content: flex-end;
                    padding: 1rem;
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255, 255, 255, 0.6);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                }
                .user-name {
                    font-size: 0.9rem;
                    color: var(--text-main);
                    font-weight: 600;
                }
                .btn-sm {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                }
            `}</style>
        </div>
    );
};
