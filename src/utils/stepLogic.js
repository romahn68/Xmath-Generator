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


/**
 * Genera explicación para álgebra avanzada
 */
export function getAlgebraExplanation(operation, coefficients) {
    const steps = [];
    if (!coefficients) return steps;

    if (operation === 'trinomio') {
        const { r1, r2, b, c } = coefficients;
        steps.push(`**Caso: Trinomio de la forma x² + bx + c**`);
        steps.push(`Buscamos dos números que multiplicados den ${c} y sumados den ${b}.`);
        steps.push(`Números: ${r1} y ${r2}`);
        steps.push(`Comprobación:`);
        steps.push(`    Multiplicación: (${r1}) × (${r2}) = ${c}`);
        steps.push(`    Suma: (${r1}) + (${r2}) = ${b}`);
        steps.push(`Formamos los factores (x + r₁) y (x + r₂) cuidando los signos.`);
        steps.push(`**✓ Solución: (x ${r1 >= 0 ? '+ ' + r1 : r1}) (x ${r2 >= 0 ? '+ ' + r2 : r2})**`);
    } else if (operation === 'prod_notable') {
        const { type, a, b, sign } = coefficients;
        if (type === 1) { // Binomio al cuadrado
            steps.push(`**Caso: Cuadrado de un Binomio**`);
            const opSign = sign === '+' ? '+' : '-';
            steps.push(`Fórmula: (a ${opSign} b)² = a² ${opSign} 2ab + b²`);
            steps.push(`Donde a = ${a === 1 ? 'x' : a + 'x'} y b = ${b}`);
            const t1 = a * a;
            const t2 = 2 * a * b;
            const t3 = b * b;
            steps.push(`1. Cuadrado del primero: (${a}x)² = ${t1 === 1 ? '' : t1}x²`);
            steps.push(`2. Doble del primero por el segundo: 2(${a}x)(${b}) = ${t2}x`);
            steps.push(`3. Cuadrado del segundo: ${b}² = ${t3}`);
            steps.push(`**✓ Resultado: ${t1 === 1 ? '' : t1}x² ${opSign} ${t2}x + ${t3}**`);
        } else if (type === 2) { // Binomios Conjugados
            steps.push(`**Caso: Binomios Conjugados**`);
            steps.push(`Fórmula: (a + b)(a - b) = a² - b²`);
            steps.push(`Donde a = ${a === 1 ? 'x' : a + 'x'} y b = ${b}`);
            steps.push(`Resultado es la diferencia de cuadrados:`);
            steps.push(`**✓ Resultado: ${a * a === 1 ? '' : a * a}x² - ${b * b}**`);
        } else { // Binomios con término común
            steps.push(`**Caso: Producto de binomios con término común**`);
            steps.push(`Fórmula: (x + a)(x + b) = x² + (a+b)x + ab`);
            const sum = a + b;
            const prod = a * b;
            steps.push(`1. Término común al cuadrado: x²`);
            steps.push(`2. Suma de no comunes por común: (${a} + ${b})x = ${sum}x`);
            steps.push(`3. Producto de no comunes: (${a})(${b}) = ${prod}`);
            steps.push(`**✓ Resultado: x² ${sum >= 0 ? '+ ' + sum : sum}x ${prod >= 0 ? '+ ' + prod : prod}**`);
        }
    } else if (operation === 'ecuacion_comp') {
        const { a, b, c, d, x } = coefficients;
        steps.push(`**Objetivo: Simplificar y resolver**`);
        steps.push(`Ecuación: x² + ${a}x + ${b}x ${c >= 0 ? '+ ' + c : c} = ${d}`);
        steps.push(`1. Agrupamos términos semejantes (x):`);
        const b_total = a + b;
        steps.push(`    ${a}x + ${b}x = ${b_total}x`);
        steps.push(`    Nos queda: x² + ${b_total}x + ${c} = ${d}`);
        steps.push(`2. Igualamos a cero pasando ${d} restando:`);
        const c_final = c - d;
        steps.push(`    x² + ${b_total}x + (${c} - ${d}) = 0`);
        steps.push(`    x² + ${b_total}x ${c_final >= 0 ? '+ ' + c_final : c_final} = 0`);
        steps.push(`3. Resolvemos la ecuación cuadrática (factorizando o fórmula).`);
        steps.push(`    Buscamos dos números que sumados den ${b_total} y multiplicados ${c_final}.`);
        steps.push(`    Son ${x} y algunas veces otro valor.`);
        steps.push(`**✓ Solución principal verificada: x = ${x}**`);
    }

    return steps;
}

/**
 * Genera explicación para operaciones de polinomios
 */
export function getPolynomialExplanation(operation, coefficients) {
    const steps = [];
    if (!coefficients) return steps;

    if (operation === 'poly_add' || operation === 'poly_sub') {
        const { a1, b1, a2, b2, op } = coefficients;
        steps.push(`**Suma o Resta de Polinomios**`);
        steps.push(`Polinomio 1: ${a1}x ${b1 > 0 ? '+ ' + b1 : b1 === 0 ? '' : b1}`);
        steps.push(`Polinomio 2: ${a2}x ${b2 > 0 ? '+ ' + b2 : b2 === 0 ? '' : b2}`);
        steps.push(`Agrupamos términos semejantes:`);

        let a2_eff = op === '+' ? a2 : -a2;
        let b2_eff = op === '+' ? b2 : -b2;

        steps.push(`Para las x: (${a1}) ${op} (${a2}) = ${a1 + a2_eff}`);
        steps.push(`Para las constantes: (${b1}) ${op} (${b2}) = ${b1 + b2_eff}`);

        const a_res = a1 + a2_eff;
        const b_res = b1 + b2_eff;

        let resultStr = `${a_res === 0 ? '' : a_res === 1 ? 'x' : a_res === -1 ? '-x' : a_res + 'x'}${b_res === 0 && a_res !== 0 ? '' : b_res >= 0 && a_res !== 0 ? ' + ' + b_res : b_res >= 0 ? b_res : ' - ' + Math.abs(b_res)}`;
        if (resultStr === '') resultStr = '0';

        steps.push(`**✓ Resultado: ${resultStr}**`);
    } else if (operation === 'poly_mul') {
        const { type } = coefficients;
        if (type === 1) { // Monomio por Binomio
            const { am, b1, b2 } = coefficients;
            steps.push(`**Multiplicación: Monomio por Binomio**`);
            steps.push(`Aplicamos propiedad distributiva:`);
            steps.push(`${am}x · (x²) = ${am * b1}x³`);
            steps.push(`${am}x · (${b2}) = ${am * b2}x`);
            steps.push(`**✓ Resultado: ${am * b1}x³ ${am * b2 > 0 ? '+ ' + (am * b2) : (am * b2)}x**`);
        } else { // Binomio por Binomio
            const { a1, b1, a2, b2 } = coefficients;
            steps.push(`**Multiplicación: Binomio por Binomio**`);
            steps.push(`Multiplicamos cada término del primero por cada término del segundo (FOIL):`);
            steps.push(`1. Primeros: (${a1}x) · (${a2}x) = ${a1 * a2}x²`);
            steps.push(`2. Externos: (${a1}x) · (${b2}) = ${a1 * b2}x`);
            steps.push(`3. Internos: (${b1}) · (${a2}x) = ${b1 * a2}x`);
            steps.push(`4. Últimos: (${b1}) · (${b2}) = ${b1 * b2}`);

            const r_x = a1 * b2 + b1 * a2;
            steps.push(`Agrupamos los términos con x: ${a1 * b2}x + ${b1 * a2}x = ${r_x}x`);

            const r_a2 = a1 * a2;
            const r_c = b1 * b2;

            steps.push(`**✓ Resultado: ${r_a2}x² ${r_x > 0 ? '+ ' + r_x : r_x}x ${r_c > 0 ? '+ ' + r_c : r_c}**`);
        }
    }

    return steps;
}

/**
 * Genera explicación para cálculo diferencial e integral
 */
export function getCalculusExplanation(operation, coefficients) {
    const steps = [];
    if (!coefficients) return steps;

    if (operation === 'limite') {
        const { type } = coefficients;
        if (type === 1) { // Sustitución directa
            const { al, bl, kl } = coefficients;
            steps.push(`**Método: Sustitución Directa**`);
            steps.push(`Evaluamos el límite reemplazando x por ${kl}:`);
            steps.push(`L = ${al}(${kl}) ${bl >= 0 ? '+ ' + bl : '- ' + Math.abs(bl)}`);
            steps.push(`Operamos:`);
            const res = al * kl + bl;
            steps.push(`L = ${al * kl} ${bl >= 0 ? '+ ' + bl : '- ' + Math.abs(bl)} = ${res}`);
            steps.push(`**✓ Resultado: ${res}**`);
        } else if (type === 2) { // 0/0 Factorización
            const { al } = coefficients;
            steps.push(`**Método: Factorización (Indeterminación 0/0)**`);
            steps.push(`Si evaluamos x=${al}, obtenemos 0/0.`);
            steps.push(`Factorizamos el numerador (Diferencia de Cuadrados):`);
            steps.push(`x² - ${al * al} = (x - ${al})(x + ${al})`);
            steps.push(`Simplificamos con el denominador (x - ${al}):`);
            steps.push(`lim (x + ${al}) cuando x → ${al}`);
            steps.push(`Ahora sustituimos:`);
            steps.push(`${al} + ${al} = ${2 * al}`);
            steps.push(`**✓ Resultado: ${2 * al}**`);
        } else { // Infinito
            const { al, bl } = coefficients;
            steps.push(`**Método: Límites al Infinito**`);
            steps.push(`Dividimos todo entre la mayor potencia de x (x²):`);
            steps.push(`Numerador: ${al}x²/x² + x/x² → ${al} + 0`);
            steps.push(`Denominador: ${bl}x²/x² - 1/x² → ${bl} - 0`);
            steps.push(`El límite es el cociente de los coeficientes principales.`);
            const res = al / bl; // Integer division usually
            steps.push(`L = ${al} / ${bl} = ${res}`);
            steps.push(`**✓ Resultado: ${res}**`);
        }
    } else if (operation === 'derivada') {
        const { type } = coefficients;
        if (type === 1) { // Potencia básica
            const { ad, nd } = coefficients;
            steps.push(`**Regla de la Potencia**`);
            steps.push(`S i f(x) = axⁿ → f'(x) = a·n·xⁿ⁻¹`);
            steps.push(`Identificamos: a = ${ad}, n = ${nd}`);
            steps.push(`Multiplicamos exponente por coeficiente: ${ad} × ${nd} = ${ad * nd}`);
            steps.push(`Restamos 1 al exponente: ${nd} - 1 = ${nd - 1}`);
            steps.push(`**✓ Resultado: ${ad * nd}x^${nd - 1}**`);
        } else if (type === 2) { // Producto
            const { ad } = coefficients;
            steps.push(`**Regla del Producto f(x) = u·v**`);
            steps.push(`u = x² + 1  →  u' = 2x`);
            steps.push(`v = ${ad}x    →  v' = ${ad}`);
            steps.push(`Formula: u'v + uv'`);
            steps.push(`(2x)(${ad}x) + (x² + 1)(${ad})`);
            steps.push(`2${ad}x² + ${ad}x² + ${ad}`);
            steps.push(`Agrupamos términos semejantes:`);
            steps.push(`**✓ Resultado: ${3 * ad}x² + ${ad}**`);
        } else { // Cadena
            const { nd } = coefficients;
            steps.push(`**Regla de la Cadena (Potencia Generalizada)**`);
            steps.push(`f(x) = uⁿ → f'(x) = n·uⁿ⁻¹ · u'`);
            steps.push(`u = x² + 1, n = ${nd}`);
            steps.push(`Derivada interna u' = 2x`);
            steps.push(`Aplicamos fórmula:`);
            steps.push(`${nd}(x² + 1)^${nd - 1} · (2x)`);
            steps.push(`Reordenamos:`);
            steps.push(`**✓ Resultado: ${2 * nd}x(x² + 1)^${nd - 1}**`);
        }
    } else if (operation === 'evaluacion') {
        const { a, b, c, k } = coefficients;
        steps.push(`**Evaluación de Funciones**`);
        steps.push(`Sustituimos x = ${k} en la función:`);
        steps.push(`f(${k}) = ${a}(${k})² ${b >= 0 ? '+ ' + b : b}(${k}) ${c >= 0 ? '+ ' + c : c}`);
        const t1 = a * k * k;
        const t2 = b * k;
        steps.push(`Calculamos potencias y productos:`);
        steps.push(`    ${a}(${k * k}) = ${t1}`);
        steps.push(`    ${b}(${k}) = ${t2}`);
        steps.push(`Sumamos todo:`);
        steps.push(`    ${t1} ${t2 >= 0 ? '+ ' + t2 : t2} ${c >= 0 ? '+ ' + c : c}`);
        steps.push(`**✓ Resultado: ${t1 + t2 + c}**`);
    } else if (operation === 'tvm') {
        const { a_coeff, b_coeff, c_coeff, a, b } = coefficients;
        steps.push(`**Tasa de Variación Media (TVM)**`);
        steps.push(`Fórmula: [f(b) - f(a)] / (b - a)`);
        steps.push(`Intervalo [a, b] = [${a}, ${b}]`);

        // Helper to format function string
        const formatF = (x) => {
            let res = '';
            // ax^2
            res += `${a_coeff}(${x})²`;
            // bx
            if (b_coeff !== 0) res += ` ${b_coeff > 0 ? '+ ' + b_coeff : b_coeff}(${x})`;
            // c
            if (c_coeff !== 0) res += ` ${c_coeff > 0 ? '+ ' + c_coeff : c_coeff}`;
            return res;
        };

        steps.push(`Calculamos f(${b}):`);
        const fb = a_coeff * b * b + b_coeff * b + c_coeff;
        steps.push(`    f(${b}) = ${formatF(b)} = ${fb}`);

        steps.push(`Calculamos f(${a}):`);
        const fa = a_coeff * a * a + b_coeff * a + c_coeff;
        steps.push(`    f(${a}) = ${formatF(a)} = ${fa}`);

        steps.push(`Aplicamos la fórmula:`);
        steps.push(`    TVM = (${fb} - (${fa})) / (${b} - (${a}))`);
        const num = fb - fa;
        const den = b - a;
        steps.push(`    TVM = ${num} / ${den}`);
        steps.push(`**✓ Resultado: ${num / den}**`);
    } else if (operation === 'int_def') {
        const { type } = coefficients;
        steps.push(`**Integral Definida**`);
        if (type === 1) {
            const { c_b, a, b } = coefficients;
            steps.push(`Función: f(x) = ${c_b}x`);
            steps.push(`Antiderivada: F(x) = (${c_b}/2)x² = ${c_b / 2}x²`);
            steps.push(`Evaluamos en los límites: F(${b}) - F(${a})`);
            const fb = (c_b / 2) * b * b;
            const fa = (c_b / 2) * a * a;
            steps.push(`F(${b}) = ${c_b / 2}(${b})² = ${fb}`);
            steps.push(`F(${a}) = ${c_b / 2}(${a})² = ${fa}`);
            steps.push(`**✓ Resultado: ${fb} - (${fa}) = ${fb - fa}**`);
        } else if (type === 2) {
            const { c_a, c_c, a, b } = coefficients;
            steps.push(`Función: f(x) = ${c_a}x² ${c_c >= 0 ? '+ ' + c_c : c_c}`);
            steps.push(`Antiderivada: F(x) = (${c_a}/3)x³ ${c_c >= 0 ? '+ ' + c_c : c_c}x = ${c_a / 3}x³ ${c_c >= 0 ? '+ ' + c_c : c_c}x`);
            steps.push(`Evaluamos en los límites: F(${b}) - F(${a})`);
            const fb = (c_a / 3) * b * b * b + c_c * b;
            const fa = (c_a / 3) * a * a * a + c_c * a;
            steps.push(`F(${b}) = ${fb}`);
            steps.push(`F(${a}) = ${fa}`);
            steps.push(`**✓ Resultado: ${fb} - (${fa}) = ${fb - fa}**`);
        } else {
            const { c_c, a, b } = coefficients;
            steps.push(`Función: f(x) = ${c_c} (Constante)`);
            steps.push(`Integral de una constante es el área de un rectángulo: base × altura`);
            steps.push(`Base: ${b} - (${a}) = ${b - a}`);
            steps.push(`Altura: ${c_c}`);
            steps.push(`**✓ Resultado: ${c_c} × ${b - a} = ${c_c * (b - a)}**`);
        }
    }

    return steps;
}
