import { presets } from './presets.js';
import { generateCSS, generateDTCG, generateTailwind, generateStylus, generateUserscript } from './export.js';
import { encodeState, decodeState } from './storage.js';
import { estimateFatigue, createFontSmoothingToggler, createReadingRuler } from './features.js';

document.addEventListener('DOMContentLoaded', () => {
    const buttonsContainer = document.getElementById('preset-buttons');
    const previewCard = document.getElementById('preview-card');
    const announcer = document.getElementById('announcer');
    const exportOutput = document.getElementById('export-output');
    const fontSmoothCheckbox = document.getElementById('font-smooth-toggle');
    const rulerCheckbox = document.getElementById('ruler-toggle');
    const fatigueMeter = document.getElementById('fatigue-meter');
    const fatigueLabel = document.getElementById('fatigue-label');
    const fatigueDesc = document.getElementById('fatigue-desc');

    let currentPreset = null;

    const fontSmoothToggler = createFontSmoothingToggler(document.body);
    const ruler = createReadingRuler(document.body);

    function announce(message) {
        if (announcer) announcer.textContent = message;
    }

    function updateFatigue(preset) {
        const { tier, label, description, percent } = estimateFatigue(preset.contrast);
        if (fatigueMeter) {
            fatigueMeter.value = percent;
            fatigueMeter.setAttribute('aria-valuenow', percent);
            fatigueMeter.className = `fatigue-bar ${tier}`;
        }
        if (fatigueLabel) fatigueLabel.textContent = `${label} — APCA Lc ${Math.round(preset.contrast)}`;
        if (fatigueDesc) fatigueDesc.textContent = description;
    }

    function applyPreset(preset, options = {}) {
        currentPreset = preset;
        if (previewCard) {
            previewCard.style.setProperty('--bg-color', preset.bg);
            previewCard.style.setProperty('--text-color', preset.text);
            previewCard.style.setProperty('--accent-color', preset.accent || preset.text);
        }

        fontSmoothToggler.enabled = !!options.fontSmooth;
        if (fontSmoothCheckbox) fontSmoothCheckbox.checked = !!options.fontSmooth;
        ruler.enabled = !!options.ruler;
        if (rulerCheckbox) rulerCheckbox.checked = !!options.ruler;

        updateFatigue(preset);
        if (exportOutput) exportOutput.value = '';
        announce(`Palette ${preset.name} applied`);
    }

    function updateHash() {
        if (!currentPreset) return;
        const hash = encodeState(currentPreset.name, {
            fontSmooth: fontSmoothToggler.enabled,
            ruler: ruler.enabled
        });
        history.replaceState(null, '', hash);
    }

    function renderPresetButtons() {
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.textContent = preset.name;
            btn.className = 'preset-btn';
            btn.setAttribute('aria-pressed', 'false');
            btn.addEventListener('click', () => {
                applyPreset(preset, { fontSmooth: fontSmoothToggler.enabled, ruler: ruler.enabled });
                updateActiveButton(btn);
                updateHash();
            });
            buttonsContainer.appendChild(btn);
        });
    }

    function updateActiveButton(activeBtn) {
        buttonsContainer.querySelectorAll('.preset-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
    }

    function findPresetByName(name) {
        return presets.find(p => p.name.toLowerCase() === (name || '').toLowerCase()) || presets[0];
    }

    function restoreFromHash() {
        const decoded = decodeState(window.location.hash);
        const preset = decoded ? findPresetByName(decoded.name) : presets[0];
        if (decoded && decoded.name && preset.name.toLowerCase() !== decoded.name.toLowerCase()) {
            announce(`Unknown preset "${decoded.name}"; using ${preset.name}`);
        }
        applyPreset(preset, {
            fontSmooth: decoded ? decoded.fontSmooth : false,
            ruler: decoded ? decoded.ruler : false
        });

        const buttons = Array.from(buttonsContainer.querySelectorAll('.preset-btn'));
        const activeBtn = buttons.find(b => b.textContent === preset.name) || buttons[0];
        if (activeBtn) updateActiveButton(activeBtn);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                announce('Exported code copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                announce('Export generated; clipboard copy failed');
            });
        } else {
            announce('Export generated; copy it from the text area below');
        }
    }

    function bindExportButton(id, build) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (!currentPreset) return;
            const text = build();
            if (exportOutput) exportOutput.value = text;
            copyToClipboard(text);
        });
    }

    renderPresetButtons();

    bindExportButton('export-css-btn', () => generateCSS(currentPreset));
    bindExportButton('export-dtcg-btn', () => generateDTCG(currentPreset));
    bindExportButton('export-tailwind-btn', () => generateTailwind(currentPreset));
    bindExportButton('export-stylus-btn', () => generateStylus(currentPreset));
    bindExportButton('export-userscript-btn', () => generateUserscript(currentPreset, {
        fontSmooth: fontSmoothToggler.enabled,
        ruler: ruler.enabled
    }));

    if (fontSmoothCheckbox) {
        fontSmoothCheckbox.addEventListener('change', () => {
            fontSmoothToggler.enabled = fontSmoothCheckbox.checked;
            updateHash();
        });
    }

    if (rulerCheckbox) {
        rulerCheckbox.addEventListener('change', () => {
            ruler.enabled = rulerCheckbox.checked;
            updateHash();
        });
    }

    window.addEventListener('hashchange', () => {
        restoreFromHash();
    });

    restoreFromHash();
});
