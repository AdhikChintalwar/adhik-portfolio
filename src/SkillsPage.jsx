import React, { useLayoutEffect } from 'react';
import {
  ArrowLeft, ArrowUpRight, Database, Network, Cable, KeyRound, Wrench, Mic, AudioLines, ScrollText, RefreshCw, Plug, LifeBuoy, TriangleAlert,
} from 'lucide-react';
import Header, { RESUME } from './Header.jsx';
import ChatWidget from './ChatWidget.jsx';
import { PERSON } from './content.js';
import { jumpTo } from './router.js';
import { SKILL_GROUPS } from './skillsData.js';
import { LOGOS } from './skillLogos.js';
import './project.css';
import './skills.css';

// Small icons for skills that are a practice or a standard, not a product with a logo (the `icon` field in skillsData.js)
const GLYPHS = {
  database: Database, api: Network, socket: Cable, key: KeyRound, tool: Wrench, mic: Mic, audio: AudioLines,
  logs: ScrollText, sync: RefreshCw, plug: Plug, support: LifeBuoy, alert: TriangleAlert,
};

function Mark({ logo, icon }) {
  const art = logo && LOGOS[logo];
  if (art) {
    // the drawings are fixed files in this project (skillLogos.js), never text from a visitor
    return <span className="sk-mark logo" aria-hidden="true"><svg viewBox={art.vb} focusable="false" dangerouslySetInnerHTML={{ __html: art.body }} /></span>;
  }
  const Glyph = GLYPHS[icon] || Wrench;
  return <span className="sk-mark glyph" aria-hidden="true"><Glyph size={22} strokeWidth={1.7} /></span>;
}

function Skill({ s }) {
  const inner = (
    <>
      <Mark logo={s.logo} icon={s.icon} />
      <span className="sk-text">
        <span className="sk-name">{s.name}</span>
        {s.note && <span className="sk-note">{s.note}</span>}
      </span>
    </>
  );
  // A skill with a website opens it in a new tab. One without (a practice, not a product) is a plain label.
  return s.url
    ? (
      <li className="sk-item">
        <a className="sk-card" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.name} (opens the official website in a new tab)`}>
          {inner}
          <ArrowUpRight className="sk-go" size={16} aria-hidden="true" />
        </a>
      </li>
    )
    : <li className="sk-item"><div className="sk-card plain">{inner}</div></li>;
}

export default function SkillsPage() {
  // a new page starts at the top, and the browser tab says which page this is
  useLayoutEffect(() => {
    const title = document.title;
    document.title = `Skills · ${PERSON.first} ${PERSON.last}`;
    const restoration = window.history.scrollRestoration;
    try { window.history.scrollRestoration = 'manual'; } catch { /* not supported */ }
    jumpTo(0);
    const raf = requestAnimationFrame(() => jumpTo(0));
    return () => {
      cancelAnimationFrame(raf);
      document.title = title;
      try { window.history.scrollRestoration = restoration; } catch { /* not supported */ }
    };
  }, []);

  const go = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'start' }); };
  const total = SKILL_GROUPS.reduce((n, g) => n + g.skills.length, 0);

  return (
    <div className="site pj sk" data-pal="project">
      <div className="aurora" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /></div>
      <Header />

      <main className="pj-wrap">
        <header className="pj-hero">
          <a className="pj-back" href="#skills"><ArrowLeft size={14} /> Skills</a>
          <p className="eyebrow"><span>{total} skills · {SKILL_GROUPS.length} groups · the same as my resume</span></p>
          <h1 className="pj-title" aria-label="Skills and tools" style={{ '--n': 16 }}><b>Skills </b>and tools</h1>
          <p className="pj-tagline">Every language, framework and platform on my resume, with a link to where it comes from.</p>
          <p className="pj-intro">Select any skill to open its official website in a new tab. A few entries are working practices or open standards rather than products, so they either link to the standard itself or stay as plain labels.</p>
          <div className="sk-jump" role="navigation" aria-label="Skill groups">
            {SKILL_GROUPS.map((g) => (
              <button type="button" key={g.id} onClick={() => go('sk-' + g.id)}>{(g.title[0] + ' ' + g.title[1]).trim()}</button>
            ))}
          </div>
        </header>

        <div className="pj-content sk-content">
          {SKILL_GROUPS.map((g, i) => (
            <section className="sec pj-sec" id={'sk-' + g.id} key={g.id}>
              <p className="scene">{String(i + 1).padStart(2, '0')} · {(g.title[0] + ' ' + g.title[1]).trim()}</p>
              <h2><b>{g.title[0]}</b> {g.title[1]}</h2>
              <ul className="sk-grid">
                {g.skills.map((s) => <Skill s={s} key={s.name} />)}
              </ul>
            </section>
          ))}

          <div className="pj-cta">
            <p className="scene">Next</p>
            <h2><b>Keep</b> exploring</h2>
            <div className="actions">
              <a className="btn" href="#skills"><ArrowLeft size={14} /> Back to portfolio</a>
              <a className="btn" href={RESUME} target="_blank" rel="noreferrer">View resume <ArrowUpRight size={14} /></a>
              <a className="btn primary" href="#contact">Get in touch</a>
            </div>
          </div>
        </div>
      </main>

      <footer className="pj-foot">
        <span>© {new Date().getFullYear()} {PERSON.first} {PERSON.last}</span>
        <span>Logos belong to their owners</span>
      </footer>
      <ChatWidget />
    </div>
  );
}
