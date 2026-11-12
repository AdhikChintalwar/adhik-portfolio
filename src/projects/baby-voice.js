// Everything shown on the "Baby, the voice assistant" project page lives in this file, so you can edit the words without touching the layout.
// It is taken from your own study guide for the project (AI-Assistant-Baby.md). Nothing here is invented.
// **double stars** make a phrase bold, `backticks` make it look like code.
// The page is a list of `sections`; each has an id, a label for the contents list, a two-part title (the first part is red) and `blocks`.
// This is a separate project from the stock researcher (baby-research.js), even though both are called Baby and share one repository.

export const BABY_VOICE = {
  slug: 'baby-voice',
  name: 'Baby Voice Assistant',
  title: ['Baby', ' Voice'],            // the big heading: the first part is shown in red
  eyebrow: 'Personal project · Local voice assistant for macOS',
  tagline: 'A voice assistant that hears a wake word, runs a real tool on the Mac, and speaks the result back.',
  intro: 'Listening, speech recognition and computer actions stay on the machine. A language model only turns messy speech into a structured tool call, and local code is the only thing allowed to run it.',

  // Paste the GitHub link between the quotes; while it is empty the page shows no source button.
  // (Both Baby projects live in the same repository, so it is the same link on both pages.)
  repo: '',

  // If the project is hosted somewhere people can try it, paste that address here to add an "Open live site" button.
  live: '',

  // One honest line under the buttons at the top of the page. Make it '' to remove it.
  heroNote: 'Baby runs locally on a Mac with a microphone and local models, so there is no hosted demo.',

  // Screenshots and videos: put the files in public/projects/baby-voice/ and list them here. While this list is empty the page shows no gallery.
  //   { type: 'video', src: 'demo.mp4', caption: 'Wake word, then “find me a good Python tutorial on YouTube”' },
  media: [],

  stack: ['Python', 'OpenWakeWord', 'SenseVoice', 'Ollama', 'Qwen 3', 'MCP', 'asyncio', 'SQLite', 'macOS'],

  facts: [
    { n: 'Local', label: 'wake word and speech-to-text' },
    { n: '4', label: 'specialist agents plus a planner' },
    { n: '1', label: 'typed tool registry' },
    { n: '1', label: 'privacy-gated cloud gateway' },
  ],

  codebase: 'Repository folder “Jarvis Voice” (the original name)',

  sections: [
    {
      id: 'overview', label: 'Overview', title: ['About', 'this project'],
      blocks: [
        { t: 'p', text: 'Baby is a privacy-first voice agent. It hears a wake word, transcribes speech on the Mac, chooses a specialist agent, turns the request into a tool call, runs that tool locally, and speaks the answer.' },
        { t: 'p', text: 'Most voice assistants send audio and screen context to a cloud company, then return a chat reply. Baby keeps the listening loop, the speech model and the computer actions on the machine. A language model is used only to turn messy speech into a structured tool call. When a harder reasoning model in the cloud is needed, the text goes through a local privacy gate first, and the cloud model never receives files, passwords, or permission to click the computer.' },
        { t: 'p', text: 'Two of my projects are called Baby. This one is the voice assistant. The stock-research product is a separate system with its own page.' },
        { t: 'links', items: [{ label: 'See Baby, the equity research platform', href: '#/project/baby-research' }] },
      ],
    },
    {
      id: 'built', label: 'What I built', title: ['What', 'I built'],
      blocks: [
        {
          t: 'bullets', cls: 'pj-built', items: [
            'Built a local macOS voice assistant that detects a wake word, transcribes speech offline, routes the request to specialist agents, and executes desktop, browser, and workspace tools through a **typed tool registry**.',
            'Designed a **plan-then-act loop**: a local language model returns structured JSON tool calls, an executor runs them through an **MCP** tool layer, and a follow-up reasoner turns tool output into a spoken answer.',
            'Added a **local privacy gate** in front of any cloud model. The gate classifies secrets and personal data, redacts or blocks the payload, and keeps file access, credentials, and computer control on the machine.',
            'Ran **scheduled automations** in a background event loop so reminders and recurring jobs continue while the wake-word listener stays on the main thread.',
          ],
        },
      ],
    },
    {
      id: 'problem', label: 'The problem', title: ['The', 'problem'],
      blocks: [
        { t: 'p', text: 'A chat window can explain a task. It cannot open the folder, read the screen, or check the battery unless something on the computer is willing to do that work. A cloud voice assistant can do some of those things, but the audio, the screen, and the command all leave the machine.' },
        { t: 'p', text: 'Baby is the middle design:' },
        {
          t: 'bullets', items: [
            '**Speech stays on the Mac.**',
            '**The language model proposes** a structured action.',
            '**Local code is the only component** allowed to touch the computer.',
            '**Cloud reasoning is optional**, and it sees a cleaned copy of the text.',
          ],
        },
        { t: 'callout', text: 'That split is the project. The control boundary matters more than any single skill the assistant has.' },
      ],
    },
    {
      id: 'using', label: 'Using it', title: ['What it is like', 'to use'],
      blocks: [
        {
          t: 'steps', items: [
            'Baby is running. The microphone stays open and a wake-word model scores each audio frame.',
            'You say the wake word. The current model is OpenWakeWord, listening for “hey jarvis”, with a confidence threshold and a short cooldown so one utterance does not trigger twice.',
            'Baby speaks a short acknowledgement and starts a **session**. A session is a conversation window, not a new process. It closes on “stop”, “go to sleep”, too much silence, or a timeout of about a minute.',
            'You speak the task. A voice-activity check waits for real speech and cuts the clip when you pause. SenseVoice turns the audio into text.',
            'Junk transcripts are dropped. Empty audio, single filler words and punctuation-only text never become a tool call.',
            'Baby routes the sentence, runs one tool, and speaks the result with the Mac `say` command.',
            'For research-style requests, Baby may run a tool, read what came back, and then speak a recommendation.',
            'The session ends and the wake-word loop starts again.',
          ],
        },
        { t: 'h3', text: 'What it can do today' },
        {
          t: 'lists', items: [
            {
              title: 'Hearing and speaking', items: [
                'Wake word with a cooldown and a busy/session state',
                'Local transcription with noise calibration and end-of-speech detection',
                'Spoken replies through macOS speech',
              ],
            },
            {
              title: 'Computer actions', items: [
                'Open an app, a website, a folder or a saved project',
                'Run a saved workspace profile',
                'Search Google and YouTube',
                'Pull YouTube titles and details, recommend one video, and open it',
                'Screenshot the screen and explain it with a local vision path when asked',
                'Report time, battery, CPU and disk',
                'Lock the Mac',
                'Describe the current workspace, recent files and git branch',
              ],
            },
            {
              title: 'Agent behavior', items: [
                'Rule-based routing for obvious commands',
                'Specialist prompts, so each agent only sees its own tools',
                'Structured JSON plans of one to three steps',
                'A second reasoning step after a tool observation',
                'A tool catalog with privacy labels and confirmation flags',
                'An event bus and a status portal',
              ],
            },
            {
              title: 'Background and privacy', items: [
                'SQLite automations beside the voice loop',
                'Last-command and profile memory',
                'A local privacy classifier and sanitizer in front of cloud reasoning',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline', title: ['The path of', 'one command'],
      blocks: [
        { t: 'p', text: 'If you remember this list, you can explain the whole assistant.' },
        {
          t: 'chain', label: 'The path of one command', items: [
            'Microphone', 'Shared mic manager', 'Wake-word model', 'Session opens', 'Voice activity + SenseVoice', 'Command check',
            'Router', 'Specialist agent', 'JSON tool decision', 'Tool registry', 'MCP tool call', 'Observation', 'Spoken answer',
          ],
        },
        {
          t: 'stages', items: [
            { title: 'One microphone, two jobs', text: 'Wake-word detection and speech recognition both need audio, and reopening the microphone between them is slow and clips the start of the sentence. Baby uses one shared microphone manager. The stream stays open: wake-word detection reads frames from it, and when a session starts the speech recognizer reads the same stream. The wake engine clears the buffer so the wake word itself is not transcribed as the command.' },
            { title: 'Wake word', text: 'The engine loads an ONNX wake-word model. Each frame of float audio is converted to 16-bit PCM, the format the model expects, and the model returns a score for the wake phrase. A trigger needs the score to clear a threshold, and a cooldown blocks an immediate second trigger. The engine publishes a `wake_listening` event so a small status portal can show that Baby is waiting.' },
            { title: 'Session', text: 'A session is the conversation: listen, validate, route, execute, speak. Stop phrases such as “stop baby” and “go to sleep” end it, and so do three silence timeouts in a row or a wall-clock timeout. A voice agent that never returns to idle talks over the user or acts on room noise, so the session boundary is a product decision.' },
            { title: 'Speech to text', text: 'The session calls one public function, `listen_streaming`. The current engine is SenseVoice through sherpa-onnx, a local speech model that handles English and several other languages. The first engine was Whisper, and swapping it did not require rewriting the session. Before transcription, a small voice-activity pass calibrates the room noise, waits for speech to start and ends the clip after a short silence, so the model is never asked to transcribe a long empty recording.' },
            { title: 'Command check', text: 'The transcript is lowercased, punctuation is stripped, and the result is compared with a list of useless fragments such as “um”, “okay”, “thanks” and “the”. Invalid text is ignored. A task splitter can break up a sentence that clearly holds more than one request before routing.' },
            { title: 'Router', text: 'The first pass is deterministic and calls no model: phrase lists and prefixes map obvious speech onto an agent. If no rule matches, a model-backed router chooses. A language model is the wrong tool for “what time is it”. Rules are faster, cheaper and easier to test.' },
            { title: 'Specialist agents', text: 'The coordinator marks the chosen agent as working, writes that status for the portal, and asks it for one decision. Each agent has a narrow prompt and a short allow-list of tools, and returns JSON. If the model wraps the JSON in extra text, the parser takes the first `{` to the last `}`. If parsing fails, the agent fails safe instead of inventing a tool.' },
            { title: 'Tool registry', text: 'The registry is the catalog of what Baby knows how to do. Each tool carries its name and owning agent, a description, parameter names and types, a privacy level (public, local-only, private or sensitive), whether confirmation is required, whether a cloud model may request it, and the MCP tool name to call. It holds metadata only, so a cloud model can be shown the catalog without ever being handed a Python function, a path full of secrets, or an MCP connection.' },
            { title: 'Executor and MCP', text: 'The executor is the only place a decision becomes a side effect. It checks the registry, optionally speaks a short status line such as “Opening Chrome”, publishes `tool_started`, and calls the tool through an MCP client. MCP, the Model Context Protocol, is a standard way to expose tools to an agent without hard-coding every action in the prompt. Here the server is local and holds the browser, Mac, screen and system actions: the model asks and the server does. After the call the executor publishes `tool_finished`, and some tools speak their own result, trimmed so a long page is not read aloud.' },
            { title: 'Observe, then answer', text: 'A tool result is an observation, not always the final answer. For “find me a good Python tutorial”, the first tool only collects YouTube titles and URLs. `decide_next_step` hands that text back to the local model with the original goal, and the model returns a final answer or asks for another search. On a final answer Baby speaks the recommendation without reading the raw URL aloud, then opens the link. That is a small agent loop (act, observe, decide whether you are done), and it is the difference between a voice remote control and an assistant.' },
            { title: 'Speech out', text: 'Replies use the macOS `say` command, so the normal loop needs no cloud text-to-speech account.' },
            { title: 'Events and the portal', text: 'An in-process event bus carries facts such as app started, wake listening, agent selected, tool started and tool finished. Handlers can log them or update a portal state file that a UI can read, so the voice loop publishes events instead of drawing a window itself.' },
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
            { nodes: [{ b: 'Wake-word loop', small: 'OpenWakeWord on one shared microphone stream. Process entry, `start_baby`.', em: 'jarvis_main.py' }] },
            { nodes: [{ b: 'Session manager', small: 'Listen, validate, route, execute, speak. Ends on a stop phrase, silence or a timeout.', em: 'core/session_manager.py' }] },
            {
              nodes: [
                { b: 'SenseVoice ASR', small: 'Local speech-to-text with voice-activity detection' },
                { b: 'Router', small: 'Phrase rules first, a local model only when no rule matches' },
                { b: 'Event bus', small: 'Wake, agent and tool events for logs and the status portal', dim: true },
              ],
            },
            {
              nodes: [
                { b: 'Desktop agent' }, { b: 'Browser agent' }, { b: 'Workspace agent' }, { b: 'Coding agent' }, { b: 'Planner' },
              ],
            },
            { wire: 'JSON tool decision', nodes: [{ b: 'Tool registry', small: 'Metadata only: name, arguments, privacy level, confirmation' }, { b: 'Executor', small: 'The only place a decision becomes a side effect' }] },
            { nodes: [{ b: 'Local MCP server', small: 'Mac, browser, screen and system actions', hot: true }] },
          ],
          caption: 'Hearing, deciding and acting are separate modules. The language model proposes a tool. The local runtime is the only thing that can run it.',
        },
        { t: 'h3', text: 'The optional cloud path' },
        { t: 'chain', numbered: false, label: 'The optional cloud path', items: ['Local text', 'Privacy classifier', 'Redact or block', 'Cloud gateway', 'NVIDIA Nemotron', 'Text answer only'] },
        { t: 'p', text: 'Only a task that needs a larger model takes this path. It goes through one gateway, and the model that answers has no computer of its own.' },
      ],
    },
    {
      id: 'agents', label: 'Agents and tools', title: ['Agents', 'and tools'],
      blocks: [
        { t: 'p', text: 'Obvious commands never call a model. Phrase lists and prefixes send them straight to an agent:' },
        {
          t: 'table', head: ['You say something like', 'Agent'], rows: [
            ['“what is on my screen”, “take a screenshot”', 'Desktop'],
            ['“open Chrome”, “what time is it”, “lock the Mac”', 'Desktop'],
            ['“what am I working on”, “current branch”, “recent files”', 'Workspace'],
            ['“search YouTube”, “google this”, “open the website”', 'Browser'],
            ['“debug this”, “fix this traceback”, “write python”', 'Coding'],
          ],
        },
        { t: 'p', text: 'Each agent has a narrow prompt and a short allow-list of tools:' },
        {
          t: 'kv', rows: [
            ['Desktop agent', 'Opens apps, folders and saved projects, runs a workspace profile, takes or explains a screenshot, and reports time, battery, disk and CPU. It can lock the Mac. It uses screen analysis only when the user actually asked about the screen.'],
            ['Browser agent', 'Searches Google, searches or opens YouTube, fetches video titles and details, and opens a website. A request for a recommendation uses the details tool, and a request that literally says “search YouTube” uses search.'],
            ['Workspace agent', 'Answers questions about the current project: status, recent files, branch and path.'],
            ['Coding agent', 'Turns a coding question into a planner request. It explains, debugs and discusses architecture. In the current build it does not edit files and does not run shell commands, and that limit is intentional.'],
            ['Planner', 'Used for a small multi-step goal. It returns one to three steps of `{tool, target}` JSON and may only name tools that exist.'],
            ['Memory agent', 'The slot exists in the coordinator, but durable long-term memory is still thin, so many memory-shaped requests currently fall through to the planner.'],
          ],
        },
        { t: 'callout', text: 'The registry stores **metadata only**: name, arguments, privacy level and whether a human confirmation is required. A model can be shown the catalog. It is never handed the functions, a file path full of secrets, or an MCP connection.' },
      ],
    },
    {
      id: 'privacy', label: 'Privacy', title: ['Privacy', 'and the cloud'],
      blocks: [
        { t: 'p', text: 'Baby has two kinds of language model, and they do not have the same rights.' },
        {
          t: 'kv', rows: [
            ['Local model', 'Qwen 3 30B, served by Ollama on the Mac. The desktop, browser, coding and planner agents use it. It sees the user sentence and a short allow-list of tools, and it returns JSON.'],
            ['Cloud model', 'NVIDIA Nemotron, reached only through `CloudReasoningGateway`. Its system prompt says it cannot read files, see the desktop, touch passwords, read cookies or run commands. If it needs a fact from the computer, it must ask a named local agent.'],
          ],
        },
        { t: 'h3', text: 'The privacy gate' },
        { t: 'p', text: 'Nothing reaches the cloud client until `CloudPrivacyGate` runs:' },
        {
          t: 'steps', items: [
            'A local classifier scans the text. It does not call the network. It looks for private keys, API keys, bearer tokens, GitHub tokens, AWS keys, emails and similar patterns.',
            'The decision is **allow, redact or block**.',
            'A block sends an empty payload and records why.',
            'A redact runs the sanitizer, then classifies the cleaned text again. If the cleaned text is still unsafe, it is blocked.',
            'The gateway sends only the surviving text.',
          ],
        },
        { t: 'quote', text: 'The cloud model can reason. It cannot act, and it cannot see a secret the local gate removed.' },
      ],
    },
    {
      id: 'automations', label: 'Automations', title: ['Background', 'automations'],
      blocks: [
        { t: 'p', text: 'The voice loop is synchronous: it waits for the wake word, then for speech. A scheduler cannot live inside that wait, or reminders would only run between commands. So `AutomationRuntime` starts a daemon thread with its own asyncio event loop, and `AutomationManager` inside it owns:' },
        {
          t: 'kv', rows: [
            ['SQLite store', 'Saved automations, in `data/baby_automations.db`'],
            ['Trigger engine', 'When something should run'],
            ['Condition engine', 'Whether it should run this time'],
            ['Action registry', 'What to do'],
            ['Output registry', 'Where the result goes: the console, a notification or a saved file'],
            ['Scheduler', 'Polls about once a second and refreshes definitions every few seconds'],
          ],
        },
        { t: 'p', text: 'The voice thread can submit “run this automation now” with `run_coroutine_threadsafe`. Shutdown stops the manager, closes the database, cancels pending tasks and joins the thread. The built-in actions today are small and safe, such as reminders. The framework is the feature: triggers, conditions, actions and outputs are separate registries, so a new action does not require a rewrite of the scheduler.' },
      ],
    },
    {
      id: 'decisions', label: 'Design decisions', title: ['Design decisions', 'worth defending'],
      blocks: [
        {
          t: 'kv', rows: [
            ['JSON, not a paragraph', 'Free text is hard to execute safely. A tool name and a target can be checked against an allow-list.'],
            ['Obvious commands skip the model', 'Routing “open Safari” through a 30-billion-parameter model adds delay and a new way to be wrong. Rules handle the obvious cases and the model handles the rest.'],
            ['Short tool lists per agent', 'A prompt that knows every tool will eventually use the wrong one. The desktop agent cannot search YouTube and the browser agent cannot lock the Mac. Narrow prompts are a safety control.'],
            ['A registry without functions', 'Metadata can be shown to a model. Functions, credentials and sockets stay in the local process.'],
            ['One gateway for the cloud', 'Agents are not allowed to call NVIDIA directly. Every cloud call shares the same privacy gate and the same “you have no computer” prompt. A second, unofficial client would be a hole.'],
            ['The microphone stays open', 'Reopening the device between the wake word and the speech clips the user’s first words.'],
            ['Automations get their own thread', 'Mixing `asyncio` into the blocking wake loop would stall either the listening or the schedule.'],
            ['Speech recognition behind one function', 'Whisper was the first engine and SenseVoice is the current one. The session code did not have to change.'],
            ['Layers that can be tested apart', 'Routing is pure string matching, so it can be tested with text. The privacy classifier can be tested with known secret patterns, and the stop phrases and filler filter without a microphone. End-to-end voice checks are manual: wake word, one command, one spoken result.'],
          ],
        },
      ],
    },
    {
      id: 'limits', label: 'Where it stands', title: ['Honest', 'limits'],
      blocks: [
        { t: 'p', text: 'These are the things I say out loud about the current build:' },
        {
          t: 'bullets', items: [
            'The wake word is still OpenWakeWord. False triggers happen, which is why a threshold, a cooldown and a filler filter exist. A tighter wake word was planned.',
            'The coding agent advises. It does not edit the repository or run commands.',
            'The memory agent is a named route. Long-term personal memory is not a finished product.',
            'Some tool dispatch still has explicit branches in the executor alongside the registry. The registry is the direction, and the migration is partial.',
            'After one observation the agent can choose a follow-up search. It does not yet rebuild a whole plan after an arbitrary failure.',
            'Calendar, email and GitHub actions are on the roadmap. They are not part of the working skill set.',
            'Screen explanation exists. This build does not click arbitrary buttons.',
          ],
        },
        { t: 'callout', lead: 'Is it done?', text: 'The voice loop, the agent split, the tool boundary and the privacy gate are real. It is a working local assistant with a clear list of next skills, not a clone of a commercial assistant.' },
        { t: 'h3', text: 'What I would build next' },
        {
          t: 'bullets', items: [
            'A tighter wake word.',
            'A real memory store that the memory agent can query.',
            'Re-planning when a tool fails.',
            'A confirmation step before any future tool that writes files or sends a message. The cloud gate would stay mandatory for all of those.',
          ],
        },
      ],
    },
    {
      id: 'stack', label: 'Tech stack', title: ['Tech', 'stack'],
      blocks: [
        {
          t: 'tech', rows: [
            ['Language', 'Python: one process owns audio, models and OS actions'],
            ['Wake word', 'OpenWakeWord on the ONNX runtime. Local, no wake-word API'],
            ['Speech to text', 'SenseVoice via sherpa-onnx. Local, streaming-style utterance capture'],
            ['Local LLM', 'Ollama serving Qwen 3 30B for structured tool decisions without a cloud round trip'],
            ['Cloud LLM', 'NVIDIA Nemotron behind one gateway, used only after a privacy check'],
            ['Tools', 'An MCP server and client, so actions live outside the prompt'],
            ['Speech out', 'The macOS say command, with no cloud voice account'],
            ['Automations', 'An asyncio thread, SQLite and a polling scheduler'],
            ['Screen', 'A local screenshot plus a vision model when asked'],
            ['UI status', 'An event bus and a portal state file'],
          ],
        },
        { t: 'h3', text: 'Repository map' },
        {
          t: 'table', code: true, head: ['Path', 'What it is'], rows: [
            ['jarvis_main.py', 'Process entry. Starts automations, then the wake loop'],
            ['voice/wake_engine.py', 'OpenWakeWord on the shared microphone'],
            ['voice/microphone_manager.py', 'One open input stream'],
            ['voice/sensevoice_asr.py', 'Local transcription and end-of-speech'],
            ['voice/streaming_asr.py', 'The function the session calls'],
            ['voice/tts.py', 'Spoken output'],
            ['core/session_manager.py', 'Conversation window, stop phrases, silence limits'],
            ['brain/router.py', 'Fast phrase routing, then a model fallback'],
            ['brain/coordinator.py', 'Picks the agent and collects one tool decision'],
            ['agents/', 'Desktop, browser, workspace, coding, planner, memory'],
            ['core/planner.py', 'Multi-step JSON plans'],
            ['core/executor.py', 'Turns a decision into an MCP call'],
            ['core/agent_loop.py', 'Reads a tool observation and decides the next step'],
            ['core/tool_registry.py', 'Tool metadata, privacy, confirmation'],
            ['mcp_layer/', 'Local MCP server and client'],
            ['skills/', 'Browser, Mac, screen and system actions'],
            ['core/privacy/', 'Classifier, sanitizer and the cloud gate'],
            ['core/cloud/', 'The single NVIDIA client and reasoning gateway'],
            ['core/automation/', 'Scheduler, triggers, actions, outputs, SQLite store'],
            ['core/event_bus.py', 'In-process events'],
            ['core/memory_store.py', 'Last command and small persistent memory'],
          ],
        },
        { t: 'p', text: 'The folder is still named Jarvis Voice because that was the original name. The running product speaks and logs as Baby.' },
      ],
    },
  ],
};

// The card shown in the Projects section of the home page
export const BABY_VOICE_CARD = {
  icon: 'voice',
  name: 'Baby Voice Assistant',
  desc: 'A local macOS voice assistant: wake word, offline speech-to-text, specialist agents, a typed tool registry and a privacy gate in front of any cloud model.',
  tags: ['Python', 'Ollama', 'MCP', 'Voice', 'Privacy'],
  href: '#/project/baby-voice',
};
