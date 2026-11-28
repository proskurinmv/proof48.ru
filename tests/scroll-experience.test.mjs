import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexPath = new URL('../main/index.html', import.meta.url);
const motionScriptPath = new URL('../main/scroll.js', import.meta.url);
const motionStylePath = new URL('../main/scroll.css', import.meta.url);

test('page uses continuous scrolling without loading the full-screen controller', async () => {
    const html = await readFile(indexPath, 'utf8');

    assert.doesNotMatch(html, /fullscreen\.css/);
    assert.doesNotMatch(html, /fullscreen\.js/);
    assert.match(html, /<link[^>]+href="\.\/scroll\.css\?v=continuous-1"/);
    assert.match(html, /<script[^>]+src="\.\/scroll\.js\?v=continuous-1"[^>]+defer/);
});

test('all internal page links resolve and interactive elements have real destinations', async () => {
    const html = await readFile(indexPath, 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id));
    const hashes = [...html.matchAll(/<a\b[^>]*\shref="#([^"]+)"/g)].map(([, hash]) => hash);

    assert.doesNotMatch(html, /\sid=""/);
    assert.doesNotMatch(html, /<a\b[^>]*\shref=""/);
    assert.deepEqual(hashes.filter(hash => !ids.has(hash)), []);
});

test('smooth scrolling stays continuous and does not expose section-jump hooks', async () => {
    const script = await readFile(motionScriptPath, 'utf8');

    assert.match(script, /smoothWheel:\s*true/);
    assert.match(script, /anchors:\s*true/);
    assert.match(script, /lerp:\s*\.12/);
    assert.doesNotMatch(script, /proofScrollTo/);
    assert.doesNotMatch(script, /addEventListener\(['"]wheel['"]/);
    assert.doesNotMatch(script, /preventDefault\(\)/);
});

test('native fallback is smooth while reduced motion removes scroll animation', async () => {
    const styles = await readFile(motionStylePath, 'utf8');

    assert.match(styles, /html\s*\{[\s\S]*?scroll-behavior:\s*smooth/);
    assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*?scroll-behavior:\s*auto/s);
    assert.doesNotMatch(styles, /scroll-snap-type/);
});

test('parallax and replayable reveal effects remain available', async () => {
    const script = await readFile(motionScriptPath, 'utf8');

    assert.match(script, /amount\s*\*\s*44/);
    assert.match(script, /if\s*\(entry\.isIntersecting\)[\s\S]*else[\s\S]*data-motion-pending/);
    assert.match(script, /scrub:\s*\.8/);
    assert.doesNotMatch(script, /observer\.unobserve\(el\)/);
});
