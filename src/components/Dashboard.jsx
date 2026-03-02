import React from 'react';

export const Dashboard = ({ stats }) => {
    const { lifetime, currentStreak, daily } = stats;

    return (
        <div className="dashboard-container no-print">
            <div className="stat-card">
                <div className="stat-value">{lifetime.solved}</div>
                <div className="stat-label">Total Resueltos</div>
            </div>

            <div className="stat-card highlight">
                <div className="stat-value">{currentStreak} 🔥</div>
                <div className="stat-label">Racha Actual</div>
            </div>

            <div className="stat-card">
                <div className="stat-value">{Math.round((lifetime.correct / (lifetime.solved || 1)) * 100)}%</div>
                <div className="stat-label">Precisión</div>
            </div>

            <div className="stat-card">
                <div className="stat-value">{daily.count}</div>
                <div className="stat-label">Hoy</div>
            </div>

            <style jsx>{`
                .dashboard-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1.5rem;
                    margin: 2rem 0;
                    width: 100%;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    padding: 1.5rem;
                    border-radius: 20px;
                    text-align: center;
                    transition: transform 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.8);
                }
                .stat-card.highlight {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    color: var(--primary);
                    /* text-shadow removed for clarity */
                }
                .stat-label {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};
