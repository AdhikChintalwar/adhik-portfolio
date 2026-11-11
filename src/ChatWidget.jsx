import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowUp } from 'lucide-react';
import './chat.css';
import { PERSON } from './content.js';

// The assistant runs on your own small Cloudflare Worker (see chatbot-worker/). The address is in .env as VITE_CHAT_URL.
// With no address: hidden on the live site, and a "preview" message in `npm run dev` so you can see the window.
const CHAT_URL = (import.meta.env.VITE_CHAT_URL || '').replace(/\/$/, '');
const PREVIEW = !CHAT_URL && import.meta.env.DEV;
const STORE = 'adhik-chat-v1';
const MAX_LEN = 500;
const SUGGEST = [
  'What does Adhik do at Agilysys?',
  'Where did he study?',
  'What are his main skills?',
  'How can I contact him?',
];

const load = () => { try { const v = JSON.parse(sessionStorage.getItem(STORE) || '[]'); return Array.isArray(v) ? v.slice(-24) : []; } catch { return []; } };
const save = (m) => { try { sessionStorage.setItem(STORE, JSON.stringify(m.slice(-24))); } catch { /* private mode: fine */ } };

// small, safe renderer: **bold**, links, e-mail addresses and "- " lists. Nothing is ever injected as HTML.
const TOKEN = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]*[^\s).,;:!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
function inline(text) {
  return text.split(TOKEN).map((p, i) => {
    if (!p) return null;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(p)) return <a key={i} href={p} target="_blank" rel="noreferrer noopener">{p.replace(/^https?:\/\/(www\.)?/, '')}</a>;
    if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(p)) return <a key={i} href={`mailto:${p}`}>{p}</a>;
    return p;
  });
}
function Body({ text }) {
  const out = [];
  let list = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>); list = []; } };
  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    const m = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) list.push(m[1]);
    else { flush(); if (line) out.push(<p key={`p${out.length}`}>{inline(line)}</p>); }
  });
  flush();
  return <>{out}</>;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState(load);        // { role, content, error? }
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => { save(msgs.filter((m) => !m.error)); }, [msgs]);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [msgs, busy, open]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); if (launcherRef.current) launcherRef.current.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); abortRef.current = null; }, []);

  if (!CHAT_URL && !PREVIEW) return null;

  const send = async (raw) => {
    const q = (raw || '').trim().slice(0, MAX_LEN);
    if (!q || busy) return;
    const next = [...msgs, { role: 'user', content: q }];
    setMsgs(next);
    setText('');
    setBusy(true);
    if (PREVIEW) {
      setTimeout(() => {
        setMsgs((m) => [...m, { role: 'assistant', error: true, content: 'Preview only: the assistant is not connected yet. In the chatbot-worker folder run  npm run deploy  and it will start answering here.' }]);
        setBusy(false);
      }, 600);
      return;
    }
    const ctl = new AbortController();
    abortRef.current = ctl;
    const timer = setTimeout(() => ctl.abort(), 40000);
    try {
      const history = next.filter((m) => !m.error).slice(-12).map(({ role, content }) => ({ role, content }));
      const res = await fetch(`${CHAT_URL}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: ctl.signal });
      let data = {};
      try { data = await res.json(); } catch { /* not JSON */ }
      if (res.ok && data.reply) setMsgs((m) => [...m, { role: 'assistant', content: data.reply }]);
      else setMsgs((m) => [...m, { role: 'assistant', error: true, content: data.error || `Sorry, I couldn't answer that just now. You can email Adhik at ${PERSON.email}.` }]);
    } catch (err) {
      if (err && err.name === 'AbortError' && !abortRef.current) return;
      setMsgs((m) => [...m, { role: 'assistant', error: true, content: `I couldn't reach the assistant. You can email Adhik at ${PERSON.email}.` }]);
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } };
  const clear = () => { setMsgs([]); setText(''); if (inputRef.current) inputRef.current.focus(); };

  return (
    <div className="chat">
      {open && (
        <section className="chat-panel" id="chat-panel" role="dialog" aria-label="Chat with Adhik’s AI assistant">
          <header className="chat-head">
            <div>
              <h2>Ask about Adhik</h2>
              <p>AI assistant · from his resume</p>
            </div>
            <div className="chat-tools">
              {msgs.length > 0 && <button type="button" className="chat-clear" onClick={clear}>New chat</button>}
              <button type="button" className="chat-x" aria-label="Close chat" onClick={() => { setOpen(false); if (launcherRef.current) launcherRef.current.focus(); }}><X size={18} /></button>
            </div>
          </header>

          <div className="chat-list" ref={listRef} role="log" aria-live="polite" aria-relevant="additions">
            <div className="msg bot">
              <p>Hi, I’m Adhik’s AI assistant. Ask me about his experience, education, skills or how to reach him.</p>
            </div>
            {msgs.length === 0 && (
              <div className="chat-suggest">
                {SUGGEST.map((s) => <button type="button" key={s} onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'me' : 'bot'}${m.error ? ' err' : ''}`}>
                {m.role === 'user' ? <p>{m.content}</p> : <Body text={m.content} />}
              </div>
            ))}
            {busy && <div className="msg bot typing" aria-label="The assistant is typing"><i /><i /><i /></div>}
          </div>

          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <textarea ref={inputRef} rows={1} value={text} maxLength={MAX_LEN} placeholder="Ask a question…" aria-label="Your question" onChange={(e) => setText(e.target.value)} onKeyDown={onKey} />
            <button type="submit" className="chat-send" aria-label="Send" disabled={busy || !text.trim()}><ArrowUp size={18} /></button>
          </form>
          <p className="chat-note">AI can make mistakes. For anything important, email {PERSON.email}.</p>
        </section>
      )}
      <button ref={launcherRef} type="button" className="chat-launch" aria-expanded={open} aria-controls="chat-panel" onClick={() => setOpen((o) => !o)}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span>{open ? 'Close' : 'Ask about Adhik'}</span>
      </button>
    </div>
  );
}
