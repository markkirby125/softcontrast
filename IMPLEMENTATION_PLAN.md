# SoftContrast — Implementation Plan

## Overview
SoftContrast is an anti-halation reading palette generator leveraging the Accessible Perceptual Contrast Algorithm (APCA) and OKLCH color science to eliminate visual degradation (irradiation blur, ghosting) for low-vision and astigmatic populations. It outputs cross-browser userstyles and userscripts.

## Scope Definition
### In Scope
- APCA algorithm implementation for contrast calculation
- OKLCH color space manipulation
- CSS token system generation (Primitive, Semantic, Component)
- Preset library (6 palettes: Midnight Ochre, Solar Flare Amber, Warm Slate, Sepia Paper, 520 nm Reading, FL-41 Night)
- UI shell for palette preview and selection
- Export systems for DTCG JSON, Tailwind `@theme`, Stylus UserCSS, and Tampermonkey UserScripts
- FOUC elimination mechanism
- Visual Fatigue Estimator
- Font Rendering Toggle & Reading Ruler
- LocalStorage per-domain memory
- URL Hash State Serialization

### Out of Scope
- Server-side rendering or backend data storage
- Account creation or user login
- Browser extension packaging (relying on Stylus/Tampermonkey instead)
- Non-web desktop applications

## Technical Architecture
- **Language**: Vanilla HTML/CSS/JavaScript
- **Color Science**: OKLCH for uniformity, APCA (SAPC) for contrast
- **Tokens**: 3-tier CSS Custom Properties (Primitive, Semantic, Component)
- **Injection Strategy**: `@run-at document-start` Tampermonkey scripts, UserCSS Stylus injection bypassing CSP
- **Storage**: `localStorage` (per-domain keying), URL Hash for shareable states

## File Map
- `index.html` (UI shell, preview canvas, and FOUC elimination)
- `css/style.css` (Base styling and preview layout)
- `js/apca.js` (APCA 0.0.98G-4g math implementation)
- `js/oklch.js` (Color manipulation, gamut mapping, palette ramp generator)
- `js/presets.js` (The 6 curated palettes)
- `js/export.js` (Logic for CSS, DTCG, Stylus, Tampermonkey string generation)
- `js/features.js` (Fatigue estimator, reading ruler, font rendering toggle)
- `js/storage.js` (URL hash and localStorage management)
- `js/app.js` (Main controller binding UI to logic)
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/labels.yml`
- `.github/milestones.yml`
- `README.md`
- `LICENSE`
- `.gitignore`
- `IMPLEMENTATION_PLAN.md`

## Implementation Phases
### Phase 1: ✅ APCA Contrast Engine
- **Goal**: Implement standard APCA math (SAPC-APCA) for polarity-aware suprathreshold contrast.
- **Files touched**: `js/apca.js`
- **Steps**:
  1. Implement sRGB to relative luminance conversion.
  2. Implement SoftToe black clamp.
  3. Implement normal (BoW) and reverse (WoB) polarity power curve difference equations.
- **Verification criteria**: Known APCA test pairs match reference Lc outputs (e.g., #FFFFFF on #000000 = -106).

### Phase 2: ✅ OKLCH Palette Generator
- **Goal**: Implement OKLCH parsing and algorithmic ramp generation.
- **Files touched**: `js/oklch.js`
- **Steps**:
  1. Add function to parse OKLCH and compute CSS string representations.
  2. Implement `generateAntiHalationPair` which targets Lc ~60-75 by stepping lightness in OKLCH.
  3. Include binary-search gamut mapping logic if necessary for sRGB bounds.
- **Verification criteria**: Generated background/text pairs achieve target APCA scores without exceeding sRGB boundaries.

### Phase 3: ✅ Preset Library (all 6 palettes)
- **Goal**: Hardcode the curated clinical palettes.
- **Files touched**: `js/presets.js`
- **Steps**:
  1. Define Midnight Ochre (141416 / D6D0C4).
  2. Define Solar Flare Amber.
  3. Define Warm Slate.
  4. Define Sepia Paper.
  5. Define 520 nm Reading.
  6. Define FL-41 Night.
- **Verification criteria**: Array of 6 objects available globally with name, bg, text, and accent colors.

### Phase 4: ✅ UI Shell — Palette Picker
- **Goal**: Build the frontend interface to test and select palettes.
- **Files touched**: `index.html`, `css/style.css`, `js/app.js`
- **Steps**:
  1. Create main HTML skeleton with semantic tags.
  2. Add buttons/dropdowns for selecting the 6 presets.
  3. Add a live preview article/card displaying the colors in realtime.
- **Verification criteria**: Clicking a preset instantly updates the preview pane's CSS variables.

### Phase 5: ✅ CSS Token Export (custom props, DTCG JSON, Tailwind)
- **Goal**: Generate copy-paste developer tokens.
- **Files touched**: `js/export.js`
- **Steps**:
  1. Write CSS custom property formatter (`:root { ... }`).
  2. Write DTCG JSON formatter.
  3. Write Tailwind v4 `@theme` formatter.
- **Verification criteria**: Formatted text blocks match the architecture specified in the research doc.

### Phase 6: ✅ Stylus UserCSS Generator
- **Goal**: Output a valid UserCSS block.
- **Files touched**: `js/export.js`
- **Steps**:
  1. Generate `==UserStyle==` metadata block.
  2. Include `@var` directives.
  3. Output the `@-moz-document` regexp block with non-destructive DOM overrides.
- **Verification criteria**: Output can be pasted directly into Stylus extension without parsing errors.

### Phase 7: ✅ Tampermonkey Userscript Generator (with FOUC elimination)
- **Goal**: Output a valid Userscript for CSP bypassing and early injection.
- **Files touched**: `js/export.js`
- **Steps**:
  1. Generate `==UserScript==` metadata with `@run-at document-start` and `@match *://*/*`.
  2. Include fallback DOM injection logic for `document.documentElement` if `GM_addStyle` fails.
  3. Ensure styles are injected before HTML body parsing.
- **Verification criteria**: Output installs seamlessly into Tampermonkey and applies styles before body paints.

### Phase 8: ✅ URL Hash Share System
- **Goal**: Serialize current palette state into the URL fragment.
- **Files touched**: `js/storage.js`, `js/app.js`
- **Steps**:
  1. Build hash encoder mapping bg, fg, link, and Lc to `#key=val`.
  2. Build hash decoder to read URL fragment on load and apply custom palette.
  3. Update hash immediately when the active palette changes.
- **Verification criteria**: Refreshing the page with a populated hash perfectly restores the custom palette view.

### Phase 9: ✅ Visual Fatigue Estimator
- **Goal**: Calculate and display halation risk scores.
- **Files touched**: `js/features.js`, `js/app.js`, `index.html`
- **Steps**:
  1. Build a function that calculates APCA Lc for current selection.
  2. Map Lc magnitude to risk tiers: Low, Medium, High (Halation Risk).
  3. Display score dynamically in the UI shell.
- **Verification criteria**: Pure white on black triggers "High Risk", while Midnight Ochre shows "Low Risk / Optimal".

### Phase 10: ✅ Per-Domain Memory (localStorage)
- **Goal**: Allow userscripts to remember per-site overrides.
- **Files touched**: `js/export.js` (Tampermonkey script generation)
- **Steps**:
  1. Add `GM_setValue` / `GM_getValue` to the userscript template.
  2. Tie it to `window.location.hostname`.
- **Verification criteria**: Generated userscript correctly retrieves custom preference for the current site.

### Phase 11: ✅ Font Rendering Toggle + Reading Ruler
- **Goal**: Implement spatial accessibility tools.
- **Files touched**: `js/features.js`, `js/export.js`, `index.html`
- **Steps**:
  1. Add `-webkit-font-smoothing` class toggles to UI and exported CSS.
  2. Build JS listener for cursor Y-position to move a 15% opacity horizontal highlight band.
  3. Integrate the ruler into the Stylus/Userscript export.
- **Verification criteria**: Ruler accurately tracks mouse vertically; font smoothing toggle visibly changes text aliasing.

### Phase 12: ✅ GitHub Pages Deployment + README
- **Goal**: Finalize documentation and deployment.
- **Files touched**: `README.md`
- **Steps**:
  1. Complete README with clinical context, screenshots placeholder, and installation instructions.
  2. Verify all paths in `index.html` are relative.
- **Verification criteria**: Repo structure is flat/clean enough to be directly hosted on GitHub Pages root.

## GitHub Project Setup
### Labels
- `apca`
- `oklch`
- `palette`
- `userstyle`
- `userscript`
- `token-export`
- `halation`
- `low-vision`
- `a11y`
- `bug`
- `enhancement`
- `documentation`

### Milestones
- `v0.1` (APCA engine + presets)
- `v0.2` (export system)
- `v0.3` (Stylus/Tampermonkey output)
- `v1.0` (Full release)

### Issue Templates
- Bug Report (`.github/ISSUE_TEMPLATE/bug_report.md`)
- Feature Request (`.github/ISSUE_TEMPLATE/feature_request.md`)
