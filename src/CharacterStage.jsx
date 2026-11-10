import React, { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;
const LINES = { left: 'Anyone here on the left?', right: 'Anyone here on the right?' };
const CENTER_LINES = ['Hey, it’s you!', 'Check out the portfolio'];

// Plays a pre-rendered frame sequence on a canvas. The cursor only selects one of three
// zones; each zone plays a short clip (start -> peak), holds, then plays back to idle.
// All per-frame work happens in requestAnimationFrame, outside React.
export default function CharacterStage() {
  const box = useRef(null);
  const canvas = useRef(null);
  const [ready, setReady] = useState(false);
  const [cue, setCue] = useState({ zone: 'center', text: '', show: false });

  useEffect(() => {
    const cv = canvas.current;
    const wrap = box.current;
    const ctx = cv.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
    let dead = false;
    let stop = () => {};

    fetch(`${BASE}frames/manifest.json`)
      .then((r) => { if (!r.ok) throw new Error('manifest'); return r.json(); })
      .then((m) => { if (!dead) stop = run(m); })
      .catch(() => console.warn('Character frames not found: public/frames/manifest.json'));

    function run(m) {
      const { count, idle, zones, fps = 24, holdMs = 2400, ext = 'webp' } = m;
      const frames = new Array(count + 1);
      const load = (n) => {
        if (frames[n]) return;
        const img = new Image();
        img.decoding = 'async';
        img.src = `${BASE}frames/f${String(n).padStart(3, '0')}.${ext}`;
        frames[n] = img;
      };
      [idle.from, idle.to, ...Object.values(zones).flatMap((z) => [z.from, z.to])].forEach(load);
      for (let n = 1; n <= count; n++) load(n);
      const get = (n) => {
        const f = frames[Math.round(n)];
        return f && f.complete && f.naturalWidth ? f : null;
      };

      let pos = idle.from, phase = 'idle', zone = null, clip = null, dir = 0;
      let holdUntil = 0, cool = 0, pending = null, lastZone = null, idleT = 0;
      let visible = true, shown = -1, dirty = true, fade = null, lastImg = null;
      let w = 0, h = 0, last = performance.now(), raf = 0, announced = false, ready_ = false, timers = [];

      const say = (z) => {
        timers.forEach(clearTimeout);
        timers = [];
        if (!z) return setCue((c) => ({ ...c, show: false }));
        if (z === 'center') {
          setCue({ zone: z, text: CENTER_LINES[0], show: true });
          timers.push(setTimeout(() => setCue({ zone: z, text: CENTER_LINES[1], show: true }), 1500));
        } else {
          setCue({ zone: z, text: LINES[z], show: true });
        }
      };
      const jump = (n) => {
        if (lastImg && Math.round(pos) !== n) fade = { img: lastImg, t0: performance.now() };
        pos = n;
      };
      const begin = (z) => {
        clip = zones[z];
        dir = Math.sign(clip.to - clip.from);
        zone = z;
        pending = null;
        jump(clip.from);
        phase = 'in';
        say(z);
      };
      const finish = (t) => {
        jump(idle.from);
        idleT = 0;
        phase = 'idle';
        clip = null;
        zone = null;
        cool = t + 500;
        lastZone = null;
        say(null);
      };
      const request = (z) => {
        if (phase === 'idle') { pending = z; return; }
        if (z === zone) return;
        pending = z;
        if (phase === 'hold') holdUntil = Math.min(holdUntil, performance.now() + 700);
      };

      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        w = cv.width = Math.max(1, Math.round(wrap.clientWidth * dpr));
        h = cv.height = Math.max(1, Math.round(wrap.clientHeight * dpr));
        dirty = true;
      };
      const paint = (img, a) => {
        const r = Math.min(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
        ctx.globalAlpha = a;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.globalAlpha = 1;
      };
      const render = (t) => {
        const f = Math.round(pos);
        const exact = get(f);
        const img = exact || lastImg;
        if (!img) return;
        if (!ready_) { ready_ = true; setReady(true); }
        if (f === shown && !fade && !dirty) return;
        ctx.clearRect(0, 0, w, h);
        if (fade) {
          const a = Math.min(1, (t - fade.t0) / 140);
          paint(fade.img, 1);
          paint(img, a);
          if (a >= 1) fade = null;
        } else paint(img, 1);
        lastImg = img;
        shown = exact ? f : -1;
        dirty = false;
      };
      const tick = (t) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (!visible || document.hidden) return;
        const sp = reduced ? 9999 : fps;
        if (phase === 'idle') {
          if (idle.to > idle.from && !reduced) {
            idleT += dt * fps * 0.7;
            const span = idle.to - idle.from, k = idleT % (span * 2);
            pos = idle.from + (k < span ? k : span * 2 - k);
          }
          if (pending && t >= cool) begin(pending);
        } else if (phase === 'in') {
          pos += dir * sp * dt;
          if (dir === 0 || (dir > 0 && pos >= clip.to) || (dir < 0 && pos <= clip.to)) {
            pos = clip.to; phase = 'hold'; holdUntil = t + holdMs;
          }
        } else if (phase === 'hold') {
          if (t >= holdUntil) phase = 'out';
        } else if (phase === 'out') {
          pos -= dir * sp * dt;
          if (dir === 0 || (dir > 0 && pos <= clip.from) || (dir < 0 && pos >= clip.from)) finish(t);
        }
        render(t);
      };

      const onMove = (e) => {
        if (e.pointerType === 'touch') return;
        const x = e.clientX / window.innerWidth;
        const z = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'center';
        if (z === lastZone) return;
        lastZone = z;
        request(z);
      };
      const onLeave = () => {
        lastZone = null;
        pending = null;
        if (phase === 'hold') holdUntil = Math.min(holdUntil, performance.now() + 500);
      };
      const onTap = () => request('center');

      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && touch && !announced) {
          announced = true;
          timers.push(setTimeout(() => request('center'), 1400));
        }
      });
      io.observe(wrap);
      resize();

      if (!touch) {
        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', onLeave);
        window.addEventListener('blur', onLeave);
      }
      wrap.addEventListener('pointerdown', onTap);
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('blur', onLeave);
        wrap.removeEventListener('pointerdown', onTap);
      };
    }

    return () => { dead = true; stop(); };
  }, []);

  return (
    <div className="stage" ref={box} role="img" aria-label="Adhik Chintalwar working on a laptop">
      <div className={`frame${ready ? ' on' : ''}`}>
        <canvas ref={canvas} />
      </div>
      <p className="bubble" data-zone={cue.zone} data-show={cue.show} aria-live="polite">{cue.text}</p>
    </div>
  );
}
