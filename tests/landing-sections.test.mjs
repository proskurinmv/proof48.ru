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

test('industries section exposes six accessible industry links and a three-image project collage', async () => {
    const html = await getPageHtml();
    const items = html.match(/class="industries__item"/g) ?? [];
    const galleryImages = html.match(/class="industries__gallery-image"/g) ?? [];

    assert.match(html, /<section[^>]+class="industries"[^>]+aria-labelledby="industries-title"/);
    assert.match(html, /id="industries-title"/);
    assert.equal(items.length, 6);
    assert.equal(galleryImages.length, 3);
    assert.match(html, /class="industries__list"/);
    assert.match(html, /class="industries__gallery"/);
    assert.match(html, /Промышленные предприятия/);
    assert.match(html, /Склады и логистические комплексы/);
    assert.match(html, /Дата-центры/);
    assert.match(html, /Аэропорты и инфраструктурные объекты/);
    assert.match(html, /Сельскохозяйственные комплексы/);
    assert.match(html, /Кровли сложной конфигурации/);
});

test('about section presents company credentials and focus areas around a real team image', async () => {
    const html = await getPageHtml();
    const trustItems = html.match(/class="about__trust-item"/g) ?? [];
    const focusCards = html.match(/class="about__focus-card"/g) ?? [];

    assert.match(html, /<link[^>]+href="\.\/about\.css\?v=about-1"/);
    assert.match(html, /<section[^>]+class="about"[^>]+id="about"[^>]+aria-labelledby="about-title"/);
    assert.match(html, /class="about__image"[^>]+src="\.\/images\/about\/proof-workers-roof-sunset\.png"/);
    assert.equal(trustItems.length, 3);
    assert.equal(focusCards.length, 3);
    assert.match(html, /ПРУФ — специализированный подрядчик по промышленной гидроизоляции/);
    assert.match(html, /Подробнее о компании/);
});

test('consultation section provides an accessible technical assessment form', async () => {
    const html = await getPageHtml();

    assert.match(html, /<link[^>]+href="\.\/consultation\.css\?v=consultation-1"/);
    assert.match(html, /<section[^>]+class="consultation"[^>]+id="consultation"[^>]+aria-labelledby="consultation-title"/);
    assert.match(html, /class="consultation__form"/);
    assert.match(html, /<input[^>]+type="tel"[^>]+required/);
    assert.match(html, /<select[^>]+name="task"[^>]+required/);
    assert.match(html, /<input[^>]+type="file"[^>]+multiple/);
    assert.match(html, /Получить техническое решение/);
});
