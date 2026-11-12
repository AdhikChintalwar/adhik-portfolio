import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header.jsx';
import ChatWidget from './ChatWidget.jsx';
import { PERSON } from './content.js';
import { jumpTo } from './router.js';
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

// The sections of the page, in order. The first word of a title is shown in red. A section with `when` is left out unless it applies.
const SECTIONS = [
  { id: 'overview', label: 'Overview', title: ['About', 'this project'] },
  { id: 'screens', label: 'Screens', title: ['Screens', 'and demo'], when: (p) => (p.media || []).length > 0 },
  { id: 'built', label: 'What I built', title: ['What', 'I built'] },
  { id: 'problem', label: 'The problem', title: ['The', 'problem'] },
  { id: 'architecture', label: 'Architecture', title: ['How it', 'fits together'] },
  { id: 'admin', label: 'Admin ERP', title: ['Admin', 'ERP for wholesalers'] },
  { id: 'ordering', label: 'Ordering portal', title: ['Pharmacy', 'ordering portal'] },
  { id: 'platform', label: 'Platform portal', title: ['Platform', 'operations'] },
  { id: 'security', label: 'Security', title: ['Security', 'and compliance'] },
  { id: 'data', label: 'Data', title: ['Data', 'layer'] },
  { id: 'delivery', label: 'Delivery', title: ['Delivery', 'and DevOps'] },
  { id: 'lessons', label: 'Problems solved', title: ['Problems', 'I solved'] },
  { id: 'stack', label: 'Tech stack', title: ['Tech', 'stack'] },
];

const mediaSrc = (slug, src) => (/^(https?:)?\/\//.test(src) || src.startsWith(BASE) ? src : `${BASE}projects/${slug}/${src.replace(/^\/+/, '')}`);

// The system drawn in HTML and CSS (sharp at any size, wraps to one column on a phone)
function Diagram() {
  return (
    <figure className="arch">
      <div className="arch-fb">
        <span className="arch-tag">Firebase</span>
        <div className="arch-apps">
          <div className="arch-node"><b>Admin app</b><small>Wholesaler ERP</small></div>
          <div className="arch-node"><b>Platform app</b><small>Operations team</small></div>
          <div className="arch-node"><b>Ordering app</b><small>Pharmacy portal</small></div>
          <div className="arch-node dim"><b>Marketing site</b><small>Static landing page</small></div>
        </div>
        <p className="arch-note"><strong>Hosting</strong> serves all four apps. <strong>Auth</strong> signs in admin, platform and ordering users (phone, email, Google).</p>
      </div>

      <div className="arch-lower">
        <div className="arch-wires"><span><i>REST + JWT</i></span><span><i>REST + JWT</i></span></div>
        <div className="arch-az">
          <span className="arch-tag">Azure App Service · Linux containers</span>
          <div className="arch-apis">
            <div className="arch-node wide"><b>Admin API</b><small>Express: sales, purchases, batches, parties, reports, platform routes, representative sessions</small><em>Used by the Admin and Platform apps</em></div>
            <div className="arch-node"><b>Ordering API</b><small>Express, CORS-locked to the ordering domains</small><em>Used by the Ordering app</em></div>
          </div>
        </div>
        <div className="arch-wires one"><span><i>SQL</i></span></div>
        <div className="arch-node arch-db"><b>SQL Server</b><small>Azure SQL in production. One shared database, with <code>organisation_id</code> on tenant rows.</small></div>
      </div>
      <figcaption>The production setup. The Azure environment has since been shut down; the same stack runs locally with Docker Compose.</figcaption>
    </figure>
  );
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
  const list = useMemo(() => SECTIONS.filter((s) => !s.when || s.when(p)), [p]);
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

  const sec = (id, body) => {
    const i = list.findIndex((s) => s.id === id);
    const s = list[i];
    return (
      <section className="sec pj-sec" id={id} key={id}>
        <p className="scene">{String(i + 1).padStart(2, '0')} · {s.label}</p>
        <h2><b>{s.title[0]}</b> {s.title[1]}</h2>
        {body}
      </section>
    );
  };

  const kv = (rows) => (
    <dl className="pj-kv">
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd><Rich text={v} /></dd></div>)}
    </dl>
  );

  return (
    <div className="site pj" data-pal="project">
      <div className="aurora" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /></div>
      <Header />

      <main className="pj-wrap">
        <header className="pj-hero">
          <a className="pj-back" href="#projects"><ArrowLeft size={14} /> All projects</a>
          <p className="eyebrow"><span>{p.eyebrow}</span></p>
          <h1 className="pj-title" aria-label={p.name}><b>{p.title[0]}</b>{p.title[1]}</h1>
          <p className="pj-tagline">{p.tagline}</p>
          <p className="pj-intro">{p.intro}</p>
          <div className="tags">{p.stack.map((t) => <span key={t}>{t}</span>)}</div>
          <div className="actions">
            {p.repo && <a className="btn primary" href={p.repo} target="_blank" rel="noreferrer"><Github size={15} /> View source <ArrowUpRight size={14} /></a>}
            <button type="button" className={p.repo ? 'btn' : 'btn primary'} onClick={() => go(list[1].id)}>{media.length ? 'See the screens' : 'Read the build'} <ArrowRight size={14} /></button>
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
            {sec('overview', <>
              {p.overview.map((t, i) => <p key={i}><Rich text={t} /></p>)}
            </>)}

            {media.length > 0 && sec('screens', <>
              <div className="pj-media">
                {media.map((m, i) => (
                  <figure key={m.src} className={m.type === 'video' || i === 0 ? 'wide' : undefined}>
                    {m.type === 'video'
                      ? <video controls preload="metadata" playsInline poster={m.poster ? mediaSrc(p.slug, m.poster) : undefined} src={mediaSrc(p.slug, m.src)} aria-label={m.caption || 'Project video'} />
                      : (
                        <button type="button" className="pj-shot" onClick={() => setLb(i)} aria-label={`Enlarge: ${m.caption || 'screenshot'}`}>
                          <img src={mediaSrc(p.slug, m.src)} alt={m.caption || ''} loading="lazy" />
                        </button>
                      )}
                    {m.caption && <figcaption>{m.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </>)}

            {sec('built', <ul className="bullets pj-built">{p.built.map((b, i) => <li key={i}><Rich text={b} /></li>)}</ul>)}

            {sec('problem', <>
              <p>{p.problem.intro}</p>
              <ul className="bullets">{p.problem.groups.map((g) => <li key={g.who}><b>{g.who}</b> {g.need}</li>)}</ul>
              <p>{p.problem.outro}</p>
              <ul className="pj-products">
                {p.problem.products.map((x) => <li key={x.app}><span>{x.who}</span><b>{x.app}</b><small>{x.note}</small></li>)}
              </ul>
              <details className="pj-details">
                <summary>New to pharma distribution? Key terms</summary>
                {kv(p.glossary)}
              </details>
            </>)}

            {sec('architecture', <>
              <Diagram />
              {p.architecture.why.map((t, i) => <p key={i}><Rich text={t} /></p>)}
              <h3 className="pj-h3">Repository layout</h3>
              <pre className="pj-pre" tabIndex={0}>{p.architecture.tree}</pre>
              <p className="pj-small">Tooling</p>
              <div className="tags">{p.architecture.tooling.split(', ').map((t) => <span key={t}>{t}</span>)}</div>
            </>)}

            {sec('admin', <>
              <p><Rich text={p.admin.intro} /></p>
              <div className="pj-groups">
                {p.admin.modules.map((g) => (
                  <div className="pj-group" key={g.group}>
                    <h3>{g.group}</h3>
                    <dl>{g.items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                  </div>
                ))}
              </div>
              <h3 className="pj-h3">Domain logic</h3>
              <ul className="bullets">{p.admin.logic.map((b, i) => <li key={i}><Rich text={b} /></li>)}</ul>
            </>)}

            {sec('ordering', <>
              <p><Rich text={p.ordering.intro} /></p>
              <ol className="pj-steps">{p.ordering.steps.map((s, i) => <li key={i}><span><Rich text={s} /></span></li>)}</ol>
              <p className="pj-callout"><Rich text={p.ordering.note} /></p>
              <p className="pj-small">Ordering API routes</p>
              <div className="tags pj-code">{p.ordering.areas.map((a) => <span key={a}>/api/{a}</span>)}</div>
            </>)}

            {sec('platform', <>
              <p>{p.platform.intro}</p>
              {kv(p.platform.screens)}
              <p className="pj-callout"><Rich text={p.platform.support} /></p>
            </>)}

            {sec('security', <>
              {kv(p.security.rows)}
              <h3 className="pj-h3">Compliance and trust</h3>
              <ul className="bullets">{p.security.compliance.map((b, i) => <li key={i}><Rich text={b} /></li>)}</ul>
            </>)}

            {sec('data', <>
              <ul className="bullets">{p.data.points.map((b, i) => <li key={i}><Rich text={b} /></li>)}</ul>
              <p className="pj-small">Key tables</p>
              <div className="tags pj-code">{p.data.tables.map((t) => <span key={t}>{t}</span>)}</div>
            </>)}

            {sec('delivery', <>
              <h3 className="pj-h3">Run it locally</h3>
              <pre className="pj-pre" tabIndex={0}>{p.delivery.local}</pre>
              <p>{p.delivery.localNote}</p>
              <p>{p.delivery.flow}</p>
              <h3 className="pj-h3">Production setup</h3>
              {kv(p.delivery.prod)}
              <p className="pj-callout"><strong>Status.</strong> {p.delivery.status}</p>
            </>)}

            {sec('lessons', <div className="pj-lessons">
              {p.lessons.map((l) => (
                <article key={l.title}>
                  <h3>{l.title}</h3>
                  {kv(l.lines)}
                </article>
              ))}
            </div>)}

            {sec('stack', <>
              <dl className="pj-tech">
                {p.tech.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
            </>)}

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
