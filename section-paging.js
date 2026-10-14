/* Desktop wheel paging: one wheel gesture (mouse tick or trackpad swipe) moves
   exactly one section. The movement is animated here instead of relying on
   CSS scroll-snap + smooth scrollTo, which fight each other and behave
   differently in Safari and Chrome. Touch devices keep native CSS snapping. */
(() => {
  const desktop = matchMedia('(min-width: 761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let idleTimer, raf = null, animating = false, consumed = false, delta = 0, direction = 0, lastMag = 0;

  const stops = () => {
    const end = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const tops = [...document.querySelectorAll('.scene, .outro')]
      .map(el => Math.round(el.getBoundingClientRect().top + scrollY));
    return [...new Set([0, ...tops, Math.round(end)].map(y => Math.max(0, Math.min(end, y))))]
      .sort((a, b) => a - b);
  };

  // A section taller than the viewport is read with native scrolling.
  const overflowing = () => {
    const center = innerHeight / 2;
    const current = [...document.querySelectorAll('.hero, .scene, .outro')]
      .find(el => { const b = el.getBoundingClientRect(); return b.top <= center && b.bottom > center; });
    return !!current && current.getBoundingClientRect().height > innerHeight + 1;
  };

  const animate = to => {
    cancelAnimationFrame(raf);
    const from = scrollY, dist = to - from;
    if (reduced.matches || Math.abs(dist) < 2) {
      scrollTo({ top: to, behavior: 'instant' });
      animating = false;
      return;
    }
    const duration = 520, start = performance.now();
    animating = true;
    const step = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      scrollTo({ top: from + dist * eased, behavior: 'instant' });
      if (p < 1) raf = requestAnimationFrame(step);
      else { scrollTo({ top: to, behavior: 'instant' }); animating = false; }
    };
    raf = requestAnimationFrame(step);
  };

  addEventListener('wheel', event => {
    if (!desktop.matches ||
        event.ctrlKey || event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        (window.visualViewport && visualViewport.scale > 1) ||
        (event.target.closest && event.target.closest('input, textarea, select, [contenteditable="true"]')) ||
        overflowing()) return;
    if (!event.deltaY) return;
    event.preventDefault();

    // Momentum never reverses: a sign change is a new gesture even inside the tail
    // or while a transition is still running, so turning back is answered at once.
    const sign = Math.sign(event.deltaY);
    const mag = Math.abs(event.deltaY);
    if ((consumed || animating) && direction && sign !== direction) { consumed = false; delta = 0; animating = false; cancelAnimationFrame(raf); }
    // A fresh swipe in the same direction shows up as a jump in magnitude inside the decaying tail.
    else if (consumed && !animating && mag > 24 && mag > lastMag * 2.5) { consumed = false; delta = 0; }
    lastMag = mag;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { consumed = false; delta = 0; direction = 0; lastMag = 0; }, 320);
    if (consumed || animating) return;

    delta += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(delta) < 12) return;
    consumed = true;
    direction = sign;

    const points = stops();
    const origin = scrollY;
    const index = points.reduce((best, y, i) =>
      Math.abs(y - origin) < Math.abs(points[best] - origin) ? i : best, 0);
    // If we are between stops (turned back mid-transition), the nearest stop in that direction is the target.
    const between = Math.abs(points[index] - origin) > 2;
    const target = between && Math.sign(points[index] - origin) === sign ? index : index + sign;
    animate(points[Math.max(0, Math.min(points.length - 1, target))]);
  }, { passive: false });
})();
