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
  body: 'I currently work at Agilysys in Atlanta. I build across modern applications, services, cloud platforms, and emerging AI workflows.',
};

export const SKILLS = [
  { icon: 'ai', name: 'AI / ML', desc: 'Intelligent systems and applied AI' },
  { icon: 'code', name: 'Full-stack', desc: 'Java, Angular, .NET' },
  { icon: 'cloud', name: 'Cloud and DevOps', desc: 'AWS, Azure, deployment' },
  { icon: 'data', name: 'Data and systems', desc: 'APIs, architecture, analytics' },
];

export const WORK = [
  {
    company: 'Agilysys',
    place: 'Atlanta, GA',
    time: 'March 2025 – Present',
    role: 'Software Engineer',
    type: 'Full-time',
    summary: 'Building and improving enterprise software systems.',
    bullets: [],             // paste your resume bullets here, one string per bullet; **bold** marks a highlighted phrase
  },
];

export const EDUCATION = [
  { school: 'University of Alabama at Birmingham', degree: 'M.S. Computer Science', time: 'Jun 2023 – Dec 2024' },
  { school: 'SRM University, Chennai, India', degree: 'Bachelor of Technology', time: 'Jun 2019 – Jun 2023' },
];

export const PROJECTS = [
  { icon: 'ai', name: 'AI Interview OS', desc: 'An interview preparation application exploring AI-powered answer evaluation, personalized learning, and progress tracking.', tags: ['AI', 'React Native', 'Product'] },
  { icon: 'code', name: 'Full-Stack Engineering', desc: 'Enterprise application development across APIs, modern interfaces, cloud services, and software integrations.', tags: ['Java', 'Angular', '.NET'] },
];
