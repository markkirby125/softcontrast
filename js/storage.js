const STORAGE_VERSION = 'v1';

function sanitizePresetName(name) {
    return name.replace(/[^a-z0-9\s-]/gi, '').trim().slice(0, 40);
}

export function encodeState(presetName, options = {}) {
    const name = sanitizePresetName(presetName);
    const fontSmooth = options.fontSmooth ? '1' : '0';
    const ruler = options.ruler ? '1' : '0';
    return `#${STORAGE_VERSION};${encodeURIComponent(name)};${fontSmooth}${ruler}`;
}

export function decodeState(hash) {
    if (!hash || typeof hash !== 'string') return null;
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    const parts = raw.split(';');
    if (parts.length < 2 || parts[0] !== STORAGE_VERSION) return null;

    const name = decodeURIComponent(parts[1]);
    const flags = parts[2] || '00';
    return {
        name,
        fontSmooth: flags.charAt(0) === '1',
        ruler: flags.charAt(1) === '1'
    };
}
