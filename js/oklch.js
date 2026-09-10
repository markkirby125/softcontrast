import { getContrast } from './apca.js';

function oklchToOklab(L, C, h) {
    const hr = h * Math.PI / 180;
    return [L, C * Math.cos(hr), C * Math.sin(hr)];
}

function oklabToLinearSrgb(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    return [
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
}

function linearSrgbToSrgb(lin) {
    return lin.map(val => {
        if (val <= 0.0031308) {
            return 12.92 * val;
        }
        return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    });
}

function inGamut(L, C, h) {
    const lab = oklchToOklab(L, C, h);
    const lin = oklabToLinearSrgb(...lab);
    return lin.every(v => v >= 0 && v <= 1);
}

const MAX_GAMUT_ITERATIONS = 15;

export function gamutMapOklch(L, C, h) {
    if (inGamut(L, C, h)) return [L, C, h];
    
    let minC = 0;
    let maxC = C;
    let bestC = 0;
    
    for (let i = 0; i < MAX_GAMUT_ITERATIONS; i++) {
        const midC = (minC + maxC) / 2;
        if (inGamut(L, midC, h)) {
            bestC = midC;
            minC = midC;
        } else {
            maxC = midC;
        }
    }
    return [L, bestC, h];
}

export function oklchToSrgb(L, C, h) {
    const mapped = gamutMapOklch(L, C, h);
    const lab = oklchToOklab(...mapped);
    const lin = oklabToLinearSrgb(...lab);
    const srgb = linearSrgbToSrgb(lin);
    
    return srgb.map(v => Math.max(0, Math.min(255, Math.round(v * 255))));
}

export function formatOklchCss([L, C, h]) {
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Generates an anti-halation color pair using APCA
 * Targets Lc ~60-75 by stepping lightness
 */
export function generateAntiHalationPair(baseL, baseC, baseH, isDark = true) {
    const targetLcMin = 60;
    const targetLcMax = 75;
    
    const bg = gamutMapOklch(baseL, baseC, baseH);
    const bgSrgb = oklchToSrgb(...bg);
    
    let bestText = [...bg];
    let bestContrast = 0;
    let found = false;
    
    if (isDark) {
        for (let l = 0.99; l > baseL; l -= 0.01) {
            const txtSrgb = oklchToSrgb(l, bg[1], bg[2]);
            const lc = Math.abs(getContrast(txtSrgb, bgSrgb));
            
            if (lc >= targetLcMin && lc <= targetLcMax) {
                bestText = [l, bg[1], bg[2]];
                bestContrast = lc;
                found = true;
                break;
            }
        }
        // Fallback if target not reached
        if (!found) {
            bestText = gamutMapOklch(0.95, bg[1], bg[2]);
            bestContrast = Math.abs(getContrast(oklchToSrgb(...bestText), bgSrgb));
        }
    } else {
        for (let l = 0.01; l < baseL; l += 0.01) {
            const txtSrgb = oklchToSrgb(l, bg[1], bg[2]);
            const lc = Math.abs(getContrast(txtSrgb, bgSrgb));
            
            if (lc >= targetLcMin && lc <= targetLcMax) {
                bestText = [l, bg[1], bg[2]];
                bestContrast = lc;
                found = true;
                break;
            }
        }
        // Fallback if target not reached
        if (!found) {
            bestText = gamutMapOklch(0.15, bg[1], bg[2]);
            bestContrast = Math.abs(getContrast(oklchToSrgb(...bestText), bgSrgb));
        }
    }
    
    return {
        background: bg,
        text: bestText,
        contrast: bestContrast
    };
}


