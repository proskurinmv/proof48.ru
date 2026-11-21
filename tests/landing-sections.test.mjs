import assert from 'node:assert/strict';
import test from 'node:test';

const pageUrl = 'http://127.0.0.1:4173/main/';

async function getPageHtml() {
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    return response.text();
}

test('statistics section exposes four measurable company facts', async () => {
    const html = await getPageHtml();
    const items = html.match(/class="stats__item"/g) ?? [];

    assert.match(html, /<section[^>]+class="stats"[^>]+aria-label="Ключевые показатели"/);
    assert.equal(items.length, 4);
});

test('industries section exposes six accessible industry links', async () => {
    const html = await getPageHtml();
    const cards = html.match(/class="industries__card"/g) ?? [];

    assert.match(html, /<section[^>]+class="industries"[^>]+aria-labelledby="industries-title"/);
    assert.match(html, /id="industries-title"/);
    assert.equal(cards.length, 6);
    assert.match(html, /Промышленные предприятия/);
    assert.match(html, /Склады и логистические комплексы/);
    assert.match(html, /Дата-центры/);
    assert.match(html, /Аэропорты и инфраструктурные объекты/);
    assert.match(html, /Сельскохозяйственные комплексы/);
    assert.match(html, /Кровли сложной конфигурации/);
});
