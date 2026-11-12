// Everything on the Skills page lives in this file: the groups, the skills in each group, and where each one links.
// The groups and skills are the same ones as on your resume.
//
// For each skill:
//   name   what is shown
//   logo   the name of a brand logo from skillLogos.js, e.g. 'react'. Leave it out to use a small icon instead.
//   icon   (only when there is no logo) one of: database, api, socket, key, tool, mic, audio, logs, sync, plug, support, alert
//   url    the skill's official website. It opens in a new tab. Leave it out (or '') for a skill that is a practice, not a product,
//          and so has no official website: it is then shown as a plain label with no link.
//   note   an optional few words under the name, only where the link is not the product's own website (for example a standard)

export const SKILL_GROUPS = [
  {
    id: 'languages', title: ['Languages', 'and data'],
    skills: [
      { name: 'Java', logo: 'java', url: 'https://dev.java' },
      { name: 'Python', logo: 'python', url: 'https://www.python.org' },
      { name: 'TypeScript', logo: 'typescript', url: 'https://www.typescriptlang.org' },
      { name: 'JavaScript', logo: 'javascript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', note: 'MDN reference' },
      { name: 'SQL', icon: 'database' },
      { name: 'SQL Server', logo: 'sqlserver', url: 'https://www.microsoft.com/sql-server' },
      { name: 'SQLite', logo: 'sqlite', url: 'https://www.sqlite.org' },
    ],
  },
  {
    id: 'frontend', title: ['Front', 'end'],
    skills: [
      { name: 'React', logo: 'react', url: 'https://react.dev' },
      { name: 'Angular', logo: 'angular', url: 'https://angular.dev' },
      { name: 'Vite', logo: 'vite', url: 'https://vite.dev' },
      { name: 'HTML', logo: 'html', url: 'https://html.spec.whatwg.org', note: 'Living Standard' },
      { name: 'CSS', logo: 'css', url: 'https://www.w3.org/Style/CSS/', note: 'W3C' },
    ],
  },
  {
    id: 'backend', title: ['Back end', 'and APIs'],
    skills: [
      { name: '.NET', logo: 'dotnet', url: 'https://dotnet.microsoft.com' },
      { name: 'Node.js', logo: 'nodejs', url: 'https://nodejs.org' },
      { name: 'Express', logo: 'express', url: 'https://expressjs.com' },
      { name: 'FastAPI', logo: 'fastapi', url: 'https://fastapi.tiangolo.com' },
      { name: 'REST APIs', icon: 'api', url: 'https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm', note: 'Fielding’s original definition' },
      { name: 'WebSockets', icon: 'socket', url: 'https://www.rfc-editor.org/rfc/rfc6455', note: 'RFC 6455' },
      { name: 'JWT authentication', icon: 'key', url: 'https://www.rfc-editor.org/rfc/rfc7519', note: 'RFC 7519' },
    ],
  },
  {
    id: 'ai', title: ['AI', 'and integration'],
    skills: [
      { name: 'LangGraph', logo: 'langgraph', url: 'https://www.langchain.com/langgraph' },
      { name: 'Model Context Protocol (MCP)', logo: 'mcp', url: 'https://modelcontextprotocol.io' },
      { name: 'LLM tool calling', icon: 'tool' },
      { name: 'Ollama', logo: 'ollama', url: 'https://ollama.com' },
      { name: 'OpenWakeWord', icon: 'mic', url: 'https://github.com/dscripka/openWakeWord', note: 'GitHub project' },
      { name: 'SenseVoice', icon: 'audio', url: 'https://github.com/FunAudioLLM/SenseVoice', note: 'GitHub project' },
      { name: 'asyncio', logo: 'python', url: 'https://docs.python.org/3/library/asyncio.html', note: 'Python docs' },
    ],
  },
  {
    id: 'cloud', title: ['Cloud', 'and DevOps'],
    skills: [
      { name: 'AWS', logo: 'aws', url: 'https://aws.amazon.com' },
      { name: 'Azure App Service', logo: 'azure', url: 'https://azure.microsoft.com/products/app-service' },
      { name: 'Azure Container Registry', logo: 'azure', url: 'https://azure.microsoft.com/products/container-registry' },
      { name: 'Firebase', logo: 'firebase', url: 'https://firebase.google.com' },
      { name: 'Cloudflare', logo: 'cloudflare', url: 'https://www.cloudflare.com' },
      { name: 'Docker', logo: 'docker', url: 'https://www.docker.com' },
      { name: 'GitHub Actions CI/CD', logo: 'githubactions', url: 'https://github.com/features/actions' },
    ],
  },
  {
    id: 'support', title: ['Enterprise', 'support'],
    skills: [
      { name: 'PMS customer support', icon: 'support', url: 'https://www.agilysys.com', note: 'Agilysys' },
      { name: 'Incident investigation', icon: 'alert' },
      { name: 'Log analysis', icon: 'logs' },
      { name: 'Data synchronization', icon: 'sync' },
      { name: 'Third-party integrations', icon: 'plug' },
    ],
  },
];
