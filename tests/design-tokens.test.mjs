import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const styleFiles = [
    new URL('../main/header.css', import.meta.url),
    new URL('../main/hero.css', import.meta.url),
    new URL('../main/stats.css', import.meta.url),
    new URL('../main/industries.css', import.meta.url),
    new URL('../main/services.css', import.meta.url),
    new URL('../main/roofing-systems.css', import.meta.url),
    new URL('../main/projects-gallery.css', import.meta.url),
    new URL('../main/project-geography.css', import.meta.url),
    new URL('../main/scroll.css', import.meta.url),
    new URL('../main/consultation.css', import.meta.url),
    new URL('../main/footer.css', import.meta.url),
];

async function readStyles() {
    return Promise.all(styleFiles.map(async (file) => ({
        file: file.pathname,
        source: await readFile(file, 'utf8'),
    })));
}

test('local styles use color tokens instead of raw color literals', async () => {
    const styles = await readStyles();
    const violations = [];

    for (const { file, source } of styles) {
        source.split('\n').forEach((line, index) => {
            if (/#[0-9a-f]{3,8}\b|\brgba?\(/i.test(line)) {
                violations.push(`${file}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});

test('local margin, padding and gap declarations use spacing tokens', async () => {
    const styles = await readStyles();
    const violations = [];
    const spacingDeclaration = /^\s*(?:margin(?:-[a-z-]+)?|padding(?:-[a-z-]+)?|gap)\s*:\s*([^;]+);/;

    for (const { file, source } of styles) {
        source.split('\n').forEach((line, index) => {
            const match = line.match(spacingDeclaration);
            if (!match) return;

            const value = match[1].trim();
            const usesToken = value.includes('var(--space-') ||
                value.includes('var(--section-space-') ||
                value.includes('var(--container-padding-');
            const tokenlessKeyword = value === '0' || value === 'auto';

            if (!usesToken && !tokenlessKeyword) {
                violations.push(`${file}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});
