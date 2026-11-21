// счетчик
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');

    const animateCounter = (el) => {
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const value = Math.floor(progress * target);

            el.textContent = value.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.textContent = target.toLocaleString() + suffix;
            }
        };

        requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, {threshold: 0.4});

    counters.forEach(counter => observer.observe(counter));
});