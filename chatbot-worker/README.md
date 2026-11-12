# "Ask about Adhik": the chat assistant

A chat button sits in the bottom right of the site. Anyone can ask it about you: it answers from the text in `knowledge.txt` (your resume plus the extra details you add) and `projects.txt` (the projects that have their own page on the site), and says "I don't know" for anything that is not there.

How it is built, and why it is safe on a public site:
- GitHub Pages can only serve static files, so the OpenAI key cannot live in the site. It lives in a tiny **Cloudflare Worker** (free plan) that you own. The site talks to the Worker; the Worker talks to OpenAI. The key is stored as a Cloudflare secret named `PORTFOLIO_CHAT_API` and never appears in the site, the repo or the browser.
- The Worker only accepts browser calls from your site (`ALLOWED_ORIGINS` in `wrangler.toml`), plus localhost on any port and your home network so you can test with `npm run dev`, allows 12 questions a minute per visitor, caps the question and reply size, and hides OpenAI error details from visitors.
- **Chats are not saved and not sent to you.** The Worker keeps no log of conversations. A visitor's own chat is kept only in their browser tab (cleared when the tab closes).
- The assistant is told to speak about you in the third person, say it is an AI, and not invent anything.

## One-time setup (about 5 minutes)
You need Node (you already have it) and a free Cloudflare account (the script opens a browser window to log in or sign up). From the project root:

```bash
cd chatbot-worker
npm install
npm run feed -- ~/Documents/your_resume.pdf     # also works with .docx or .txt
open knowledge.txt                               # fill in the "MORE ABOUT ME" part (details below)
npm run deploy
```
`npm run deploy` logs in to Cloudflare, publishes the Worker, asks you to paste an OpenAI key **into the terminal** (typing is hidden; it goes straight to Cloudflare), writes the Worker's public address into `../.env` as `VITE_CHAT_URL`, and checks that everything works. Create the key at https://platform.openai.com/api-keys.

Then run `npm run dev` in the project root and ask the chat a question. When you are happy, commit `.env` along with the rest and publish as usual (`.env` holds only the public Worker address, nothing secret).

Until `VITE_CHAT_URL` exists, the chat button is **hidden on the live site** and shows a "preview only" message in `npm run dev`.

## Adding and changing what it knows
- Everything it knows is `knowledge.txt` plus `projects.txt` (one section per project page, for example MediCoreRx). Lines starting with `//` in either file are notes to you and are never sent to OpenAI.
- `npm run feed -- resume.pdf` replaces the part between `// BEGIN RESUME` and `// END RESUME`. Run it again whenever the resume changes.
- **Phone numbers are hidden by default** (the assistant would give them to any visitor who asks). Add `--keep-phone` to the feed command if you want it shared.
- "MORE ABOUT ME" is for the things a resume does not say: what roles you want, what you are proud of, how you work, what you are learning, interests, availability, location preferences, work authorization (only what is true and what you are happy to be public).
- After any edit, run `npm run deploy` again (it is safe to repeat; it keeps the key).
- `knowledge.txt` and `projects.txt` are committed to your repository, and the repository is public, so write only what you are comfortable having public. Re-running `apply.sh` never overwrites them.
- When you change a project page (`src/projects/medicorerx.js`), update its section in `projects.txt` the same way, so the assistant stays in step (for example when the source link is published), then run `npm run deploy`.

## Cost and safety
- The default model is `gpt-6-luna`, OpenAI's low-cost model ($0.10 per million input tokens and $0.50 per million output tokens as of November 2026; check OpenAI's pricing page for changes). Your whole `knowledge.txt` is sent with each question, so a typical question costs a small fraction of a cent.
- Anyone can use the chat, so **set a monthly spending limit** in your OpenAI account (Billing, Limits) as a hard ceiling.
- To change the model, edit `OPENAI_MODEL` in `wrangler.toml` and run `npm run deploy`. If the name is wrong, `deploy` tells you ("OpenAI does not know the model...").
- To change how fast visitors may ask, edit `limit` and `period` at the bottom of `wrangler.toml`.
- If you move the site to another address (a custom domain), add it to `ALLOWED_ORIGINS` in `wrangler.toml`.

## Check it by hand
Open `<your worker address>/health` in a browser. `{"ok":true,...}` means the key and model work. Otherwise it says what is wrong: key rejected, model name unknown, or no credit left on the OpenAI account.

## Turn it off
- Hide it: delete the `VITE_CHAT_URL` line from `.env`, rebuild, publish.
- Remove it completely: `npx wrangler delete` inside `chatbot-worker`.
- Replace the key: `npx wrangler secret put PORTFOLIO_CHAT_API`.
