import React, { useState, useEffect } from 'react';
import './App.css';
import { generateExercises } from './utils/mathLogic';
import { ExerciseCard } from './components/ExerciseCard';

function App() {
    const [config, setConfig] = useState({
        operation: 'add', // 'add', 'sub', 'mix'
        digitsTop: 2,
        digitsBottom: 2,
        count: 12
    });

    const [exercises, setExercises] = useState([]);
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        // Generación inicial al cargar
        handleGenerate();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'operation' ? value : parseInt(value)
        }));
    };

    const handleGenerate = () => {
        const newExercises = generateExercises(config.count, {
            digitsTop: config.digitsTop,
            digitsBottom: config.digitsBottom,
            operation: config.operation
        });
        setExercises(newExercises);
        setShowAnswers(false);
    };

    const toggleAnswers = () => {
        setShowAnswers(!showAnswers);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="app-container">
            <div className="controls-panel no-print">
                <h1 className="header-title">Xmath generator</h1>

                <div className="input-group-container">
                    <div className="input-wrapper">
                        <label htmlFor="operation">Operación</label>
                        <select
                            id="operation"
                            name="operation"
                            value={config.operation}
                            onChange={handleChange}
                        >
                            <option value="add">Sumas</option>
                            <option value="sub">Restas</option>
                            <option value="mul">Multiplicaciones</option>
                            <option value="div">Divisiones</option>
                            <option value="eq1">Ecuaciones 1er Grado</option>
                            <option value="eq2">Ecuaciones 2do Grado</option>
                            <option value="mix">Combinado</option>
                        </select>
                    </div>

                    <div className="input-wrapper">
                        <label htmlFor="digitsTop">Dígitos Arriba</label>
                        <input
                            type="number"
                            id="digitsTop"
                            name="digitsTop"
                            value={config.digitsTop}
                            min="1"
                            max="6"
                            style={{ width: '80px' }}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-wrapper">
                        <label htmlFor="digitsBottom">Dígitos Abajo</label>
                        <input
                            type="number"
                            id="digitsBottom"
                            name="digitsBottom"
                            value={config.digitsBottom}
                            min="1"
                            max="6"
                            style={{ width: '80px' }}
                            onChange={handleChange}
                        />
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
                            style={{ width: '80px' }}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="actions">
                        <button className="btn btn-primary" onClick={handleGenerate}>
                            Generar
                        </button>
                        <button className="btn btn-secondary" onClick={toggleAnswers}>
                            {showAnswers ? 'Ocultar Respuestas' : 'Revelar Todas'}
                        </button>
                        <button className="btn btn-neutral" onClick={handlePrint}>
                            Imprimir
                        </button>
                    </div>
                </div>
            </div>

            <div className="exercise-grid">
                {exercises.map((ex, index) => {
                    // Determine if this is the first example of its type
                    const isFirstSum = ex.operation === 'suma' &&
                        exercises.findIndex(e => e.operation === 'suma') === index;
                    const isFirstSub = ex.operation === 'resta' &&
                        exercises.findIndex(e => e.operation === 'resta') === index;
                    const isFirstMul = ex.operation === 'multiplicacion' &&
                        exercises.findIndex(e => e.operation === 'multiplicacion') === index;
                    const isFirstDiv = ex.operation === 'division' &&
                        exercises.findIndex(e => e.operation === 'division') === index;
                    const isFirstEq1 = ex.operation === 'ecuacion1' &&
                        exercises.findIndex(e => e.operation === 'ecuacion1') === index;
                    const isFirstEq2 = ex.operation === 'ecuacion2' &&
                        exercises.findIndex(e => e.operation === 'ecuacion2') === index;
                    const isExample = isFirstSum || isFirstSub || isFirstMul || isFirstDiv || isFirstEq1 || isFirstEq2;

                    return (
                        <ExerciseCard
                            key={ex.id}
                            numTop={ex.numTop}
                            numBottom={ex.numBottom}
                            symbol={ex.symbol}
                            result={ex.result}
                            operation={ex.operation}
                            showAnswer={showAnswers}
                            isExample={isExample}
                            equation={ex.equation}
                            coefficients={ex.coefficients}
                        />
                    );
                })}
            </div>

            <footer className="app-footer no-print">
                <div className="footer-content">
                    <p>Autor: <strong>Alan Romahn O.</strong></p>
                    <p>Tester: (vacio)</p>
                    <p className="footer-year">2025</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
