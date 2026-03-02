/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { getExplanation, getEquation1Explanation, getEquation2Explanation, getAlgebraExplanation, getCalculusExplanation, getPolynomialExplanation } from '../utils/stepLogic';
import { getAdditionVisual, getSubtractionVisual, getMultiplicationVisual } from '../utils/visualLogic';
import { MathSymbolKeyboard } from './MathSymbolKeyboard';

export function ExerciseCard({ numTop, numBottom, symbol, result, operation, showAnswer: globalShowAnswer, isExample, equation, coefficients, onResult }) {
    const mathRef = useRef(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [status, setStatus] = useState('pending'); // 'pending', 'correct', 'incorrect', 'revealed'

    useEffect(() => {
        // Reset state when exercise changes
        setUserAnswer('');
        setStatus('pending');
    }, [numTop, numBottom, symbol, operation, result, equation, coefficients]);

    useEffect(() => {
        if (globalShowAnswer) {
            setStatus('revealed');
        } else if (status === 'revealed') {
            setStatus('pending');
            setUserAnswer('');
        }
    }, [globalShowAnswer]);

    const isEquation = operation === 'ecuacion1' || operation === 'ecuacion2' || operation === 'ecuacion_comp';
    const isCalculus = ['evaluacion', 'tvm', 'limite', 'derivada', 'prod_notable', 'trinomio', 'poly_add', 'poly_sub', 'poly_mul', 'int_def'].includes(operation);

    const checkAnswer = () => {
        if (!userAnswer) return;

        const cleanUser = userAnswer.toLowerCase().replace(/\s/g, '').replace(/,/g, '.').replace('->', '→').replace('oo', '∞');
        let isCorrect = false;

        if (operation === 'division') {
            isCorrect = Math.abs(parseFloat(cleanUser) - Math.floor(result)) < 0.01;
        } else if (isEquation || ['evaluacion', 'tvm', 'int_def'].includes(operation)) {
            const val = parseFloat(cleanUser);
            if (Array.isArray(result)) {
                isCorrect = result.some(r => Math.abs(r - val) < 0.01);
            } else {
                isCorrect = Math.abs(val - result) < 0.01;
            }
        } else if (['limite', 'trinomio'].includes(operation)) {
            const cleanResult = result.toString().toLowerCase().replace(/\s/g, '');
            isCorrect = cleanUser === cleanResult;
        } else if (['derivada', 'prod_notable', 'poly_add', 'poly_sub', 'poly_mul'].includes(operation)) {
            // Normalize result for comparison (remove spaces)
            const normResult = result.toString().toLowerCase().replace(/\s/g, '');
            // Simple normalization for user input (could be improved with a math parser)
            const normUser = cleanUser.replace(/\s/g, '');
            isCorrect = normUser === normResult;
        } else {
            isCorrect = Math.abs(parseFloat(cleanUser) - result) < 0.01;
        }

        const isCorrectResult = isCorrect;
        setStatus(isCorrectResult ? 'correct' : 'incorrect');
        if (onResult && !isExample) onResult(isCorrectResult);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') checkAnswer();
    };

    const handleSymbolClick = (val) => {
        setUserAnswer(prev => prev + val);
    };

    useEffect(() => {
        if (mathRef.current) {
            let latex = '';
            const shouldRenderSolution = status === 'revealed' || (status === 'correct');

            if (operation === 'division') {
                latex = `\\begin{array}{r|l} & \\phantom{${result}} \\\\ \\hline ${numBottom} & ${numTop} \\\\ \\end{array}`;
            } else if ((isEquation || isCalculus) && equation) {
                latex = equation.replace(/x²/g, 'x^2').replace(/−/g, '-').replace(/→/g, '\\to').replace(/∞/g, '\\infty');
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
    }, [numTop, numBottom, symbol, operation, result, equation, isEquation, isCalculus, status]);

    const getSteps = () => {
        if (!isExample) return [];
        if (operation === 'ecuacion1' && coefficients) return getEquation1Explanation(coefficients);
        if (operation === 'ecuacion2' && coefficients) return getEquation2Explanation(coefficients);

        if (['prod_notable', 'trinomio', 'ecuacion_comp'].includes(operation)) {
            return getAlgebraExplanation(operation, coefficients);
        }

        if (['poly_add', 'poly_sub', 'poly_mul'].includes(operation)) {
            return getPolynomialExplanation(operation, coefficients);
        }

        if (['evaluacion', 'tvm', 'limite', 'derivada', 'int_def'].includes(operation)) {
            return getCalculusExplanation(operation, coefficients);
        }

        return getExplanation(numTop, numBottom, operation);
    };

    const explanationSteps = getSteps();

    return (
        <div className={`exercise-card ${isExample ? 'example-card' : ''}`}>
            <div ref={mathRef} style={{ fontSize: (isEquation || isCalculus) ? '1.2rem' : '1.8rem', color: 'var(--text-main)', marginBottom: '20px' }}></div>

            {status !== 'revealed' && status !== 'correct' && (
                <div className="input-section no-print" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`answer-input ${status}`}
                        placeholder="Respuesta"
                        style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: `2px solid ${status === 'incorrect' ? '#ef4444' : '#e2e8f0'}`,
                            width: '90%',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            transition: 'all 0.2s',
                            outline: 'none',
                            marginBottom: '10px'
                        }}
                    />

                    {isCalculus && <MathSymbolKeyboard onSymbolClick={handleSymbolClick} />}

                    <button onClick={checkAnswer} className="btn btn-primary" style={{ marginTop: '12px', width: '90%', justifyContent: 'center' }}>
                        Comprobar
                    </button>

                    {status === 'incorrect' && (
                        <button onClick={() => setStatus('revealed')} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                            Ver solución
                        </button>
                    )}
                </div>
            )}

            {(status === 'correct' || status === 'revealed') && (
                <div className="result-badge" style={{ color: status === 'correct' ? '#22c55e' : '#6366f1', fontWeight: '900', fontSize: '1.2rem', marginTop: '10px', textAlign: 'center' }}>
                    {status === 'correct' ? '✨ ¡Correcto!' : `Respuesta: ${result}`}
                </div>
            )}

            {!isExample && (isEquation || isCalculus) && status === 'pending' && (
                <div className="procedure-space">
                    <div className="procedure-label">Procedimiento (Opcional):</div>
                    <textarea
                        className="procedure-textarea"
                        placeholder="Escribe tu procedimiento aquí..."
                        rows="6"
                        spellCheck="false"
                    ></textarea>
                </div>
            )}

            {isExample && explanationSteps.length > 0 && (
                <div className="explanation-panel">
                    <div className="explanation-title">Paso a paso:</div>
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
