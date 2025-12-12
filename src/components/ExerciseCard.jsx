import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { getExplanation, getEquation1Explanation, getEquation2Explanation } from '../utils/stepLogic';
import { getAdditionVisual, getSubtractionVisual, getMultiplicationVisual } from '../utils/visualLogic';

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
                // Determine format based on state (solved vs unsolved)

                // Si se debe mostrar la respuesta y no es un ejemplo (que tiene su propia lógica abajo)
                // O incluso si es ejemplo podríamos querer mostrarlo visualmente
                // El requerimiento decía "cuando se agrega el resultado aparezca la respuesta pero con procedimiento"

                if (showAnswer) {
                    switch (operation) {
                        case 'suma':
                            latex = getAdditionVisual(numTop, numBottom);
                            break;
                        case 'resta':
                            latex = getSubtractionVisual(numTop, numBottom);
                            break;
                        case 'multiplicacion':
                            latex = getMultiplicationVisual(numTop, numBottom);
                            break;
                        default:
                            // Fallback
                            latex = `
                                \\begin{array}{r}
                                    ${numTop} \\\\
                                    ${symbol} \\; ${numBottom} \\\\
                                \\hline
                                    ${result}
                                \\end{array}
                            `;
                    }
                } else {
                    // Estado inicial (sin respuesta)
                    latex = `
                        \\begin{array}{r}
                            ${numTop} \\\\
                            ${symbol} \\; ${numBottom} \\\\
                        \\hline
                        \\end{array}
                    `;
                }
            }

            katex.render(latex, mathRef.current, {
                throwOnError: false
            });
        }
    }, [numTop, numBottom, symbol, operation, result, equation, isEquation, showAnswer]);

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
        return ``; // Vacío porque el resultado visual ya está en el LaTeX para operaciones básicas
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

            {/* Para ecuaciones, seguimos mostrando el texto rojo de resultado. 
                Para sumas/restas/mult, como ya lo muestra el gráfico, ocultamos el texto rojo redundante 
                A MENOS que sea división (que no tiene visualLogic aún) */}

            {showAnswer && (isEquation || operation === 'division') && (
                <div style={{
                    marginTop: '12px',
                    fontSize: '1.25em',
                    color: '#ef4444',
                    fontWeight: 'bold'
                }} className="no-print">
                    {operation === 'division' ? `= ${Math.floor(result)} (res: ${numTop % numBottom})` : formatResult()}
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
