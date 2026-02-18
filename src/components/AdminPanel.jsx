import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';

export const AdminPanel = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch users
        const fetchUsers = async () => {
            const q = query(collection(db, "users"), limit(50));
            const querySnapshot = await getDocs(q);
            const usersList = [];
            querySnapshot.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersList);
        };

        // Stream logs
        const qLogs = query(collection(db, "access_logs"), orderBy("timestamp", "desc"), limit(20));
        const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
            const logsList = [];
            snapshot.forEach((doc) => {
                logsList.push({ id: doc.id, ...doc.data() });
            });
            setLogs(logsList);
            setLoading(false);
        });

        fetchUsers();
        return () => unsubscribeLogs();
    }, []);

    return (
        <div className="admin-modal no-print">
            <div className="admin-content">
                <div className="admin-header">
                    <h2>Panel de Administración 🔐</h2>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>

                {loading ? (
                    <div className="loading">Cargando datos...</div>
                ) : (
                    <div className="admin-grid">
                        <section className="admin-section">
                            <h3>Usuarios Registrados</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Ejercicios</th>
                                            <th>Racha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td className="user-td">
                                                    <img src={u.photoURL} alt="" className="mini-avatar" />
                                                    {u.displayName}
                                                </td>
                                                <td>{u.email}</td>
                                                <td>{u.stats?.lifetime?.solved || 0}</td>
                                                <td>{u.stats?.lifetime?.bestStreak || 0} 🔥</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="admin-section">
                            <h3>Accesos Recientes</h3>
                            <div className="log-list">
                                {logs.map(l => (
                                    <div key={l.id} className="log-item">
                                        <span className="log-time">{l.timestamp?.toDate().toLocaleString()}</span>
                                        <span className="log-msg"><strong>{l.email}</strong> inició sesión</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            <style jsx>{`
                .admin-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 2rem;
                }
                .admin-content {
                    background: #1e1e1e;
                    width: 100%;
                    max-width: 1000px;
                    max-height: 80vh;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .admin-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-header h2 { margin: 0; color: #fff; }
                .btn-close {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                }
                .admin-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2rem;
                    padding: 2rem;
                    overflow-y: auto;
                }
                .admin-section h3 { margin-top: 0; color: #a855f7; }
                .table-wrapper {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    overflow: hidden;
                }
                table { width: 100%; border-collapse: collapse; color: #ccc; }
                th, td { padding: 1rem; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
                th { background: rgba(255, 255, 255, 0.1); font-size: 0.8rem; text-transform: uppercase; }
                .user-td { display: flex; align-items: center; gap: 0.5rem; }
                .mini-avatar { width: 24px; height: 24px; border-radius: 50%; }
                .log-list { display: flex; flex-direction: column; gap: 1rem; }
                .log-item {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.8rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                }
                .log-time { color: #6366f1; display: block; margin-bottom: 0.2rem; }
            `}</style>
        </div>
    );
};
