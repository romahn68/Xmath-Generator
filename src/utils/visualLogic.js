/**
 * Genera el código LaTeX para visualizar una suma con sus acarreos.
 * @param {number} numTop 
 * @param {number} numBottom 
 * @returns {string} Código LaTeX
 */
export const getAdditionVisual = (numTop, numBottom) => {
    const sum = numTop + numBottom;
    const strTop = String(numTop);
    const strBottom = String(numBottom);
    const maxLength = Math.max(strTop.length, strBottom.length);

    // Arrays para guardar los dígitos alineados
    const digitsTop = strTop.padStart(maxLength, ' ').split('');
    const digitsBottom = strBottom.padStart(maxLength, ' ').split('');
    const digitsSum = String(sum).padStart(maxLength, ' ').split(''); // Puede ser más largo

    // Calcular acarreos
    let carries = [];
    let currentCarry = 0;

    // Iteramos de derecha a izquierda
    // Necesitamos alinear todo al final, así que usamos un índice relativo al final
    const lenTop = strTop.length;
    const lenBottom = strBottom.length;
    const maxLen = Math.max(lenTop, lenBottom);

    // Array de acarreos del mismo tamaño que el maxLen
    let carryArr = new Array(maxLen).fill('');

    for (let i = 0; i < maxLen; i++) {
        // Obtener dígitos desde la derecha
        const digitT = i < lenTop ? parseInt(strTop[lenTop - 1 - i]) : 0;
        const digitB = i < lenBottom ? parseInt(strBottom[lenBottom - 1 - i]) : 0;

        const val = digitT + digitB + currentCarry;

        // El acarreo que se genera AHORA se muestra en la SIGUIENTE posición (i+1)
        // Pero visualmente, el acarreo va sobre la columna actual si viene de la anterior?
        // No, el acarreo se escribe ARRIBA de la columna que lo recibe.
        // Ejemplo: 9+9=18. Escribo 8, llevo 1 a la siguiente columna.
        // Ese '1' se muestra sobre la siguiente columna a la izquierda.

        currentCarry = Math.floor(val / 10);

        if (currentCarry > 0) {
            // Guardamos el acarreo para la posición i+1 (que es más a la izquierda)
            if (i + 1 < maxLen) {
                carryArr[maxLen - 1 - (i + 1)] = currentCarry;
            } else {
                // Acarreo final que expande el número, a veces se pone, a veces no. 
                // En formato estándar escolar, si es el último, simplemente se escribe en el resultado.
                // Pero si queremos mostrarlo "volando", sería un elemento extra a la izq.
                // Para simplificar, este generator pondrá acarreos solo SOBRE columnas existentes.
            }
        }
    }

    // Construir filas LaTeX
    // Usamos phantom para alinear si hay espacios vacíos

    // Fila de acarreos (color rojo, pequeño)
    let carryRow = '';
    // Si hay algún acarreo, generamos la fila
    const hasCarries = carryArr.some(c => c !== '');

    if (hasCarries) {
        carryRow = carryArr.map(c =>
            c !== '' ? `\\textcolor{red}{\\tiny ${c}}` : `\\phantom{\\tiny 0}`
        ).join(' & ');
        // Ajustar si el resultado es más largo (ej 99+1 = 100), necesitamos una columna extra a la izquierda posiblemente
    }

    // Reconstrucción más robusta usando array de columnas
    // Vamos a construir una matriz grid de caracteres

    /* Estrategia:
       Formar columnas desde la derecha.
       Col 0 (unidades): top, bottom, result, carry (coming from prev, no, carry goes TO next)
       
       Mejor: Simular la operación completa guardando strings por columna.
    */

    let cols = [];
    let c = 0;
    let i = 0;

    while (i < maxLen || c > 0) {
        const dTop = i < lenTop ? parseInt(strTop[lenTop - 1 - i]) : null;
        const dBot = i < lenBottom ? parseInt(strBottom[lenBottom - 1 - i]) : null;

        const sumVal = (dTop || 0) + (dBot || 0) + c;
        const resDigit = sumVal % 10;
        const newC = Math.floor(sumVal / 10);

        // Acarreo que se muestra sobre ESTA columna (proviene de la anterior, i-1)
        // El acarreo 'c' actual es el que entra a esta posición.
        const carryDisplay = c > 0 ? `\\textcolor{red}{\\tiny ${c}}` : '';

        cols.unshift({
            carry: carryDisplay,
            top: dTop !== null ? dTop : '',
            bottom: dBot !== null ? dBot : '',
            res: resDigit
        });

        c = newC;
        i++;
    }

    // Construir LaTeX
    // Format: \begin{array}{@{}c@{\;}c@{\;}c@{}} ...

    const colCount = cols.length;
    const format = new Array(colCount).fill('r').join(''); // r para alinear a derecha en cada col es standard, o c. Probaremos r.

    const rowCarry = cols.map(col => col.carry || '\\phantom{\\tiny 0}').join(' & ');
    const rowTop = cols.map(col => col.top !== '' ? col.top : '\\phantom{0}').join(' & ');
    const rowBot = cols.map(col => col.bottom !== '' ? col.bottom : '\\phantom{0}').join(' & ');
    const rowRes = cols.map(col => col.res).join(' & ');

    // El simbolo + va flotando a la izquierda.
    // Hack: ponerlo en una columna extra a la izquierda o usar multicolor
    // Una forma limpia es un array global donde el simbolo ocupa la primera col si hay espacio.
    // Simplificación: Usar el formato "r" global y poner el simbolo en la fila del medio a la izquierda del todo

    return `
        \\begin{array}{${format}}
            ${rowCarry} \\\\[-3pt]
            ${rowTop} \\\\
            +\\; ${rowBot} \\\\
            \\hline
            ${rowRes}
        \\end{array}
    `;

    // Correccion: El símbolo '+' rompe la alineación si lo meto directo en la celda del numero
    // Mejor usar un array de N+1 columnas, la primera para el símbolo '+'
};


/**
 * Genera el LaTeX para RESTA con visualización de préstamos (tachados).
 */
export const getSubtractionVisual = (numTop, numBottom) => {
    // Nota: Asumimos que el resultado no es negativo por la lógica base
    const strTop = String(numTop);
    const strBottom = String(numBottom);
    const len = strTop.length;

    let cols = [];
    let borrow = 0;

    // Procesamos de derecha a izquierda
    for (let i = 0; i < len; i++) {
        let dTop = parseInt(strTop[len - 1 - i]);
        let dBot = i < strBottom.length ? parseInt(strBottom[strBottom.length - 1 - i]) : 0;

        let originalTop = dTop;
        let finalTop = dTop;
        let displayTop = String(dTop);

        // Ajuste por préstamo previo
        if (borrow > 0) {
            dTop -= 1;
            // Si era 0 y le prestaron, se vuelve 9 (en realidad 10-1 = 9)
            // Pero en el algoritmo manual:
            // Si tengo 50 - 6. 
            // 0 pide prestado al 5. El 5 se vuelve 4. El 0 se vuelve 10.
            // visual: tacho 5 pongo 4. tacho 0 pongo 10.
        }

        // Check si necesito pedir prestado AHORA
        let needBorrow = false;
        if (dTop < dBot) {
            needBorrow = true;
            // Pedimos prestado al siguiente
            // Visualmente este número se convierte en (dTop + 10)
            // PERO si ya le había quitado 1 por un borrow previo...
            // Ejemplo complejo: 100 - 1.
            // Col 0: 0-1. Pide. Es 10.
            // Col 1: 0. Dio 1 (o sea ahora es -1 virtual?). No, el algoritmo escolar es cadena.
        }

        /* 
           Lógica escolar estándar:
           Se procesa si se necesita pedir prestado a la columna izquierda.
        */
    }

    // Reintentamos con lógica simulada completa de izq a derecha para estados? 
    // No, derecha a izquierda es lo natural.

    // Vamos a generar estados de "tachado" y "nuevo valor"
    let borrows = new Array(len).fill(0); // 1 si presta a la derecha

    // Paso 1: Calcular quién presta a quién
    let tempTop = strTop.split('').map(Number);

    for (let i = len - 1; i >= 0; i--) {
        let val = tempTop[i];
        let valBot = i >= (len - strBottom.length) ? parseInt(strBottom[i - (len - strBottom.length)]) : 0;

        if (val < valBot) {
            // Necesita prestado del de la izquierda
            let j = i - 1;
            while (j >= 0) {
                if (tempTop[j] > 0) {
                    tempTop[j]--; // Presta 1
                    // Todos los ceros intermedios se vuelven 9
                    for (let k = j + 1; k < i; k++) {
                        tempTop[k] = 9;
                    }
                    tempTop[i] += 10; // Recibe 10
                    break;
                }
                j--;
            }
        }
    }

    // Ahora construimos la visualización basada en comparar tempTop (modificado) vs original
    // O mejor, construimos la visualización basada en lo que pasó.

    /* 
       Mejor approach visual simple:
       Si el número cambió respecto al original:
         Muestra \cancel{orig} \textcolor{red}{nuevo}
       El resultado abajo es simplemente la resta final.
    */

    let resultRows = [];
    const finalResult = numTop - numBottom;
    const strResult = String(finalResult);

    // Re-calculamos con lógica paso a paso para identificar cambios exactos columna por columna
    // Array de objetos { original, modified, isModified }
    let topDisplay = [];
    let currTop = strTop.split('').map(Number);
    let modTop = [...currTop];

    // Pre-pass para simular préstamos
    for (let i = len - 1; i >= 0; i--) {
        // Indice visual relativo a bottom
        let botIdx = strBottom.length - (len - i);
        let valBot = botIdx >= 0 ? parseInt(strBottom[botIdx]) : 0;

        if (modTop[i] < valBot) {
            // Buscamos a la izquierda quién presta
            let j = i - 1;
            while (j >= 0 && modTop[j] === 0) {
                j--;
            }
            if (j >= 0) {
                modTop[j]--; // Presta
                for (let k = j + 1; k < i; k++) {
                    modTop[k] = 9; // Los 0 se vuelven 9
                }
                modTop[i] += 10; // Este recibe 10
            }
        }
    }

    // Generar celdas
    for (let i = 0; i < len; i++) {
        if (currTop[i] !== modTop[i]) {
            // Fue modificado
            // Ej: \overset{\textcolor{red}{\tiny 12}}{\cancel{2}}
            topDisplay.push(`\\overset{\\textcolor{red}{\\tiny ${modTop[i]}}}{\\cancel{${currTop[i]}}}`);
        } else {
            topDisplay.push(String(currTop[i]));
        }
    }

    const rowTop = topDisplay.join(' & ');
    // Bottom alineado a derecha
    const diff = len - strBottom.length;
    const bottomCells = Array(diff).fill('\\phantom{0}').concat(strBottom.split(''));
    const rowBot = bottomCells.join(' & ');

    // Result alineado
    const diffRes = len - strResult.length;
    const resCells = Array(diffRes).fill('\\phantom{0}').concat(strResult.split(''));
    const rowRes = resCells.join(' & ');

    const format = new Array(len).fill('c').join('');

    return `
        \\begin{array}{${format}}
            ${rowTop} \\\\
            -\\quad ${rowBot} \\\\
            \\hline
            ${rowRes}
        \\end{array}
    `;
};


/**
 * Genera LaTeX para Multiplicación con productos parciales
 */
export const getMultiplicationVisual = (numTop, numBottom) => {
    const strTop = String(numTop);
    const strBottom = String(numBottom);
    const result = numTop * numBottom;

    // Si es de 1 dígito el multiplicador, es simple
    if (strBottom.length === 1) {
        // Reutiliza logica simple o añade acarreos si quieres
        // Por consistencia, podríamos mostrar acarreo, pero por ahora simple
        return `
            \\begin{array}{r}
                ${numTop} \\\\
                \\times \\; ${numBottom} \\\\
                \\hline
                ${result}
            \\end{array}
         `;
    }

    // Multidigito
    let steps = [];

    /* 
         123
       x  45
       -----
         615  <- 123 * 5
        492   <- 123 * 4 (desplazado)
       -----
        5535
    */

    // Calcular productos parciales
    let partials = [];
    for (let i = strBottom.length - 1; i >= 0; i--) {
        const digit = parseInt(strBottom[i]);
        const prod = numTop * digit;
        partials.push(prod);
    }

    // Alinear todo a la derecha basado en el ancho total del resultado
    const totalWidth = String(result).length;

    // Construir filas
    // Fila 1: Top
    // Fila 2: Bottom (con simbolo x)
    // Barra
    // Filas parciales (con desplazamientos)
    // Barra
    // Resultado

    // Helper para pad
    const pad = (str, len) => {
        // Retorna array de celdas
        const cells = str.split('');
        const missing = len - cells.length;
        const prefix = Array(missing).fill('\\phantom{0}');
        return prefix.concat(cells).join(' & ');
    };

    // El ancho de la tabla es el maximo
    // Para simplificar, usamos alineación 'r' en cada celda pero necesitamos N columnas.
    // O mejor, una sola columna 'r' con phantom spaces manuales? No, array de columnas es mejor para alinamiento estricto.

    const maxCols = totalWidth;

    // Top
    const rowTop = pad(strTop, maxCols);
    const rowBot = pad(strBottom, maxCols);

    let partialRows = partials.map((p, idx) => {
        // idx 0 = derecha total
        // idx 1 = desplazado 1 izq
        // El string visual debe tener (maxCols - idx) longitud 'visible' al final? 
        // No, el numero p se escribe, y se le añaden idx espacios vacíos a la derecha
        // Ej: 123 x 45. Parcial 1 (5*123) = 615. Shift 0.
        // Parcial 2 (4*123) = 492. Shift 1. (Visualmente 4920 o 492_)

        let pStr = String(p);
        // Padding derecha (espacios vacíos reales para alineación)
        // PERO en latex standard de multiplicar, se deja vacío, no se pone 0.

        // Total chars visuales contando el shift
        const visualLen = pStr.length + idx;
        // Necesitamos alinear esto a la derecha en un grid de maxCols

        let cells = pStr.split('');
        // Relleno izquierda
        const leftFill = maxCols - visualLen;
        const leftCells = Array(leftFill).fill('\\phantom{0}');
        // Relleno derecha (phantom)
        const rightCells = Array(idx).fill('\\phantom{0}');

        return leftCells.concat(cells).concat(rightCells).join(' & ');
    });

    const rowRes = pad(String(result), maxCols);

    const format = Array(maxCols).fill('c').join(''); // c o r da igual si cada celda es 1 digito

    return `
        \\begin{array}{${format}}
            ${rowTop} \\\\
            \\times \\; ${rowBot} \\\\
            \\hline
            ${partialRows.join(' \\\\ ')} \\\\
            \\hline
            ${rowRes}
        \\end{array}
    `;
};
