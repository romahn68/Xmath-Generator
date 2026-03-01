export const generateExercises = (count, options) => {
    const { digitsTop = 2, digitsBottom = 1, operation } = options;
    const exercises = [];

    const getRand = (digits) => {
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const mixOps = ['add', 'sub', 'mul', 'div', 'eq1', 'eq2', 'eval', 'tvm', 'lim', 'cont', 'der', 'prod', 'tri', 'eq_comp', 'poly_add', 'poly_sub', 'poly_mul', 'int_def'];
    for (let i = 0; i < count; i++) {
        let op = operation;
        if (op === 'mix') {
            op = mixOps[Math.floor(Math.random() * mixOps.length)];
        }

        let symbol, result, opName, equation, coefficients, numTop, numBottom;

        switch (op) {
            case 'tri': {
                let r1t = randRange(-10, 10);
                let r2t = randRange(-10, 10);
                if (r1t === 0 && r2t === 0) { r1t = 1; r2t = 1; }
                const roots = [r1t, r2t].sort((a, b) => a - b);
                r1t = roots[0];
                r2t = roots[1];
                const bt = r1t + r2t;
                const ct = r1t * r2t;
                opName = 'trinomio';
                equation = `x^2 ${bt === 0 ? '' : (bt > 0 ? '+ ' + bt : '- ' + Math.abs(bt)) + 'x'} ${ct >= 0 ? '+ ' + ct : '- ' + Math.abs(ct)}`;
                const f1 = `(x ${r1t >= 0 ? '+' + r1t : '-' + Math.abs(r1t)})`;
                const f2 = `(x ${r2t >= 0 ? '+' + r2t : '-' + Math.abs(r2t)})`;
                result = r1t === r2t ? f1 + '^2' : f1 + f2;
                symbol = 'fact';
                coefficients = { b: bt, c: ct, r1: r1t, r2: r2t };
                break;
            }
            case 'eq_comp': {
                const x_sol = randRange(-10, 10);
                const a_ec = randRange(1, 10);
                const b_ec = randRange(1, 10);
                const c_ec = randRange(-20, 20);
                const d_ec = x_sol * x_sol + (a_ec + b_ec) * x_sol + c_ec;
                opName = 'ecuacion_comp';
                equation = `x^2 + ${a_ec}x + ${b_ec}x ${c_ec >= 0 ? '+ ' + c_ec : '- ' + Math.abs(c_ec)} = ${d_ec}`;
                result = x_sol;
                symbol = '=';
                coefficients = { a: a_ec, b: b_ec, c: c_ec, d: d_ec, x: x_sol };
                break;
            }
            case 'poly_add': {
                const a1 = randRange(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const b1 = randRange(-10, 10);
                const a2 = randRange(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const b2 = randRange(-10, 10);
                opName = 'poly_add';
                equation = `(${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x ${b1 >= 0 ? '+ ' + b1 : '- ' + Math.abs(b1)}) + (${a2 === 1 ? '' : a2 === -1 ? '-' : a2}x ${b2 >= 0 ? '+ ' + b2 : '- ' + Math.abs(b2)})`;
                const a_res = a1 + a2;
                const b_res = b1 + b2;
                result = `${a_res === 0 ? '' : a_res === 1 ? 'x' : a_res === -1 ? '-x' : a_res + 'x'}${b_res === 0 && a_res !== 0 ? '' : b_res >= 0 && a_res !== 0 ? '+' + b_res : b_res >= 0 ? b_res : b_res}`;
                if (result === '') result = '0';
                symbol = 'poly';
                coefficients = { a1, b1, a2, b2, op: '+' };
                break;
            }
            case 'poly_sub': {
                const a1 = randRange(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const b1 = randRange(-10, 10);
                const a2 = randRange(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const b2 = randRange(-10, 10);
                opName = 'poly_sub';
                equation = `(${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x ${b1 >= 0 ? '+ ' + b1 : '- ' + Math.abs(b1)}) - (${a2 === 1 ? '' : a2 === -1 ? '-' : a2}x ${b2 >= 0 ? '+ ' + b2 : '- ' + Math.abs(b2)})`;
                const a_res = a1 - a2;
                const b_res = b1 - b2;
                result = `${a_res === 0 ? '' : a_res === 1 ? 'x' : a_res === -1 ? '-x' : a_res + 'x'}${b_res === 0 && a_res !== 0 ? '' : b_res >= 0 && a_res !== 0 ? '+' + b_res : b_res >= 0 ? b_res : b_res}`.replace('++', '+');
                if (result === '') result = '0';
                symbol = 'poly';
                coefficients = { a1, b1, a2, b2, op: '-' };
                break;
            }
            case 'poly_mul': {
                const type = randRange(1, 2);
                if (type === 1) { // Monomio por Binomio
                    const am = randRange(2, 5); // 3x
                    const b1 = randRange(1, 3); // x^2
                    const b2 = randRange(-5, 5) || 1; // - 2
                    opName = 'poly_mul';
                    equation = `${am}x(x^2 ${b2 >= 0 ? '+ ' + b2 : '- ' + Math.abs(b2)})`;
                    const r1 = am * b1;
                    const r2 = am * b2;
                    result = `${r1 === 1 ? '' : r1}x^3 ${r2 >= 0 ? '+' + r2 : r2}x`;
                    coefficients = { type: 1, am, b1, b2 };
                } else { // Binomio por Binomio
                    const a1 = randRange(1, 3);
                    const b1 = randRange(-5, 5) || 1;
                    const a2 = randRange(1, 3);
                    const b2 = randRange(-5, 5) || -1;
                    opName = 'poly_mul';
                    equation = `(${a1 === 1 ? '' : a1}x ${b1 >= 0 ? '+ ' + b1 : '- ' + Math.abs(b1)})(${a2 === 1 ? '' : a2}x ${b2 >= 0 ? '+ ' + b2 : '- ' + Math.abs(b2)})`;
                    const r_a2 = a1 * a2;
                    const r_x = a1 * b2 + b1 * a2;
                    const r_c = b1 * b2;
                    result = `${r_a2 === 1 ? '' : r_a2}x^2 ${r_x === 0 ? '' : r_x > 0 ? '+' + r_x + 'x' : r_x + 'x'} ${r_c >= 0 && (r_a2 !== 0 || r_x !== 0) ? '+' + r_c : r_c}`;
                    coefficients = { type: 2, a1, b1, a2, b2 };
                }
                symbol = 'poly';
                break;
            }
            case 'prod': {
                const prodType = randRange(1, 3);
                if (prodType === 1) {
                    const a = randRange(1, 5);
                    const b = randRange(1, 10);
                    const sign = Math.random() > 0.5 ? '+' : '-';
                    opName = 'prod_notable';
                    equation = `(${a === 1 ? '' : a}x ${sign} ${b})^2`;
                    const r_a2 = a * a;
                    const r_2ab = 2 * a * b;
                    const r_b2 = b * b;
                    result = `${r_a2 === 1 ? '' : r_a2}x^2 ${sign === '+' ? '+' : '-'} ${r_2ab}x + ${r_b2}`;
                    coefficients = { type: 1, a, b, sign };
                } else if (prodType === 2) {
                    const a = randRange(1, 5);
                    const b = randRange(1, 10);
                    opName = 'prod_notable';
                    equation = `(${a === 1 ? '' : a}x + ${b})(${a === 1 ? '' : a}x - ${b})`;
                    result = `${a * a === 1 ? '' : a * a}x^2 - ${b * b}`;
                    coefficients = { type: 2, a, b };
                } else {
                    const a = randRange(-10, 10);
                    const b = randRange(-10, 10);
                    opName = 'prod_notable';
                    equation = `(x ${a >= 0 ? '+ ' + a : '- ' + Math.abs(a)})(x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)})`;
                    const r_ab = a + b;
                    const r_a_mul_b = a * b;
                    result = `x^2 ${r_ab === 0 ? '' : (r_ab > 0 ? '+ ' + r_ab : '- ' + Math.abs(r_ab)) + 'x'} ${r_a_mul_b >= 0 ? '+ ' + r_a_mul_b : '- ' + Math.abs(r_a_mul_b)}`;
                    coefficients = { type: 3, a, b };
                }
                symbol = 'prod';
                break;
            }
            case 'add': {
                numTop = getRand(digitsTop);
                numBottom = getRand(digitsBottom);
                symbol = '+';
                result = numTop + numBottom;
                opName = 'suma';
                break;
            }
            case 'sub': {
                numTop = getRand(digitsTop);
                numBottom = getRand(digitsBottom);
                if (numBottom > numTop) [numTop, numBottom] = [numBottom, numTop];
                symbol = '−';
                result = numTop - numBottom;
                opName = 'resta';
                break;
            }
            case 'mul': {
                numTop = getRand(digitsTop);
                numBottom = getRand(digitsBottom);
                symbol = '×';
                result = numTop * numBottom;
                opName = 'multiplicacion';
                break;
            }
            case 'div': {
                const divisor = getRand(digitsBottom);
                const quotient = getRand(digitsTop);
                numTop = divisor * quotient;
                numBottom = divisor;
                symbol = '÷';
                result = quotient;
                opName = 'division';
                break;
            }
            case 'eq1': {
                const a1 = randRange(2, 9) * (Math.random() > 0.5 ? 1 : -1);
                const x1 = randRange(-10, 10);
                const b1 = randRange(-20, 20);
                const c1 = a1 * x1 + b1;
                symbol = '=';
                result = x1;
                opName = 'ecuacion1';
                coefficients = { a: a1, b: b1, c: c1 };
                let eq1Str = `${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x ${b1 > 0 ? '+ ' + b1 : b1 < 0 ? '- ' + Math.abs(b1) : ''} = ${c1}`;
                equation = eq1Str.trim().replace('x  ', 'x ');
                break;
            }
            case 'eq2': {
                const r1 = randRange(-8, 8);
                const r2 = randRange(-8, 8);
                const a2 = randRange(1, 2) * (Math.random() > 0.7 ? -1 : 1);
                const b2 = -a2 * (r1 + r2);
                const c2 = a2 * r1 * r2;
                symbol = '=';
                result = r1 === r2 ? [r1] : [Math.min(r1, r2), Math.max(r1, r2)];
                opName = 'ecuacion2';
                coefficients = { a: a2, b: b2, c: c2, r1, r2 };
                let eq2Str = `${a2 === 1 ? '' : a2 === -1 ? '-' : a2}x² ${b2 === 1 ? '+ x' : b2 === -1 ? '- x' : b2 > 0 ? '+ ' + b2 + 'x' : b2 < 0 ? '- ' + Math.abs(b2) + 'x' : ''} ${c2 > 0 ? '+ ' + c2 : c2 < 0 ? '- ' + Math.abs(c2) : ''} = 0`;
                equation = eq2Str.trim();
                break;
            }
            case 'eval': {
                const ae = randRange(1, 6) * (Math.random() > 0.7 ? -1 : 1);
                const be = randRange(-8, 8);
                const ce = randRange(-15, 15);
                const ke = randRange(-6, 6);
                symbol = 'val';
                result = ae * ke * ke + be * ke + ce;
                opName = 'evaluacion';
                coefficients = { a: ae, b: be, c: ce, k: ke };
                equation = `f(x) = ${ae === 1 ? '' : ae === -1 ? '-' : ae}x^2 ${be === 0 ? '' : (be > 0 ? '+ ' + be : '- ' + Math.abs(be)) + 'x'} ${ce === 0 ? '' : (ce > 0 ? '+ ' + ce : '- ' + Math.abs(ce))}`;
                break;
            }
            case 'tvm': {
                // General quadratic: ax^2 + bx + c
                const at_coeff = randRange(1, 3) * (Math.random() > 0.8 ? -1 : 1);
                const bt_coeff = randRange(-5, 5);
                const ct_coeff = randRange(-10, 10);

                const x1 = randRange(-5, 5);
                const x2 = x1 + randRange(1, 5); // Ensure x2 > x1

                const fx1 = at_coeff * x1 * x1 + bt_coeff * x1 + ct_coeff;
                const fx2 = at_coeff * x2 * x2 + bt_coeff * x2 + ct_coeff;

                symbol = 'tvm';
                result = (fx2 - fx1) / (x2 - x1);
                opName = 'tvm';
                coefficients = { a_coeff: at_coeff, b_coeff: bt_coeff, c_coeff: ct_coeff, a: x1, b: x2 };

                let eqStr = `f(x) = ${at_coeff === 1 ? '' : at_coeff === -1 ? '-' : at_coeff}x^2`;
                if (bt_coeff !== 0) eqStr += ` ${bt_coeff > 0 ? '+ ' + bt_coeff : '- ' + Math.abs(bt_coeff)}x`;
                if (ct_coeff !== 0) eqStr += ` ${ct_coeff > 0 ? '+ ' + ct_coeff : '- ' + Math.abs(ct_coeff)}`;
                equation = `${eqStr} \\text{ en } [${x1}, ${x2}]`;
                break;
            }
            case 'int_def': {
                const type = randRange(1, 3);
                let func_latex = '';
                let a = 0, b = 0, res = 0;
                let c_a, c_b, c_c;
                if (type === 1) { // cx
                    c_b = randRange(1, 5) * (Math.random() > 0.5 ? 2 : -2); // par para evitar fracciones si b^2-a^2 es impar, aunque int(cx) = c/2 x^2
                    a = randRange(-2, 2);
                    b = a + randRange(1, 3);
                    func_latex = `${c_b === 1 ? '' : c_b === -1 ? '-' : c_b}x`;
                    res = (c_b / 2) * (b * b - a * a);
                    coefficients = { type: 1, c_b, a, b };
                } else if (type === 2) { // cx^2 + d
                    c_a = randRange(1, 3) * 3; // multiplo de 3 para que int(cx^2) = cx^3/3 sea entero
                    c_c = randRange(-5, 5);
                    a = randRange(0, 2);
                    b = a + randRange(1, 2);
                    func_latex = `${c_a === 3 ? '' : c_a === -3 ? '-' : c_a / 3}x^2 ${c_c === 0 ? '' : c_c > 0 ? '+ ' + c_c : '- ' + Math.abs(c_c)}`.replace('1x^2', 'x^2');
                    res = (c_a / 3) * (b * b * b - a * a * a) + c_c * (b - a);
                    func_latex = `${c_a}x^2 ${c_c === 0 ? '' : c_c > 0 ? '+ ' + c_c : '- ' + Math.abs(c_c)}`;
                    coefficients = { type: 2, c_a, c_c, a, b };
                } else { // constante
                    c_c = randRange(-10, 10);
                    a = randRange(-5, 5);
                    b = a + randRange(1, 5);
                    func_latex = `${c_c}`;
                    res = c_c * (b - a);
                    coefficients = { type: 3, c_c, a, b };
                }
                opName = 'int_def';
                equation = `\\int_{${a}}^{${b}} (${func_latex}) dx`;
                result = res;
                symbol = 'int';
                break;
            }
            case 'lim': {
                const type = randRange(1, 3);
                if (type === 1) {
                    const kl = randRange(-5, 7);
                    const al = randRange(2, 5) * (Math.random() > 0.5 ? 1 : -1);
                    const bl = randRange(-10, 10);
                    result = al * kl + bl;
                    opName = 'limite';
                    equation = `\\lim_{x \\to ${kl}} (${al}x ${bl >= 0 ? '+ ' + bl : '- ' + Math.abs(bl)})`;
                    coefficients = { type: 1, al, bl, kl };
                } else if (type === 2) {
                    const al2 = randRange(2, 8);
                    result = 2 * al2;
                    opName = 'limite';
                    equation = `\\lim_{x \\to ${al2}} \\frac{x^2 - ${al2 * al2}}{x - ${al2}}`;
                    coefficients = { type: 2, al: al2 };
                } else {
                    const bl3 = randRange(1, 6);
                    const res_int = randRange(1, 8);
                    const al3 = bl3 * res_int;
                    result = res_int;
                    opName = 'limite';
                    equation = `\\lim_{x \\to \\infty} \\frac{${al3}x^2 + ${randRange(1, 9)}x}{${bl3}x^2 - ${randRange(1, 9)}}`;
                    coefficients = { type: 3, al: al3, bl: bl3 };
                }
                symbol = 'lim';
                break;
            }
            case 'der': {
                const typeD = randRange(1, 3);
                if (typeD === 1) {
                    const ad = randRange(2, 9);
                    const nd = randRange(2, 6);
                    opName = 'derivada';
                    equation = `f(x) = ${ad}x^${nd}`;
                    result = `${ad * nd}x^${nd - 1}`.replace('^1', '');
                    coefficients = { type: 1, ad, nd };
                } else if (typeD === 2) {
                    const ad2 = randRange(2, 6);
                    opName = 'derivada';
                    equation = `f(x) = (x^2 + 1)(${ad2}x)`;
                    result = `${3 * ad2}x^2 + ${ad2}`;
                    coefficients = { type: 2, ad: ad2 };
                } else {
                    const nd2 = randRange(2, 5);
                    opName = 'derivada';
                    equation = `f(x) = (x^2 + 1)^${nd2}`;
                    result = `${2 * nd2}x(x^2+1)^${nd2 - 1}`.replace('^1', '');
                    coefficients = { type: 3, nd: nd2 };
                }
                symbol = 'der';
                break;
            }
            default: {
                numTop = getRand(digitsTop);
                numBottom = getRand(digitsBottom);
                symbol = '+';
                result = numTop + numBottom;
                opName = 'suma';
            }
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
