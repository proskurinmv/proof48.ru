import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

class FakeClassList {
    constructor() {
        this.values = new Set();
    }

    contains(value) {
        return this.values.has(value);
    }

    toggle(value, force) {
        if (force === true) this.values.add(value);
        else if (force === false) this.values.delete(value);
        else if (this.values.has(value)) this.values.delete(value);
        else this.values.add(value);
    }
}

class FakeElement {
    constructor() {
        this.attributes = new Map();
        this.classList = new FakeClassList();
        this.listeners = new Map();
        this.focused = false;
    }

    addEventListener(type, handler) {
        const handlers = this.listeners.get(type) ?? [];
        handlers.push(handler);
        this.listeners.set(type, handlers);
    }

    dispatch(type, event = {}) {
        for (const handler of this.listeners.get(type) ?? []) {
            handler({ preventDefault() {}, ...event });
        }
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    getAttribute(name) {
        return this.attributes.get(name) ?? null;
    }

    focus() {
        this.focused = true;
    }

    contains(target) {
        return target === this;
    }
}

function createHarness() {
    const header = new FakeElement();
    const toggle = new FakeElement();
    const navigation = new FakeElement();
    const link = new FakeElement();
    const body = new FakeElement();
    const documentListeners = new Map();
    const mediaListeners = [];

    navigation.querySelectorAll = () => [link];
    header.querySelector = (selector) => ({
        '[data-header-toggle]': toggle,
        '[data-header-navigation]': navigation,
    })[selector] ?? null;

    const document = {
        body,
        querySelector: (selector) => selector === '[data-header]' ? header : null,
        addEventListener(type, handler) {
            const handlers = documentListeners.get(type) ?? [];
            handlers.push(handler);
            documentListeners.set(type, handlers);
        },
        dispatch(type, event = {}) {
            for (const handler of documentListeners.get(type) ?? []) handler(event);
        },
    };

    const media = {
        matches: false,
        addEventListener(type, handler) {
            if (type === 'change') mediaListeners.push(handler);
        },
        setMatches(matches) {
            this.matches = matches;
            for (const handler of mediaListeners) handler({ matches });
        },
    };

    return {
        body,
        document,
        header,
        link,
        media,
        navigation,
        toggle,
        window: { matchMedia: () => media },
    };
}

async function runHeaderScript(harness) {
    const source = await readFile(new URL('../main/header.js', import.meta.url), 'utf8');
    vm.runInNewContext(source, {
        document: harness.document,
        window: harness.window,
    });
}

test('mobile menu exposes its state and closes on Escape', async () => {
    const harness = createHarness();
    await runHeaderScript(harness);

    assert.equal(harness.toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(harness.navigation.getAttribute('aria-hidden'), 'true');

    harness.toggle.dispatch('click');
    assert.equal(harness.header.classList.contains('header--mobile-open'), true);
    assert.equal(harness.body.classList.contains('menu-open'), true);
    assert.equal(harness.toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(harness.navigation.getAttribute('aria-hidden'), 'false');

    harness.document.dispatch('keydown', { key: 'Escape' });
    assert.equal(harness.header.classList.contains('header--mobile-open'), false);
    assert.equal(harness.body.classList.contains('menu-open'), false);
    assert.equal(harness.toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(harness.navigation.getAttribute('aria-hidden'), 'true');
    assert.equal(harness.toggle.focused, true);
});

test('mobile menu closes after navigation and when desktop layout activates', async () => {
    const harness = createHarness();
    await runHeaderScript(harness);

    harness.toggle.dispatch('click');
    harness.link.dispatch('click');
    assert.equal(harness.toggle.getAttribute('aria-expanded'), 'false');

    harness.toggle.dispatch('click');
    harness.media.setMatches(true);
    assert.equal(harness.toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(harness.navigation.getAttribute('aria-hidden'), 'false');
});

test('header script is safe when the block is absent', async () => {
    const harness = createHarness();
    harness.document.querySelector = () => null;
    await assert.doesNotReject(() => runHeaderScript(harness));
});
