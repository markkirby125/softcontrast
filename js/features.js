export function estimateFatigue(contrast) {
    const lc = Math.abs(Number(contrast) || 0);

    if (lc < 45) {
        return {
            tier: 'low',
            label: 'Low fatigue risk',
            description: 'Sub-threshold contrast may be comfortable but can reduce reading speed.',
            percent: Math.min(100, Math.round((lc / 45) * 25))
        };
    }
    if (lc <= 75) {
        return {
            tier: 'optimal',
            label: 'Optimal anti-halation zone',
            description: 'APCA Lc sits in the clinical sweet spot for sustained reading.',
            percent: Math.min(100, Math.round(25 + ((lc - 45) / 30) * 25))
        };
    }
    if (lc <= 90) {
        return {
            tier: 'elevated',
            label: 'Elevated halation risk',
            description: 'High contrast can trigger irradiation blur for astigmatic or low-vision readers.',
            percent: Math.min(100, Math.round(50 + ((lc - 75) / 15) * 25))
        };
    }
    return {
        tier: 'high',
        label: 'High fatigue risk',
        description: 'Extreme contrast may cause severe ghosting and eye strain over time.',
        percent: Math.min(100, Math.round(75 + ((lc - 90) / 30) * 25))
    };
}

export function createFontSmoothingToggler(rootElement) {
    const className = 'sc-font-smooth';

    return {
        get enabled() {
            return rootElement.classList.contains(className);
        },
        set enabled(value) {
            if (value) {
                rootElement.classList.add(className);
            } else {
                rootElement.classList.remove(className);
            }
        },
        toggle() {
            this.enabled = !this.enabled;
            return this.enabled;
        }
    };
}

export function createReadingRuler(container) {
    const ruler = document.createElement('div');
    ruler.className = 'sc-reading-ruler';
    ruler.setAttribute('aria-hidden', 'true');
    ruler.hidden = true;
    container.appendChild(ruler);

    const step = 20;

    function setTop(y) {
        ruler.style.top = `${y - ruler.offsetHeight / 2}px`;
    }

    function onMove(e) {
        const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        setTop(y);
    }

    function onKey(e) {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        const currentTop = parseFloat(ruler.style.top) || 0;
        const delta = e.key === 'ArrowUp' ? -step : step;
        setTop(currentTop + ruler.offsetHeight / 2 + delta);
    }

    return {
        get enabled() {
            return !ruler.hidden;
        },
        set enabled(value) {
            ruler.hidden = !value;
            if (value) {
                if (!ruler.style.top) {
                    setTop(window.innerHeight / 2);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: true });
                document.addEventListener('keydown', onKey);
            } else {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('keydown', onKey);
            }
        },
        toggle() {
            this.enabled = !this.enabled;
            return this.enabled;
        },
        destroy() {
            this.enabled = false;
            if (ruler.parentNode) {
                ruler.parentNode.removeChild(ruler);
            }
        }
    };
}
