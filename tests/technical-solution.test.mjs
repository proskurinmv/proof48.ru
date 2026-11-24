import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';

const pageUrl = 'http://127.0.0.1:4173/main/';
const imagePath = new URL('../main/images/technical-solution/roof-inspection-tablet.png', import.meta.url);

async function getPageHtml() {
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    return response.text();
}

test('technical solution CTA uses the supplied inspection image and sprite benefits', async () => {
    const html = await getPageHtml();
    const benefits = html.match(/class="technical-solution__benefit"/g) ?? [];

    assert.match(html, /<link[^>]+href="\.\/technical-solution\.css\?v=technical-solution-1"/);
    assert.match(html, /<script[^>]+src="\.\/header\.js\?v=technical-solution-1"/);
    assert.match(html, /<section[^>]+class="technical-solution"[^>]+id="technical-solution"/);
    assert.match(html, /class="technical-solution__background"[^>]+src="\.\/images\/technical-solution\/roof-inspection-tablet\.png"/);
    assert.equal(benefits.length, 3);
    assert.match(html, /<use href="#ui-search"><\/use>/);
    assert.match(html, /<use href="#ui-layers"><\/use>/);
    assert.match(html, /<use href="#technical-calendar-check"><\/use>/);
    assert.match(html, /class="technical-solution__cta[^>]+href="#consultation"/);
    await access(imagePath);
});
