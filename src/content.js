// All the words on the page live here, so you can edit them without touching the layout.
// Everything below is either from your resume draft or was already on your portfolio. Nothing here is invented.

export const PERSON = {
  first: 'Adhik',
  last: 'Chintalwar',
  title: 'Software Engineer',
  location: 'Atlanta, GA',
  email: 'adhikchintalwar550@gmail.com',
  phone: '+1 205-585-5829',
  showPhone: false,          // set to true to list your phone number in the Contact section
  github: 'https://github.com/AdhikChintalwar',
  linkedin: '',              // paste your LinkedIn URL here; while empty, the page shows no LinkedIn link
};

export const LEDE = 'Building intelligent, scalable systems at the intersection of AI, data, and modern web technologies.';

export const ABOUT = {
  lead: 'I’m a software engineer focused on building useful, reliable technology, from full-stack applications to AI-powered experiences.',
  body: 'At Agilysys in Atlanta I build internal tools in React and .NET, develop MCP integrations and FastAPI services for an AI-enabled integration platform, and support Property Management System customers. On my own time I build end-to-end projects: a multi-tenant SaaS platform, an equity research system, a local voice assistant and an iPhone-to-Mac remote.',
};

// Each skill is a card in the Skills section. icon is one of: ai, code, cloud, data, systems, support.
// Everything here comes from your Agilysys bullets, your resume draft and your four project guides.
export const SKILLS = [
  { icon: 'ai', name: 'AI and integrations', desc: 'LangGraph, MCP and FastAPI at work. Local-model agents, typed tool registries and privacy gates in my own projects.' },
  { icon: 'code', name: 'Full-stack', desc: 'React, .NET, Node.js, TypeScript, Java and Angular, from internal tools to a multi-tenant SaaS platform.' },
  { icon: 'cloud', name: 'Cloud and DevOps', desc: 'AWS, Azure, Docker, Firebase, Cloudflare and GitHub Actions CI/CD.' },
  { icon: 'data', name: 'Data and APIs', desc: 'SQL Server, SQLite, REST APIs and WebSockets, plus SQL and API troubleshooting in production support.' },
  { icon: 'systems', name: 'Real-time systems', desc: 'Python, asyncio, WebSockets and native macOS APIs (Quartz, AppKit) for input, audio and overlays.' },
  { icon: 'support', name: 'Enterprise support', desc: 'Property Management System customer support: incident investigation, log analysis, data synchronization, third-party integrations.' },
];

export const WORK = [
  {
    company: 'Agilysys',
    place: 'Atlanta, GA',
    time: 'March 2025 – Present',
    role: 'Software Engineer',
    type: 'Full-time',
    summary: 'Internal full-stack tools, AI-enabled integrations, and technical support for Property Management System customers.',
    href: '#/project/agilysys',   // the Agilysys page (src/projects/agilysys.js); empty it to hide the "View role details" link
    tags: ['React', '.NET', 'REST APIs', 'FastAPI', 'MCP', 'LangGraph', 'SQL'],   // small labels on the card (remove the line to hide them)
    bullets: [],             // the full details are on the Agilysys page. To list bullets on the home page instead, add them here, one string per bullet; **bold** marks a highlighted phrase
  },
];

export const EDUCATION = [
  { school: 'University of Alabama at Birmingham', degree: 'M.S. Computer Science', time: 'Jun 2023 – Dec 2024' },
  { school: 'SRM University, Chennai, India', degree: 'Bachelor of Technology', time: 'Jun 2019 – Jun 2023' },
];

// Projects with their own page are listed in src/projects/index.js. Add a card here only for a project that has no page yet:
//   { icon: 'code', name: 'Project name', desc: 'One or two sentences.', tags: ['Tag', 'Tag'] },
export const PROJECTS = [];
