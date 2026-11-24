import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexPath = new URL('../main/index.html', import.meta.url);
const fullscreenScriptPath = new URL('../main/fullscreen.js', import.meta.url);
const fullscreenStylePath = new URL('../main/fullscreen.css', import.meta.url);
const motionScriptPath = new URL('../main/scroll.js', import.meta.url);

test('page loads the current full-screen fit files', async () => {
    const html = await readFile(indexPath, 'utf8');

    assert.match(html, /<link[^>]+href="\.\/fullscreen\.css\?v=fit-11"/);
    assert.match(html, /<script[^>]+src="\.\/fullscreen\.js\?v=fit-11"[^>]+defer/);
    assert.match(html, /<script[^>]+src="\.\/scroll\.js\?v=fullscreen-9"[^>]+defer/);
    assert.equal((html.match(/class="fullscreen-section__body"/g) || []).length, 10);
});

test('all internal page links resolve and interactive elements have real destinations', async () => {
    const html = await readFile(indexPath, 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id));
    const hashes = [...html.matchAll(/<a\b[^>]*\shref="#([^"]+)"/g)].map(([, hash]) => hash);

    assert.doesNotMatch(html, /\sid=""/);
    assert.doesNotMatch(html, /<a\b[^>]*\shref=""/);
    assert.deepEqual(hashes.filter(hash => !ids.has(hash)), []);
});

test('each chapter scales into the viewport without internal clipping or scrolling', async () => {
    const styles = await readFile(fullscreenStylePath, 'utf8');

    assert.match(styles, /\.fullscreen\s+\.fullscreen-section__body\s*\{[\s\S]*top:\s*var\(--fullscreen-header/s);
    assert.match(styles, /height:\s*var\(--fullscreen-fit-height/);
    assert.match(styles, /padding-block:\s*var\(--fullscreen-edge-block\)/);
    assert.match(styles, /max-width:\s*576px[\s\S]*--fullscreen-edge-block:\s*var\(--space-16\)/);
    assert.match(styles, /\.fullscreen\s+\.fullscreen-section__body\s*>\s*\*\s*\{[\s\S]*transform:\s*translate3d\(0,[^;]*var\(--fullscreen-fit-offset-y[^;]*scale\(var\(--fullscreen-fit-scale/s);
    assert.match(styles, /transform-origin:\s*top left/);
    assert.match(styles, /width:\s*100%/);
    assert.doesNotMatch(styles, /\.fullscreen\s+\.fullscreen-section__body\s*\{[\s\S]*?zoom:/s);
    assert.match(styles, /overflow-y:\s*hidden/);
});

test('fit values are recalculated vertically without moving text toward viewport edges', async () => {
    const script = await readFile(fullscreenScriptPath, 'utf8');

    assert.match(script, /fitSections/);
    assert.match(script, /Math\.min\(window\.innerHeight,\s*window\.visualViewport\?\.height\s*\|\|\s*window\.innerHeight\)/);
    assert.match(script, /body\.firstElementChild/);
    assert.match(script, /content\.scrollHeight/);
    assert.doesNotMatch(script, /content\.scrollWidth/);
    assert.doesNotMatch(script, /availableContentWidth/);
    assert.doesNotMatch(script, /const offsetX\s*=/);
    assert.match(script, /getBoundingClientRect/);
    assert.match(script, /--fullscreen-fit-scale/);
    assert.doesNotMatch(script, /--fullscreen-fit-offset-x/);
    assert.match(script, /--fullscreen-fit-offset-y/);
    assert.match(script, /--fullscreen-fit-height/);
    assert.match(script, /document\.fonts/);
    assert.match(script, /ResizeObserver[\s\S]*observe\(content\)/);
    assert.match(script, /visualViewport\?\.addEventListener\(['"]resize['"]/);
    assert.match(script, /addEventListener\(['"]resize['"]/);
});

test('chapter navigation eases smoothly while keeping the first response immediate', async () => {
    const fullscreenScript = await readFile(fullscreenScriptPath, 'utf8');
    const motionScript = await readFile(motionScriptPath, 'utf8');

    assert.match(fullscreenScript, /duration\s*=\s*520/);
    assert.match(fullscreenScript, /1\s*-\s*Math\.pow\(1\s*-\s*t,\s*3\)/);
    assert.match(fullscreenScript, /gestureTimer\s*=\s*setTimeout\([\s\S]*?90\)/);
    assert.match(motionScript, /duration:\s*\.52/);
    assert.match(fullscreenScript, /passive:\s*false/);
});

test('chapter depth motion uses compositor properties and has a reduced-motion fallback', async () => {
    const [styles, fullscreenScript] = await Promise.all([
        readFile(fullscreenStylePath, 'utf8'),
        readFile(fullscreenScriptPath, 'utf8'),
    ]);

    assert.match(fullscreenScript, /updateChapterMotion/);
    assert.match(fullscreenScript, /--fullscreen-chapter-shift/);
    assert.match(fullscreenScript, /--fullscreen-chapter-opacity/);
    assert.match(fullscreenScript, /fine\.matches\s*\?\s*72\s*:\s*34/);
    assert.match(fullscreenScript, /Math\.abs\(distance\)\s*\*\s*0\.5/);
    assert.match(styles, /translate3d\(0,\s*calc\(var\(--fullscreen-fit-offset-y[^;]+var\(--fullscreen-chapter-shift/s);
    assert.match(styles, /opacity:\s*var\(--fullscreen-chapter-opacity/);
    assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*--fullscreen-chapter-shift:\s*0px/s);
    assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*--fullscreen-chapter-opacity:\s*1/s);
});

test('native image and content effects visibly replay whenever a chapter re-enters', async () => {
    const motionScript = await readFile(motionScriptPath, 'utf8');

    assert.match(motionScript, /amount\s*\*\s*44/);
    assert.match(motionScript, /if\s*\(entry\.isIntersecting\)[\s\S]*else[\s\S]*data-motion-pending/);
    assert.doesNotMatch(motionScript, /observer\.unobserve\(el\)/);
});
