/**
 * Genera una explicación paso a paso para una operación matemática.
 * @param {number} numTop - Número de arriba
 * @param {number} numBottom - Número de abajo
 * @param {string} operation - 'suma' o 'resta'
 * @returns {string[]} Array de strings con los pasos de la explicación
 */
export function getExplanation(numTop, numBottom, operation) {
    const steps = [];
    const topStr = String(numTop);
    const bottomStr = String(numBottom);

    // Determinar la longitud máxima para alinear por columnas
    const maxLen = Math.max(topStr.length, bottomStr.length);

    // Padding para alinear los números a la derecha
    const topPadded = topStr.padStart(maxLen, '0');
    const bottomPadded = bottomStr.padStart(maxLen, '0');

    const columnNames = ['unidades', 'decenas', 'centenas', 'millares', 'decenas de millar', 'centenas de millar'];

    if (operation === 'suma') {
        let carry = 0;
        let resultDigits = [];

        // Procesar de derecha a izquierda (unidades primero)
        for (let i = maxLen - 1; i >= 0; i--) {
            const colIndex = maxLen - 1 - i;
            const colName = columnNames[colIndex] || `columna ${colIndex + 1}`;

            const digitTop = parseInt(topPadded[i]) || 0;
            const digitBottom = parseInt(bottomPadded[i]) || 0;
            const sum = digitTop + digitBottom + carry;
            const resultDigit = sum % 10;
            const newCarry = Math.floor(sum / 10);

            resultDigits.unshift(resultDigit);

            let stepText = `${colName.charAt(0).toUpperCase() + colName.slice(1)}: ${digitTop} + ${digitBottom}`;
            if (carry > 0) {
                stepText += ` + ${carry} (acarreo)`;
            }
            stepText += ` = ${sum}`;
            if (newCarry > 0) {
                stepText += ` → escribimos ${resultDigit}, llevamos ${newCarry}`;
            }

            steps.push(stepText);
            carry = newCarry;
        }

        if (carry > 0) {
            resultDigits.unshift(carry);
            steps.push(`Acarreo final: ${carry}`);
        }

        const result = parseInt(resultDigits.join(''));
        steps.push(`Resultado: ${numTop} + ${numBottom} = ${result}`);

    } else if (operation === 'resta') {
        // Resta
        let borrow = 0;
        let resultDigits = [];

        for (let i = maxLen - 1; i >= 0; i--) {
            const colIndex = maxLen - 1 - i;
            const colName = columnNames[colIndex] || `columna ${colIndex + 1}`;

            let digitTop = parseInt(topPadded[i]) || 0;
            const digitBottom = parseInt(bottomPadded[i]) || 0;

            digitTop = digitTop - borrow;

            let stepText = `${colName.charAt(0).toUpperCase() + colName.slice(1)}: `;

            if (digitTop < digitBottom) {
                stepText += `${digitTop} < ${digitBottom}, pedimos 10 → ${digitTop + 10} - ${digitBottom} = ${digitTop + 10 - digitBottom}`;
                resultDigits.unshift(digitTop + 10 - digitBottom);
                borrow = 1;
            } else {
                stepText += `${digitTop} - ${digitBottom} = ${digitTop - digitBottom}`;
                resultDigits.unshift(digitTop - digitBottom);
                borrow = 0;
            }

            steps.push(stepText);
        }

        // Remover ceros a la izquierda del resultado
        while (resultDigits.length > 1 && resultDigits[0] === 0) {
            resultDigits.shift();
        }

        const result = parseInt(resultDigits.join('')) || 0;
        steps.push(`Resultado: ${numTop} - ${numBottom} = ${result}`);
    } else if (operation === 'multiplicacion') {
        // Multiplicación
        const partialProducts = [];

        steps.push(`Multiplicamos ${numTop} × ${numBottom}`);

        // Procesar cada dígito del número de abajo (de derecha a izquierda)
        for (let i = bottomStr.length - 1; i >= 0; i--) {
            const digitBottom = parseInt(bottomStr[i]);
            const position = bottomStr.length - 1 - i;
            const positionName = columnNames[position] || `posición ${position + 1}`;

            let carry = 0;
            let partialResult = [];

            // Agregar ceros según la posición
            for (let z = 0; z < position; z++) {
                partialResult.push(0);
            }

            steps.push(`Multiplicamos por ${digitBottom} (${positionName}):`);

            // Multiplicar cada dígito del número de arriba
            for (let j = topStr.length - 1; j >= 0; j--) {
                const digitTop = parseInt(topStr[j]);
                const product = digitTop * digitBottom + carry;
                const resultDigit = product % 10;
                carry = Math.floor(product / 10);

                partialResult.unshift(resultDigit);

                let stepText = `  ${digitTop} × ${digitBottom}`;
                if (carry > 0 || (product >= 10)) {
                    stepText += ` = ${product}`;
                    if (Math.floor(product / 10) > 0) {
                        stepText += ` → escribimos ${resultDigit}, llevamos ${Math.floor((digitTop * digitBottom + (carry > resultDigit ? 0 : carry)) / 10)}`;
                    }
                } else {
                    stepText += ` = ${resultDigit}`;
                }
                steps.push(stepText);
            }

            if (carry > 0) {
                partialResult.unshift(carry);
            }

            const partialNum = parseInt(partialResult.join(''));
            partialProducts.push(partialNum);
            steps.push(`  Producto parcial: ${partialNum}`);
        }

        // Sumar productos parciales
        if (partialProducts.length > 1) {
            steps.push(`Sumamos los productos parciales:`);
            let sum = 0;
            partialProducts.forEach((p, idx) => {
                sum += p;
                if (idx < partialProducts.length - 1) {
                    steps.push(`  ${p} +`);
                } else {
                    steps.push(`  ${p}`);
                }
            });
            steps.push(`  = ${sum}`);
        }

        const result = numTop * numBottom;
        steps.push(`Resultado: ${numTop} × ${numBottom} = ${result}`);
    } else if (operation === 'division') {
        // División
        const dividend = numTop;
        const divisor = numBottom;

        steps.push(`Dividimos ${dividend} ÷ ${divisor}`);

        let remaining = 0;
        const dividendStr = String(dividend);
        const quotientDigits = [];

        for (let i = 0; i < dividendStr.length; i++) {
            // Tomar el siguiente dígito del dividendo
            const currentDigit = parseInt(dividendStr[i]);
            remaining = remaining * 10 + currentDigit;

            if (i === 0) {
                steps.push(`Tomamos el primer dígito: ${currentDigit}`);
            } else {
                steps.push(`Bajamos el ${currentDigit}, tenemos: ${remaining}`);
            }

            // Calcular cuántas veces cabe el divisor
            const times = Math.floor(remaining / divisor);
            quotientDigits.push(times);

            if (remaining < divisor) {
                steps.push(`${remaining} < ${divisor}, escribimos 0 en el cociente`);
            } else {
                const product = times * divisor;
                const newRemaining = remaining - product;
                steps.push(`${divisor} cabe ${times} vez/veces en ${remaining} (${times} × ${divisor} = ${product})`);
                steps.push(`${remaining} - ${product} = ${newRemaining}`);
                remaining = newRemaining;
            }
        }

        // Resultado final
        const finalQuotient = parseInt(quotientDigits.join('')) || 0;
        if (remaining === 0) {
            steps.push(`Resultado: ${dividend} ÷ ${divisor} = ${finalQuotient} (división exacta)`);
        } else {
            steps.push(`Resultado: ${dividend} ÷ ${divisor} = ${finalQuotient} con residuo ${remaining}`);
        }
    }

    // Nota: Las ecuaciones ahora necesitan los coeficientes para generar explicaciones
    // El componente ExerciseCard mostrará espacio para que el alumno escriba

    return steps;
}

/**
 * Genera explicación para ecuación de primer grado: ax + b = c
 * @param {object} coefficients - { a, b, c }
 * @returns {string[]} Array de pasos
 */
export function getEquation1Explanation(coefficients) {
    const { a, b, c } = coefficients;
    const steps = [];

    // Construir la ecuación original
    const buildEq = (coef, constant, rightSide) => {
        let left = '';
        if (coef === 1) left = 'x';
        else if (coef === -1) left = '-x';
        else left = `${coef}x`;

        if (constant > 0) left += ` + ${constant}`;
        else if (constant < 0) left += ` - ${Math.abs(constant)}`;

        return `${left} = ${rightSide}`;
    };

    const eqOriginal = buildEq(a, b, c);

    steps.push(`**Paso 1: Agrupar las constantes en el lado derecho**`);
    steps.push(`Ecuación original:`);
    steps.push(`    ${eqOriginal}`);

    if (b !== 0) {
        const operacion = b > 0 ? 'Restamos' : 'Sumamos';
        const valorB = Math.abs(b);

        steps.push(`${operacion} ${valorB} en ambos lados:`);

        // Mostrar la operación
        let leftWithOp = '';
        if (a === 1) leftWithOp = 'x';
        else if (a === -1) leftWithOp = '-x';
        else leftWithOp = `${a}x`;

        if (b > 0) {
            leftWithOp += ` + ${b} - ${b}`;
        } else {
            leftWithOp += ` - ${Math.abs(b)} + ${Math.abs(b)}`;
        }

        const rightWithOp = b > 0 ? `${c} - ${b}` : `${c} + ${Math.abs(b)}`;
        steps.push(`    ${leftWithOp} = ${rightWithOp}`);

        const newRight = c - b;

        steps.push(`Simplificamos:`);
        if (a === 1) {
            steps.push(`    x = ${newRight}`);
        } else if (a === -1) {
            steps.push(`    -x = ${newRight}`);
        } else {
            steps.push(`    ${a}x = ${newRight}`);
        }
    }

    const valorDerecho = c - b;

    steps.push(`**Paso 2: Aislar la x**`);

    if (a === 1) {
        steps.push(`La x ya está aislada:`);
        steps.push(`    x = ${valorDerecho}`);
    } else if (a === -1) {
        steps.push(`Tenemos -x, multiplicamos ambos lados por -1:`);
        steps.push(`    -x = ${valorDerecho}`);
        steps.push(`    x = ${-valorDerecho}`);
    } else {
        steps.push(`Dividimos ambos lados entre ${a}:`);
        steps.push(`    ${a}x ÷ ${a} = ${valorDerecho} ÷ ${a}`);
        const resultado = valorDerecho / a;
        steps.push(`    x = ${resultado}`);
    }

    const resultadoFinal = valorDerecho / a;
    steps.push(`**✓ Solución: x = ${resultadoFinal}**`);

    return steps;
}

/**
 * Genera explicación para ecuación de segundo grado: ax² + bx + c = 0
 * @param {object} coefficients - { a, b, c, r1, r2 }
 * @returns {string[]} Array de pasos
 */
export function getEquation2Explanation(coefficients) {
    const { a, b, c, r1, r2 } = coefficients;
    const steps = [];

    // Construir la ecuación
    let eqStr = '';
    if (a === 1) eqStr = 'x²';
    else if (a === -1) eqStr = '-x²';
    else eqStr = `${a}x²`;

    if (b === 1) eqStr += ' + x';
    else if (b === -1) eqStr += ' - x';
    else if (b > 0) eqStr += ` + ${b}x`;
    else if (b < 0) eqStr += ` - ${Math.abs(b)}x`;

    if (c > 0) eqStr += ` + ${c}`;
    else if (c < 0) eqStr += ` - ${Math.abs(c)}`;

    eqStr += ' = 0';

    steps.push(`**Ecuación:** ${eqStr}`);
    steps.push(`**Método: Fórmula General**`);
    steps.push(`a = ${a}, b = ${b}, c = ${c}`);
    steps.push(`x = (-b ± √(b² - 4ac)) / 2a`);

    const discriminant = b * b - 4 * a * c;
    steps.push(`Discriminante: b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`);

    if (discriminant > 0) {
        const sqrtD = Math.sqrt(discriminant);
        steps.push(`√${discriminant} = ${sqrtD}`);
        steps.push(`x = (${-b} ± ${sqrtD}) / ${2 * a}`);
        steps.push(`x₁ = (${-b} + ${sqrtD}) / ${2 * a} = ${r1}`);
        steps.push(`x₂ = (${-b} - ${sqrtD}) / ${2 * a} = ${r2}`);
    } else if (discriminant === 0) {
        steps.push(`Discriminante = 0 → raíz doble`);
        steps.push(`x = ${-b} / ${2 * a} = ${r1}`);
    }

    if (r1 === r2) {
        steps.push(`✓ Resultado: x = ${r1} (raíz doble)`);
    } else {
        steps.push(`✓ Resultado: x₁ = ${Math.min(r1, r2)}, x₂ = ${Math.max(r1, r2)}`);
    }

    return steps;
}
