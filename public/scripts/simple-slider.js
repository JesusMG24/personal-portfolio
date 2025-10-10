const initSimpleSlider = (container) => {
    if (!container || container.__simpleSlider) return;
    container.__simpleSlider = true;

    const track = container.querySelector('.ss-track');
    if (!track) return;

    const slotChildren = Array.from(container.children).filter((n) => !n.classList.contains('ss-track'));
    slotChildren.forEach((el) => {
        el.classList.add('ss-slide');
        track.appendChild(el);
    });

    let slides = Array.from(track.children);
    if (slides.length === 0) return;

    if (slides.length > 1) {
        const first = slides[0].cloneNode(true);
        const last = slides[slides.length - 1].cloneNode(true);
        track.appendChild(first);
        track.insertBefore(last, track.firstChild);
    }

    slides = Array.from(track.children);
    let total = slides.length;
    let currentIndex = slides.length > 1 ? 1 : 0;

    track.style.display = 'flex';
    track.style.willChange = 'transform';
    track.style.transition = 'transform 450ms ease';

    const setSizes = () => {
        const w = container.clientWidth;
        slides = Array.from(track.children);
        slides.forEach((s) => {
            s.style.minWidth = `${w}px`;
            s.style.flex = '0 0 auto';
        });
        track.style.transform = `translateX(-${currentIndex * w}px)`;
    };

    const slideWidth = () => container.clientWidth;

    setSizes();
    track.style.transform = `translateX(-${currentIndex * slideWidth()}px)`;

    const goTo = (idx, smooth = true) => {
        const w = slideWidth();
        if (!smooth) track.style.transition = 'none';
        else track.style.transition = 'transform 450ms ease';
        track.style.transform = `translateX(-${idx * w}px)`;
        currentIndex = idx;
        if (!smooth) requestAnimationFrame(() => (track.style.transition = 'transform 450ms ease'));
    };

    track.addEventListener('transitionend', () => {
        const realCount = total - 2;
        if (realCount <= 0) return;
        if (currentIndex === 0) {
            currentIndex = realCount;
            goTo(currentIndex, false);
        } else if (currentIndex === total - 1) {
            currentIndex = 1;
            goTo(currentIndex, false);
        }
    });

    const ensureImagesLoaded = async () => {
        const imgs = track.querySelectorAll('img');
        for (const img of imgs) {
            try {
                if (img.loading === 'lazy') img.loading = 'eager';
            } catch { }
            if (!img.complete) {
                try { await img.decode(); } catch (e) { /* ignore decode errors */ }
            }
        }
    };

    const autoplayMs = Number.parseInt(container.dataset.autoplay, 10) || 3000;
    let autoplayInterval = null;
    let paused = false;

    const startAutoplay = () => {
        if (autoplayInterval) clearInterval(autoplayInterval);
        if (!(autoplayMs > 0) || slides.length <= 1) return;
        autoplayInterval = setInterval(() => {
            if (!paused) goTo(currentIndex + 1);
        }, autoplayMs);
    };
    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    };

    if (autoplayMs > 0 && slides.length > 1) {
        container.addEventListener('mouseenter', () => (paused = true));
        container.addEventListener('mouseleave', () => (paused = false));
        container.addEventListener('focusin', () => (paused = true));
        container.addEventListener('focusout', () => (paused = false));
        startAutoplay();
        container.__simpleSliderStop = stopAutoplay;
        window.addEventListener('unload', stopAutoplay);
    }

    const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            setTimeout(() => {
                setSizes();
                goTo(currentIndex, false);
            }, 50);
            ensureImagesLoaded();
            paused = false;
            if (autoplayMs > 0 && slides.length > 1) startAutoplay();
        } else {
            paused = true;
            stopAutoplay();
        }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let t;
    const onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => {
            setSizes();
        }, 120);
    };
    window.addEventListener('resize', onResize);

    const observer = new MutationObserver(() => {
        if (!document.body.contains(container)) {
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            stopAutoplay();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
};

document.querySelectorAll('[data-simple-slider]').forEach(initSimpleSlider);
window.initSimpleSlider = initSimpleSlider;