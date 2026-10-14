(() => {
  'use strict';


function departureOrbits(){
 const colors=['#805CFB','#5271FF','#FFFFFF'];
 const rand=(a,b)=>a+Math.random()*(b-a);
 const rotating=(content)=>`<g class="ring" style="animation-duration:${rand(16,48).toFixed(2)}s;animation-delay:-${rand(0,48).toFixed(2)}s;animation-direction:${Math.random()<.5?'normal':'reverse'}"><g class="hero-fade" style="--fade-duration:${rand(6,14).toFixed(2)}s;--fade-delay:-${rand(0,14).toFixed(2)}s">${content}</g></g>`;
 const shapes=[145,174,203,232,261,288].map((r,i)=>{
  const circumference=2*Math.PI*r;
  const arc=circumference*rand(.12,.20);
  const arcShape=rotating(`<circle cx="300" cy="300" r="${r}" stroke="${colors[i%3]}" opacity="${i%3===2?.75:.55}" stroke-dasharray="${arc} ${circumference*.16} ${arc*.6} ${circumference-arc*1.6-circumference*.16}" transform="rotate(${rand(0,360)} 300 300)"/>`);
  const marks=Array.from({length:3},(_,j)=>{
   const angle=(j*120+rand(0,50))*Math.PI/180;
   const x=300+r*Math.cos(angle),y=300+r*Math.sin(angle),size=rand(4,6),color=colors[(i+j)%3];
   return rotating((i+j)%2===0?`<circle class="orbit-marker" stroke="none" cx="${x}" cy="${y}" r="${size}" fill="${color}"/>`:`<rect class="orbit-marker" stroke="none" x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" rx="1" fill="${color}" transform="rotate(${angle*180/Math.PI} ${x} ${y})"/>`);
  }).join('');
  return arcShape+marks;
 }).join('');
 return `<svg class="solar-rings" viewBox="0 0 600 600" fill="none" aria-hidden="true">${shapes}</svg>`;
}

  const artworks = [...document.querySelectorAll('svg[data-artwork-motion]')];
  const cssArtworks = [...document.querySelectorAll('.solar-pro-hero')];
  const motionTargets = [...artworks, ...cssArtworks];
  const toggle = document.querySelector('[data-artwork-toggle]');
  if (!motionTargets.length || !toggle) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let userPaused = false;

  function sync() {
    const stopped = userPaused || preference.matches;
    document.querySelector('.space-background')?.classList.toggle('is-running', !stopped && !document.hidden);
    artworks.forEach((svg) => {
      if (stopped || document.hidden || !visible.has(svg)) {
        svg.pauseAnimations();
      } else {
        svg.unpauseAnimations();
      }
    });
    cssArtworks.forEach((hero) => {
      hero.classList.toggle('is-running', !stopped && !document.hidden && visible.has(hero));
    });
    toggle.textContent = stopped ? '움직임 재생' : '움직임 멈추기';
    toggle.setAttribute('aria-pressed', String(stopped));
    toggle.disabled = preference.matches;
    toggle.title = preference.matches ? '시스템의 움직임 줄이기 설정을 따릅니다.' : '';
  }

  artworks.forEach((svg) => {
    svg.pauseAnimations();
    svg.setAttribute('data-motion-ready', '');
  });

  cssArtworks.forEach((hero) => {
    hero.classList.remove('is-running');
    if (!hero.querySelector('.solar-rings')) {
      hero.insertAdjacentHTML('afterbegin', departureOrbits());
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      });
      sync();
    });
    motionTargets.forEach((target) => observer.observe(target));
  }

  toggle.addEventListener('click', () => {
    if (preference.matches) return;
    userPaused = !userPaused;
    sync();
  });
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
  toggle.hidden = false;
})();
