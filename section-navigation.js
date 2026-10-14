/* Native links retain hash history and keyboard behavior; only state is observed. */
(() => {
  const desktop = matchMedia('(min-width: 761px)');
  const navigation = document.querySelector('.section-navigation');
  if (!navigation) return;
  const links = [...navigation.querySelectorAll('a')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let frame = null;
  const update = () => {
    frame = null;
    if (!desktop.matches) return;
    const center = innerHeight / 2;
    let active = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= center) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    if (frame === null) frame = requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  desktop.addEventListener('change', schedule);
  schedule();
})();
