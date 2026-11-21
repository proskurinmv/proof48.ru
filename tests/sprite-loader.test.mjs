import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('page scripts do not request the missing singular sprite filename', async () => {
    const files = [
        new URL('../main/header.js', import.meta.url),
        new URL('../main/custom.js', import.meta.url),
        new URL('../custom/custom.js', import.meta.url),
    ];
    const sources = await Promise.all(files.map((file) => readFile(file, 'utf8')));

    assert.match(sources[0], /svg_icons\.html/);
    assert.match(sources[0], /svg_icons\.html\?v=services-1/);
    sources.forEach((source) => assert.doesNotMatch(source, /svg_icon\.html/));
});

test('main page does not load redundant legacy sprite loaders', async () => {
    const source = await readFile(new URL('../main/index.html', import.meta.url), 'utf8');

    assert.doesNotMatch(source, /<script src="\.\.\/custom\/custom\.js"><\/script>/);
    assert.doesNotMatch(source, /<script src="custom\.js"><\/script>/);
});
