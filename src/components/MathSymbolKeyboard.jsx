import React from 'react';

const SYMBOLS = [
    { label: 'x²', value: '^2' },
    { label: 'xⁿ', value: '^' },
    { label: 'lim', value: 'lim' },
    { label: '→', value: '->' },
    { label: '∞', value: 'oo' },
    { label: '√', value: 'sqrt' },
    { label: '÷', value: '/' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'f(x)', value: 'f(x)' },
];

export function MathSymbolKeyboard({ onSymbolClick }) {
    return (
        <div className="math-keyboard no-print">
            {SYMBOLS.map((symbol) => (
                <button
                    key={symbol.value}
                    className="symbol-btn"
                    onClick={() => onSymbolClick(symbol.value)}
                    title={symbol.label}
                >
                    {symbol.label}
                </button>
            ))}
        </div>
    );
}
