// Content rolls out of the film reel behind the avatar as it scrolls into view: each block starts edge-on at his position and
// swings flat (a 3D unroll) while it travels left into the column.
//  - the avatar stage is painted above the text, so the text really does come out from behind him
//  - a block only starts once it has stayed in view for a moment, so flying past sections shows nothing
//  - leaving the screen (either direction) re-arms the block, so it plays again when you come back
//  - the big name is split into letters (data-letters): each letter flies out on its own, then cycles through colors
//  - reduced-motion users get plain static content
import { AVATAR_X } from './stageConfig.js';

const SELECTORS = [
  '.hero > *',
  '.sec > h2', '.sec > h3', '.sec > p', '.sec > .text-link',
  '.sec .rows > li', '.sec .skills > li', '.sec .contact-lines > li', '.sec .contact-links',
].join(',');
const SETTLE = 110;        // ms a block must stay in view before it slides in
const STAGGER = 70;        // ms between blocks that arrive together
const GATE_MAX = 2800;     // ms to wait for the avatar before showing the first screen anyway

export function startReveal() {
  const copy = document.querySelector('.col-copy');
  if (!copy || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return () => {};
  const stage = document.querySelector('.col-stage');
  const els = [...copy.querySelectorAll(SELECTORS)];
  const isName = (el) => el.hasAttribute('data-letters');
  const live = new Set();                       // blocks currently on screen
  const timers = new Map();
  let gate = !!window.__avatarReady;            // the first screen waits for the avatar, so text comes out from behind a visible character
  let gateTimer = 0;

  // how far to start from: the left edge of the text column (or of each letter) to where the avatar stands
  const letters = [...copy.querySelectorAll('[data-letters] .ch')];
  const names = els.filter(isName);
  // each word of the name is sized to fill the text column, whatever font is loaded: size = column width / width of the word (in em)
  const WORD_MAX = [380, 220];
  const fitNames = () => {
    const cs = getComputedStyle(copy);
    const avail = copy.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0');
    names.forEach((h) => {
      h.querySelectorAll('.w').forEach((w, i) => {
        const width = w.getBoundingClientRect().width;
        const fs = parseFloat(getComputedStyle(w).fontSize);
        if (width > 0 && fs > 0) h.style.setProperty(`--fs${i + 1}`, `${Math.max(28, Math.min(WORD_MAX[i] || 240, (avail * 0.99 * fs) / width)).toFixed(1)}px`);
      });
    });
  };
  const setShift = () => {
    fitNames();
    if (!stage || matchMedia('(max-width: 960px)').matches) {
      els.forEach((el) => el.style.removeProperty('--rv-x'));
      letters.forEach((l) => l.style.removeProperty('--lx'));
      return;
    }
    const s = stage.getBoundingClientRect(), c = copy.getBoundingClientRect();
    const target = s.left + s.width * AVATAR_X;
    // every block starts with its left edge at the avatar, wherever it sits in the column. (Starting further right would put
    // second-column items outside the screen, where the page clips them and the observer can no longer see them.)
    // offsetLeft ignores transforms, so the numbers stay right while a block is still hidden behind him.
    els.forEach((el) => { if (!isName(el)) el.style.setProperty('--rv-x', `${Math.round(target - (c.left + el.offsetLeft))}px`); });
    // offsetLeft ignores transforms, so this is correct even while a letter is still hidden behind him
    letters.forEach((l) => l.style.setProperty('--lx', `${Math.round(target - (c.left + l.offsetLeft))}px`));
  };
  setShift();
  const chroma = !!(window.CSS && CSS.registerProperty);   // animated letter colors need registered custom properties
  els.forEach((el) => {
    if (isName(el)) { el.classList.add('js'); if (chroma) el.classList.add('chroma'); }
    else el.classList.add('rv');
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setShift);   // web fonts change letter positions

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
    letters.forEach((l) => l.style.removeProperty('--lx'));
    els.forEach((el) => { el.style.removeProperty('--rv-x'); el.classList.remove('rv', 'in', 'js', 'chroma'); el.style.removeProperty('--rv-d'); });
  };
}
