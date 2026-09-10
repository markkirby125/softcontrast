/**
 * SoftContrast — APCA Contrast Engine
 * Implementation based on standard SAPC-APCA 0.0.98G-4g math
 * (Accessible Perceptual Contrast Algorithm)
 */

export const SA98G = {
    mainTRC: 2.4, // 2.4 exponent for emulating actual monitor perception
    
    // sRGB coefficients
    sRco: 0.2126729, 
    sGco: 0.7151522, 
    sBco: 0.0721750, 
    
    // G-4g constants for use with 2.4 exponent
    normBG: 0.56, 
    normTXT: 0.57,
    revTXT: 0.62,
    revBG: 0.65,
    
    // G-4g Clamps and Scalers
    blkThrs: 0.022,
    blkClmp: 1.414, 
    scaleBoW: 1.14,
    scaleWoB: 1.14,
    loBoWoffset: 0.027,
    loWoBoffset: 0.027,
    deltaYmin: 0.0005,
    loClip: 0.1,
};

/**
 * Parses numeric sRGB values [0-255] or hex string to array [r, g, b]
 * @param {string|number[]} color 
 * @returns {number[]}
 */
export function parseColor(color) {
    if (Array.isArray(color) && color.length >= 3) {
        return color.slice(0, 3);
    }
    if (typeof color === 'string') {
        const hex = color.replace(/^#/, '');
        if (hex.length === 3) {
            return [
                parseInt(hex[0]+hex[0], 16),
                parseInt(hex[1]+hex[1], 16),
                parseInt(hex[2]+hex[2], 16)
            ];
        }
        if (hex.length === 6 || hex.length === 8) {
            return [
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16)
            ];
        }
    }
    throw new Error('Invalid color format');
}

/**
 * Calculates Relative Luminance (Y) from sRGB color array
 * @param {number[]} srgbArray [r,g,b] (0-255)
 * @returns {number} Relative luminance (0.0 to 1.0)
 */
export function sRGBtoY(srgbArray) {
    const r = Math.max(0, Math.min(1, srgbArray[0] / 255.0));
    const g = Math.max(0, Math.min(1, srgbArray[1] / 255.0));
    const b = Math.max(0, Math.min(1, srgbArray[2] / 255.0));

    const trc = SA98G.mainTRC;

    return Math.pow(r, trc) * SA98G.sRco + 
           Math.pow(g, trc) * SA98G.sGco + 
           Math.pow(b, trc) * SA98G.sBco;
}

/**
 * Calculates APCA Contrast (Lc)
 * @param {number} txtY - Text relative luminance (0.0 - 1.0)
 * @param {number} bgY - Background relative luminance (0.0 - 1.0)
 * @returns {number} Signed numeric APCA contrast (Lc)
 */
export function calcAPCA(txtY, bgY) {
    if (isNaN(txtY) || isNaN(bgY) || Math.min(txtY, bgY) < 0.0 || Math.max(txtY, bgY) > 1.1) {
        return 0.0;
    }

    // Soft Toe black clamp
    let clampTxtY = (txtY > SA98G.blkThrs) ? txtY : txtY + Math.pow(SA98G.blkThrs - txtY, SA98G.blkClmp);
    let clampBgY = (bgY > SA98G.blkThrs) ? bgY : bgY + Math.pow(SA98G.blkThrs - bgY, SA98G.blkClmp);

    // Return early for very close luminances
    if (Math.abs(clampBgY - clampTxtY) < SA98G.deltaYmin) {
        return 0.0;
    }

    let SAPC = 0.0;
    let outputContrast = 0.0;

    if (clampBgY > clampTxtY) { 
        // Normal polarity: Black on White (BoW)
        SAPC = (Math.pow(clampBgY, SA98G.normBG) - Math.pow(clampTxtY, SA98G.normTXT)) * SA98G.scaleBoW;
        outputContrast = (SAPC < SA98G.loClip) ? 0.0 : SAPC - SA98G.loBoWoffset;
    } else { 
        // Reverse polarity: White on Black (WoB)
        SAPC = (Math.pow(clampBgY, SA98G.revBG) - Math.pow(clampTxtY, SA98G.revTXT)) * SA98G.scaleWoB;
        outputContrast = (SAPC > -SA98G.loClip) ? 0.0 : SAPC + SA98G.loWoBoffset;
    }

    return outputContrast * 100.0;
}

/**
 * Helper to calculate contrast directly from color strings
 * @param {string|number[]} textColor 
 * @param {string|number[]} bgColor 
 * @returns {number}
 */
export function getContrast(textColor, bgColor) {
    const txtY = sRGBtoY(parseColor(textColor));
    const bgY = sRGBtoY(parseColor(bgColor));
    return calcAPCA(txtY, bgY);
}
