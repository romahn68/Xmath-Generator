import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { getExplanation, getEquation1Explanation, getEquation2Explanation } from '../utils/stepLogic';
import { getAdditionVisual, getSubtractionVisual, getMultiplicationVisual } from '../utils/visualLogic';

export function ExerciseCard({ numTop, numBottom, symbol, result, operation, showAnswer: globalShowAnswer, isExample, equation, coefficients }) {
    const mathRef = useRef(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [status, setStatus] = useState('pending'); // 'pending', 'correct', 'incorrect', 'revealed'

    // Si globalShowAnswer cambia a true (el botón "Ver Respuestas" global), revelamos todo
    useEffect(() => {
        if (globalShowAnswer) {
            setStatus('revealed');
        } else if (status === 'revealed') {
            setStatus('pending');
            setUserAnswer('');
        }
    }, [globalShowAnswer]);

    const isEquation = operation === 'ecuacion1' || operation === 'ecuacion2';

    // Manejar envío de respuesta
    const checkAnswer = () => {
        if (!userAnswer) return;
        const cleanUser = userAnswer.replace(/\s/g, '').replace(/,/g, '.');
        let isCorrect = false;

        if (operation === 'division') {
            isCorrect = Math.abs(parseFloat(cleanUser) - Math.floor(result)) < 0.01;
        } else if (isEquation) {
            const val = parseFloat(cleanUser);
            if (Array.isArray(result)) {
                isCorrect = result.some(r => Math.abs(r - val) < 0.01);
            } else {
                isCorrect = Math.abs(val - result) < 0.01;
            }
        } else {
            isCorrect = Math.abs(parseFloat(cleanUser) - result) < 0.01;
        }

        if (isCorrect) {
            setStatus('correct');
        } else {
            setStatus('incorrect');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    };

    useEffect(() => {
        if (mathRef.current) {
            let latex;
            const shouldRenderSolution = status === 'revealed' || (status === 'correct' && !isEquation);

            if (operation === 'division') {
                latex = `
                    \\begin{array}{r|l}
                    & \\phantom{${result}} \\\\
                    \\hline
                    ${numBottom} & ${numTop} \\\\
                    \\end{array}
                `;
            } else if (isEquation && equation) {
                let eqLatex = equation.replace(/x²/g, 'x^2').replace(/−/g, '-');
                latex = eqLatex;
            } else {
                if (shouldRenderSolution) {
                    switch (operation) {
                        case 'suma': latex = getAdditionVisual(numTop, numBottom); break;
                        case 'resta': latex = getSubtractionVisual(numTop, numBottom); break;
                        case 'multiplicacion': latex = getMultiplicationVisual(numTop, numBottom); break;
                        default:
                            latex = `\\begin{array}{r} ${numTop} \\\\ ${symbol} \\; ${numBottom} \\\\ \\hline ${result} \\end{array}`;
                    }
                } else {
                    latex = `\\begin{array}{r} ${numTop} \\\\ ${symbol} \\; ${numBottom} \\\\ \\hline \\end{array}`;
                }
            }

            katex.render(latex, mathRef.current, { throwOnError: false });
        }
    }, [numTop, numBottom, symbol, operation, result, equation, isEquation, status]);

    // Obtener explicación según el tipo de operación
    const getSteps = () => {
        if (!isExample) return [];

        if (operation === 'ecuacion1' && coefficients) {
            return getEquation1Explanation(coefficients);
        } else if (operation === 'ecuacion2' && coefficients) {
            return getEquation2Explanation(coefficients);
        } else {
            return getExplanation(numTop, numBottom, operation);
        }
    };

    const explanationSteps = getSteps();

    // Formatear resultado para ecuaciones (solo para display)
    const formatResult = () => {
        if (operation === 'ecuacion1') {
            return `x = ${result}`;
        } else if (operation === 'ecuacion2') {
            if (Array.isArray(result)) {
                if (result.length === 1) {
                    return `x = ${result[0]} (raíz doble)`;
                }
                return `x₁ = ${result[0]}, x₂ = ${result[1]}`;
            }
            return `x = ${result}`;
        }
        return ``;
    };

    // UI Input Styles
    const inputStyle = {
        marginTop: '15px',
        padding: '8px',
        borderRadius: '8px',
        border: '2px solid #e2e8f0',
        width: '100px',
        textAlign: 'center',
        fontSize: '1.2rem',
        outline: 'none',
        transition: 'all 0.2s',
        backgroundColor: 'white'
    };

    if (status === 'correct') {
        inputStyle.borderColor = '#22c55e';
        inputStyle.backgroundColor = '#f0fdf4';
    } else if (status === 'incorrect') {
        inputStyle.borderColor = '#ef4444';
        inputStyle.backgroundColor = '#fef2f2';
    }

    return (
        <div className={`exercise-card ${isExample ? 'example-card' : ''} ${isEquation ? 'equation-card' : ''}`}>
            <div ref={mathRef} style={{ fontSize: isEquation ? '0.95em' : '1.6em', color: 'var(--text)' }}></div>

            {/* Input interactivo - Solo si no está revelado globalmente */}
            {status !== 'revealed' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }} className="no-print">

                    {status === 'correct' ? (
                        <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2em', marginTop: '10px' }}>
                            ¡Correcto! 🎉
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="?"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={inputStyle}
                                disabled={status === 'correct'}
                            />

                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={checkAnswer}
                                    style={{
                                        padding: '5px 15px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Comprobar
                                </button>

                                {status === 'incorrect' && (
                                    <button
                                        onClick={() => setStatus('revealed')}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: 'transparent',
                                            color: '#64748b',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Ver solución
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Espacio para procedimiento en ecuaciones (solo visual, modo papel) */}
            {isEquation && !isExample && status !== 'revealed' && (
                <div className="procedure-space">
                    <div className="procedure-label">Procedimiento:</div>
                    <div className="procedure-lines">
                        <div className="procedure-line"></div>
                        <div className="procedure-line"></div>
                        <div className="procedure-line"></div>
                        <div className="procedure-line"></div>
                        <div className="procedure-line"></div>
                        <div className="procedure-line"></div>
                    </div>
                </div>
            )}

            {/* Si es Ecuación y está correcta o revelada, mostramos el valor  */}
            {(status === 'correct' || status === 'revealed') && isEquation && (
                <div style={{ marginTop: '10px', color: '#22c55e', fontWeight: 'bold' }}>
                    {formatResult()}
                </div>
            )}

            {/* Si es Division y está correcta o revelada */}
            {(status === 'correct' || status === 'revealed') && operation === 'division' && (
                <div style={{ marginTop: '10px', color: '#64748b', fontSize: '0.9em' }}>
                    {`= ${Math.floor(result)} (res: ${numTop % numBottom})`}
                </div>
            )}


            {isExample && (
                <div className="explanation-panel">
                    <div className="explanation-title">Procedimiento detallado (Texto):</div>
                    <div className="explanation-steps-text">
                        {explanationSteps.map((step, idx) => (
                            <div key={idx} className={step.startsWith('**') ? 'step-header' : 'step-item'}>
                                {step.replace(/\*\*/g, '')}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
