import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { getExplanation, getEquation1Explanation, getEquation2Explanation } from '../utils/stepLogic';

export function ExerciseCard({ numTop, numBottom, symbol, result, operation, showAnswer, isExample, equation, coefficients }) {
    const mathRef = useRef(null);

    const isEquation = operation === 'ecuacion1' || operation === 'ecuacion2';

    useEffect(() => {
        if (mathRef.current) {
            let latex;

            if (operation === 'division') {
                // Formato de división larga "casita"
                latex = `
                    \\begin{array}{r|l}
                    & \\phantom{${result}} \\\\
                    \\hline
                    ${numBottom} & ${numTop} \\\\
                    \\end{array}
                `;
            } else if (isEquation && equation) {
                // Formato de ecuación - convertir a LaTeX
                let eqLatex = equation
                    .replace(/x²/g, 'x^2')
                    .replace(/−/g, '-');
                latex = eqLatex;
            } else {
                // Formato vertical para suma, resta, multiplicación
                latex = `
                    \\begin{array}{r}
                        ${numTop} \\\\
                        ${symbol} \\; ${numBottom} \\\\
                    \\hline
                    \\end{array}
                `;
            }

            katex.render(latex, mathRef.current, {
                throwOnError: false
            });
        }
    }, [numTop, numBottom, symbol, operation, result, equation, isEquation]);

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

    // Formatear resultado para ecuaciones
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
        return `= ${result}`;
    };

    return (
        <div className={`exercise-card ${isExample ? 'example-card' : ''} ${isEquation ? 'equation-card' : ''}`}>
            <div ref={mathRef} style={{ fontSize: isEquation ? '0.95em' : '1.6em', color: 'var(--text)' }}></div>

            {/* Espacio para procedimiento en ecuaciones */}
            {isEquation && !isExample && (
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

            {showAnswer && (
                <div style={{
                    marginTop: '12px',
                    fontSize: '1.25em',
                    color: '#ef4444',
                    fontWeight: 'bold'
                }} className="no-print">
                    {formatResult()}
                </div>
            )}

            {isExample && (
                <div className="explanation-panel">
                    <div className="explanation-title">Procedimiento:</div>
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
