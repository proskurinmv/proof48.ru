import assert from 'node:assert/strict';
import test from 'node:test';

const pageUrl = 'http://127.0.0.1:4173/main/';

async function getPageHtml() {
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    return response.text();
}

test('services section exposes six service links and its heading', async () => {
    const html = await getPageHtml();
    const cards = html.match(/class="services__card"/g) ?? [];

    assert.match(html, /<section[^>]+class="services"[^>]+id="services"[^>]+aria-labelledby="services-title"/);
    assert.match(html, /id="services-title"/);
    assert.equal(cards.length, 6);
    assert.match(html, /Ремонт промышленных кровель без демонтажа/);
    assert.match(html, /Устройство промышленных кровель/);
    assert.match(html, /Устранение протечек, обследование и дефектовка/);
    assert.match(html, /Ремонт сложных кровельных узлов/);
    assert.match(html, /Ремонт сложнодоступных узлов в стеснённых условиях/);
    assert.match(html, /Гидроизоляция резервуаров и сооружений/);
});

test('services section uses sprite icons and a real background asset', async () => {
    const html = await getPageHtml();

    assert.match(html, /href="#ui-layers"/);
    assert.match(html, /href="#icon_home_v1"/);
    assert.match(html, /href="#ui-search"/);
    assert.match(html, /href="#icon_share"/);
    assert.match(html, /href="#icon_technical"/);
    assert.match(html, /href="#icon_bucket_outline"/);
    assert.match(html, /class="services__background"[^>]+services-roof-sunset\.png/);
    assert.match(html, /class="services__title-accent">ключ</);
});
