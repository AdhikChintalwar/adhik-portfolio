import React, { useState } from 'react';
import {
  ArrowUpRight, ArrowDown, Github, Linkedin, Download,
  Code2, BrainCircuit, Cloud, Database, Menu, X,
} from 'lucide-react';
import AvatarStage from './AvatarStage.jsx';

const BASE = import.meta.env.BASE_URL;
const RESUME = BASE + 'Adhik_Chintalwar_Resume.pdf';

const links = [
  ['Home', '#home'], ['About', '#about'], ['Experience', '#experience'],
  ['Projects', '#projects'], ['Contact', '#contact'],
];
const skills = [
  { icon: BrainCircuit, name: 'AI / ML', desc: 'Intelligent systems and applied AI' },
  { icon: Code2, name: 'Full-stack', desc: 'Java, Angular, .NET' },
  { icon: Cloud, name: 'Cloud and DevOps', desc: 'AWS, Azure, deployment' },
  { icon: Database, name: 'Data and systems', desc: 'APIs, architecture, analytics' },
];
const work = [
  { company: 'Agilysys', time: '2025 – Present', role: 'Software Engineering', desc: 'Building and improving enterprise software systems.' },
  { company: 'Walmart', time: '2024', role: 'Software Engineering', desc: 'Experience delivering software in large-scale environments.' },
  { company: 'Cigna', time: '2022 – 2023', role: 'Software Engineering', desc: 'Engineering experience across application development and services.' },
];
const projects = [
  { icon: BrainCircuit, name: 'AI Interview OS', desc: 'An interview preparation application exploring AI-powered answer evaluation, personalized learning, and progress tracking.', tags: ['AI', 'React Native', 'Product'] },
  { icon: Code2, name: 'Full-Stack Engineering', desc: 'Enterprise application development across APIs, modern interfaces, cloud services, and software integrations.', tags: ['Java', 'Angular', '.NET'] },
];

export default function App() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="site">
      <header className="topbar">
        <a className="logo" href="#home">AC<span>_</span></a>
        <nav className={menu ? 'nav open' : 'nav'} aria-label="Primary">
          {links.map(([name, href]) => (
            <a key={name} href={href} onClick={() => setMenu(false)}>{name}</a>
          ))}
        </nav>
        <a className="header-cta" href={RESUME} target="_blank" rel="noreferrer">Resume <ArrowUpRight size={15} /></a>
        <button className="menu" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div className="split">
        <aside className="col-stage"><AvatarStage /></aside>

        <main className="col-copy">
          <section className="hero" id="home">
            <p className="hello">Hello, I’m</p>
            <h1>Adhik Chintalwar</h1>
            <h2>AI engineer and full-stack developer</h2>
            <p className="lede">Building intelligent, scalable systems at the intersection of AI, data, and modern web technologies.</p>
            <div className="actions">
              <a className="btn primary" href="#projects">Explore my work</a>
              <a className="btn" href="#contact">Get in touch</a>
            </div>
            <div className="cue" aria-hidden="true">
              <span className="track"><svg className="cursor" width="18" height="18" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="currentColor" /></svg></span>
              <span className="cue-desktop">Move your cursor to get my attention</span>
              <span className="cue-touch">Tap to get my attention</span>
            </div>
            <a className="scroll" href="#about">Scroll to explore <ArrowDown size={16} /></a>
          </section>

          <section className="sec" id="about">
            <h2>Engineering what’s next</h2>
            <p className="lead">I’m a software engineer focused on building useful, reliable technology — from full-stack applications to AI-powered experiences.</p>
            <p>My background includes engineering experience at Agilysys, Walmart, and Cigna. I work across modern applications, services, cloud platforms, and emerging AI workflows.</p>
            <a className="text-link" href={RESUME} target="_blank" rel="noreferrer">View current resume <Download size={16} /></a>
          </section>

          <section className="sec" id="experience">
            <h2>Where I’ve built</h2>
            <ul className="rows">
              {work.map((w) => (
                <li key={w.company}>
                  <span className="when">{w.time}</span>
                  <div><h3>{w.company}</h3><strong>{w.role}</strong><p>{w.desc}</p></div>
                </li>
              ))}
            </ul>
            <p className="note">Brief overview for now. Detailed achievements will be added with the revised resume.</p>
          </section>

          <section className="sec" id="projects">
            <h2>Selected work</h2>
            <ul className="rows">
              {projects.map(({ icon: Icon, name, desc, tags }) => (
                <li key={name}>
                  <span className="when"><Icon size={26} /></span>
                  <div>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    <div className="tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="note">Project details and links can be expanded as your portfolio content is updated.</p>
          </section>

          <section className="sec" id="skills">
            <h2>Skills</h2>
            <ul className="skills">
              {skills.map(({ icon: Icon, name, desc }) => (
                <li key={name}><Icon size={22} /><div><strong>{name}</strong><p>{desc}</p></div></li>
              ))}
            </ul>
          </section>

          <section className="sec" id="contact">
            <h2>Let’s build something</h2>
            <p className="lead">Open to meaningful engineering conversations, collaboration, and new opportunities.</p>
            <div className="contact-links">
              <a href="https://github.com/AdhikChintalwar" target="_blank" rel="noreferrer"><Github size={20} /> GitHub <ArrowUpRight size={16} /></a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><Linkedin size={20} /> LinkedIn <ArrowUpRight size={16} /></a>
            </div>
            <p className="note">The LinkedIn link is a placeholder until your profile URL is confirmed.</p>
          </section>

          <footer><span>© {new Date().getFullYear()} Adhik Chintalwar</span></footer>
        </main>
      </div>
    </div>
  );
}
