(() => {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const toggle = header.querySelector('[data-header-toggle]');
    const navigation = header.querySelector('[data-header-navigation]');
    if (!toggle || !navigation) return;

    const desktopMedia = window.matchMedia('(min-width: 1121px)');
    const navigationLinks = navigation.querySelectorAll('a');

    const updateScrolledState = () => {
        header.classList.toggle('header--scrolled', window.scrollY > 24);
    };

    updateScrolledState();
    window.addEventListener?.('scroll', updateScrolledState, { passive: true });

    const setMenuState = (isOpen, { returnFocus = false } = {}) => {
        header.classList.toggle('header--mobile-open', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        navigation.setAttribute('aria-hidden', String(desktopMedia.matches ? false : !isOpen));

        if (returnFocus) toggle.focus();
    };

    setMenuState(false);

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    navigationLinks.forEach((link) => {
        link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
        setMenuState(false, { returnFocus: true });
    });

    desktopMedia.addEventListener('change', () => setMenuState(false));
})();
