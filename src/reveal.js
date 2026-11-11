// Content blocks slide in horizontally from behind the avatar as they scroll into view.
//  - the avatar stage is painted above the text, so the text really does come out from behind him
//  - a block only starts once it has stayed in view for a moment, so flying past sections shows nothing
//  - leaving the screen (either direction) re-arms the block, so it plays again when you come back
//  - reduced-motion users get plain static content
const SELECTORS = [
  '.hero > *',
  '.sec > h2', '.sec > p', '.sec > .text-link',
  '.sec .rows > li', '.sec .skills > li', '.sec .contact-links',
].join(',');
const SETTLE = 110;        // ms a block must stay in view before it slides in
const STAGGER = 70;        // ms between blocks that arrive together
const GATE_MAX = 2800;     // ms to wait for the avatar before showing the first screen anyway

export function startReveal() {
  const copy = document.querySelector('.col-copy');
  if (!copy || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return () => {};
  const stage = document.querySelector('.col-stage');
  const els = [...copy.querySelectorAll(SELECTORS)];
  const live = new Set();                       // blocks currently on screen
  const timers = new Map();
  let gate = !!window.__avatarReady;            // the first screen waits for the avatar, so text comes out from behind a visible character
  let gateTimer = 0;

  // how far to start from: the left edge of the text column to the middle of the avatar
  const setShift = () => {
    if (!stage || matchMedia('(max-width: 960px)').matches) { copy.style.removeProperty('--rv-x'); return; }
    const s = stage.getBoundingClientRect(), c = copy.getBoundingClientRect();
    const left = c.left + parseFloat(getComputedStyle(copy).paddingLeft || '0');
    copy.style.setProperty('--rv-x', `${Math.round(s.left + s.width / 2 - left)}px`);
  };
  setShift();
  els.forEach((el) => el.classList.add('rv'));

  const show = (el, delay) => {
    if (!live.has(el)) return;
    el.style.setProperty('--rv-d', `${delay}ms`);
    el.classList.add('in');
  };
  const arrive = (list) => list.forEach((el, i) => {
    clearTimeout(timers.get(el));
    timers.set(el, setTimeout(() => show(el, Math.min(i, 6) * STAGGER), SETTLE));
  });

  const io = new IntersectionObserver((entries) => {
    const entering = [];
    for (const e of entries) {
      if (e.isIntersecting) { live.add(e.target); entering.push(e.target); }
      else { live.delete(e.target); clearTimeout(timers.get(e.target)); e.target.classList.remove('in'); }
    }
    if (gate && entering.length) arrive(entering);
  }, { rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));

  const open = () => {
    if (gate && !live.size) return;
    gate = true;
    clearTimeout(gateTimer);
    arrive([...live].sort((a, b) => els.indexOf(a) - els.indexOf(b)));
  };
  if (!gate) {
    window.addEventListener('avatar-ready', open, { once: true });
    gateTimer = setTimeout(open, GATE_MAX);
  }

  // keyboard users tabbing into a block that is still hidden
  const onFocus = (e) => { const r = e.target.closest && e.target.closest('.rv'); if (r) r.classList.add('in'); };
  copy.addEventListener('focusin', onFocus);
  window.addEventListener('resize', setShift);

  return () => {
    io.disconnect();
    clearTimeout(gateTimer);
    timers.forEach(clearTimeout);
    window.removeEventListener('avatar-ready', open);
    window.removeEventListener('resize', setShift);
    copy.removeEventListener('focusin', onFocus);
    copy.style.removeProperty('--rv-x');
    els.forEach((el) => { el.classList.remove('rv', 'in'); el.style.removeProperty('--rv-d'); });
  };
}
