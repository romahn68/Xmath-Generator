import React, { useState } from 'react';

const CATEGORIES = {
    'Básico': [
        { label: '+', value: '+' },
        { label: '−', value: '-' },
        { label: '×', value: '*' },
        { label: '÷', value: '/' },
        { label: '=', value: '=' },
        { label: '≠', value: '!=' },
    ],
    'Potencias': [
        { label: 'xʸ', value: '^' },
        { label: 'x²', value: '^2' },
        { label: '√x', value: 'sqrt(' },
    ],
    'Cálculo': [
        { label: 'd/dx', value: 'd/dx ' },
        { label: '∫', value: 'int ' },
        { label: '∫_a^b', value: 'int_a^b ' },
        { label: 'lim_{n→∞}', value: 'lim_{n->oo} ' },
    ],
    'Funciones': [
        { label: 'ln', value: 'ln(' },
        { label: 'log_10', value: 'log_10(' },
        { label: 'e^x', value: 'e^' },
        { label: '$', value: '$ ' },
    ]
};

export function MathSymbolKeyboard({ onSymbolClick }) {
    const [activeTab, setActiveTab] = useState('Básico');

    return (
        <div className="math-keyboard-container no-print">
            <div className="math-tabs">
                {Object.keys(CATEGORIES).map(cat => (
                    <button
                        key={cat}
                        className={`math-tab-btn ${activeTab === cat ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveTab(cat); }}
                        tabIndex="-1"
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="math-keyboard">
                {CATEGORIES[activeTab].map((symbol, idx) => (
                    <button
                        key={idx}
                        className="symbol-btn"
                        onClick={(e) => { e.preventDefault(); onSymbolClick(symbol.value); }}
                        title={symbol.label}
                        tabIndex="-1"
                    >
                        {symbol.label === 'xʸ' ? <span>x<sup>y</sup></span> :
                            symbol.label === 'x²' ? <span>x<sup>2</sup></span> :
                                symbol.label === 'e^x' ? <span>e<sup>x</sup></span> :
                                    symbol.label === 'log_10' ? <span>log<sub>10</sub></span> :
                                        symbol.label === 'lim_{n→∞}' ? <span>lim<sub>n→∞</sub></span> :
                                            symbol.label === '∫_a^b' ? <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.7em', lineHeight: '1' }}><span>b</span><span style={{ fontSize: '1.4em' }}>∫</span><span>a</span></span> :
                                                symbol.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
