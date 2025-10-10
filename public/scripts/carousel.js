const initCarousel = (container) => {
    if (!container || container.__carouselInit) return;
    container.__carouselInit = true;

    const list = container.querySelector('[data-carousel-list]');
    const prev = container.querySelector('[data-carousel-prev]');
    const next = container.querySelector('[data-carousel-next]');
    if (!list) return;

    const items = () => Array.from(list.children);
    const getItemWidth = () => items()[0]?.getBoundingClientRect().width || list.clientWidth;
    const count = () => Math.max(1, items().length);

    const currentIndex = () => {
        const w = getItemWidth();
        return Math.round(list.scrollLeft / w);
    };

    const scrollToIndex = (i, smooth = true) => {
        const idx = ((i % count()) + count()) % count();
        const left = Math.round(idx * getItemWidth());
        list.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    };

    prev?.addEventListener('click', () => {
        scrollToIndex(currentIndex() - 1);
    });

    next?.addEventListener('click', () => {
        scrollToIndex(currentIndex() + 1);
    });

    list.setAttribute('tabindex', '0');
    list.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') scrollToIndex(currentIndex() + 1);
        if (e.key === 'ArrowLeft') scrollToIndex(currentIndex() - 1);
    });

    let t;
    const onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => scrollToIndex(currentIndex(), false), 100);
    };
    window.addEventListener('resize', onResize);
};

document.querySelectorAll('[data-carousel]').forEach(initCarousel);
window.initCarousel = initCarousel;