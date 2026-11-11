// Feeds your resume to the assistant:  npm run feed -- path/to/resume.pdf   (also .docx, .txt, .md)
// It extracts the text and writes it into knowledge.txt between the BEGIN RESUME / END RESUME lines. Then run: npm run deploy
// Phone numbers are masked unless you add --keep-phone (the assistant would otherwise give them to any visitor who asks).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE = path.join(here, '..', 'knowledge.txt');
const args = process.argv.slice(2);
const keepPhone = args.includes('--keep-phone');
const file = args.find((a) => !a.startsWith('--'));
if (!file) { console.error('Usage: npm run feed -- path/to/resume.pdf   (.pdf, .docx, .txt or .md)'); process.exit(1); }
if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }

const ext = path.extname(file).toLowerCase();
let text = '';
if (ext === '.txt' || ext === '.md') {
  text = fs.readFileSync(file, 'utf8');
} else if (ext === '.docx') {
  const mammoth = require('mammoth');
  text = (await mammoth.extractRawText({ path: file })).value;
} else if (ext === '.pdf') {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: true, verbosity: 0 }).promise;
    const lines = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const content = await (await doc.getPage(n)).getTextContent();
      let line = '', y = null;
      for (const it of content.items) {
        if (typeof it.str !== 'string') continue;
        const iy = it.transform ? Math.round(it.transform[5]) : y;
        if (y !== null && iy !== null && Math.abs(iy - y) > 2 && line) { lines.push(line); line = ''; }
        line += it.str; y = iy;
        if (it.hasEOL) { lines.push(line); line = ''; }
      }
      if (line) lines.push(line);
      lines.push('');
    }
    text = lines.join('\n');
  } catch (err) {
    console.error(`Could not read that PDF (${err && err.message ? err.message : err}). Export it again as a standard PDF, save it as DOCX, or paste the text into knowledge.txt.`); process.exit(1);
  }
} else {
  console.error(`Cannot read ${ext} files. Save your resume as PDF, DOCX or TXT.`); process.exit(1);
}

text = text.replace(/\r/g, '').split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter((l) => !l.startsWith('//')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
if (!keepPhone) text = text.replace(/(?:\+?\d{1,2}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/g, '[phone number not shared]');
if (text.length < 200) { console.error(`Only ${text.length} characters could be read from that file. A scanned (image-only) PDF has no text: export it as a text PDF or DOCX, or paste the text into knowledge.txt.`); process.exit(1); }
if (text.length > 30000) { console.error(`The resume is ${text.length} characters, which is too long for the assistant (limit 30000). Shorten it.`); process.exit(1); }

let k = fs.readFileSync(KNOWLEDGE, 'utf8');
const begin = '// BEGIN RESUME', end = '// END RESUME';
const i = k.indexOf(begin), j = k.indexOf(end);
if (i < 0 || j < i) { console.error('knowledge.txt is missing the BEGIN RESUME / END RESUME lines.'); process.exit(1); }
k = k.slice(0, i + begin.length) + '\n' + text + '\n' + k.slice(j);
fs.writeFileSync(KNOWLEDGE, k);
console.log(`Resume added to knowledge.txt (${text.length} characters${keepPhone ? '' : ', phone numbers masked'}).`);
console.log('\nFirst lines read:\n' + text.split('\n').slice(0, 8).map((l) => '  ' + l.slice(0, 100)).join('\n'));
console.log('\nNext: npm run deploy');
