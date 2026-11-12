import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header.jsx';
import ChatWidget from './ChatWidget.jsx';
import { PERSON } from './content.js';
import { jumpTo } from './router.js';
import { DIAGRAMS } from './projects/diagrams.jsx';
import './project.css';

const BASE = import.meta.env.BASE_URL;

// "**bold**" and `code` inside a sentence
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**')) return <b key={i}>{p.slice(2, -2)}</b>;
    if (p.startsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    return p;
  });
}

// The page is built from the `sections` listed in the project's data file. Each section is a list of blocks (see Block below).
// A "Screens and demo" section is added after the first section whenever the project lists screenshots or videos.
const SCREENS = { id: 'screens', label: 'Screens', title: ['Screens', 'and demo'], gallery: true };

const mediaSrc = (slug, src) => (/^(https?:)?\/\//.test(src) || src.startsWith(BASE) ? src : `${BASE}projects/${slug}/${src.replace(/^\/+/, '')}`);

function Kv({ rows }) {
  return (
    <dl className="pj-kv">
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd><Rich text={v} /></dd></div>)}
    </dl>
  );
}

// A stack of boxes joined by arrows: { t: 'layers', rows: [{ tag?, wire?, nodes: [{ b, small?, em?, dim? }] }], caption? }
function Layers({ rows, caption }) {
  return (
    <figure className="lay">
      {rows.map((r, i) => {
        const nodes = (
          <div className={'lay-nodes' + (r.cols ? ' cols' : '')} style={r.cols ? { '--cols': r.cols } : undefined}>
            {r.nodes.map((n) => (
              <div className={'arch-node' + (n.dim ? ' dim' : '') + (n.hot ? ' hot' : '')} key={n.b}>
                <b>{n.b}</b>
                {n.small && <small><Rich text={n.small} /></small>}
                {n.em && <em>{n.em}</em>}
              </div>
            ))}
          </div>
        );
        return (
          <div className="lay-row" key={i}>
            {r.wire && <span className="lay-wire">{r.wire}</span>}
            {r.tag ? <div className="lay-box"><span className="arch-tag">{r.tag}</span>{nodes}</div> : nodes}
          </div>
        );
      })}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// One piece of a section. The data file picks the type with `t`:
//   p, bullets, steps, callout, quote, h3, small, pre, tags, kv, table, bars, chain, stages, layers, groups, lists,
//   products, lessons, tech, details, links, diagram
function Block({ b }) {
  switch (b.t) {
    case 'p': return <p><Rich text={b.text} /></p>;
    case 'h3': return <h3 className="pj-h3">{b.text}</h3>;
    case 'small': return <p className="pj-small">{b.text}</p>;
    case 'bullets': return <ul className={'bullets' + (b.cls ? ` ${b.cls}` : '')}>{b.items.map((x, i) => <li key={i}><Rich text={x} /></li>)}</ul>;
    case 'steps': return <ol className="pj-steps">{b.items.map((x, i) => <li key={i}><span><Rich text={x} /></span></li>)}</ol>;
    case 'callout': return <p className="pj-callout">{b.lead && <><strong>{b.lead}</strong> </>}<Rich text={b.text} /></p>;
    case 'quote': return <blockquote className="pj-quote"><Rich text={b.text} /></blockquote>;
    case 'pre': return <pre className="pj-pre" tabIndex={0}>{b.text}</pre>;
    case 'tags': return <div className={'tags' + (b.code ? ' pj-code' : '')}>{b.items.map((t) => <span key={t}>{b.prefix || ''}{t}</span>)}</div>;
    case 'kv': return <Kv rows={b.rows} />;
    case 'table': {
      return (
        <div className="pj-tablewrap" tabIndex={0}>
          <table className="pj-table">
            <thead><tr>{b.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}>{b.code && j === 0 ? <code>{c}</code> : <Rich text={c} />}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'bars': {
      const max = Math.max(...b.rows.map((r) => r[1]));
      return (
        <div className="pj-bars">
          {b.rows.map(([k, v]) => <div key={k}><span>{k}</span><i><u style={{ width: `${(v / max) * 100}%` }} /></i><b>{v}%</b></div>)}
        </div>
      );
    }
    case 'chain': return <ol className={'pj-chain' + (b.numbered === false ? ' plain' : '')} aria-label={b.label}>{b.items.map((x) => <li key={x}>{x}</li>)}</ol>;
    case 'stages': {
      return (
        <ol className="pj-stages">
          {b.items.map((s) => (
            <li key={s.title}>
              <div>
                <h3>{s.title}</h3>
                {[].concat(s.text).map((t, i) => <p key={i}><Rich text={t} /></p>)}
              </div>
            </li>
          ))}
        </ol>
      );
    }
    case 'layers': return <Layers rows={b.rows} caption={b.caption} />;
    case 'groups': {
      return (
        <div className="pj-groups">
          {b.items.map((g) => (
            <div className="pj-group" key={g.group}>
              <h3>{g.group}</h3>
              <dl>{g.items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </div>
          ))}
        </div>
      );
    }
    case 'lists': {
      return (
        <div className="pj-groups">
          {b.items.map((g) => (
            <div className="pj-group" key={g.title}>
              <h3>{g.title}</h3>
              <ul>{g.items.map((x, i) => <li key={i}><Rich text={x} /></li>)}</ul>
            </div>
          ))}
        </div>
      );
    }
    case 'products': return <ul className="pj-products">{b.items.map((x) => <li key={x.app}><span>{x.who}</span><b>{x.app}</b><small>{x.note}</small></li>)}</ul>;
    case 'lessons': {
      return (
        <div className="pj-lessons">
          {b.items.map((l) => (
            <article key={l.title}>
              <h3>{l.title}</h3>
              <Kv rows={l.lines} />
            </article>
          ))}
        </div>
      );
    }
    case 'tech': return <dl className="pj-tech">{b.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
    case 'details': return <details className="pj-details"><summary>{b.summary}</summary><Kv rows={b.rows} /></details>;
    case 'links': return <div className="actions pj-links">{b.items.map((l) => <a className="btn" href={l.href} key={l.href}>{l.label} <ArrowRight size={14} /></a>)}</div>;
    case 'diagram': { const D = DIAGRAMS[b.id]; return D ? <D /> : null; }
    default: return null;
  }
}

function Lightbox({ item, onClose, onPrev, onNext, many }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const opener = document.activeElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = before;
      if (opener && opener.focus) opener.focus();
    };
  }, []);
  return (
    <div className="pj-lb" role="dialog" aria-modal="true" aria-label={item.caption || 'Screenshot'} onClick={onClose}>
      <button ref={closeRef} type="button" className="pj-lb-x" aria-label="Close" onClick={onClose}><X size={22} /></button>
      {many && <button type="button" className="pj-lb-nav prev" aria-label="Previous screenshot" onClick={(e) => { e.stopPropagation(); onPrev(); }}><ChevronLeft size={28} /></button>}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={item.url} alt={item.caption || ''} />
        {item.caption && <figcaption>{item.caption}</figcaption>}
      </figure>
      {many && <button type="button" className="pj-lb-nav next" aria-label="Next screenshot" onClick={(e) => { e.stopPropagation(); onNext(); }}><ChevronRight size={28} /></button>}
    </div>
  );
}

export default function ProjectPage({ project: p }) {
  const media = p.media || [];
  const list = useMemo(() => {
    const all = [...p.sections];
    if (media.length > 0) all.splice(1, 0, SCREENS);
    return all;
  }, [p, media.length]);
  const [active, setActive] = useState(list[0].id);
  const [lb, setLb] = useState(-1);
  const tocRef = useRef(null);

  // a new page starts at the top, and the browser tab says which project this is
  useLayoutEffect(() => {
    const title = document.title;
    document.title = `${p.name} · ${PERSON.first} ${PERSON.last}`;
    // the browser would otherwise put back an old scroll position when this page is opened with Back/Forward
    const restoration = window.history.scrollRestoration;
    try { window.history.scrollRestoration = 'manual'; } catch { /* not supported */ }
    jumpTo(0);
    const raf = requestAnimationFrame(() => jumpTo(0));
    return () => {
      cancelAnimationFrame(raf);
      document.title = title;
      try { window.history.scrollRestoration = restoration; } catch { /* not supported */ }
    };
  }, [p]);

  // which section is being read (highlights it in the contents list)
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      let cur = list[0].id;
      for (const s of list) { const el = document.getElementById(s.id); if (el && el.getBoundingClientRect().top <= 190) cur = s.id; }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = list[list.length - 1].id;
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [list]);

  // on a phone the contents list is a row that scrolls sideways: keep the current chip in view
  useEffect(() => {
    const ul = tocRef.current && tocRef.current.querySelector('ul');
    const on = ul && ul.querySelector('[aria-current="true"]');
    if (ul && on && ul.scrollWidth > ul.clientWidth + 2) ul.scrollTo({ left: on.offsetLeft - (ul.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const go = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'start' }); };

  // screenshots open in a viewer; arrows step through the images (videos play in place)
  const images = useMemo(() => media.map((m, i) => (m.type === 'video' ? -1 : i)).filter((i) => i >= 0), [media]);
  const step = useCallback((cur, d) => images[(images.indexOf(cur) + d + images.length) % images.length], [images]);
  const closeLb = useCallback(() => setLb(-1), []);
  const prevLb = useCallback(() => setLb((i) => (i < 0 ? i : step(i, -1))), [step]);
  const nextLb = useCallback(() => setLb((i) => (i < 0 ? i : step(i, 1))), [step]);

  return (
    <div className="site pj" data-pal="project">
      <div className="aurora" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /></div>
      <Header />

      <main className="pj-wrap">
        <header className="pj-hero">
          <a className="pj-back" href="#projects"><ArrowLeft size={14} /> All projects</a>
          <p className="eyebrow"><span>{p.eyebrow}</span></p>
          <h1 className="pj-title" aria-label={p.name} style={{ '--n': (p.title[0] + p.title[1]).length }}><b>{p.title[0]}</b>{p.title[1]}</h1>
          <p className="pj-tagline">{p.tagline}</p>
          <p className="pj-intro">{p.intro}</p>
          <div className="tags">{p.stack.map((t) => <span key={t}>{t}</span>)}</div>
          <div className="actions">
            {p.live && <a className="btn primary" href={p.live} target="_blank" rel="noreferrer">Open live site <ArrowUpRight size={14} /></a>}
            {p.repo && <a className={p.live ? 'btn' : 'btn primary'} href={p.repo} target="_blank" rel="noreferrer"><Github size={15} /> View source <ArrowUpRight size={14} /></a>}
            <button type="button" className={p.repo || p.live ? 'btn' : 'btn primary'} onClick={() => go(list[1].id)}>{media.length ? 'See the screens' : 'Read the build'} <ArrowRight size={14} /></button>
          </div>
          {p.heroNote && <p className="pj-note">{p.heroNote}</p>}
          <ul className="pj-facts" aria-label="At a glance">
            {p.facts.map((f) => <li key={f.label}><b>{f.n}</b><span>{f.label}</span></li>)}
          </ul>
        </header>

        <div className="pj-body">
          <nav className="pj-toc" aria-label="On this page" ref={tocRef}>
            <ul>
              {list.map((s) => (
                <li key={s.id}>
                  <button type="button" aria-current={active === s.id ? 'true' : undefined} onClick={() => go(s.id)}>{s.label}</button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pj-content">
            {list.map((s, i) => (
              <section className="sec pj-sec" id={s.id} key={s.id}>
                <p className="scene">{String(i + 1).padStart(2, '0')} · {s.label}</p>
                <h2><b>{s.title[0]}</b> {s.title[1]}</h2>
                {s.gallery ? (
                  <div className="pj-media">
                    {media.map((m, k) => (
                      <figure key={m.src} className={m.type === 'video' || k === 0 ? 'wide' : undefined}>
                        {m.type === 'video'
                          ? <video controls preload="metadata" playsInline poster={m.poster ? mediaSrc(p.slug, m.poster) : undefined} src={mediaSrc(p.slug, m.src)} aria-label={m.caption || 'Project video'} />
                          : (
                            <button type="button" className="pj-shot" onClick={() => setLb(k)} aria-label={`Enlarge: ${m.caption || 'screenshot'}`}>
                              <img src={mediaSrc(p.slug, m.src)} alt={m.caption || ''} loading="lazy" />
                            </button>
                          )}
                        {m.caption && <figcaption>{m.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                ) : s.blocks.map((b, j) => <Block b={b} key={j} />)}
              </section>
            ))}

            <div className="pj-cta">
              <p className="scene">Next</p>
              <h2><b>Keep</b> exploring</h2>
              <div className="actions">
                <a className="btn" href="#projects"><ArrowLeft size={14} /> Back to portfolio</a>
                {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noreferrer"><Github size={15} /> View source <ArrowUpRight size={14} /></a>}
                <a className="btn primary" href="#contact">Get in touch</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="pj-foot">
        <span>© {new Date().getFullYear()} {PERSON.first} {PERSON.last}</span>
        <span>{p.codebase}</span>
      </footer>

      {lb >= 0 && media[lb] && <Lightbox item={{ ...media[lb], url: mediaSrc(p.slug, media[lb].src) }} many={images.length > 1} onClose={closeLb} onPrev={prevLb} onNext={nextLb} />}
      <ChatWidget />
    </div>
  );
}
