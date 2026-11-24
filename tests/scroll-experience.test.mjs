import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexPath = new URL('../main/index.html', import.meta.url);
const fullscreenScriptPath = new URL('../main/fullscreen.js', import.meta.url);
const fullscreenStylePath = new URL('../main/fullscreen.css', import.meta.url);
const motionScriptPath = new URL('../main/scroll.js', import.meta.url);

test('page loads the current full-screen fit files', async () => {
    const html = await readFile(indexPath, 'utf8');

    assert.match(html, /<link[^>]+href="\.\/fullscreen\.css\?v=fit-7"/);
    assert.match(html, /<script[^>]+src="\.\/fullscreen\.js\?v=fit-7"[^>]+defer/);
    assert.match(html, /<script[^>]+src="\.\/scroll\.js\?v=fullscreen-7"[^>]+defer/);
    assert.equal((html.match(/class="fullscreen-section__body"/g) || []).length, 10);
});

test('each chapter scales into the viewport without internal clipping or scrolling', async () => {
    const styles = await readFile(fullscreenStylePath, 'utf8');

    assert.match(styles, /\.fullscreen\s+\.fullscreen-section__body\s*\{[\s\S]*top:\s*var\(--fullscreen-header/s);
    assert.match(styles, /height:\s*var\(--fullscreen-fit-height/);
    assert.match(styles, /\.fullscreen\s+\.fullscreen-section__body\s*>\s*\*\s*\{[\s\S]*transform:\s*translateY\(var\(--fullscreen-fit-offset-y[^;]*scale\(var\(--fullscreen-fit-scale/s);
    assert.match(styles, /transform-origin:\s*top left/);
    assert.match(styles, /width:\s*100%/);
    assert.doesNotMatch(styles, /\.fullscreen\s+\.fullscreen-section__body\s*\{[\s\S]*?zoom:/s);
    assert.match(styles, /overflow-y:\s*hidden/);
});

test('fit values are recalculated vertically without moving text toward viewport edges', async () => {
    const script = await readFile(fullscreenScriptPath, 'utf8');

    assert.match(script, /fitSections/);
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
    assert.match(script, /visualViewport\?\.addEventListener\(['"]resize['"]/);
    assert.match(script, /addEventListener\(['"]resize['"]/);
});

test('chapter navigation responds quickly and keeps native wheel handling', async () => {
    const fullscreenScript = await readFile(fullscreenScriptPath, 'utf8');
    const motionScript = await readFile(motionScriptPath, 'utf8');

    assert.match(fullscreenScript, /duration\s*=\s*420/);
    assert.match(fullscreenScript, /gestureTimer\s*=\s*setTimeout\([\s\S]*?90\)/);
    assert.match(motionScript, /duration:\s*\.45/);
    assert.match(fullscreenScript, /passive:\s*false/);
});
