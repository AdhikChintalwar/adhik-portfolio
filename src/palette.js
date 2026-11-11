// Each section is a "scene" with its own mix of the brand colors (charcoal, forest green, crimson). This only tells the page
// which scene is in view (data-pal on .site, data-scene on the stage); the backdrop colors and their smooth cross-fade live in
// styles.css. The 3D avatar's rim lights listen for the 'palette' event so they match.
const IDS = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];
// rim light colors per scene: [green side, crimson side]
const RIM = {
  home:       ['#2fbf8a', '#ff4a45'],
  about:      ['#6fe0b0', '#d9453d'],
  experience: ['#2fbf8a', '#ff4a45'],
  projects:   ['#ff6a55', '#ff3d3d'],
  skills:     ['#6fe0b0', '#ff4a45'],
  contact:    ['#2fbf8a', '#ff6f5e'],
};

export function startPalette() {
  const site = document.querySelector('.site');
  const stage = document.querySelector('.col-stage');
  if (!site) return () => {};
  let cur = '', raf = 0;

  const announce = () => {
    const [c1, c2] = RIM[cur] || RIM.home;
    window.__palette = { c1, c2 };
    if (stage) stage.dataset.scene = String(IDS.indexOf(cur) + 1).padStart(2, '0');
    window.dispatchEvent(new CustomEvent('palette', { detail: window.__palette }));
  };
  const pick = () => {
    const line = window.innerHeight * 0.45;
    let now = 'home';
    for (const id of IDS) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= line) now = id; }
    if (now !== cur) { cur = now; site.dataset.pal = now; announce(); }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pick(); }); };

  pick();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    delete site.dataset.pal;
  };
}
