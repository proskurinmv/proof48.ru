(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopViewport = window.matchMedia('(min-width: 769px)');
    const root = document.documentElement;
    const sections = [...document.querySelectorAll('main > section')];

    if (sections.length < 2) return;

    const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
    let frameId = 0;

    const resetScene = () => {
        sections.forEach((section) => {
            section.style.zIndex = '';
            section.style.transform = '';
            section.style.removeProperty('--stack-dim');
        });
        root.classList.remove('scroll-enhanced');
    };

    const renderScene = () => {
        frameId = 0;

        if (reducedMotion.matches || !desktopViewport.matches) {
            resetScene();
            return;
        }

        const viewportHeight = Math.max(window.innerHeight, 1);

        sections.forEach((section, index) => {
            const nextSection = sections[index + 1];
            const nextTop = nextSection?.getBoundingClientRect().top ?? viewportHeight;
            const progress = nextSection
                ? clamp((viewportHeight - nextTop) / viewportHeight, 0, 1)
                : 0;
            const shift = progress * 32;
            const scale = 1 - progress * 0.025;
            const dim = progress * 0.15;

            section.style.zIndex = `${index + 1}`;
            section.style.transform = `translate3d(0, -${shift}px, 0) scale(${scale})`;
            section.style.setProperty('--stack-dim', `${dim}`);
        });

        root.classList.add('scroll-enhanced');
    };

    const requestSceneUpdate = () => {
        if (frameId) return;
        frameId = requestAnimationFrame(renderScene);
    };

    window.addEventListener('scroll', requestSceneUpdate, { passive: true });
    window.addEventListener('resize', requestSceneUpdate, { passive: true });
    reducedMotion.addEventListener?.('change', requestSceneUpdate);
    desktopViewport.addEventListener?.('change', requestSceneUpdate);
    requestSceneUpdate();
})();
