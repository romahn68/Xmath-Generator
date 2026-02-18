import React, { useState, useEffect } from 'react';

export const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer-display">
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatTime(timeLeft)}</span>

            <style jsx>{`
                .timer-display {
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid #ef4444;
                    padding: 0.8rem 1.5rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 800;
                    color: #dc2626;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
                    animation: pulse 1s infinite alternate;
                }
                .timer-value {
                    font-size: 1.5rem;
                }
                @keyframes pulse {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};
