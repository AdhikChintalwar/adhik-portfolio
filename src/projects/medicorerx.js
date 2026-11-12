// Everything shown on the MediCoreRx project page lives in this file, so you can edit the words without touching the layout.
// It is taken from your own "Portfolio & Interview Guide" for the project. Nothing here is invented.
// **double stars** make a phrase bold, `backticks` make it look like code.

export const MEDICORERX = {
  slug: 'medicorerx',
  name: 'MediCoreRx',
  title: ['MediCore', 'Rx'],            // the big heading: the first part is shown in red
  eyebrow: 'Personal project · Healthcare distribution SaaS',
  tagline: 'A multi-tenant SaaS platform for pharmaceutical wholesale and retail ordering.',
  intro: 'Wholesalers run inventory, billing and compliance in an admin ERP. Pharmacies order online through a separate portal. A platform team approves accounts and supports tenants.',

  // Paste the GitHub link between the quotes; while it is empty the page shows no source button.
  repo: '',

  // One honest line under the buttons at the top of the page. Make it '' to remove it.
  heroNote: 'No public live demo: I shut the cloud environment down to stop spend. The full stack still runs locally and with Docker.',

  // Screenshots and videos: put the files in public/projects/medicorerx/ and list them here. While this list is empty the page shows no gallery.
  //   { type: 'image', src: 'admin-dashboard.png', caption: 'Admin dashboard' },
  //   { type: 'video', src: 'walkthrough.mp4', caption: 'Order placed in the portal, received in admin' },
  media: [],

  stack: ['React', 'TypeScript', 'Node.js', 'Express', 'SQL Server', 'Firebase Auth', 'Firebase Hosting', 'Docker', 'Azure App Service', 'GitHub Actions'],

  facts: [
    { n: '4', label: 'web apps' },
    { n: '2', label: 'Express APIs' },
    { n: '1', label: 'shared TypeScript package' },
    { n: '1', label: 'SQL Server database' },
  ],

  overview: [
    'MediCoreRx is a full-stack platform I built for pharmaceutical wholesale and pharmacy ordering. Wholesalers use a web-based ERP to manage masters, batch-wise inventory, GST billing, purchases, returns, and customer orders submitted online. Pharmacies use a separate ordering portal to browse linked distributors, place orders, and manage receipts. An internal platform portal lets operators approve new businesses, monitor health metrics, broadcast announcements, and enter time-limited support sessions.',
    'It is implemented as a TypeScript monorepo with two Express APIs, a shared SQL database, Firebase authentication and hosting, and containerized API deployment on Azure with CI/CD from GitHub Actions.',
  ],

  built: [
    'Designed and implemented a **monorepo B2B pharma distribution platform** with separate admin ERP, customer ordering, and internal platform portals.',
    'Built **dual Express APIs** on **SQL Server** with organisation-scoped multi-tenancy, JWT auth, and Firebase identity integration.',
    'Implemented an **inventory engine** with batch tracking, FIFO deduction, sale returns, and order-to-stock integration between the ordering and admin APIs.',
    'Delivered **platform operations tooling**: tenant approvals, organisation suspension, support-session audit logging, and operational dashboards.',
    'Set up **production deployment**: Dockerized APIs on **Azure App Service**, static SPAs on **Firebase Hosting**, custom domains, and GitHub Actions CI/CD.',
    'Created **representative PIN sessions** so field sales staff operate under route permissions without sharing admin credentials.',
  ],

  problem: {
    intro: 'Indian pharmaceutical distribution involves three groups with different needs:',
    groups: [
      { who: 'Wholesalers and distributors', need: 'must track stock by batch and expiry, GST, drug licences, customers, and representatives in the field.' },
      { who: 'Retail pharmacies', need: 'want to place orders digitally instead of phone calls.' },
      { who: 'A platform operator (MediCoreRx)', need: 'onboards organisations, verifies licences, and provides support without sharing one password across all tenants.' },
    ],
    outro: 'Small distributors often work from spreadsheets or legacy desktop ERP. This project replaces that with a modern web stack that keeps each audience in its own product:',
    products: [
      { who: 'Wholesaler staff', app: 'Admin app', note: '“Proficenter” ERP' },
      { who: 'Pharmacy buyers', app: 'Ordering app', note: 'B2B ordering portal' },
      { who: 'MediCoreRx operations team', app: 'Platform app', note: 'Approvals, support, health' },
      { who: 'Public', app: 'Marketing site', note: 'Static landing page' },
    ],
  },

  architecture: {
    why: [
      '**Why two APIs?** The admin API is large: sales, purchases, batches, parties, reports, platform routes and representative sessions. The ordering API is smaller and CORS-locked to the ordering domains only. That reduces the blast radius of a customer-facing bug and keeps customer JWTs separate from admin JWTs.',
      '**One shared database.** Both APIs connect to the same SQL database. Multi-tenancy comes from an `organisation_id` on rows, not from a separate database per customer.',
    ],
    tree: [
      'DeviMedical/',
      '├── apps/',
      '│   ├── api/            Admin + platform backend (Express)',
      '│   ├── ordering-api/   Customer ordering backend (Express)',
      '│   ├── admin/          Wholesaler ERP UI (Vite + React)',
      '│   ├── ordering/       Pharmacy ordering UI',
      '│   ├── platform/       Platform operations UI',
      '│   └── marketing/      Static marketing landing',
      '├── packages/shared/    Types, money utils, DL status, disclaimer text',
      '├── scripts/            DB init, Azure deploy, cleanup, docker helpers',
      '├── docker-compose.yml  Local full stack',
      '└── firebase.json       Multi-target hosting config',
    ].join('\n'),
    tooling: 'npm workspaces, TypeScript 5.7, ESLint 9, Node 20, Docker, GitHub Actions',
  },

  admin: {
    intro: 'The wholesaler ERP (“Proficenter”). Staff sign in with Firebase (phone OTP for signup, email and password or Google for login) and receive a JWT from the admin API. Field representatives can use a separate PIN session so they never share the owner’s password.',
    modules: [
      { group: 'Setup and masters', items: [
        ['Masters setup', 'Representatives, areas, taxes, registration types'],
        ['Customers and vendors', 'Party master with GSTIN, DL numbers, credit and schemes'],
        ['Catalog', 'The organisation’s sellable medicines'],
        ['Catalog import', 'Bulk import and a reference library'],
        ['Product batch master', 'Batch-level product setup'],
      ] },
      { group: 'Trading', items: [
        ['Receive orders', 'Accept or reject orders from the customer portal; ties to stock'],
        ['Sales and purchases', 'Billing with GST, batches and FIFO stock'],
        ['Purchase import', 'Spreadsheet-style purchase intake'],
        ['Batches', 'Batch receipts, expiry, quantities'],
        ['Returns', 'Customer sale returns and vendor purchase notes'],
      ] },
      { group: 'Finance and control', items: [
        ['Receipts, payments, vouchers', 'The finance side'],
        ['Night audit', 'End-of-day control reports'],
        ['Stock adjustments', 'Corrections and unsellable stock'],
        ['Alerts and dashboard', 'An operational snapshot and alerts'],
        ['Reports', 'Sales and purchase registers and other business reports'],
      ] },
    ],
    logic: [
      '**FIFO batch consumption** when selling or fulfilling orders',
      'A **stock ledger** for traceability',
      '**Customer schemes** (for example free-quantity rules) through the shared package',
      '**Drug licence validity** helpers that warn in the UI',
      '**Organisation codes** so pharmacies link to the right wholesaler in the ordering app',
    ],
  },

  ordering: {
    intro: 'The pharmacy side. Sign-up uses phone OTP (Firebase in production). The profile captures the representative name, pharmacy name, organisation phone, and the drug licence number, state and validity. New accounts can go through an approval queue on the platform.',
    steps: [
      'Register, verify the OTP, and (optionally) wait for platform approval',
      'Link a wholesaler with their **organisation code**',
      'Browse products, fill the cart and place orders',
      'Track orders, pending receipts and receipt history, re-order, and see outstanding totals',
    ],
    note: 'Orders placed here appear in the admin app under **Receive orders**. Accepting an order deducts stock through the same inventory engine as a manual sale, so there is one source of truth and no double entry.',
    areas: ['auth', 'products', 'orders', 'receipts', 'seller-info', 'announcements'],
  },

  platform: {
    intro: 'The internal portal for the MediCoreRx team. Access is limited to platform owners.',
    screens: [
      ['Overview', 'Counts of organisations, customers, orders and tickets'],
      ['Approvals', 'Business accounts (wholesaler sign-up) and customer accounts (ordering sign-up), each with its own fields'],
      ['Organisations', 'List organisations and suspend one with a reason'],
      ['More', 'Billing, inbox, announcements, compliance, health and support access'],
    ],
    support: '**Support access.** A platform owner starts a time-boxed support session. The customer or admin gets a link, the JWT encodes the support session, and the API logs support-session events for audit.',
  },

  security: {
    rows: [
      ['Identity', 'Firebase Auth: phone, email and Google'],
      ['API session', 'JWT, signed with a separate secret for the admin API and the ordering API'],
      ['Multi-tenant', 'Every API call resolves the organisation from the signed-in admin user'],
      ['Platform routes', 'A platform-owner check plus an optional IP allowlist'],
      ['Production', 'The legacy username and password admin login is disabled (it returns 404)'],
      ['Representatives', 'A separate PIN session sent in its own request header'],
    ],
    compliance: [
      'A **licence responsibility clause** on admin and ordering signup, from shared config',
      'A **platform disclaimer** on the sign-in screens',
      '**DL fields** on customers and parties, with validity status in the UI',
      '**Approval workflows** that give the platform visibility into who is on the network',
      'GSTIN, jurisdiction and drug licences captured at organisation signup for invoices and seller info',
    ],
  },

  data: {
    points: [
      '**SQL Server** with schema migrations that run on startup in both APIs',
      'A **medicine reference library**, a large import of hundreds of thousands of reference rows, kept separate from each organisation’s catalog',
    ],
    tables: ['organisations', 'admin_app_users', 'customer_app_users', 'medicines', 'medicine_batches', 'orders', 'order_lines', 'sales_bills', 'purchase_bills', 'parties', 'support_sessions', 'platform_announcements'],
  },

  delivery: {
    local: [
      'npm run db:up && npm run db:init',
      'npm run dev      # all six processes at once',
    ].join('\n'),
    localNote: 'Or run the whole stack with Docker Compose: SQL Server, both APIs and both SPAs.',
    flow: 'The flow to see: sign in, build the catalog, place an order from the ordering app, receive it in admin, and watch the stock change.',
    prod: [
      ['Frontends', 'Firebase Hosting, one target each for admin, ordering, platform and marketing'],
      ['APIs', 'Azure App Service on Linux containers from Azure Container Registry'],
      ['Database', 'Azure SQL'],
      ['CI', 'A GitHub Actions workflow builds and pushes the API images on every push to main'],
      ['Scripts', 'Provision, deploy, set-app-settings and status scripts for Azure, including CORS for ordering'],
    ],
    status: 'I tore the Azure environment down afterwards to stop cloud spend, so there is no public live demo. The stack runs locally and with Docker Compose.',
  },

  lessons: [
    {
      title: 'Order flow, end to end',
      lines: [
        ['Problem', 'Pharmacies needed to order from wholesalers without calling.'],
        ['What I did', 'The ordering API creates orders for the linked organisation. The admin API receives them under Receive orders. Accepting or cancelling updates the order lines and deducts or restores batch stock through shared inventory helpers.'],
        ['Result', 'One database as the truth and no double entry.'],
      ],
    },
    {
      title: 'Two account types, one phone number',
      lines: [
        ['Problem', 'The same phone number could create an empty customer row and a full wholesaler row, so the platform UI showed “-” for customer fields.'],
        ['What I did', 'Business approvals now show GSTIN and organisation licences, and customer approvals show representative and DL fields. Admin signup never populates the customer table.'],
        ['Result', 'Less confusion for operators, and the orphan customer stubs were removed.'],
      ],
    },
    {
      title: 'A “CORS error” that was an outage',
      lines: [
        ['Problem', 'Admin signup failed with a CORS error in the browser.'],
        ['What I did', 'I checked the API before the frontend and found Azure returning 503 because the free-tier SQL database had paused. I fixed the database billing mode, improved client-IP detection behind the proxy for the platform allowlist, and restarted the apps.'],
        ['Lesson', 'A CORS error in the browser often means the API is down or the origin is wrong.'],
      ],
    },
  ],

  tech: [
    ['Language', 'TypeScript (strict), JavaScript modules'],
    ['Frontend', 'React 18, React Router, Vite, a CSS design system'],
    ['Backend', 'Node 20, Express, the mssql driver, Swagger (dev)'],
    ['Auth', 'Firebase Admin SDK and custom JWT'],
    ['Database', 'Microsoft SQL Server 2022 (Docker), Azure SQL in production'],
    ['Hosting', 'Firebase Hosting, Azure App Service, Azure Container Registry'],
    ['Shared code', 'npm workspaces and a shared package'],
    ['Quality', 'ESLint, TypeScript project references, concurrent dev scripts'],
  ],

  glossary: [
    ['Wholesaler / distributor', 'Sells medicines in bulk to pharmacies'],
    ['DL (Drug Licence)', 'Government licence to trade medicines'],
    ['GSTIN', 'Indian tax ID for GST'],
    ['Batch / expiry', 'Regulatory requirement to sell from specific manufacturing lots'],
    ['FIFO', 'Sell the oldest batches first'],
    ['B2B ordering', 'A business customer placing restock orders, not consumer e-commerce'],
  ],

  codebase: 'DeviMedical monorepo v0.2.0',
};

// The card shown in the Projects section of the home page
export const MEDICORERX_CARD = {
  icon: 'health',
  name: 'MediCoreRx',
  desc: 'A multi-tenant SaaS platform for pharmaceutical wholesale and retail ordering: an admin ERP, a pharmacy ordering portal and a platform operations portal, on React, Node and SQL Server.',
  tags: ['React', 'TypeScript', 'Node.js', 'SQL Server', 'Firebase', 'Azure'],
  href: '#/project/medicorerx',
};
