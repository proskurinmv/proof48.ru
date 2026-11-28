const gallerySlots = ['main', 'secondary', 'tertiary'];

function getGalleryState(item) {
    return {
        label: item.dataset.galleryLabel,
        images: {
            main: item.dataset.galleryMain,
            secondary: item.dataset.gallerySecondary,
            tertiary: item.dataset.galleryTertiary,
        },
    };
}

function initIndustriesGallery(root = document) {
    const items = [...root.querySelectorAll('.industries__item')];
    const gallery = root.querySelector('.industries__gallery');
    const slots = [...root.querySelectorAll('.industries__gallery-item[data-gallery-slot]')];

    if (!items.length || !gallery || slots.length !== gallerySlots.length) {
        return () => {};
    }

    let activeItem;
    const frame = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : callback => callback();

    const activate = item => {
        if (item === activeItem) return;

        const state = getGalleryState(item);
        activeItem = item;
        items.forEach(candidate => {
            if (candidate === item) candidate.dataset.active = 'true';
            else delete candidate.dataset.active;
        });

        gallery.classList.add('is-changing');
        slots.forEach(slot => {
            const slotName = slot.dataset.gallerySlot;
            const image = slot.querySelector('.industries__gallery-image');
            const label = slot.querySelector('.industries__gallery-placeholder-label');
            const source = state.images[slotName];

            label.textContent = state.label;
            slot.classList[source ? 'remove' : 'add']('is-placeholder');

            if (source) {
                image.hidden = false;
                image.setAttribute('src', source);
            } else {
                image.hidden = true;
                image.removeAttribute('src');
            }
        });
        frame(() => gallery.classList.remove('is-changing'));
    };

    const subscriptions = items.flatMap(item => {
        const onActivate = () => activate(item);
        item.addEventListener('pointerenter', onActivate);
        item.addEventListener('focus', onActivate);
        return [
            () => item.removeEventListener('pointerenter', onActivate),
            () => item.removeEventListener('focus', onActivate),
        ];
    });

    activate(items.find(item => item.dataset.active === 'true') ?? items[0]);
    return () => subscriptions.forEach(unsubscribe => unsubscribe());
}

if (typeof document !== 'undefined') {
    initIndustriesGallery(document);
}

if (typeof module !== 'undefined') {
    module.exports = { initIndustriesGallery };
}
