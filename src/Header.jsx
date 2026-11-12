import React, { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;
export const RESUME = BASE + 'Adhik_Chintalwar_Resume.pdf';

const links = [
  ['Home', '#home'], ['About', '#about'], ['Experience', '#experience'],
  ['Projects', '#projects'], ['Contact', '#contact'],
];

// The top bar, shared by the home page and the project pages (on a project page these links lead back to the matching home section)
export default function Header() {
  const [menu, setMenu] = useState(false);
  return (
    <header className="topbar">
      <a className="logo" href="#home" aria-label="Adhik Chintalwar, home">AC<span>.</span></a>
      <nav className={menu ? 'nav open' : 'nav'} aria-label="Primary">
        {links.map(([name, href]) => (
          <a key={name} href={href} onClick={() => setMenu(false)}>{name}</a>
        ))}
      </nav>
      <a className="header-cta" href={RESUME} target="_blank" rel="noreferrer">Resume <ArrowUpRight size={14} /></a>
      <button className="menu" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>
        {menu ? <X size={22} /> : <Menu size={22} />}
      </button>
    </header>
  );
}
