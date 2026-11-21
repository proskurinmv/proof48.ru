//header
// Активиция подменю

// Появление блоков при прокрутки страницы
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('[data-reveal]');
    const motionAllowed = window.matchMedia(
        '(prefers-reduced-motion: no-preference)'
    ).matches;

    if (
        !sections.length ||
        !motionAllowed ||
        !('IntersectionObserver' in window)
    ) {
        return;
    }

    sections.forEach((section) => {
        section.classList.add('reveal');
    });

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('is-visible');
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    sections.forEach((section) => {
        observer.observe(section);
    });
});






