import assert from 'node:assert/strict';
import test from 'node:test';

const pageUrl = 'http://127.0.0.1:4173/main/';

async function getPageHtml() {
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    return response.text();
}

test('projects gallery exposes exactly three static project cards', async () => {
    const html = await getPageHtml();
    const cards = html.match(/class="projects-gallery__card"/g) ?? [];

    assert.match(html, /<section[^>]+class="projects-gallery"[^>]+id="projects"[^>]+aria-labelledby="projects-gallery-title"/);
    assert.equal(cards.length, 3);
    assert.match(html, /Гидроизоляция кровли объекта критической инфраструктуры/);
    assert.match(html, /Ремонт и гидроизоляция государственных объектов/);
    assert.match(html, /Восстановление кровли после многократных ремонтов/);
    assert.doesNotMatch(html, /projects-gallery[^\n]*(swiper|slider|carousel)/i);
});

test('projects gallery uses its own stylesheet, real images and sprite icons', async () => {
    const html = await getPageHtml();

    assert.match(html, /href="\.\/projects-gallery\.css"/);
    assert.match(html, /projects-gallery-background\.webp/);
    assert.match(html, /project-data-center\.webp/);
    assert.match(html, /project-production\.webp/);
    assert.match(html, /project-warehouse\.webp/);
    assert.match(html, /href="#icon_settings_2"/);
    assert.match(html, /href="#icon_industrial_width"/);
    assert.match(html, /href="#icon_warehouse"/);
    assert.match(html, /href="#ui-map-pin"/);
    assert.match(html, /href="#icon_arrow_right_3"/);
});
