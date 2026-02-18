import React from 'react';

export const HistoryModal = ({ challenges, onClose, onClear, userName }) => {
    return (
        <div className="history-modal no-print">
            <div className="history-content">
                <div className="history-header">
                    <h2>🏆 Historial de {userName || 'Usuario'}</h2>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>

                <div className="history-list">
                    {challenges && challenges.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Puntos</th>
                                    <th>Modo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {challenges.map((challenge, index) => (
                                    <tr key={index}>
                                        <td>{new Date(challenge.date).toLocaleDateString()} {new Date(challenge.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="score-cell">{challenge.score}</td>
                                        <td className="mode-cell">
                                            {challenge.config?.operation === 'mix' ? '⚡ Mix' :
                                                challenge.config?.operation === 'add' ? '➕ Suma' :
                                                    challenge.config?.operation === 'sub' ? '➖ Resta' :
                                                        challenge.config?.operation === 'mul' ? '✖️ Multi' :
                                                            challenge.config?.operation === 'div' ? '➗ Div' : 'Math'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <p>Aún no hay registros de Time Trial.</p>
                            <p>¡Completa un desafío para aparecer aquí!</p>
                        </div>
                    )}
                </div>

                <div className="history-footer">
                    <button onClick={onClear} className="btn btn-danger-outline">
                        🗑️ Borrar Historial
                    </button>
                    <button onClick={onClose} className="btn btn-primary">
                        Cerrar
                    </button>
                </div>
            </div>

            <style jsx>{`
                .history-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .history-content {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    max-height: 80vh;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                    animation: slideUp 0.3s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .history-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }
                .history-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #1e293b;
                }
                .btn-close {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: #94a3b8;
                    cursor: pointer;
                    line-height: 1;
                }
                .history-list {
                    padding: 0;
                    overflow-y: auto;
                    flex-grow: 1;
                }
                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .history-table th {
                    background: #f1f5f9;
                    text-align: left;
                    padding: 1rem;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    color: #64748b;
                    position: sticky;
                    top: 0;
                }
                .history-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    font-size: 0.95rem;
                }
                .score-cell {
                    font-weight: 800;
                    color: #6366f1 !important;
                    font-size: 1.1rem !important;
                }
                .mode-cell {
                    font-size: 0.85rem !important;
                    color: #64748b;
                }
                .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                }
                .history-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    background: #fff;
                }
                .btn-danger-outline {
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-danger-outline:hover {
                    background: #fef2f2;
                }
            `}</style>
        </div>
    );
};
