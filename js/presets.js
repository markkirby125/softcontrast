import { generateAntiHalationPair, formatOklchCss, oklchToSrgb } from './oklch.js';
import { getContrast } from './apca.js';

function createPreset(name, L, C, h, isDark) {
    const pair = generateAntiHalationPair(L, C, h, isDark);
    const bgSrgb = oklchToSrgb(...pair.background);
    const textSrgb = oklchToSrgb(...pair.text);
    const accent = pair.text;

    return {
        name,
        bg: formatOklchCss(pair.background),
        text: formatOklchCss(pair.text),
        accent: formatOklchCss(accent),
        bgOklch: pair.background,
        textOklch: pair.text,
        accentOklch: accent,
        contrast: Math.abs(getContrast(textSrgb, bgSrgb))
    };
}

export const presets = [
    createPreset("Midnight Ochre", 0.19, 0.017, 84.5, true),
    createPreset("Solar Flare Amber", 0.15, 0.04, 60, true),
    createPreset("Warm Slate", 0.20, 0.01, 260, true),
    createPreset("Sepia Paper", 0.90, 0.03, 75, false),
    createPreset("520 nm Reading", 0.15, 0.03, 145, true),
    createPreset("FL-41 Night", 0.15, 0.04, 15, true)
];

if (typeof window !== 'undefined') {
    window.softContrastPresets = presets;
}
