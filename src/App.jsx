/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { generateExercises } from './utils/mathLogic';
import { ExerciseCard } from './components/ExerciseCard';
import { getStats, recordResult, saveChallengeResult, clearHistory, resetCounters } from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { Timer } from './components/Timer';
import { Auth } from './components/Auth';
import { AdminPanel } from './components/AdminPanel';
import { HistoryModal } from './components/HistoryModal';
import { syncUserStats, logAccess, db } from './utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

function App() {
    const [config, setConfig] = useState({
        operation: 'add',
        digitsTop: 2,
        digitsBottom: 1,
        count: 12,
        timeMinutes: 1
    });

    const [exercises, setExercises] = useState([]);
    const [showAnswers, setShowAnswers] = useState(false);
    const [stats, setStats] = useState(getStats());
    const [isChallenge, setIsChallenge] = useState(false);
    const [challengeFinished, setChallengeFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);

    // Ref to hold stats for callbacks without triggering re-renders
    const statsRef = useRef(stats);
    useEffect(() => {
        statsRef.current = stats;
    }, [stats]);

    // New States
    const [showHistory, setShowHistory] = useState(false);
    const [countdown, setCountdown] = useState(null); // null, 3, 2, 1

    const handleLogin = useCallback(async (currentUser) => {
        setUser(currentUser);
        // Sync stats using ref to avoid dependency loop
        try {
            const currentStats = statsRef.current;
            const syncedStats = await syncUserStats(currentUser, currentStats);
            if (syncedStats) setStats(syncedStats);

            // Log access
            await logAccess(currentUser);

            // Check for admin role
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().role === 'admin') {
                setIsAdmin(true);
            }
        } catch (error) {
            console.error("Error in login flow:", error);
        }
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setIsAdmin(false);
        setShowAdmin(false);
        setStats(getStats()); // Revert to local stats
    }, []);

    const handleResult = (isCorrect) => {
        const newStats = recordResult(isCorrect);
        setStats(newStats);

        // If logged in, update firebase
        if (user) {
            syncUserStats(user, newStats);
        }

        if (isChallenge && isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const handleGenerate = useCallback(() => {
        const newExercises = generateExercises(config.count, {
            digitsTop: config.digitsTop,
            digitsBottom: config.digitsBottom,
            operation: config.operation
        });
        setExercises(newExercises);
        setShowAnswers(false);
    }, [config.count, config.digitsTop, config.digitsBottom, config.operation]);

    const initiateChallenge = () => {
        setCountdown(3);
    };

    const startChallenge = useCallback(() => {
        setIsChallenge(true);
        setChallengeFinished(false);
        setScore(0);
        handleGenerate();
    }, [handleGenerate]);

    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            startChallenge();
            setCountdown(null);
        }
    }, [countdown, startChallenge]);

    const endChallenge = () => {
        setChallengeFinished(true);
        const newStats = saveChallengeResult(score, config);
        setStats(newStats);
        if (user) syncUserStats(user, newStats);
    };

    const resetChallenge = () => {
        setIsChallenge(false);
        setChallengeFinished(false);
        setScore(0);
    };

    const handleClearHistory = () => {
        if (window.confirm('¿Estás seguro de borrar todo tu historial de resultados?')) {
            const newStats = clearHistory();
            setStats(newStats);
            if (user) syncUserStats(user, newStats);
        }
    };

    const handleResetCounters = () => {
        if (window.confirm('¿Estás seguro de reiniciar todos tus contadores (ejercicios y rachas) a cero? Esta acción no se puede deshacer.')) {
            const newStats = resetCounters();
            setStats(newStats);
            if (user) syncUserStats(user, newStats);
        }
    };

    useEffect(() => {
        handleGenerate();
    }, [handleGenerate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'operation' ? value : parseInt(value)
        }));
    };

    const toggleAnswers = () => {
        setShowAnswers(!showAnswers);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="app-container">
            {countdown !== null && (
                <div className="countdown-overlay">
                    <div className="countdown-number">{countdown > 0 ? countdown : '¡YA!'}</div>
                </div>
            )}

            <Auth onLogin={handleLogin} onLogout={handleLogout} />

            {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

            {showHistory && (
                <HistoryModal
                    challenges={stats.challenges}
                    onClose={() => setShowHistory(false)}
                    onClear={handleClearHistory}
                    onResetCounters={handleResetCounters}
                    userName={user?.displayName}
                />
            )}

            <header className="controls-panel no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="header-title">Xmath Gen</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowHistory(true)}>
                            📜 Ver Historial
                        </button>
                        {isAdmin && (
                            <button className="btn btn-neutral" onClick={() => setShowAdmin(true)} style={{ background: '#a855f7', color: '#fff' }}>
                                <span>⚙️</span> Admin
                            </button>
                        )}
                    </div>
                </div>

                <Dashboard stats={stats} />

                <div className="input-group-container">
                    {!isChallenge ? (
                        <>
                            <div className="input-wrapper">
                                <label htmlFor="operation">Tipo de Ejercicio</label>
                                <select
                                    id="operation"
                                    name="operation"
                                    value={config.operation}
                                    onChange={handleChange}
                                >
                                    <optgroup label="Aritmética Básica">
                                        <option value="add">Sumas</option>
                                        <option value="sub">Restas</option>
                                        <option value="mul">Multiplicaciones</option>
                                        <option value="div">Divisiones</option>
                                    </optgroup>
                                    <optgroup label="Álgebra">
                                        <option value="eq1">Ecuaciones 1er Grado</option>
                                        <option value="eq2">Ecuaciones 2do Grado</option>
                                        <option value="prod">Productos Notables</option>
                                        <option value="tri">Trinomios (Factorización)</option>
                                        <option value="eq_comp">Ecuaciones (Simplificar)</option>
                                    </optgroup>
                                    <optgroup label="Polinomios">
                                        <option value="poly_add">Suma de Polinomios</option>
                                        <option value="poly_sub">Resta de Polinomios</option>
                                        <option value="poly_mul">Multiplicación de Polinomios</option>
                                    </optgroup>
                                    <optgroup label="Cálculo">
                                        <option value="eval">Evaluación de Funciones</option>
                                        <option value="tvm">Tasa de Variación Media</option>
                                        <option value="lim">Límites</option>
                                        <option value="der">Derivadas</option>
                                        <option value="int_def">Integrales Definidas</option>
                                    </optgroup>
                                    <option value="mix">¡Sorpréndeme! (Combinado)</option>
                                </select>
                            </div>

                            <div className="input-wrapper">
                                <label htmlFor="count">Cantidad</label>
                                <input
                                    type="number"
                                    id="count"
                                    name="count"
                                    value={config.count}
                                    min="1"
                                    max="100"
                                    style={{ width: '100px' }}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label htmlFor="timeMinutes">Tiempo (min)</label>
                                <select
                                    id="timeMinutes"
                                    name="timeMinutes"
                                    value={config.timeMinutes}
                                    onChange={handleChange}
                                >
                                    {[1, 2, 3, 4, 5].map(min => (
                                        <option key={min} value={min}>{min} {min === 1 ? 'Minuto' : 'Minutos'}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="actions">
                                <button className="btn btn-primary" onClick={handleGenerate}>
                                    <span>⚡</span> Generar
                                </button>
                                <button className="btn btn-secondary" onClick={toggleAnswers}>
                                    <span>{showAnswers ? '👁️' : '🙈'}</span> {showAnswers ? 'Ocultar' : 'Ver Respuestas'}
                                </button>
                                <button className="btn btn-challenge" onClick={initiateChallenge}>
                                    <span>⏱️</span> Time Trial
                                </button>
                                <button className="btn btn-neutral" onClick={handlePrint}>
                                    <span>🖨️</span> Imprimir
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="challenge-bar">
                            {!challengeFinished ? (
                                <>
                                    <div className="score-badge">Puntos: {score}</div>
                                    <Timer duration={config.timeMinutes * 60} onTimeUp={endChallenge} />
                                    <button className="btn btn-neutral" onClick={resetChallenge}>Cancelar</button>
                                </>
                            ) : (
                                <div className="challenge-summary">
                                    <div className="final-score">¡Fin del tiempo! Puntos: {score}</div>
                                    <button className="btn btn-primary" onClick={initiateChallenge}>Reintentar</button>
                                    <button className="btn btn-secondary" onClick={() => setShowHistory(true)}>Ver Historial</button>
                                    <button className="btn btn-neutral" onClick={resetChallenge}>Salir</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="exercise-grid">
                {exercises.map((ex, index) => {
                    const isExample = (index === 0 && config.operation !== 'mix');

                    return (
                        <ExerciseCard
                            key={`${ex.operation}-${index}`}
                            numTop={ex.numTop}
                            numBottom={ex.numBottom}
                            symbol={ex.symbol}
                            result={ex.result}
                            operation={ex.operation}
                            showAnswer={showAnswers}
                            isExample={isExample}
                            equation={ex.equation}
                            coefficients={ex.coefficients}
                            onResult={handleResult}
                        />
                    );
                })}
            </main>

            <footer className="app-footer no-print">
                <div className="footer-content">
                    <h2 className="footer-logo">Xmath Gen</h2>
                    <div className="footer-divider"></div>
                    <p className="footer-design">Design: <strong>Alan Romahn</strong> 2026</p>
                    <p className="footer-rights">Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
