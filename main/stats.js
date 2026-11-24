document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const format = (value, suffix) => value.toLocaleString('ru-RU') + suffix;
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const animate = time => {
            const progress = reduced.matches ? 1 : Math.min((time - start) / 1200, 1);
            el.textContent = format(Math.round(target * (1 - Math.pow(1 - progress, 3))), suffix);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }), { threshold: .35 });
    counters.forEach(el => observer.observe(el));
});
