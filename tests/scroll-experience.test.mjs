import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const indexPath = new URL('../main/index.html', import.meta.url);
const scriptPath = new URL('../main/scroll.js', import.meta.url);
const stylePath = new URL('../main/scroll.css', import.meta.url);

test('page loads the current scroll scene files', async () => {
    const html = await readFile(indexPath, 'utf8');

    assert.match(html, /<link[^>]+href="\.\/scroll\.css\?v=scroll-4"/);
    assert.match(html, /<script[^>]+src="\.\/scroll\.js\?v=scroll-4"[^>]+defer/);
    await Promise.all([readFile(scriptPath, 'utf8'), readFile(stylePath, 'utf8')]);
});

test('every top-level section participates in the desktop stack', async () => {
    const styles = await readFile(stylePath, 'utf8');

    assert.match(styles, /\.scroll-enhanced\s+main\s*>\s*section\s*\{[^}]*position:\s*sticky/s);
    assert.match(styles, /main\s*>\s*section:not\(:first-child\)\s*\{[^}]*margin-top:\s*calc\(var\(--space-32\)\s*\*\s*-1\)/s);
    assert.match(styles, /border-radius:\s*var\(--radius-2xl\)\s+var\(--radius-2xl\)\s+0\s+0/);
    assert.match(styles, /main\s*>\s*section::after[\s\S]*opacity:\s*var\(--stack-dim/);
    assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test('each incoming section pushes the previous section into depth', async () => {
    const script = await readFile(scriptPath, 'utf8');
    const windowListeners = new Map();
    const animationFrames = [];
    const classNames = new Set();
    const createStyle = () => ({
        setProperty(name, value) {
            this[name] = value;
        },
        removeProperty(name) {
            delete this[name];
        },
    });
    const sectionAtTop = { style: createStyle(), getBoundingClientRect: () => ({ top: 0 }) };
    const incomingSection = { style: createStyle(), getBoundingClientRect: () => ({ top: 450 }) };
    const followingSection = { style: createStyle(), getBoundingClientRect: () => ({ top: 1300 }) };
    const sections = [sectionAtTop, incomingSection, followingSection];
    const documentElement = {
        classList: {
            add: (value) => classNames.add(value),
            remove: (value) => classNames.delete(value),
        },
    };
    const document = {
        documentElement,
        querySelectorAll: (selector) => selector === 'main > section' ? sections : [],
    };
    const window = {
        innerHeight: 900,
        matchMedia: (query) => ({
            matches: query.includes('min-width: 769px'),
            addEventListener() {},
        }),
        addEventListener: (type, handler, options) => {
            windowListeners.set(type, { handler, options });
        },
    };

    vm.runInNewContext(script, {
        document,
        requestAnimationFrame: (callback) => {
            animationFrames.push(callback);
            return animationFrames.length;
        },
        window,
    });

    animationFrames.shift()();

    assert.equal(sectionAtTop.style.zIndex, '1');
    assert.equal(incomingSection.style.zIndex, '2');
    assert.equal(followingSection.style.zIndex, '3');
    assert.equal(sectionAtTop.style.transform, 'translate3d(0, -16px, 0) scale(0.9875)');
    assert.equal(sectionAtTop.style.opacity, undefined);
    assert.equal(sectionAtTop.style['--stack-dim'], '0.075');
    assert.equal(incomingSection.style.transform, 'translate3d(0, -0px, 0) scale(1)');
    assert.equal(classNames.has('scroll-enhanced'), true);
    assert.equal(windowListeners.get('scroll').options.passive, true);
    assert.equal(windowListeners.has('wheel'), false);
});

test('mobile and reduced-motion modes keep the normal document flow', async () => {
    const styles = await readFile(stylePath, 'utf8');
    const script = await readFile(scriptPath, 'utf8');

    assert.match(script, /prefers-reduced-motion/);
    assert.match(script, /min-width:\s*769px/);
    assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*position:\s*relative/);
    assert.doesNotMatch(script, /addEventListener\(['"]wheel['"]/);
});
