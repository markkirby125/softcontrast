# SoftContrast

**Anti-Halation Reading Palette Generator**

SoftContrast is a clinical-grade, anti-halation reading palette generator designed for populations with astigmatism, high myopia, age-related macular degeneration (AMD), and photophobia. It replaces naive WCAG 2.1 contrast ratios with the Accessible Perceptual Contrast Algorithm (APCA) and leverages the OKLCH color space to produce perceptually uniform, halation-proof reading themes.

## The Science

### The Failure of High-Contrast Dark Modes
Traditional dark modes (`#000000` background with `#FFFFFF` text) often induce visual degradation known as **optical halation** (irradiation blur or ghosting). When a high-luminance white pixel sits adjacent to a zero-luminance black pixel, the human eye's Point Spread Function (PSF) scatters the photons across the retina. For users with astigmatism, this causes light text to smear and glow, triggering severe eye strain.

### APCA vs WCAG
WCAG 2.1 contrast math uses simple relative luminance ratios that suffer from polarity blindness (treating black-on-white the same as white-on-black). SoftContrast relies on **APCA (SAPC-APCA)**, a psychophysics-driven model that uses asymmetric power curves to accurately predict suprathreshold visual contrast, accounting for spatial frequency and display physics.

### OKLCH Color Space
By utilizing the CSS Color Module Level 4 **OKLCH** color space, SoftContrast generates algorithmic palettes with perfect perceptual lightness uniformity and no hue shifting (unlike CIELAB), guaranteeing readable contrasts across different spectral temperatures.

## Features

- **Clinical Presets**: Midnight Ochre, Solar Flare Amber, Warm Slate, Sepia Paper, 520 nm Reading, and FL-41 Night.
- **Cross-Browser Export**: Instantly export palettes to CSS Variables, Tailwind v4 `@theme`, DTCG JSON tokens, Stylus UserCSS, and Tampermonkey Userscripts.
- **Universal Injection**: Userscripts eliminate FOUC with `@run-at document-start` and remember your last palette per domain using `GM_setValue` / `GM_getValue`.
- **Visual Fatigue Estimator**: Real-time evaluation of halation risk based on the APCA contrast value.
- **Reading Ruler**: Horizontal highlight band following your cursor to prevent line-skipping.
- **Font Smoothing Toggle**: Quickly enable or disable subpixel anti-aliasing in the preview.
- **Privacy-First**: No servers, no accounts. Shareable state is encoded entirely in the URL hash.

## Installation & Usage

1. **Web Version**: Visit [SoftContrast on GitHub Pages](https://markkirby125.github.io/softcontrast/) to use the interactive generator.
2. **Userscript**: Select a palette, choose your reading aids, and click "Copy Tampermonkey". Paste the generated code into your userscript manager to apply it globally across the web.
3. **UserCSS**: Click "Copy Stylus" and paste into the Stylus extension for CSS-based, lightweight injection.

## Contributing

Contributions are welcome! Please review the open issues and match PRs against the implementation plan outlined in `IMPLEMENTATION_PLAN.md`.

## License

MIT License. See `LICENSE` for details.
