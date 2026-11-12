// Everything shown on the "Baby, the equity research platform" project page lives in this file, so you can edit the words without touching the layout.
// It is taken from your own study guide for the project (Stock-Researcher-Baby.md). Nothing here is invented.
// **double stars** make a phrase bold, `backticks` make it look like code.
// The page is a list of `sections`; each has an id, a label for the contents list, a two-part title (the first part is red) and `blocks`.
// This is a separate project from the voice assistant (baby-voice.js), even though both are called Baby and share one repository.
//
// No return figures appear on this page on purpose. If you ever add one, say which window it covers and that it is paper money.

export const BABY_RESEARCH = {
  slug: 'baby-research',
  name: 'Baby Equity Research',
  title: ['Baby', ' Research'],         // the big heading: the first part is shown in red
  eyebrow: 'Personal project · Equity research platform',
  tagline: 'A research system that turns public data into a scored, explainable trade plan. A person confirms any simulated order.',
  intro: 'The language model can explain the research file. It cannot change the score, override risk, or send the order. Real-money trading is disabled.',

  // Paste the GitHub link between the quotes; while it is empty the page shows no source button.
  // (Both Baby projects live in the same repository, so it is the same link on both pages.)
  repo: '',

  // If the project is hosted somewhere people can open it, paste that address here to add an "Open live site" button.
  live: '',

  // One honest line under the buttons at the top of the page. Make it '' to remove it.
  heroNote: 'Research and simulated paper trading only. Nothing on this page is investment advice.',

  // Screenshots and videos: put the files in public/projects/baby-research/ and list them here. While this list is empty the page shows no gallery.
  //   { type: 'image', src: 'stock-research.png', caption: 'Stock Research: evidence by pipeline stage' },
  //   { type: 'image', src: 'trade-plan.png', caption: 'A trade plan waiting for its entry' },
  media: [],

  stack: ['Python', 'FastAPI', 'React', 'Vite', 'Recharts', 'SQLite', 'Alpaca paper API', 'SEC company facts', 'Alpha Vantage', 'Cloudflare', 'systemd'],

  facts: [
    { n: '7', label: 'weighted scoring modules' },
    { n: '6', label: 'discovery profiles' },
    { n: '0', label: 'model authority over score, levels or orders' },
    { n: 'Paper', label: 'only: real-money execution is disabled' },
  ],

  codebase: 'Python package investor/ · FastAPI baby_ui_backend/ · React frontend/',

  sections: [
    {
      id: 'overview', label: 'Overview', title: ['About', 'this project'],
      blocks: [
        { t: 'p', text: 'Baby is an investment research system. It scans the market, builds an evidence file on a stock, scores that evidence with deterministic code, watches the setup, and lets a person approve a simulated paper trade.' },
        { t: 'p', text: 'A stock can look exciting because it showed up on a scanner. Baby treats that as the start of a file, not a decision. It pulls price history, financial statements, SEC filings, news and market context, grades each area with code, and combines the grades with fixed weights. Missing data stays unknown. If the plan later reaches a ready state, Baby sends a review alert, and a paper order exists only after the person confirms it. Live-money trading is disabled in the production configuration.' },
        { t: 'p', text: 'Two of my projects are called Baby. This one is the research platform. The voice assistant is a separate system with its own page.' },
        { t: 'links', items: [{ label: 'See Baby, the voice assistant', href: '#/project/baby-voice' }] },
      ],
    },
    {
      id: 'built', label: 'What I built', title: ['What', 'I built'],
      blocks: [
        {
          t: 'bullets', cls: 'pj-built', items: [
            'Built an end-to-end **equity research system** that scans a listed-stock universe, assembles multi-source evidence, and produces a deterministic attractiveness score, trade plan and risk gate.',
            'Kept **model authority at zero** for scoring, price levels and order entry. A copilot explains the research file, Python engines own the math, and a confirmation step owns any Alpaca paper order.',
            'Shipped a **React research product** on a **FastAPI** backend: discovery, single-stock evidence, monitored setups, paper positions, alerts, performance reports and an operating scheduler on market hours.',
            'Separated research quotes from execution-grade quotes, and monitored plans from broker positions, so a scanner hit cannot silently become an order.',
          ],
        },
      ],
    },
    {
      id: 'problem', label: 'The problem', title: ['The', 'problem'],
      blocks: [
        { t: 'p', text: 'Public data on a stock is scattered. Price is in one place, financial statements are in another, filings are long, and a headline can be true without being the cause of a move. A person cannot recompute all of that every time a scanner blinks.' },
        { t: 'p', text: 'A single language-model summary has the opposite problem. It reads smoothly, and it will invent a figure or a cause when the source is missing.' },
        { t: 'p', text: 'Baby is a third shape:' },
        {
          t: 'steps', items: [
            '**Collect** the evidence and label the source.',
            '**Score** only what the code can calculate.',
            'Leave holes marked **unknown**.',
            'Turn the result into a **plan** with an entry, an invalidation and targets.',
            '**Watch** the plan.',
            'Require **a person** before any simulated order.',
          ],
        },
        { t: 'callout', text: 'The product is for understanding a candidate and reviewing a paper action with a record of why. It is not an autonomous trader.' },
      ],
    },
    {
      id: 'product', label: 'The product', title: ['The product,', 'screen by screen'],
      blocks: [
        { t: 'p', text: 'The interface is a React app. These are the pages a user actually moves through.' },
        {
          t: 'kv', rows: [
            ['Home', 'The daily picture: what the scanner did, what research changed, and what deserves a look. Home is a summary. The stock page is the evidence.'],
            ['Ideas', 'Names the discovery rules surfaced. A row here means “it matched a scan”. It does not mean buy, and it does not mean a paper order exists.'],
            ['Stock Research', 'One symbol, broken into pipeline stages. Each stage shows the metrics it has, where they came from and what is still unknown, with a chart, a live quote and a plain-language legend so a score can be read without guessing.'],
            ['Trade plan', 'The setup, current price, pullback zone or breakout trigger, planned entry, invalidation, target 1, target 2 and risk/reward. A plan can exist while the setup is still waiting.'],
            ['Portfolio', 'Three different lists, on purpose: **monitored setups** (plans Baby is rechecking, not holdings), **Alpaca paper positions** (simulated shares the broker says you hold) and **Alpaca paper orders**. A plan becomes a position only after a confirmed order fills.'],
            ['Alerts', 'Monitoring events and setup-ready notices. Email is a research notification. It cannot place an order.'],
            ['Reports', 'Performance over a chosen window, with a PDF export. Three histories are kept apart (see Reports below).'],
            ['Ask Baby', 'A side panel that explains terms, stages and the current file. Broker authority stays outside it.'],
            ['Settings and status', 'Is the scheduler running, when was the last scan, which symbol is being rechecked, is the paper broker connected, is email ready. The safety controls for live trading are shown locked.'],
            ['Docs and About', 'The product’s own explanation, stored as markdown next to the UI so a behavior change can update the words in the same commit.'],
            ['Developer tools', 'Raw scanner output, backtests and automation internals. Hidden by default.'],
          ],
        },
        { t: 'h3', text: 'Five states that are never merged' },
        { t: 'chain', numbered: false, label: 'Five states', items: ['Scan hit', 'Waiting plan', 'Setup-ready', 'Paper order submitted', 'Paper position filled'] },
        { t: 'p', text: 'Each of these is stored and shown as a different thing. Collapsing them is how research tools accidentally become trading bots.' },
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline', title: ['From a ticker', 'to a paper order'],
      blocks: [
        { t: 'p', text: 'If you can walk this list, you can explain the system from a ticker to a paper order.' },
        {
          t: 'chain', label: 'The research pipeline', items: [
            'Listed universe', 'Discovery profiles', 'Candidate', 'Price history', 'Technicals, fundamentals, filings, news, macro',
            'Financial health, accounting, valuation', 'Unified risk', 'Decision engine', 'Thesis state', 'Trade plan',
            'Quote and portfolio gates', 'Monitored setup', 'Setup-ready alert', 'Human confirmation', 'Alpaca paper order',
          ],
        },
        {
          t: 'stages', items: [
            { title: 'Discovery', text: 'The scanner narrows thousands of listed names. One scheduled job is an unusual-volume scan that keeps a top slice for follow-up. Research profiles add a second filter: each is a frozen set of rules (price floor, average volume, dollar volume, relative volume, volatility cap, minimum history) plus weights for trend, momentum, volume, risk and setup. The profiles in code are momentum, breakout, pullback, quality, growth and speculative. A candidate is an input to research, and the UI copy says so, so a green row is not mistaken for an instruction.' },
            { title: 'Price history', text: 'Later math needs open, high, low, close and volume, so the pipeline normalizes those bars. If there is not enough history, coverage drops and the missing piece stays unknown. The trade-plan builder expects a long enough series before it will draw an entry and an invalidation.' },
            { title: 'Technical evidence', text: 'From those bars the code computes simple and exponential moving averages and RSI. Average true range describes how wide the recent daily range has been, which later sets the distance for invalidation and targets. A moving-average cross is context and never creates an order by itself.' },
            { title: 'Fundamentals and financial health', text: 'A financial engine looks at profitability, cash generation, liquidity, debt and the relationships among them, with free cash flow, margins and balance-sheet strength shown as evidence with a source. SEC company facts are a primary filing source, Yahoo Finance is used as a market-data provider, and Alpha Vantage is wired in as an independent second opinion. That second source validates. It does not overwrite the SEC figures and it does not become a scoring input.' },
            { title: 'Accounting quality', text: 'Checks whether the statements agree with each other well enough to use: cash flow versus earnings, and balance-sheet relationships. The result is pass, review, fail or unknown. A review flag means a person should look. It is an evidence-quality result, not an accusation.' },
            { title: 'Valuation', text: 'Compares the market price with the business numbers the pipeline actually has and returns a grade inside the model, such as favorable, demanding or unresolved. It is one input to the score, not a timing signal.' },
            { title: 'Filings, catalysts and news', text: 'The SEC client looks for financing, material events and other filing context. Registration language is read cautiously: a filing that permits a future sale is not treated as a sale that already happened. News is classified as context, and if the system cannot show that a headline caused a price move, causality stays `NOT_ESTABLISHED`. Timing and cause are different claims.' },
            { title: 'Market regime', text: 'A macro and regime layer adds broad-market context, and an advanced market layer adds higher-level market evidence. Both are structured inputs. A model is not asked to invent the macro number.' },
            { title: 'Unified risk', text: 'Risk findings are combined into one layer: a risk score, a confidence, a coverage and any hard constraint. Hard risk can hold a candidate down even when the business looks attractive, and the language model has no authority to waive it.' },
            { title: 'Decision engine', text: 'Each available module contributes a score, a confidence and a coverage, and fixed weights combine them into a research score. It never calls a model. The details are in the next section.' },
            { title: 'Thesis state', text: 'Baby compares the new file with the previous one and labels the thesis stable, strengthening, weakening or constrained, so the monitoring page has more than a single number with no history.' },
            { title: 'Trade plan', text: 'The plan agent turns research plus price structure into a setup: the setup type, current price, a pullback zone or breakout trigger, a planned entry, an invalidation level, target 1, target 2 and the risk/reward of each target. A plan can sit in `WAITING` for a long time, which means the entry condition is not active.' },
            {
              title: 'Gates before anything is called ready', text: [
                'Readiness is a stack of checks, and any required failure blocks it.',
                '**Research and hard risk.** The evidence has to support a plan, and hard risk can stop it.',
                '**Execution quote.** The production quote path is Alpaca market data on the configured IEX feed. The quote must be fresh, with a valid bid and ask and an acceptable spread. A chart quote or a display quote is not allowed to stand in for this check.',
                '**Portfolio gate.** The paper account is checked for position count, position size, sector exposure, correlated exposure, single-trade risk and a cash reserve. It fails closed: if the primary source the execution path needs is unhealthy, the path does not proceed.',
                '**Production decision.** The gates are combined into one status, with the blocking reasons written down.',
                '`SETUP_READY` or `ELIGIBLE` means those conditions passed and a person should review the plan. It does not mean an order was sent.',
              ],
            },
            { title: 'Monitoring', text: 'Asking Baby to check the paper setup also adds the symbol to the monitored setups. A scheduler, on by default, runs in Eastern Time on weekdays: revalidation after the open at about 9:35, a scanner refresh every 15 minutes from 9:45 through 15:45, and an afternoon scan around 15:30 that is suppressed if the 15-minute job already covered it. It rechecks monitored symbols as well as a top slice of scan names. The scheduler does research and monitoring only. It does not submit broker orders.' },
            { title: 'Alerts without spam', text: 'The meaningful edge is `WAITING` to `SETUP_READY`. Staying ready does not send another message, and leaving ready and coming back later does, because that is a new transition. Email goes out through a configured SMTP path to verified subscribers as a research notice, and delivery health, including failures, is visible in the reports.' },
            {
              title: 'The human and the paper broker', text: [
                'At submission time the server recomputes the setup, and the browser’s copy of the plan is not trusted as the final authority. The person supplies a positive share quantity and the paper confirmation phrase. The server checks that the paper notional fits the available paper buying power when those figures exist, then sends the order to Alpaca paper.',
                'A single-use approval path, including a token link, lets a review be confirmed deliberately rather than by a stray click. Positions and open orders are then read back from the broker, and cancelling an open paper order is a separate, explicit action.',
                'A startup guard refuses a configuration that tries to enable real-money execution, and the settings screen shows live trading, model execution authority and automatic orders as locked controls.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'architecture', label: 'Architecture', title: ['How it', 'fits together'],
      blocks: [
        {
          t: 'layers',
          rows: [
            { tag: 'Browser · React and Vite', nodes: [{ b: 'Research product', small: 'Home, Ideas, Stock Research, Portfolio, Alerts, Reports, Settings and Docs. Relative `/api` paths, so the same build can be proxied without a hard-coded backend host.' }] },
            {
              wire: '/api',
              tag: 'FastAPI backend · baby_ui_backend/',
              cols: 4,
              nodes: [
                { b: 'Scanner and scheduler' },
                { b: 'Research engines', small: 'StockAnalyzer and the evidence engines' },
                { b: 'Decision engine and trade plan' },
                { b: 'Quote, risk and portfolio gates' },
                { b: 'Monitored-setup store' },
                { b: 'Alerts and subscriber email' },
                { b: 'Reports and performance ledger' },
                { b: 'Alpaca paper broker adapter', hot: true },
              ],
            },
            {
              tag: 'Evidence sources',
              cols: 3,
              nodes: [
                { b: 'SEC company facts', small: 'Primary company evidence' },
                { b: 'Price history', small: 'Bars for indicators, charts and plans' },
                { b: 'Alpha Vantage', small: 'A secondary check' },
                { b: 'Alpaca IEX quote', small: 'Execution-grade checks' },
                { b: 'Alpaca news', small: 'Context where configured' },
                { b: 'Alpaca paper account', small: 'Simulated orders only', hot: true },
              ],
            },
            { tag: 'Language model', nodes: [{ b: 'Ask Baby (copilot)', small: 'Reads exported evidence and a glossary. Explains. Does not score, size or send.', dim: true }] },
          ],
          caption: 'Locally, the same idea is a FastAPI process beside the Vite dev server.',
        },
        { t: 'h3', text: 'Production route' },
        { t: 'chain', numbered: false, label: 'Production route', items: ['Browser', 'Cloudflare', '/api proxy', 'FastAPI under systemd'] },
        { t: 'p', text: 'The research core is a Python package, `investor/`, that holds the engines, scanners, validators and backtests. The FastAPI app in `baby_ui_backend/` serves the research, paper, alert, report and status routes, and the React app talks to it through `/api`.' },
      ],
    },
    {
      id: 'scoring', label: 'Scoring', title: ['How the', 'score works'],
      blocks: [
        { t: 'p', text: 'The decision engine is the scoring authority, and it never calls a model. Each available module contributes a score, a confidence and a coverage. The weights are constants in code:' },
        {
          t: 'bars', rows: [
            ['Financial health', 20],
            ['Unified risk quality', 20],
            ['Valuation', 15],
            ['Advanced market evidence', 15],
            ['Accounting quality', 12],
            ['Event intelligence', 10],
            ['Macro regime', 8],
          ],
        },
        { t: 'p', text: 'Unified risk quality is `100 - risk score`, so a safer file scores higher on that component. If a module has no score it is left out, and the weights of the remaining modules are renormalized. A missing valuation does not become a zero that secretly punishes the stock. Confidence is reported beside the score and does not quietly rewrite it.' },
        { t: 'p', text: 'The output is a research-attractiveness number, an evidence-confidence number, an evidence-coverage number and a research state.' },
        { t: 'callout', lead: 'What the score means.', text: 'It is attractiveness inside Baby’s model. It is not a forecast and not a buy rating.' },
      ],
    },
    {
      id: 'authority', label: 'Who decides', title: ['Who decides', 'what'],
      blocks: [
        { t: 'p', text: 'This is the most important idea in the project: where the language model is allowed to stand.' },
        {
          t: 'table', head: ['Decision', 'Who owns it'], rows: [
            ['Indicator math, financial ratios, valuation grade', 'Deterministic engines'],
            ['Research score and weights', 'The decision engine'],
            ['Entry, invalidation, targets', 'The trade-plan code'],
            ['Hard risk and portfolio blocks', 'The risk and portfolio gates'],
            ['Quote acceptance', 'The execution-quote checks'],
            ['Share quantity', 'The person, at confirmation time'],
            ['Sending a paper order', 'The person, with a confirmation phrase, after a server recompute'],
            ['Explaining a term, a stage or a blocker', 'Ask Baby, the copilot'],
          ],
        },
        { t: 'p', text: 'The copilot is grounded in a research-knowledge module: stage explanations, a status legend and written definitions for terms such as RSI, ATR, moving averages and free cash flow. It can also see status from the paper broker, the awareness layer and the gate audit. Its job is to answer “what does this mean?” and “why did this fail?”' },
        { t: 'h3', text: 'The authority contract' },
        {
          t: 'bullets', items: [
            'Verified evidence is authoritative according to its source.',
            'Baby’s calculations and the decision engine are authoritative for the research score.',
            'The model does not establish facts that were not exported.',
            'Model scoring authority is **zero**.',
            'Model price-level authority is **zero**.',
            'Model risk-override authority is **zero**.',
            'Model execution authority is **none**.',
            'Paper execution requires an explicit confirmation.',
            'Real-money execution is **disabled**.',
          ],
        },
        { t: 'p', text: 'An older committee / red-team path in the research code challenges a thesis. Even there, the model role is research red-team only, with scoring authority at zero. It is a critic of the file, not a second scoring engine.' },
      ],
    },
    {
      id: 'data', label: 'Data sources', title: ['Data sources', 'and their labels'],
      blocks: [
        {
          t: 'table', head: ['Source', 'Role'], rows: [
            ['SEC company facts and filings', 'Primary company evidence: statements, financing, material events'],
            ['Price history providers', 'Bars for indicators, charts and the trade plan'],
            ['Yahoo Finance', 'Market and financial adapter used by the analyzer'],
            ['Alpha Vantage', 'Independent secondary check. It does not replace SEC facts inside the score'],
            ['Alpaca market data, IEX path', 'The execution-grade quote. Freshness, bid, ask and spread are checked here'],
            ['Alpaca news', 'Company headlines as context, with causality left unclaimed when it is unproven'],
            ['Alpaca paper account', 'Simulated cash, buying power, positions and orders'],
            ['SMTP email', 'Research and setup alerts to verified subscribers'],
          ],
        },
        {
          t: 'bullets', items: [
            '**A display number is not an execution number.** The chart can use research data. The order gate uses the execution quote path only.',
            '**A failed provider should be visible.** The system is built to surface unknown and unavailable, rather than to backfill a hole with a convenient number and carry on.',
          ],
        },
      ],
    },
    {
      id: 'reports', label: 'Reports', title: ['Did the', 'ideas work?'],
      blocks: [
        { t: 'p', text: 'The reports page is the honesty layer. It splits history into three populations:' },
        {
          t: 'kv', rows: [
            ['Historical observations', 'Monitoring records, including a conservative backfill of older records. These are “Baby looked at this”. They are not trades.'],
            ['Baby performance', 'Every true setup-ready episode, traded or not. Each episode can show the entry, whether the entry was reached, target 1, target 2, invalidation, status, the best move in favor and the worst move against.'],
            ['Paper trades', 'Starts at a real paper fill: the fill price, the quantity and what happened after the fill.'],
          ],
        },
        { t: 'p', text: 'Summary rates include how often a ready plan reached its entry, how often target 1 or target 2 was hit after entry, and how often the idea failed before target 1. The same stats can be grouped by setup type, and a blockers table counts why candidates never became ready, with example symbols. A watch record is never counted as a win or a loss.' },
        { t: 'callout', text: 'If you only measure the trades you felt like taking, you never measure the ideas you skipped. That is why setup-ready episodes and paper fills are separate statistics.' },
        { t: 'callout', lead: 'No return figures here.', text: 'The reports measure paper plans and paper fills over a chosen window. That is not live trading performance, and real-money execution is disabled.' },
      ],
    },
    {
      id: 'decisions', label: 'Design decisions', title: ['Design decisions', 'worth defending'],
      blocks: [
        {
          t: 'kv', rows: [
            ['Unknown stays unknown', 'Filling a missing margin with an average, or with a model’s guess, makes the score look more certain than the file is. Omitting the module and showing coverage is the stricter choice.'],
            ['Weights live in code', 'They are constants, not a prompt, so they can be diffed, tested and explained. A model that “feels” a stock is bullish cannot be audited the same way.'],
            ['Confidence does not rewrite the score', 'A shaky data source is visible beside the number. If confidence silently shrank the score, a reader could not tell a weak business from a thin file.'],
            ['Different states stay different', 'A scan hit, a waiting plan, a setup-ready plan, a submitted paper order and a filled paper position are stored and shown separately.'],
            ['The server recomputes at order time', 'A page can be minutes old. Eligibility, quote quality and buying power are checked again when the person confirms.'],
            ['The person owns quantity', 'Baby owns the plan levels. The person types the share count and the confirmation phrase, and `quantity_source` is recorded as user-selected.'],
            ['Paper and live are different systems', 'The order adapter is the paper environment, startup refuses a live-trading flag, and the UI locks the live controls so the boundary is visible.'],
            ['Alerts fire on transitions', 'Repeating “still ready” every fifteen minutes trains the user to ignore the one message that matters.'],
            ['Point-in-time history is handled carefully', 'The repository includes historical replay, point-in-time availability and backtest infrastructure. A historical track record is claimed only when the inputs support it: what was knowable on that date, delistings, corporate actions and macro vintages. Incomplete history stays a stated limitation, and automatic retuning of production weights from a weak backtest is disabled.'],
            ['ETFs are not forced through a company model', 'An ETF thesis path marks company fundamentals and valuation as not applicable instead of scoring them as broken financials.'],
            ['Idempotent proposals', 'Repeating the same proposal request with the same idempotency key returns the original proposal, so retries do not create duplicate paper intents.'],
          ],
        },
      ],
    },
    {
      id: 'limits', label: 'Limits', title: ['Limits', 'and next steps'],
      blocks: [
        {
          t: 'bullets', items: [
            'It is a research tool, not an autonomous trader. Orders go to a **paper** broker only, and real-money execution is disabled.',
            'The research score is attractiveness inside the model. It is not a forecast and not a buy rating.',
            'Where point-in-time inputs are incomplete, a historical track record is withheld rather than published.',
            'The reports are paper plans and paper fills. They are not live results.',
          ],
        },
        { t: 'h3', text: 'What I would add next' },
        {
          t: 'bullets', items: [
            'Richer point-in-time coverage, so more historical claims are allowed.',
            'Tighter sector and correlation data inside the portfolio gate.',
            'A clearer audit export for one symbol that a second person can read without opening the UI.',
            'No live trading until the paper record and the quote gate have been watched for a long time on purpose.',
          ],
        },
      ],
    },
    {
      id: 'stack', label: 'Tech stack', title: ['Tech', 'stack'],
      blocks: [
        {
          t: 'tech', rows: [
            ['Research core', 'The Python package investor/: engines, scanners, validators and backtests'],
            ['API', 'FastAPI in baby_ui_backend/: research, paper, scheduler status and reports'],
            ['Interface', 'React and Vite, with charts in Recharts'],
            ['Storage', 'SQLite ledgers and JSON artifacts for proposals, monitoring, automations and research caches'],
            ['Broker', 'The Alpaca paper API for simulated orders, positions and execution-grade quotes'],
            ['Filings', 'An SEC company-facts client for primary fundamental evidence'],
            ['Market data', 'Yahoo Finance, Alpha Vantage and Alpaca'],
            ['Scheduling', 'An in-process scheduler on the America/New_York clock'],
            ['Email', 'SMTP to verified subscribers'],
            ['Front door', 'Cloudflare in front of the UI and /api'],
            ['Process supervision', 'systemd on the application server'],
          ],
        },
        { t: 'h3', text: 'Repository map' },
        {
          t: 'table', code: true, head: ['Path', 'What it is'], rows: [
            ['investor/analyzer.py', 'Orchestrates the research engines for one symbol'],
            ['investor/investment_system.py', 'Decision, validation and trade plan. Model scoring authority is fixed at zero'],
            ['investor/decision_engine.py', 'The fixed-weight attractiveness score'],
            ['investor/scoring_engine.py', 'An earlier scoring component used inside research'],
            ['investor/financial_engine.py', 'Business evidence: financial health (with accounting_quality.py and valuation_engine.py)'],
            ['investor/unified_risk.py', 'Combined risk and hard constraints (with risk_engine.py)'],
            ['investor/trade_plan.py', 'Entry, invalidation and targets (with trade_plan_v46.py)'],
            ['investor/sec_client.py', 'Filing facts, normalization and cross-checks (with primary_data/)'],
            ['investor/scanner/', 'Universe, profiles, volume and opportunity scores'],
            ['investor/point_in_time/', 'Replay and backtest discipline (with investor/historical/)'],
            ['investor/committee/', 'Optional red-team commentary, fenced off from the score'],
            ['baby_ui_backend/app.py', 'The HTTP API for research, paper, alerts and status'],
            ['baby_ui_backend/operating_scheduler.py', 'The weekday scan and revalidation clock'],
            ['baby_ui_backend/copilot.py', 'Explanations grounded in the research glossary'],
            ['frontend/src/pages/', 'The screens described above'],
            ['frontend/src/docs/', 'The in-app documentation'],
          ],
        },
        { t: 'p', text: 'The voice-assistant folders (`voice/`, `brain/`, `agents/` and `jarvis_main.py`) belong to the other Baby project.' },
      ],
    },
  ],
};

// The card shown in the Projects section of the home page
export const BABY_RESEARCH_CARD = {
  icon: 'chart',
  name: 'Baby Equity Research',
  desc: 'An equity research platform: multi-source evidence, a deterministic score, a trade plan and paper-trading safety, in a React product on FastAPI. The language model explains and never decides.',
  tags: ['Python', 'FastAPI', 'React', 'Alpaca Paper', 'SEC data'],
  href: '#/project/baby-research',
};
