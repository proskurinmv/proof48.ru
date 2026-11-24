/* One wheel gesture = one chapter; overflowing chapters retain native scrolling. */
(() => {
    'use strict';
    const root = document.documentElement;
    const sections = [...document.querySelectorAll('main > section')];
    if (!sections.length) return;
    const header = document.querySelector('.header');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    root.classList.add('fullscreen');
    const updateHeader = () => root.style.setProperty('--fullscreen-header', `${header?.offsetHeight || 0}px`);
    updateHeader();
    if (header && 'ResizeObserver' in window) new ResizeObserver(updateHeader).observe(header);
    const nav = document.createElement('nav');
    nav.className = 'fullscreen-nav';
    nav.setAttribute('aria-label', 'Навигация по экранам');
    const makeButton = (className, label) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = className; button.setAttribute('aria-label', label); nav.append(button); return button;
    };
    const prev = makeButton('fullscreen-nav__arrow fullscreen-nav__arrow_prev', 'Предыдущий экран');
    const dots = sections.map((section, i) => {
        const label = document.getElementById(section.getAttribute('aria-labelledby'))?.textContent.trim() || `Экран ${i + 1}`;
        const button = makeButton('fullscreen-nav__dot', `${i + 1}. ${label}`);
        button.title = label; button.addEventListener('click', () => goTo(i)); return button;
    });
    const next = makeButton('fullscreen-nav__arrow', 'Следующий экран');
    document.body.append(nav);
    const current = () => sections.reduce((best, section, i) => Math.abs(section.getBoundingClientRect().top) < Math.abs(sections[best].getBoundingClientRect().top) ? i : best, 0);
    const updateNav = (i = current()) => {
        dots.forEach((dot, j) => j === i ? dot.setAttribute('aria-current', 'step') : dot.removeAttribute('aria-current'));
        prev.disabled = i === 0; next.disabled = i === sections.length - 1;
    };
    let animating = false, animationToken = 0, animationFrame = 0, targetIndex = 0;
    let gesture = null, gestureTimer = 0;
    function goTo(index, callback) {
        index = Math.min(sections.length - 1, Math.max(0, index));
        const token = ++animationToken;
        cancelAnimationFrame(animationFrame);
        targetIndex = index; animating = true;
        const top = Math.round(scrollY + sections[index].getBoundingClientRect().top);
        let finished = false;
        const finish = () => {
            if (token !== animationToken || finished) return;
            finished = true; animating = false; root.style.removeProperty('scroll-snap-type'); updateNav(index); callback?.();
        };
        if (reduced.matches || Math.abs(top - scrollY) < 2) { window.scrollTo({ top, behavior: 'instant' }); finish(); return; }
        if (fine.matches && window.proofScrollTo) { window.proofScrollTo(top, finish); setTimeout(finish, 1450); return; }
        const from = scrollY, start = performance.now(), duration = 850;
        if (!fine.matches) root.style.scrollSnapType = 'none';
        const step = now => {
            if (token !== animationToken) return;
            const t = Math.min(1, (now - start) / duration);
            window.scrollTo({ top: from + (top - from) * (1 - Math.pow(1 - t, 4)), behavior: 'instant' });
            if (t < 1) animationFrame = requestAnimationFrame(step);
            else finish();
        };
        animationFrame = requestAnimationFrame(step);
    }
    const scrollable = (node, direction) => {
        for (let el = node; el && el !== document.body; el = el.parentElement) {
            if (!/(auto|scroll)/.test(getComputedStyle(el).overflowY)) continue;
            if (direction > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2) return true;
        }
        return false;
    };
    const menuOpen = () => document.body.classList.contains('menu-open');
    window.addEventListener('wheel', event => {
        if (!fine.matches || menuOpen() || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
        if (event.target.closest?.('.project-geography__map, textarea, select, [contenteditable="true"]')) return;
        const direction = Math.sign(event.deltaY);
        const canScroll = scrollable(event.target, direction);
        clearTimeout(gestureTimer);
        gestureTimer = setTimeout(() => { gesture = null; }, 180);
        if (animating || gesture === 'page') { event.preventDefault(); event.stopImmediatePropagation(); return; }
        if (canScroll) { gesture = 'inner'; return; }
        event.preventDefault(); event.stopImmediatePropagation();
        if (gesture === 'inner') return;
        gesture = 'page'; goTo(current() + direction);
    }, { passive: false, capture: true });
    const move = direction => goTo((animating ? targetIndex : current()) + direction);
    prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
    document.addEventListener('keydown', event => {
        if (menuOpen() || event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('input, textarea, select, button, [contenteditable], .project-geography__map')) return;
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); goTo(event.key === 'Home' ? 0 : sections.length - 1); return; }
        const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
        if (!direction) return;
        const body = sections[current()].querySelector('.fullscreen-section__body');
        if (!animating && scrollable(body, direction)) { event.preventDefault(); body.scrollBy({ top: direction * (event.key.startsWith('Arrow') ? 65 : body.clientHeight * .8), behavior: reduced.matches ? 'instant' : 'smooth' }); return; }
        event.preventDefault(); if (!animating && !event.repeat) move(direction);
    });
    function navigateHash(hash, push = false) {
        let id; try { id = decodeURIComponent(hash.slice(1)); } catch { return false; }
        const target = id ? document.getElementById(id) : sections[0];
        const section = target?.closest('main > section');
        const index = sections.indexOf(section);
        if (index < 0) return false;
        if (push) history.pushState(null, '', id ? `#${encodeURIComponent(id)}` : location.pathname + location.search);
        goTo(index, () => {
            const body = section.querySelector('.fullscreen-section__body');
            if (target !== section && body.contains(target)) body.scrollTop += target.getBoundingClientRect().top - body.getBoundingClientRect().top - (header?.offsetHeight || 0) - 16;
            else body.scrollTop = 0;
        });
        return true;
    }
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (navigateHash(link.getAttribute('href'), true)) event.preventDefault();
    });
    window.addEventListener('popstate', () => navigateHash(location.hash));
    window.addEventListener('scroll', () => { if (!animating) updateNav(); }, { passive: true });
    window.addEventListener('resize', () => { updateHeader(); if (!animating) updateNav(); }, { passive: true });
    if (location.hash) requestAnimationFrame(() => navigateHash(location.hash));
    updateNav();
})();
