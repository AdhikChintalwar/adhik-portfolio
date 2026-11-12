import React, { useLayoutEffect } from 'react';
import {
  ArrowUpRight, ArrowRight, ArrowDown, Github, Linkedin, Download, Mail, Phone, MapPin,
  Code2, BrainCircuit, Cloud, Database, Pill, Mic, TrendingUp, Smartphone,
} from 'lucide-react';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import AvatarStage from './AvatarStage.jsx';
import ChatWidget from './ChatWidget.jsx';
import Header, { RESUME } from './Header.jsx';
import ProjectPage from './ProjectPage.jsx';
import { startReveal } from './reveal.js';
import { startPalette } from './palette.js';
import { useRoute, takeRestore, restoreScroll } from './router.js';
import { PERSON, LEDE, ABOUT, SKILLS, WORK, EDUCATION, PROJECTS } from './content.js';
import { PROJECT_PAGES, PROJECT_CARDS } from './projects/index.js';

const ICONS = { ai: BrainCircuit, code: Code2, cloud: Cloud, data: Database, health: Pill, voice: Mic, chart: TrendingUp, remote: Smartphone };

// projects with their own page come first, then the ones listed in content.js
const CARDS = [...PROJECT_CARDS, ...PROJECTS];

// Two words: ADHIK in heavy red, CHINTALWAR in regular mint. Every letter is its own element so it can fly out from behind the avatar (reveal.js, styles.css)
const NAME = [PERSON.first, PERSON.last];
function Name() {
  let k = 0;
  return (
    <h1 className="name" aria-label={NAME.join(' ')} data-letters>
      {NAME.map((word, wi) => (
        <React.Fragment key={word}>
          <span className={'w w' + (wi + 1)} aria-hidden="true">
            {[...word].map((ch, j) => { const i = k++; return <span className="ch" key={i} style={{ '--li': i, '--wi': j }}>{ch}</span>; })}
          </span>
          {wi < NAME.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </h1>
  );
}

// "**bold**" inside a bullet becomes <b>
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p));
}

// A film reel for the stage: it turns slowly behind him
function Reel() {
  const holes = [0, 60, 120, 180, 240, 300];
  return (
    <svg className="reel" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="96" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="88" strokeWidth="1" />
        <circle cx="100" cy="100" r="18" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="6" strokeWidth="2" />
        {holes.map((a) => (
          <g key={a} transform={`rotate(${a} 100 100)`}>
            <circle cx="100" cy="50" r="19" strokeWidth="2.5" />
            <line x1="100" y1="82" x2="100" y2="31" strokeWidth="0.8" opacity="0.6" />
          </g>
        ))}
        {Array.from({ length: 36 }, (_, i) => (
          <line key={i} x1="100" y1="6" x2="100" y2="12" strokeWidth="1.5" transform={`rotate(${i * 10} 100 100)`} />
        ))}
      </g>
    </svg>
  );
}

function Home() {
  useLayoutEffect(() => {
    // coming back from a project page: go to the section that was asked for, or to where the visitor was
    const back = takeRestore();
    const cancel = back ? restoreScroll(back) : () => {};
    const stopReveal = startReveal();     // content rolls out from behind the avatar (reveal.js)
    const stopPalette = startPalette();   // the studio re-lights per scene (palette.js)
    return () => { cancel(); stopReveal(); stopPalette(); };
  }, []);
  return (
    <div className="site">
      <div className="aurora" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /></div>
      <Header />

      <div className="split">
        <aside className="col-stage" data-scene="01">
          <div className="studio" aria-hidden="true">
            <div className="glow" /><div className="strip" /><Reel /><div className="beam" /><div className="floor" />
          </div>
          <AvatarStage />
        </aside>

        <main className="col-copy">
          <section className="hero" id="home">
            <p className="eyebrow"><span>{PERSON.title}</span><span>{PERSON.location}</span></p>
            <Name />
            <span className="rule" aria-hidden="true" />
            <p className="lede">{LEDE}</p>
            <div className="actions">
              <a className="btn" href="#projects">Explore <ArrowRight size={14} /></a>
              <a className="btn primary" href="#contact">Get in touch</a>
            </div>
            <div className="cue" aria-hidden="true">
              <span className="track"><svg className="cursor" width="18" height="18" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="currentColor" /></svg></span>
              <span className="cue-desktop">Move your cursor to get my attention</span>
              <span className="cue-touch">Tap to get my attention</span>
            </div>
            <a className="scroll" href="#about">Scroll to see me in action <ArrowDown size={14} /></a>
          </section>

          <section className="sec" id="about">
            <p className="scene">Scene 02 · About</p>
            <h2><b>Engineering</b> what’s next</h2>
            <p className="lead">{ABOUT.lead}</p>
            <p>{ABOUT.body}</p>
            <a className="text-link" href={RESUME} target="_blank" rel="noreferrer">View resume <Download size={15} /></a>
          </section>

          <section className="sec" id="experience">
            <p className="scene">Scene 03 · Experience</p>
            <h2><b>Where</b> I’ve built</h2>
            <ul className="rows">
              {WORK.map((w) => (
                <li key={w.company}>
                  <span className="when">{w.time}</span>
                  <div>
                    <h3>{w.company}</h3>
                    <strong>{w.role} · {w.type} · {w.place}</strong>
                    {w.bullets.length
                      ? <ul className="bullets">{w.bullets.map((b, i) => <li key={i}><Rich text={b} /></li>)}</ul>
                      : <p>{w.summary}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <h3 className="sub">Education</h3>
            <ul className="rows">
              {EDUCATION.map((e) => (
                <li key={e.school}>
                  <span className="when">{e.time}</span>
                  <div><h3>{e.school}</h3><strong>{e.degree}</strong></div>
                </li>
              ))}
            </ul>
          </section>

          <section className="sec" id="projects">
            <p className="scene">Scene 04 · Projects</p>
            <h2><b>Selected</b> work</h2>
            <ul className="rows">
              {CARDS.map(({ icon, name, desc, tags, href }) => {
                const Icon = ICONS[icon] || Code2;
                return (
                  <li key={name} className={href ? 'has-link' : undefined}>
                    <span className="when"><Icon size={26} /></span>
                    <div>
                      <h3>{name}</h3>
                      <p>{desc}</p>
                      <div className="tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
                      {href && <a className="text-link" href={href} aria-label={`View the ${name} project`}>View project <ArrowRight size={15} /></a>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="sec" id="skills">
            <p className="scene">Scene 05 · Skills</p>
            <h2><b>Skills</b></h2>
            <ul className="skills">
              {SKILLS.map(({ icon, name, desc }) => {
                const Icon = ICONS[icon];
                return <li key={name}><Icon size={22} /><div><strong>{name}</strong><p>{desc}</p></div></li>;
              })}
            </ul>
          </section>

          <section className="sec" id="contact">
            <p className="scene">Scene 06 · Contact</p>
            <h2><b>Let’s</b> build something</h2>
            <p className="lead">Open to meaningful engineering conversations, collaboration, and new opportunities.</p>
            <ul className="contact-lines">
              <li><a href={`mailto:${PERSON.email}`}><Mail size={20} /> {PERSON.email}</a></li>
              {PERSON.showPhone && <li><a href={`tel:${PERSON.phone.replace(/[^+\d]/g, '')}`}><Phone size={20} /> {PERSON.phone}</a></li>}
              <li><span><MapPin size={20} /> {PERSON.location}</span></li>
            </ul>
            <div className="contact-links">
              <a href={PERSON.github} target="_blank" rel="noreferrer"><Github size={18} /> GitHub <ArrowUpRight size={14} /></a>
              {PERSON.linkedin && <a href={PERSON.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn <ArrowUpRight size={14} /></a>}
            </div>
          </section>

          <footer><span>© {new Date().getFullYear()} {PERSON.first} {PERSON.last}</span></footer>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}

// Which page is showing: the home page, or a project page (the address after the # decides; see router.js)
export default function App() {
  const route = useRoute();
  const project = route.page === 'project' ? PROJECT_PAGES[route.slug] : null;
  return project ? <ProjectPage key={project.slug} project={project} /> : <Home />;
}
