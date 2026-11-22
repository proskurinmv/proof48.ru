import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const indexUrl = new URL('../main/index.html', import.meta.url);
const scriptUrl = new URL('../main/project-geography.js', import.meta.url);

class FakeElement {
    constructor(dataset = {}) {
        this.dataset = dataset;
        this.attributes = new Map();
        this.listeners = new Map();
        this.children = [];
        this.textContent = '';
        this._src = '';
        this.alt = '';
        this.srcWrites = 0;
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    getAttribute(name) {
        return this.attributes.get(name);
    }

    addEventListener(name, handler) {
        this.listeners.set(name, handler);
    }

    replaceChildren(...children) {
        this.children = children;
    }

    set src(value) {
        this._src = value;
        this.srcWrites += 1;
    }

    get src() {
        return this._src;
    }
}

async function loadGeographyApi() {
    const source = await readFile(scriptUrl, 'utf8');
    const document = {
        readyState: 'loading',
        addEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; },
        createElement() { return new FakeElement(); },
        head: { append() {} },
    };
    const window = { document };
    vm.runInNewContext(source, { window, document, URL, Promise, setTimeout, clearTimeout });
    return window.ProofProjectGeography;
}

function createFixture(apiKey = '') {
    const selectors = ['moscow', 'lipetsk', 'tula'].map((id) => new FakeElement({ projectSelect: id }));
    const elements = {
        '[data-project-map]': new FakeElement(),
        '[data-project-image]': new FakeElement(),
        '[data-project-city]': new FakeElement(),
        '[data-project-type]': new FakeElement(),
        '[data-project-detail-type]': new FakeElement(),
        '[data-project-title]': new FakeElement(),
        '[data-project-solution]': new FakeElement(),
        '[data-project-description]': new FakeElement(),
    };
    const root = {
        dataset: { yandexApiKey: apiKey },
        querySelector(selector) { return elements[selector] ?? null; },
        querySelectorAll(selector) { return selector === '[data-project-select]' ? selectors : []; },
    };
    const document = {
        createElement() { return new FakeElement(); },
        querySelector() { return null; },
        head: { append() {} },
    };

    return { root, selectors, elements, document };
}

test('project geography exposes map, three selectors and a live project card', async () => {
    const html = await readFile(indexUrl, 'utf8');
    const selectors = html.match(/data-project-select="(?:moscow|lipetsk|tula)"/g) ?? [];

    assert.match(html, /href="\.\/project-geography\.css"/);
    assert.match(html, /src="\.\/project-geography\.js"/);
    assert.match(html, /<section[^>]+class="project-geography"[^>]+data-project-geography[^>]+data-yandex-api-key=""/);
    assert.match(html, /data-project-map/);
    assert.equal(selectors.length, 3);
    assert.match(html, /data-project-select="moscow"[^>]+aria-pressed="true"/);
    assert.match(html, /data-project-select="lipetsk"[^>]+aria-pressed="false"/);
    assert.match(html, /data-project-select="tula"[^>]+aria-pressed="false"/);
    assert.match(html, /data-project-card[^>]+aria-live="polite"/);
});

test('project selection updates the card and pressed state without duplicate image writes', async () => {
    const api = await loadGeographyApi();
    const fixture = createFixture();
    const controller = api.createController(fixture.root, {
        document: fixture.document,
        window: {},
        initializeMap: false,
    });

    assert.equal(controller.selectProject('lipetsk'), true);
    assert.equal(fixture.elements['[data-project-city]'].textContent, 'Липецк');
    assert.equal(fixture.elements['[data-project-type]'].textContent, 'Производство');
    assert.match(fixture.elements['[data-project-title]'].textContent, /Ремонт и гидроизоляция/);
    assert.match(fixture.elements['[data-project-description]'].textContent, /повышенными требованиями/);
    assert.match(fixture.elements['[data-project-image]'].src, /project-production\.webp/);
    assert.equal(fixture.selectors[1].getAttribute('aria-pressed'), 'true');
    assert.equal(fixture.selectors[0].getAttribute('aria-pressed'), 'false');

    const imageWrites = fixture.elements['[data-project-image]'].srcWrites;
    assert.equal(controller.selectProject('lipetsk'), true);
    assert.equal(fixture.elements['[data-project-image]'].srcWrites, imageWrites);
    assert.equal(controller.selectProject('unknown'), false);
    assert.equal(fixture.elements['[data-project-city]'].textContent, 'Липецк');
});

test('empty key renders the supplied constructor map', async () => {
    const api = await loadGeographyApi();
    const fixture = createFixture();
    const controller = api.createController(fixture.root, {
        document: fixture.document,
        window: {},
        initializeMap: false,
    });

    await controller.initializeMap();
    const iframe = fixture.elements['[data-project-map]'].children[0];
    assert.equal(fixture.root.dataset.mapMode, 'constructor');
    assert.match(iframe.src, /constructor%3A550e1b4888ff585ce473f480f7a73f03cd8f793a50bb00bab63be2ee69dca04d/);
});

test('API map creates three clickable points and uses a key in the loader URL', async () => {
    const api = await loadGeographyApi();
    const fixture = createFixture('real-api-key');
    const placemarks = [];
    const map = { geoObjects: { add() {} } };
    const ymaps = {
        Map: function Map() { return map; },
        Placemark: function Placemark(coordinates, properties, options) {
            const handlers = new Map();
            const placemark = {
                coordinates,
                properties,
                options,
                events: { add(name, handler) { handlers.set(name, handler); } },
                handlers,
            };
            placemarks.push(placemark);
            return placemark;
        },
    };
    const controller = api.createController(fixture.root, {
        document: fixture.document,
        window: { getComputedStyle() { return { color: 'rgb(81, 178, 165)' }; } },
        initializeMap: false,
    });

    controller.renderApiMap(ymaps);
    assert.equal(placemarks.length, 3);
    placemarks[2].handlers.get('click')();
    assert.equal(fixture.elements['[data-project-city]'].textContent, 'Тула');
    assert.match(api.createApiUrl('real-api-key'), /apikey=real-api-key/);
    assert.match(api.createApiUrl('real-api-key'), /lang=ru_RU/);
});

test('API loading failure falls back to constructor map', async () => {
    const api = await loadGeographyApi();
    const fixture = createFixture('real-api-key');
    const controller = api.createController(fixture.root, {
        document: fixture.document,
        window: {},
        initializeMap: false,
        loadYandexMaps() { return Promise.reject(new Error('network unavailable')); },
    });

    await controller.initializeMap();
    assert.equal(fixture.root.dataset.mapMode, 'constructor');
    assert.equal(fixture.elements['[data-project-map]'].children.length, 1);
});
