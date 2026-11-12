// Everything shown on the Agilysys page lives in this file, so you can edit the words without touching the layout.
// It is written only from the work bullets you gave me. Nothing here is invented: if a detail is not in your bullets, it is not on the page.
// These are internal company systems, so the page stays at the level of what you built and which technologies it uses. Add more only if you are sure it is fine to share publicly.
// **double stars** make a phrase bold, `backticks` make it look like code.

export const AGILYSYS = {
  slug: 'agilysys',
  name: 'Agilysys',
  title: ['Agilysys', ''],               // the big heading: the first part is shown in red
  eyebrow: 'Full-time · Software Engineer · Atlanta, GA · March 2025 – Present',
  tagline: 'Internal full-stack tools, AI-enabled integrations and technical support for Property Management System customers.',
  intro: 'My work at Agilysys falls into three areas: an internal onboarding application built with React and .NET, an AI-enabled internal integration platform called OrchestrAI, and day-to-day technical support for customers of the Agilysys Property Management System (PMS).',

  // These are your employer’s systems, so there is no source link. Leave both empty.
  repo: '',
  live: '',

  // One honest line under the buttons at the top of the page. Make it '' to remove it.
  heroNote: 'These are internal company systems, so this page describes my role and the technologies, not internal designs or customer data.',

  // Screenshots and videos: only add anything that is fine to show publicly. Put the files in public/projects/agilysys/ and list them here.
  media: [],

  // Wording of the page’s buttons and of the link back (the other project pages go back to the project list)
  readLabel: 'Read the details',
  back: { href: '#experience', label: 'Experience', cta: 'Back to experience' },

  stack: ['React', '.NET', 'REST APIs', 'FastAPI', 'MCP', 'LangGraph', 'SQL'],

  facts: [
    { n: '2', label: 'internal platforms I work on' },
    { n: 'PMS', label: 'customer technical support' },
    { n: 'Mar 2025', label: 'started, full-time' },
  ],

  codebase: 'Internal systems at Agilysys',

  sections: [
    {
      id: 'overview', label: 'Overview', title: ['About', 'this role'],
      blocks: [
        { t: 'p', text: 'I am a Software Engineer at Agilysys in Atlanta, working full-time since March 2025. The work mixes building and supporting software:' },
        {
          t: 'bullets', items: [
            '**Building:** an internal full-stack onboarding application, owning its frontend, backend and API integration work.',
            '**AI-enabled integration:** MCP integrations, integration logic and FastAPI endpoints for OrchestrAI, an internal enterprise integration platform.',
            '**Supporting customers:** technical support for Agilysys Property Management System (PMS) customers, from production incidents to configuration and integration problems.',
          ],
        },
      ],
    },
    {
      id: 'built', label: 'What I do', title: ['What', 'I do'],
      blocks: [
        {
          t: 'bullets', cls: 'pj-built', items: [
            '**Onboarding Tool:** Developed an internal full-stack onboarding application using React and .NET, owning frontend, backend, and API integration work.',
            'Implemented **master-data entry and management workflows** and **REST API-based migration** into Agilysys software.',
            '**OrchestrAI:** Developed **MCP integrations**, integration logic, and **FastAPI endpoints** for an AI-enabled internal enterprise integration platform.',
            'Contributed API and tool functionality supporting **chatbot-initiated workflows** orchestrated through **LangGraph** across Agilysys and third-party systems.',
            'Provide **technical support for Agilysys Property Management System (PMS) customers**, investigating production incidents, software configuration, and operational issues.',
            'Troubleshoot **SQL/database issues, API failures, application logs, data synchronization, and third-party integration problems**; collaborate on resolution and escalation.',
          ],
        },
      ],
    },
    {
      id: 'onboarding', label: 'Onboarding Tool', title: ['The onboarding', 'tool'],
      blocks: [
        {
          t: 'kv', rows: [
            ['What it is', 'An internal full-stack onboarding application.'],
            ['Built with', 'React and .NET.'],
            ['My part', 'I own the frontend, the backend and the API integration work.'],
            ['Data workflows', 'Master-data entry and management workflows.'],
            ['Migration', 'REST API-based migration into Agilysys software.'],
          ],
        },
      ],
    },
    {
      id: 'orchestrai', label: 'OrchestrAI', title: ['OrchestrAI,', 'the integration platform'],
      blocks: [
        {
          t: 'kv', rows: [
            ['What it is', 'An AI-enabled internal enterprise integration platform.'],
            ['What I built', 'MCP integrations, integration logic, and FastAPI endpoints.'],
            ['Workflows', 'I contributed the API and tool functionality behind chatbot-initiated workflows, which are orchestrated through LangGraph across Agilysys and third-party systems.'],
          ],
        },
      ],
    },
    {
      id: 'support', label: 'Customer support', title: ['Supporting', 'customers'],
      blocks: [
        { t: 'p', text: 'I provide technical support for customers of the Agilysys Property Management System (PMS).' },
        {
          t: 'lists', items: [
            { title: 'What I investigate', items: ['Production incidents', 'Software configuration', 'Operational issues'] },
            { title: 'What I troubleshoot', items: ['SQL and database issues', 'API failures and application logs', 'Data synchronization', 'Third-party integration problems'] },
            { title: 'How I work', items: ['Collaborate on resolution and escalation'] },
          ],
        },
      ],
    },
    {
      id: 'stack', label: 'Technologies', title: ['Technologies', 'I use here'],
      blocks: [
        {
          t: 'tech', rows: [
            ['React', 'The frontend of the internal onboarding application.'],
            ['.NET', 'Used together with React to build the onboarding application, including its backend and API integration work.'],
            ['REST APIs', 'The migration of master data into Agilysys software.'],
            ['FastAPI', 'Endpoints for OrchestrAI.'],
            ['MCP', 'Integrations for OrchestrAI.'],
            ['LangGraph', 'Orchestrates the chatbot-initiated workflows that my API and tool functionality supports.'],
            ['SQL', 'Troubleshooting database issues while supporting PMS customers.'],
          ],
        },
      ],
    },
  ],
};
