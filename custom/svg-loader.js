(() => {
    const loaderUrl = new URL(document.currentScript.src);
    const spriteUrl = new URL('./svg_icons.html', loaderUrl);
    spriteUrl.search = loaderUrl.search;

    async function loadSprite() {
        if (document.getElementById('svg-sprite')) return;

        const sprite = document.createElement('div');
        sprite.id = 'svg-sprite';
        sprite.setAttribute('aria-hidden', 'true');
        document.body.prepend(sprite);

        try {
            const response = await fetch(spriteUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            sprite.innerHTML = await response.text();
        } catch (error) {
            sprite.remove();
            console.error('Ошибка загрузки SVG-спрайта:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSprite, { once: true });
    } else {
        loadSprite();
    }
})();
