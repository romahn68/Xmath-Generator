export const generateExercises = (count, options) => {
    const { digitsTop, digitsBottom, operation } = options;
    const exercises = [];

    const getRand = (digits) => {
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Helper para generar número aleatorio en rango
    const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Available operations for mix mode
    const mixOps = ['add', 'sub', 'mul', 'div'];

    for (let i = 0; i < count; i++) {
        let op = operation;
        if (op === 'mix') {
            op = mixOps[Math.floor(Math.random() * mixOps.length)];
        }

        let numTop = getRand(digitsTop);
        let numBottom = getRand(digitsBottom);

        // Adjust for subtraction to avoid negative results
        if (op === 'sub') {
            if (numBottom > numTop) {
                [numTop, numBottom] = [numBottom, numTop];
            }
        }

        // Adjust for division to ensure exact result (no decimals)
        if (op === 'div') {
            const divisor = getRand(digitsBottom);
            const quotient = getRand(digitsTop);
            numTop = divisor * quotient;
            numBottom = divisor;
        }

        // Determine symbol and result
        let symbol, result, opName, equation, coefficients;

        switch (op) {
            case 'add':
                symbol = '+';
                result = numTop + numBottom;
                opName = 'suma';
                break;
            case 'sub':
                symbol = '−';
                result = numTop - numBottom;
                opName = 'resta';
                break;
            case 'mul':
                symbol = '×';
                result = numTop * numBottom;
                opName = 'multiplicacion';
                break;
            case 'div':
                symbol = '÷';
                result = numTop / numBottom;
                opName = 'division';
                break;
            case 'eq1':
                // Ecuación de primer grado: ax + b = c
                // Generamos x y coeficientes, luego calculamos c
                const a1 = randRange(2, 9) * (Math.random() > 0.5 ? 1 : -1);
                const x1 = randRange(-10, 10);
                const b1 = randRange(-20, 20);
                const c1 = a1 * x1 + b1;

                symbol = '=';
                result = x1;
                opName = 'ecuacion1';
                coefficients = { a: a1, b: b1, c: c1 };

                // Construir string de ecuación
                let eq1Str = '';
                if (a1 === 1) eq1Str = 'x';
                else if (a1 === -1) eq1Str = '-x';
                else eq1Str = `${a1}x`;

                if (b1 > 0) eq1Str += ` + ${b1}`;
                else if (b1 < 0) eq1Str += ` - ${Math.abs(b1)}`;

                eq1Str += ` = ${c1}`;
                equation = eq1Str;
                break;
            case 'eq2':
                // Ecuación de segundo grado: ax² + bx + c = 0
                // Generamos dos raíces enteras y construimos la ecuación
                const r1 = randRange(-8, 8);
                const r2 = randRange(-8, 8);
                const a2 = randRange(1, 3) * (Math.random() > 0.7 ? -1 : 1);

                // (x - r1)(x - r2) = x² - (r1+r2)x + r1*r2
                // a(x² - (r1+r2)x + r1*r2) = ax² - a(r1+r2)x + a*r1*r2
                const b2 = -a2 * (r1 + r2);
                const c2 = a2 * r1 * r2;

                symbol = '=';
                result = r1 === r2 ? [r1] : [Math.min(r1, r2), Math.max(r1, r2)];
                opName = 'ecuacion2';
                coefficients = { a: a2, b: b2, c: c2, r1, r2 };

                // Construir string de ecuación
                let eq2Str = '';
                if (a2 === 1) eq2Str = 'x²';
                else if (a2 === -1) eq2Str = '-x²';
                else eq2Str = `${a2}x²`;

                if (b2 === 1) eq2Str += ' + x';
                else if (b2 === -1) eq2Str += ' - x';
                else if (b2 > 0) eq2Str += ` + ${b2}x`;
                else if (b2 < 0) eq2Str += ` - ${Math.abs(b2)}x`;

                if (c2 > 0) eq2Str += ` + ${c2}`;
                else if (c2 < 0) eq2Str += ` - ${Math.abs(c2)}`;

                eq2Str += ' = 0';
                equation = eq2Str;
                break;
            default:
                symbol = '+';
                result = numTop + numBottom;
                opName = 'suma';
        }

        exercises.push({
            id: i,
            numTop,
            numBottom,
            symbol,
            result,
            operation: opName,
            equation: equation || null,
            coefficients: coefficients || null
        });
    }

    return exercises;
};
