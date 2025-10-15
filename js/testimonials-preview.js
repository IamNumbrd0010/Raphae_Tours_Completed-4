document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.testimonials-slider');
    if (!container) return;
    // Prevent double initialization if script runs multiple times
    if (container.dataset.testimonialsInited) return;
    container.dataset.testimonialsInited = '1';

    const track = container.querySelector('.slides-track');
    if (!track) return;

    // Ensure track has a transform transition (force in JS to avoid being overridden)
    track.style.transition = track.style.transition || 'transform 0.8s cubic-bezier(.22,.9,.39,1)';

    // Query slides explicitly by class name (scoped) to avoid counting unexpected nodes
    const slides = Array.from(container.querySelectorAll('.testimonial-slide'));
    const dotsContainer = container.querySelector('.testi-dots');
    const total = slides.length;
    let current = 0;
    let timer = null;

    // Debug info: expose counts and log
    container.dataset.testimonialSlides = total;
    console.log('[testimonials-preview] slides found:', total);

    if (!dotsContainer) return;
    // clear any existing dots (in case of previous runs or leftover HTML)
    dotsContainer.innerHTML = '';
    // also remove any leftover child nodes with class testi-dot anywhere just in case
    document.querySelectorAll('.testi-dot').forEach(n => n.remove());

    // create dots equal to the number of slides
    const dots = [];
    for (let i = 0; i < total; i++) {
        const btn = document.createElement('button');
        btn.className = 'testi-dot';
        btn.setAttribute('aria-label', `Go to testimonial ${i+1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(btn);
        dots.push(btn);
    }

    console.log('[testimonials-preview] dots created:', dots.length);
    container.dataset.testimonialDots = dots.length;

    function updateDots() {
        dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    function goTo(index) {
        if (total === 0) return;
        const clamped = ((index % total) + total) % total;
        // Use requestAnimationFrame to ensure transition animates
        const slideEl = slides[clamped];
        const offset = slideEl.offsetLeft;
        requestAnimationFrame(() => {
            track.style.transform = `translateX(-${offset}px)`;
        });
        current = clamped;
        updateDots();
        resetTimer();
    }

    function next() { goTo(current + 1); }
    function startTimer() { stopTimer(); timer = setInterval(next, 4000); }
    function stopTimer() { if (timer) clearInterval(timer); }
    function resetTimer() { stopTimer(); startTimer(); }

    // initialize - set initial transform in px after layout so transitions will run
    // wait a tick so layout is ready, then set initial transform and start autoplay
    requestAnimationFrame(() => {
        if (slides.length > 0) {
            const offset = slides[0].offsetLeft;
            track.style.transform = `translateX(-${offset}px)`;
        } else {
            track.style.transform = 'translateX(0px)';
        }
        updateDots();
        // small delay to ensure transform is applied before autoplay
        setTimeout(startTimer, 120);
    });

    // pause autoplay on hover
    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', startTimer);

    // re-calc position on resize to keep current slide aligned
    window.addEventListener('resize', () => {
        setTimeout(() => {
            // reapply transform for current index
            if (total > 0) {
                const slideEl = slides[current];
                const offset = slideEl.offsetLeft;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${offset}px)`;
                 // force reflow then restore transition
                 // eslint-disable-next-line no-unused-expressions
                 track.offsetHeight;
                 track.style.transition = '';
            }
        }, 100);
    });
});
