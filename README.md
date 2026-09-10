# SoftContrast

**Anti-Halation Reading Palette Generator**

SoftContrast is an anti-halation reading palette generator designed for readers with astigmatism, high myopia, age-related macular degeneration (AMD), and photophobia. It replaces naive WCAG 2.1 contrast ratios with the Accessible Perceptual Contrast Algorithm (APCA) and leverages the OKLCH color space to produce perceptually uniform, low-glare reading themes.

## The Science

### The Failure of High-Contrast Dark Modes
Traditional dark modes (`#000000` background with `#FFFFFF` text) often induce visual degradation known as **optical halation** (irradiation blur or ghosting). When a high-luminance white pixel sits adjacent to a zero-luminance black pixel, the human eye's Point Spread Function (PSF) scatters the photons across the retina. For users with astigmatism, this can make light text appear to smear or glow, which may cause eye strain.

### APCA vs WCAG
WCAG 2.1 contrast math uses simple relative luminance ratios that suffer from polarity blindness (treating black-on-white the same as white-on-black). SoftContrast relies on **APCA (SAPC-APCA)**, a psychophysics-driven model that uses asymmetric power curves to accurately predict suprathreshold visual contrast, accounting for spatial frequency and display physics.

### OKLCH Color Space
By utilizing the CSS Color Module Level 4 **OKLCH** color space, SoftContrast generates algorithmic palettes with high perceptual lightness uniformity and no hue shifting (unlike CIELAB), producing perceptually uniform palettes across different spectral temperatures.

## Features

- **Presets**: Midnight Ochre, Solar Flare Amber, Warm Slate, Sepia Paper, 520 nm Reading, and FL-41 Night.
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

## Part of the Vision Apps toolkit

SoftContrast is one of four accessibility tools in the [Vision Apps](https://github.com/markkirby125/vision-apps) toolkit — small, dependency-light projects that reduce visual strain for low-vision, photophobic and astigmatic readers.

| Project | What it does |
| --- | --- |
| [ChromaCalm](https://github.com/markkirby125/chromacalm) | Zero-install spectral notch filtering for photophobia, migraine and screen halation. |
| **SoftContrast** *(this repo)* | Anti-halation reading palettes built on APCA and OKLCH. |
| [terminal-a11y](https://github.com/markkirby125/terminal-a11y) | Screen-reader, photophobia, braille and sensory-budget modes for the command line. |
| [FocusBeacon](https://github.com/markkirby125/focusbeacon) | High-contrast dual-contour focus ring and a cursor radar for tunnel vision. |

## License

MIT License. See `LICENSE` for details.

## Sources
- [Myndex Research. APCA (SAPC-APCA) documentation.](https://git.apcacontrast.com/)
- [Myndex/SAPC-APCA canonical repository (GitHub).](https://github.com/Myndex/SAPC-APCA)
- [Myndex/apca-w3 — W3/AGWG-licensed reference implementation.](https://github.com/Myndex/apca-w3)
- [van den Berg TJTP. "Scattering, straylight, and glare." *Handbook of Visual Optics*. Taylor & Francis.](https://www.taylorfrancis.com/chapters/edit/10.1201/9781315373034-33/scattering-straylight-glare-thomas-van-den-273/3034-33/scattering-straylight-glare-thomas-van-den-berg)

> Note: APCA's documentation prohibits use in medical/clinical/human-safety applications without a written licence from Myndex. SoftContrast is a readability aid, not a clinical tool.
