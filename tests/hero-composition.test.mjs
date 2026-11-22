import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexUrl = new URL('../main/index.html', import.meta.url);
const headerCssUrl = new URL('../main/header.css', import.meta.url);
const headerJsUrl = new URL('../main/header.js', import.meta.url);

test('header, hero and statistics form one visual composition', async () => {
    const html = await readFile(indexUrl, 'utf8');
    const heroStart = html.indexOf('<section class="hero"');
    const heroEnd = html.indexOf('</section>', html.indexOf('</section>', heroStart) + 10);
    const heroMarkup = html.slice(heroStart, heroEnd + 10);

    assert.match(html, /<use href="#logo-proof"><\/use>/);
    assert.match(html, /Эксперт в гидроизоляции<br>промышленных объектов/);
    assert.match(html, /Надёжные кровельные<br class="hero__desktop-break">/);
    assert.match(html, /решения для сложных<br class="hero__desktop-break"> промышленных объектов/);
    assert.match(html, /Гидроизоляция, ремонт и обслуживание<br> кровель по всей России/);
    assert.match(heroMarkup, /<section class="stats" aria-label="Ключевые показатели">/);
    assert.match(heroMarkup, /data-target="20000" data-suffix="\+"/);
    assert.match(heroMarkup, /data-target="95" data-suffix="\+"/);
    assert.match(heroMarkup, /data-target="1000" data-suffix="\+"/);
    assert.match(heroMarkup, /data-target="15" data-suffix="\+"/);
});

test('header stays visible and gains a readable state after scrolling', async () => {
    const [css, script] = await Promise.all([
        readFile(headerCssUrl, 'utf8'),
        readFile(headerJsUrl, 'utf8'),
    ]);

    assert.match(css, /\.header\s*\{[^}]*position:\s*fixed;/s);
    assert.match(css, /\.header--scrolled/);
    assert.match(script, /header--scrolled/);
    assert.match(script, /addEventListener\?\.\(['"]scroll['"]/);
});
