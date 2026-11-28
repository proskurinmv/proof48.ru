import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../main/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../main/industries.css', import.meta.url), 'utf8');
const require = createRequire(import.meta.url);

class FakeClassList {
    #values = new Set();

    add(...values) {
        values.forEach(value => this.#values.add(value));
    }

    remove(...values) {
        values.forEach(value => this.#values.delete(value));
    }

    contains(value) {
        return this.#values.has(value);
    }
}

class FakeImage {
    hidden = false;
    attributes = new Map();

    setAttribute(name, value) {
        this.attributes.set(name, value);
    }

    removeAttribute(name) {
        this.attributes.delete(name);
    }

    getAttribute(name) {
        return this.attributes.get(name) ?? null;
    }
}

class FakeItem extends EventTarget {
    constructor(dataset) {
        super();
        this.dataset = dataset;
    }
}

class FakeSlot {
    constructor(name) {
        this.dataset = { gallerySlot: name };
        this.classList = new FakeClassList();
        this.image = new FakeImage();
        this.label = { textContent: '' };
    }

    querySelector(selector) {
        if (selector === '.industries__gallery-image') return this.image;
        if (selector === '.industries__gallery-placeholder-label') return this.label;
        return null;
    }
}

test('industries items expose gallery states and load their own interaction script', () => {
    const configuredItems = html.match(/class="industries__item"[^>]+data-gallery-label=/g) ?? [];

    assert.equal(configuredItems.length, 6);
    assert.match(html, /<link rel="stylesheet" href="\.\/industries\.css\?v=industries-gallery-1">/);
    assert.match(html, /<script src="\.\/industries\.js\?v=industries-gallery-1" defer><\/script>/);
    assert.match(html, /class="industries__gallery-placeholder"/);
});

test('hovering an industry switches every gallery slot and keeps missing images as labelled placeholders', async () => {
    const { initIndustriesGallery } = require('../main/industries.js');
    const first = new FakeItem({
        galleryLabel: 'Производственные предприятия',
        galleryMain: './factory.webp',
        gallerySecondary: './factory-detail.webp',
        galleryTertiary: './factory-roof.webp',
        active: 'true',
    });
    const second = new FakeItem({
        galleryLabel: 'Склады и логистические комплексы',
        galleryMain: './warehouse.webp',
    });
    const slots = ['main', 'secondary', 'tertiary'].map(name => new FakeSlot(name));
    const gallery = { classList: new FakeClassList() };
    const root = {
        querySelector(selector) {
            return selector === '.industries__gallery' ? gallery : null;
        },
        querySelectorAll(selector) {
            if (selector === '.industries__item') return [first, second];
            if (selector === '.industries__gallery-item[data-gallery-slot]') return slots;
            return [];
        },
    };

    initIndustriesGallery(root);
    second.dispatchEvent(new Event('pointerenter'));

    assert.equal(first.dataset.active, undefined);
    assert.equal(second.dataset.active, 'true');
    assert.equal(slots[0].image.getAttribute('src'), './warehouse.webp');
    assert.equal(slots[0].classList.contains('is-placeholder'), false);
    assert.equal(slots[1].image.getAttribute('src'), null);
    assert.equal(slots[1].classList.contains('is-placeholder'), true);
    assert.equal(slots[2].classList.contains('is-placeholder'), true);
    assert.equal(slots[1].label.textContent, 'Склады и логистические комплексы');
    assert.equal(slots[2].label.textContent, 'Склады и логистические комплексы');
});

test('gallery placeholders and active industry have visible states with reduced-motion support', () => {
    assert.match(css, /\.industries__item\[data-active="true"\]/);
    assert.match(css, /\.industries__gallery-placeholder\s*{/);
    assert.match(css, /\.industries__gallery-item\.is-placeholder/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /@media \(max-width: 576px\)[\s\S]*?\.industries__gallery\s*{[\s\S]*?width:\s*100%/);
});
