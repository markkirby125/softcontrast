import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeState, decodeState } from '../js/storage.js';
import { estimateFatigue } from '../js/features.js';

test('hash round-trips for real preset names', () => {
    for (const name of ['Midnight Ochre', 'Solar Flare Amber', '520 nm Reading', 'FL-41 Night']) {
        const d = decodeState(encodeState(name, { fontSmooth: true, ruler: false }));
        assert.equal(d.name, name);
        assert.equal(d.fontSmooth, true);
        assert.equal(d.ruler, false);
    }
});

test('decodeState rejects malformed input without throwing', () => {
    assert.equal(decodeState(''), null);
    assert.equal(decodeState('#garbage'), null);
    assert.equal(decodeState('#v2;X;00'), null);
    // malformed percent-encoding must not throw (regression: URIError crash)
    assert.doesNotThrow(() => decodeState('#v1;%E0%A4%A;00'));
    assert.equal(decodeState('#v1;%E0%A4%A;00'), null);
});

test('decodeState parses flag bits', () => {
    assert.equal(decodeState('#v1;X;10').fontSmooth, true);
    assert.equal(decodeState('#v1;X;10').ruler, false);
    assert.equal(decodeState('#v1;X;01').fontSmooth, false);
    assert.equal(decodeState('#v1;X;01').ruler, true);
});

test('estimateFatigue is monotonic and bounded 0-100', () => {
    let prev = -1;
    for (let lc = 0; lc <= 130; lc++) {
        const { percent } = estimateFatigue(lc);
        assert.ok(percent >= prev, `non-monotonic at ${lc}`);
        assert.ok(percent >= 0 && percent <= 100, `out of bounds at ${lc}`);
        prev = percent;
    }
});

test('estimateFatigue tiers are sane', () => {
    assert.equal(estimateFatigue(30).tier, 'low');
    assert.equal(estimateFatigue(60).tier, 'optimal');
    assert.equal(estimateFatigue(80).tier, 'elevated');
    assert.equal(estimateFatigue(95).tier, 'high');
});
