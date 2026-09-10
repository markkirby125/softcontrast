export function generateCSS(preset) {
    return `:root {
  /* Primitive Tokens */
  --sc-color-bg-base: ${preset.bg};
  --sc-color-text-base: ${preset.text};
  --sc-color-accent-base: ${preset.accent};

  /* Semantic Tokens */
  --sc-background: var(--sc-color-bg-base);
  --sc-foreground: var(--sc-color-text-base);
  --sc-primary: var(--sc-color-accent-base);

  /* Component Tokens */
  --sc-body-bg: var(--sc-background);
  --sc-body-text: var(--sc-foreground);
  --sc-link-text: var(--sc-primary);
}`;
}

export function generateDTCG(preset) {
    const tokens = {
        "softcontrast": {
            "primitive": {
                "color": {
                    "bg-base": { "$value": preset.bg, "$type": "color" },
                    "text-base": { "$value": preset.text, "$type": "color" },
                    "accent-base": { "$value": preset.accent, "$type": "color" }
                }
            },
            "semantic": {
                "background": { "$value": "{softcontrast.primitive.color.bg-base}", "$type": "color" },
                "foreground": { "$value": "{softcontrast.primitive.color.text-base}", "$type": "color" },
                "primary": { "$value": "{softcontrast.primitive.color.accent-base}", "$type": "color" }
            },
            "component": {
                "body-bg": { "$value": "{softcontrast.semantic.background}", "$type": "color" },
                "body-text": { "$value": "{softcontrast.semantic.foreground}", "$type": "color" },
                "link-text": { "$value": "{softcontrast.semantic.primary}", "$type": "color" }
            }
        }
    };
    return JSON.stringify(tokens, null, 2);
}

export function generateTailwind(preset) {
    return `@theme {
  --color-sc-bg-base: ${preset.bg};
  --color-sc-text-base: ${preset.text};
  --color-sc-accent-base: ${preset.accent};

  --color-sc-background: var(--color-sc-bg-base);
  --color-sc-foreground: var(--color-sc-text-base);
  --color-sc-primary: var(--color-sc-accent-base);
}`;
}

export function generateStylus(preset) {
    return `/* ==UserStyle==
@name           SoftContrast - ${preset.name}
@namespace      github.com/openstyles/stylus
@version        1.0.0
@description    Anti-halation reading palette
@author         SoftContrast
@var color bg "Background" ${preset.bg}
@var color text "Text" ${preset.text}
@var color accent "Accent" ${preset.accent}
==/UserStyle== */

@-moz-document regexp(".*") {
  :root {
    --sc-color-bg-base: var(--bg);
    --sc-color-text-base: var(--text);
    --sc-color-accent-base: var(--accent);
  }

  html, body {
    background-color: var(--sc-color-bg-base) !important;
    color: var(--sc-color-text-base) !important;
  }

  a, a:visited {
    color: var(--sc-color-accent-base) !important;
  }
}`;
}

export function generateUserscript(preset, options = {}) {
    const { fontSmooth = false, ruler = false } = options;
    const css = generateCSS(preset);
    const safeName = preset.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const headerName = preset.name.replace(/[\r\n*\\/]/g, '').trim();

    return `// ==UserScript==
// @name         SoftContrast - ${headerName}
// @namespace    https://github.com/softcontrast
// @version      1.0.0
// @description  Anti-halation reading palette with per-domain memory
// @author       SoftContrast
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const host = window.location.hostname || 'global';
    const defaultPalette = {
        bg: ${JSON.stringify(preset.bg)},
        text: ${JSON.stringify(preset.text)},
        accent: ${JSON.stringify(preset.accent)},
        fontSmooth: ${JSON.stringify(fontSmooth)},
        ruler: ${JSON.stringify(ruler)}
    };

    let palette = defaultPalette;
    try {
        const stored = (typeof GM_getValue !== 'undefined') ? GM_getValue(host) : null;
        if (stored) {
            palette = JSON.parse(stored);
        }
    } catch (e) {
        // ignore corrupted storage
    }

    const sheet = \`
${css.replace(/^/gm, '      ').trim()}

      html, body {
        background-color: var(--sc-color-bg-base) !important;
        color: var(--sc-color-text-base) !important;
      }

      a, a:visited, a:hover {
        color: var(--sc-color-accent-base) !important;
      }

      \${palette.fontSmooth ? \`html, body {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }\` : ''}
    \`;

    function injectStyle(cssText) {
        const style = document.createElement('style');
        style.textContent = cssText;
        style.dataset.softcontrast = '${safeName}';
        const target = document.head || document.documentElement;
        if (target) {
            target.appendChild(style);
        } else {
            // document-start fallback before <head> exists
            const observer = new MutationObserver(() => {
                if (document.head) {
                    document.head.appendChild(style);
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }
    }

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(sheet);
    } else {
        injectStyle(sheet);
    }

    if (palette.ruler) {
        const rulerEl = document.createElement('div');
        rulerEl.id = 'sc-reading-ruler';
        rulerEl.style.cssText = 'position: fixed; left: 0; right: 0; height: 2.5em; pointer-events: none; z-index: 2147483647; background: rgba(128,128,128,0.12); mix-blend-mode: difference; display: none;';
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(rulerEl);
            rulerEl.style.display = 'block';
        });
        document.addEventListener('mousemove', (e) => {
            rulerEl.style.top = (e.clientY - rulerEl.offsetHeight / 2) + 'px';
        });
    }

    try {
        if (typeof GM_setValue !== 'undefined') {
            GM_setValue(host, JSON.stringify(palette));
        }
    } catch (e) {
        // storage may be disabled
    }
})();`;
}
