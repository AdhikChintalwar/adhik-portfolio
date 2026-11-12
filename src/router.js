// A tiny router that works on GitHub Pages (a static host with no server routes): the "page" is kept after the # in the address.
//   https://adhikchintalwar.github.io/adhik-portfolio/                    the home page
//   https://adhikchintalwar.github.io/adhik-portfolio/#about              a section of the home page (as before)
//   https://adhikchintalwar.github.io/adhik-portfolio/#/project/medicorerx   a project page
//   https://adhikchintalwar.github.io/adhik-portfolio/#/skills            the Skills page
// Links to a project page can be shared and reloaded, and the browser's Back button works.
import { useEffect, useState } from 'react';
import { PROJECT_PAGES } from './projects/index.js';

const PROJECT_RE = /^#\/project\/([a-z0-9-]+)\/?$/;
const SKILLS_RE = /^#\/skills\/?$/;

export function parseHash(hash = '') {
  const m = PROJECT_RE.exec(hash);
  if (m && PROJECT_PAGES[m[1]]) return { page: 'project', slug: m[1], section: '' };
  if (SKILLS_RE.test(hash)) return { page: 'skills', slug: '', section: '' };
  let section = '';
  if (hash.length > 1 && hash[1] !== '/') { try { section = decodeURIComponent(hash.slice(1)); } catch { section = hash.slice(1); } }
  return { page: 'home', slug: '', section };
}

// Where the home page was scrolled to when another page (a project or the Skills page) opened, and where to put the visitor when they come back.
// This listener is registered once, when the file loads, so it always runs before React reacts to the same change.
let current = parseHash(window.location.hash);
let homeY = 0;
let pending = null;

// An address like #/project/does-not-exist shows the home page, so tidy it up to #home
function tidy() {
  if (window.location.hash.startsWith('#/') && parseHash(window.location.hash).page === 'home') {
    window.history.replaceState(null, '', window.location.pathname + window.location.search + '#home');
  }
}
tidy();
current = parseHash(window.location.hash);

window.addEventListener('hashchange', () => {
  tidy();
  const next = parseHash(window.location.hash);
  if (current.page === 'home' && next.page !== 'home') homeY = window.scrollY;
  if (current.page !== 'home' && next.page === 'home') pending = next.section ? { id: next.section } : { y: homeY };
  current = next;
});

export function useRoute() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const sync = () => setRoute((prev) => (prev.page === current.page && prev.slug === current.slug ? prev : current));
    window.addEventListener('hashchange', sync);
    sync();
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return route;
}

// The home page asks for this when it appears again: { id } for a section link, { y } for the Back button.
export function takeRestore() {
  const p = pending;
  pending = null;
  return p;
}

// The page has `scroll-behavior: smooth`; these jump at once instead, so a new page does not visibly scroll into place.
function instant(fn) {
  const root = document.documentElement;
  const before = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  void root.offsetHeight;                 // make the browser apply it before scrolling, or it may still animate
  try { fn(); } finally { root.style.scrollBehavior = before; }
}

export function jumpTo(y = 0) {
  instant(() => window.scrollTo(0, y));
}

// Scrolls to a section or an exact position, and once more on the next two frames (the browser may also try to restore its own position). Returns a cancel function.
export function restoreScroll(target) {
  const apply = () => instant(() => {
    const el = target.id ? document.getElementById(target.id) : null;
    if (el) el.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, target.id ? 0 : target.y || 0);
  });
  apply();
  let b = 0;
  const a = requestAnimationFrame(() => { apply(); b = requestAnimationFrame(apply); });
  return () => { cancelAnimationFrame(a); cancelAnimationFrame(b); };
}
