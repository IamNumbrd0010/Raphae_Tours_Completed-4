document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.hero-slideshow .slides-track');
    if (!track) return;

    // Use children of the track as slides
    const slides = Array.from(track.children);
    const slideCount = slides.length;
    if (slideCount === 0) return;

    // Clone the first slide and append to the end for seamless forward looping
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);

    let current = 0; // index of current slide (0..slideCount-1)
    let timer = null;
    let isTransitioning = false;

    function setTransition(enabled) {
        track.style.transition = enabled ? 'transform 1s ease-in-out' : 'none';
    }

    function goTo(index) {
        setTransition(true);
        track.style.transform = `translateX(-${index * 100}%)`;
        current = index;
    }

    function goNext() {
        if (isTransitioning) return;
        isTransitioning = true;
        goTo(current + 1);
    }

    // When the transition ends, if we've moved onto the clone (index === slideCount),
    // jump instantly (no transition) back to the real first slide (index 0).
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        // If we've reached the cloned slide at the end, reset to the real first slide
        if (current === slideCount) {
            setTransition(false);
            track.style.transform = 'translateX(0)';
            current = 0;
            // Force reflow so that subsequent transitions work correctly
            // eslint-disable-next-line no-unused-expressions
            track.offsetHeight;
        }
    });

    // Start autoplay
    function startTimer() {
        stopTimer();
        timer = setInterval(goNext, 3500);
    }
    function stopTimer() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    // Pause on hover
    const container = document.querySelector('.hero-slideshow');
    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', () => {
        startTimer();
    });

    // Initialize
    setTransition(false);
    track.style.transform = 'translateX(0)';
    // small timeout to ensure styles applied before enabling timer
    setTimeout(() => startTimer(), 100);
});
