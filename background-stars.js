/* Keep decorative stars away from text, independently of artwork. */
(() => {
  const field = document.querySelector('.space-background');
  if (!field) return;
  // Extra stars only on desktop; keep the approved mobile density unchanged.
  let seed = 141026;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 180; i++) {
    const star = document.createElement('i');
    const bright = i % 4 === 0, twinkle = i % 9 === 0;
    star.className = 'desktop-star' + (twinkle ? ' twinkle-star' : '');
    const size = bright ? 2 + random() * 1.1 : 1.2 + random() * 1.2;
    star.style.cssText = `left:${random()*99+.5}%;top:${random()*99+.5}%;width:${size}px;height:${size}px;opacity:${twinkle ? 1 : bright ? .65+random()*.3 : .18+random()*.25};--twinkle-duration:${5.5+random()*4}s;--twinkle-delay:-${random()*12}s`;
    fragment.append(star);
  }
  field.append(fragment);
  const stars = [...field.children];
  const copy = [...document.querySelectorAll('.scene-copy,.hero-content,.outro h2,.outro p,.outro .graphic-space,header,footer,nav,.section-navigation,.skip-link')];
  let pending = false;
  function layout() {
    pending = false;
    const w = document.documentElement.clientWidth, h = window.innerHeight;
    const areas = copy.map(el => el.getBoundingClientRect()).filter(r => r.width && r.height && r.bottom > 0 && r.top < h);
    for (const star of stars) {
      const x = parseFloat(star.style.left) * w / 100;
      const y = parseFloat(star.style.top) * h / 100;
      const covered = areas.some(r => x > r.left - 24 && x < r.right + 24 && y > r.top - 24 && y < r.bottom + 24);
      if (star._covered !== covered) { star._covered = covered; star.style.visibility = covered ? 'hidden' : ''; }
    }
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(layout); } }
  // While a section transition is running, wait for scrolling to settle instead of re-measuring every frame.
  let settle;
  addEventListener('scroll', () => { clearTimeout(settle); settle = setTimeout(schedule, 140); }, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  new ResizeObserver(schedule).observe(document.body);
  document.fonts?.ready.then(schedule);
  layout();
})();
