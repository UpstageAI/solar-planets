/* Native touch snapping lives in CSS. Group trackpad/wheel momentum into
   one adjacent section move; keyboard, horizontal gestures and zoom stay native. */
(() => {
  const mobile = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let idleTimer, settleTimer, consumed = false, delta = 0, destination = null;
  const stops = () => {
    const end = document.documentElement.scrollHeight - innerHeight;
    return [...new Set([0, ...document.querySelectorAll('.scene, .outro')]
      .map(el => typeof el === 'number' ? el : el.getBoundingClientRect().top + scrollY)
      .map(y => Math.max(0, Math.min(end, Math.round(y))))
      .concat(Math.round(end)))].sort((a, b) => a - b);
  };
  // Only the section being read can opt desktop scrolling out of paging.
  const desktopOverflow = () => {
    const center = innerHeight / 2;
    const current = [...document.querySelectorAll('.hero, .scene, .outro')]
      .find(el => {
        const bounds = el.getBoundingClientRect();
        return bounds.top <= center && bounds.bottom > center;
      });
    return current && current.getBoundingClientRect().height > innerHeight + 1;
  };
  const settled = () => { destination = null; clearTimeout(settleTimer); };
  addEventListener('scrollend', settled);
  addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        (window.visualViewport && visualViewport.scale > 1) ||
        event.target.closest('input, textarea, select, [contenteditable="true"]') ||
        (mobile.matches
          ? [...document.querySelectorAll('.scene')].some(el => el.scrollHeight > el.clientHeight + 1)
          : desktopOverflow())) return;
    if (!event.deltaY) return;
    event.preventDefault();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { consumed = false; delta = 0; }, 200);
    if (consumed) return;
    delta += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(delta) < 24) return;
    consumed = true;
    const points = stops();
    const origin = destination === null ? scrollY : destination;
    const index = points.reduce((best, y, i) =>
      Math.abs(y - origin) < Math.abs(points[best] - origin) ? i : best, 0);
    destination = points[Math.max(0, Math.min(points.length - 1, index + Math.sign(delta)))];
    scrollTo({ top: destination, behavior: reduced.matches ? 'instant' : 'smooth' });
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settled, 800);
  }, { passive: false });
})();
