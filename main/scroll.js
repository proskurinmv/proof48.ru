/* PROOF — progressive enhancement: native motion, then Lenis + GSAP when available. */
(() => {
    'use strict';
    const root = document.documentElement;
    const main = document.querySelector('main');
    if (!main) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 1201px) and (min-height: 720px) and (pointer: fine)');
    const hero = main.querySelector('.hero');
    const progressBar = document.querySelector('.scroll-progress__bar');
    const sectionSelector = 'main > section';
    const reveals = [...main.querySelectorAll([
        ':scope > section:not(.hero) h2', '[class$="__eyebrow-row"]',
        '.industries__subtitle', '.services__description', '.roofing-systems__subtitle',
        '.projects-gallery__description', '.project-geography__description', '.about__description',
        '.knowledge__description', '.technical-solution__description', '.consultation__description',
        '.industries__item', '.industries__gallery-item', '.services__card',
        '.roofing-systems__card', '.projects-gallery__card', '.about__media',
        '.about__focus-card', '.knowledge__media', '.knowledge__item',
        '.technical-solution__benefit', '.project-geography__map-panel',
        '.project-geography__card', '.consultation__form'
    ].join(','))];
    const images = [...main.querySelectorAll('.hero__image, .services__background, .roofing-systems__background, .technical-solution__background')];
    const imageReveal = el => el.matches('.industries__gallery-item, .about__media, .knowledge__media');
    const cardReveal = el => el.matches('.industries__item, .services__card, .roofing-systems__card, .projects-gallery__card, .about__focus-card, .knowledge__item, .technical-solution__benefit');
    const motionType = el => imageReveal(el) ? 'image' : cardReveal(el) ? 'card' : 'content';
    const stagger = el => Math.min([...el.parentElement.children].filter(child => reveals.includes(child)).indexOf(el), 3) * 70;
    let observer, frame = 0, cleanupGsap = null, librariesReady = false, librariesLoading = false;
    const formatProgress = () => {
        const max = root.scrollHeight - innerHeight;
        const fraction = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0;
        if (progressBar) progressBar.style.transform = `scaleX(${fraction})`;
    };
    const nativeParallax = () => {
        if (reduced.matches || !desktop.matches || cleanupGsap) return;
        const positions = images.map(img => ({ img, rect: img.closest(sectionSelector).getBoundingClientRect() }));
        positions.forEach(({ img, rect }) => {
            if (rect.bottom < 0 || rect.top > innerHeight) return;
            const amount = Math.max(-1, Math.min(1, (innerHeight / 2 - (rect.top + rect.height / 2)) / (innerHeight / 2 + rect.height / 2)));
                img.style.transform = `translate3d(0, ${amount * 44}px, 0) scale(1.08)`;
        });
    };
    const onFrame = () => { frame = 0; formatProgress(); nativeParallax(); };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(onFrame); };
    const clearNative = () => {
        observer?.disconnect();
        root.classList.remove('motion-native');
        reveals.forEach(el => {
            el.removeAttribute('data-motion-pending');
            el.removeAttribute('data-motion-visible');
            el.style.removeProperty('--motion-delay');
        });
        images.forEach(img => img.style.removeProperty('transform'));
    };
    const startNative = () => {
        if (reduced.matches || !('IntersectionObserver' in window)) return;
        root.classList.add('motion-native');
        observer?.disconnect();
        observer = new IntersectionObserver(entries => entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                el.removeAttribute('data-motion-pending');
                el.setAttribute('data-motion-visible', '');
            } else if (!el.contains(document.activeElement)) {
                el.removeAttribute('data-motion-visible');
                el.setAttribute('data-motion-pending', motionType(el));
            }
        }), { rootMargin: '-8% 0px -8% 0px', threshold: 0.08 });
        reveals.forEach(el => {
            el.style.setProperty('--motion-delay', `${Math.max(0, stagger(el))}ms`);
            el.setAttribute('data-motion-pending', motionType(el));
            observer.observe(el);
        });
        schedule();
    };
    // Keyboard navigation must never focus an invisible element.
    main.addEventListener('focusin', event => {
        const el = event.target.closest('[data-motion-pending]');
        if (el) {
            el.removeAttribute('data-motion-pending');
            el.setAttribute('data-motion-visible', '');
        }
    });
    const startGsap = () => {
        if (!librariesReady || reduced.matches || cleanupGsap) return;
        const { gsap, ScrollTrigger, Lenis } = window;
        clearNative();
        gsap.registerPlugin(ScrollTrigger);
        const mm = gsap.matchMedia();
        let lenis = null;
        let tick = null;
        // Observe actual intersection, including the independently scrolling panel bodies.
        // ScrollTrigger is used only for the outer page parallax.
        startNative();
        mm.add('(min-width: 1201px) and (min-height: 720px) and (pointer: fine)', () => {
            lenis = new Lenis({
                smoothWheel: true,
                syncTouch: false,
                autoRaf: false,
                anchors: true,
                lerp: .12,
                wheelMultiplier: .9
            });
            lenis.on('scroll', ScrollTrigger.update);
            tick = time => lenis?.raf(time * 1000);
            gsap.ticker.add(tick);
            images.forEach(img => gsap.fromTo(img, { y: -32, scale: 1.08 }, { y: 32, scale: 1.08, ease: 'none', scrollTrigger: { trigger: img.closest(sectionSelector), start: 'top bottom', end: 'bottom top', scrub: .8 } }));
            return () => {
                gsap.ticker.remove(tick);
                lenis?.destroy(); lenis = null; tick = null;
            };
        });
        cleanupGsap = () => { mm.revert(); clearNative(); cleanupGsap = null; };
        document.fonts?.ready.then(() => { if (cleanupGsap) ScrollTrigger.refresh(); });
        window.addEventListener('load', () => { if (cleanupGsap) ScrollTrigger.refresh(); }, { once: true });
        ScrollTrigger.refresh();
    };
    const loadScript = (src, check) => new Promise((resolve, reject) => {
        if (check()) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src; script.async = true;
        const timeout = setTimeout(() => { script.remove(); reject(new Error('CDN timeout')); }, 5000);
        script.onload = () => { clearTimeout(timeout); check() ? resolve() : reject(new Error('Missing library')); };
        script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('CDN unavailable')); };
        document.head.append(script);
    });
    const loadLibraries = async () => {
        if (librariesLoading || librariesReady || reduced.matches) return;
        librariesLoading = true;
        try {
            await Promise.all([
                loadScript('https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js', () => window.Lenis),
                loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js', () => window.gsap).then(() => loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js', () => window.ScrollTrigger))
            ]);
            librariesReady = true;
            startGsap();
        } catch (error) { /* Keep the native implementation; the site works offline. */ }
        finally { librariesLoading = false; }
    };
    const applyPreference = () => {
        if (reduced.matches) { cleanupGsap?.(); clearNative(); }
        else if (librariesReady) startGsap();
        else { startNative(); loadLibraries(); }
        schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    desktop.addEventListener('change', () => { if (!desktop.matches && !cleanupGsap) images.forEach(img => img.style.removeProperty('transform')); schedule(); });
    reduced.addEventListener('change', applyPreference);
    applyPreference();
    if (!reduced.matches && scrollY < 30 && !location.hash) {
        const heroItems = hero?.querySelectorAll('.hero__eyebrow, .hero__title, .hero__description, .hero__actions, .stats__item') || [];
        heroItems.forEach((el, i) => el.animate?.([{ opacity: .15, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 780, delay: Math.min(i, 5) * 85, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    }
})();
