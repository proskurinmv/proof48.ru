import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';

const pageUrl = 'http://127.0.0.1:4173/main/';
const imagePath = new URL('../main/images/knowledge/proof-roofing-expert.png', import.meta.url);

async function getPageHtml() {
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    return response.text();
}

test('knowledge section presents three expert materials with the supplied portrait', async () => {
    const html = await getPageHtml();
    const items = html.match(/class="knowledge__item"/g) ?? [];
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    assert.match(html, /<link[^>]+href="\.\/knowledge\.css\?v=knowledge-1"/);
    assert.match(html, /<section[^>]+class="knowledge"[^>]+id="knowledge"[^>]+aria-labelledby="knowledge-title"/);
    assert.match(html, /class="knowledge__image"[^>]+src="\.\/images\/knowledge\/proof-roofing-expert\.png"/);
    assert.equal(items.length, 3);
    assert.match(text, /Как выбрать систему для промышленной кровли/);
    assert.match(text, /Когда кровлю можно восстановить без демонтажа/);
    assert.match(text, /Почему протечки возвращаются после локального ремонта/);
    assert.match(html, /<use href="#icon_arrow_right_3"><\/use>/);
    await access(imagePath);
});
