import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(path) {
    return readFile(new URL(path, root), 'utf8').catch(() => '');
}

test('footer uses real project contacts, anchors and the existing logo', async () => {
    const html = await read('main/index.html');

    assert.match(html, /<link rel="stylesheet" href="\.\/footer\.css\?v=footer-1">/);
    assert.match(html, /<script src="\.\.\/custom\/svg-loader\.js\?v=footer-1" defer><\/script>/);
    assert.match(html, /<footer class="footer"/);
    assert.match(html, /<use href="#logo-proof"><\/use>/);
    assert.match(html, /href="tel:\+74951504567"/);
    assert.match(html, />\+7 495 150-45-67</);
    assert.match(html, /href="mailto:info@proof48\.ru"/);

    for (const anchor of ['#services', '#projects', '#roofing', '#about', '#knowledge']) {
        assert.match(html, new RegExp(`href="${anchor}"`));
    }

    assert.doesNotMatch(html, /\+7 \(XXX\)|info@example\.ru/);
});

test('footer uses supplied art, the filtered logo and MAX, VK and Rutube sprite icons', async () => {
    const [html, css, sprite] = await Promise.all([
        read('main/index.html'),
        read('main/footer.css'),
        read('custom/svg_icons.html'),
    ]);

    await access(new URL('main/images/footer/footer-fon.png', root));

    assert.match(css, /url\(["']?\.\/images\/footer\/footer-fon\.png["']?\)/);
    assert.match(css, /filter:\s*brightness\(0\)\s+invert\(1\)/);

    for (const icon of ['#footer-max', '#icon_vk', '#footer-rutube', '#ui-map-pin', '#ui-mail', '#ui-phone']) {
        assert.match(html, new RegExp(`<use href="${icon}"><\\/use>`));
    }

    assert.match(sprite, /<symbol id="footer-max"/);
    assert.match(sprite, /<symbol id="footer-rutube"/);
    assert.doesNotMatch(html, /#icon_tg|youtube/i);
});

test('footer styles include desktop, tablet and mobile layouts', async () => {
    const css = await read('main/footer.css');

    assert.match(css, /@media \(max-width:\s*1200px\)/);
    assert.match(css, /@media \(max-width:\s*768px\)/);
    assert.match(css, /@media \(max-width:\s*576px\)/);
    assert.match(css, /@media \(max-width:\s*576px\)[\s\S]*?\.footer__navigation\s*{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
}
);
