import assert from 'node:assert/strict';
import test from 'node:test';

const pageUrl = 'http://127.0.0.1:4173/main/';

async function getPageHtml() {
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    return response.text();
}

test('roofing systems section exposes three solution cards', async () => {
    const html = await getPageHtml();
    const cards = html.match(/class="roofing-systems__card"/g) ?? [];

    assert.match(html, /<section[^>]+class="roofing-systems"[^>]+id="roofing"[^>]+aria-labelledby="roofing-systems-title"/);
    assert.match(html, /id="roofing-systems-title"/);
    assert.equal(cards.length, 3);
    assert.match(html, /Жидкие и напыляемые гидроизоляционные системы/);
    assert.match(html, /Битумно-рулонные кровли/);
    assert.match(html, /Мембранные кровли/);
});

test('roofing systems section presents the dark hero heading and project metrics', async () => {
    const html = await getPageHtml();
    const metrics = html.match(/class="roofing-systems__metric"/g) ?? [];

    assert.match(html, /class="roofing-systems__title-line">Кровельные/);
    assert.match(html, /class="roofing-systems__title-line roofing-systems__title-line_accent">системы/);
    assert.equal(metrics.length, 2);
    assert.match(html, /20\+/);
    assert.match(html, /500\+/);
    assert.match(html, /href="#ui-layers"/);
    assert.match(html, /href="#icon_industrial_width"/);
});

test('roofing systems section uses real images and the sprite arrow', async () => {
    const html = await getPageHtml();

    assert.match(html, /roofing-systems-hero\.webp/);
    assert.match(html, /liquid-systems\.webp/);
    assert.match(html, /bitumen-rolls\.webp/);
    assert.match(html, /membrane-roofing\.webp/);
    assert.match(html, /href="#icon_arrow_right_3"/);
    assert.equal((html.match(/class="roofing-systems__card-link"/g) ?? []).length, 3);
});
