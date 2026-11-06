// build_combined.js
// Reads every .md file in the CSE423 study pack and composes a single,
// self-contained HTML app (modern editorial UI/UX) with sidebar navigation.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "CSE423_Study_Pack.html");

// ---------------------------------------------------------------------------
// Markdown -> HTML conversion (small, self-contained, safe)
// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(md) {
  // Protect fenced/inline code first
  const codeSpans = [];
  let s = md.replace(/`([^`]+)`/g, (m, c) => {
    codeSpans.push(escapeHtml(c));
    return "\u0000" + (codeSpans.length - 1) + "\u0000";
  });

  // Bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text* (no space after open star)
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?![*])/g, "$1<em>$2</em>");
  // Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => {
    const href = u.startsWith("http")
      ? u
      : "#" + u.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const target = u.startsWith("http")
      ? ' target="_blank" rel="noopener"'
      : "";
    return '<a href="' + href + '"' + target + ">" + t + "</a>";
  });

  // Restore code
  s = s.replace(
    /\u0000(\d+)\u0000/g,
    (m, i) => "<code>" + codeSpans[+i] + "</code>",
  );
  return s;
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inFence = false,
    fenceBuf = [],
    fenceLang = "";
  let listType = null,
    listBuf = [];
  let paraBuf = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push("<p>" + inline(paraBuf.join(" ")) + "</p>");
      paraBuf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      const tag = listType === "ol" ? "ol" : "ul";
      out.push("<" + tag + ">" + listBuf.join("") + "</" + tag + ">");
      listBuf = [];
      listType = null;
    }
  };

  // Table collection
  let tableBuf = [],
    inTable = false;
  const flushTable = () => {
    if (!tableBuf.length) return;
    const html = [];
    const isSep = (r) =>
      /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(r) &&
      r.includes("-");
    const rows = tableBuf.filter((r) => !isSep(r));
    rows.forEach((r, i) => {
      const cells = r
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.trim());
      const tag = i === 0 ? "th" : "td";
      html.push(
        "<tr>" +
          cells
            .map((c) => "<" + tag + ">" + inline(c) + "</" + tag + ">")
            .join("") +
          "</tr>",
      );
    });
    out.push(
      '<div class="tbl-wrap"><table>' + html.join("") + "</table></div>",
    );
    tableBuf = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Fenced code
    if (/^```/.test(line)) {
      if (inFence) {
        out.push(
          '<pre><code class="lang-' +
            fenceLang +
            '">' +
            escapeHtml(fenceBuf.join("\n")) +
            "</code></pre>",
        );
        inFence = false;
        fenceBuf = [];
        fenceLang = "";
      } else {
        flushPara();
        flushList();
        flushTable();
        inFence = true;
        fenceLang = line.slice(3).trim();
      }
      continue;
    }
    if (inFence) {
      fenceBuf.push(raw);
      continue;
    }

    // Table rows
    if (/^\s*\|/.test(line) || (inTable && /^\s*\|?[^|]*\|/.test(line))) {
      if (!inTable) {
        flushPara();
        flushList();
        tableBuf = [];
        inTable = true;
      }
      if (line) tableBuf.push(line);
      continue;
    }
    if (inTable) flushTable();

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      flushTable();
      const level = h[1].length;
      out.push("<h" + level + ">" + inline(h[2]) + "</h" + level + ">");
      continue;
    }

    // HR
    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushPara();
      flushList();
      flushTable();
      out.push("<hr>");
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      flushPara();
      flushList();
      out.push(
        "<blockquote>" + inline(line.replace(/^>\s?/, "")) + "</blockquote>",
      );
      continue;
    }

    // Lists
    const ul = line.match(/^[-*+]\s+(.*)$/);
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const t = ol ? "ol" : "ul";
      if (listType !== t) {
        flushList();
        listType = t;
      }
      const content = ul ? ul[1] : ol[1];
      listBuf.push("<li>" + inline(content) + "</li>");
      continue;
    }
    if (listType) flushList();

    // Empty line
    if (line === "") {
      flushPara();
      continue;
    }

    // Plain paragraph (accumulate)
    paraBuf.push(line);
  }
  flushPara();
  flushList();
  flushTable();
  if (inFence)
    out.push(
      '<pre><code class="lang-' +
        fenceLang +
        '">' +
        escapeHtml(fenceBuf.join("\n")) +
        "</code></pre>",
    );
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Manifest: ordered list of (file, section label)
// ---------------------------------------------------------------------------
const MANIFEST = [
  { file: "README.md", label: "Home & Overview", group: "Start" },
  { file: "Course_Map.md", label: "Course Map (COs)", group: "Start" },
  { file: "Unit_1/Unit_1_Notes.md", label: "Unit 1 · Notes", group: "Unit I" },
  {
    file: "Unit_1/Unit_1_Questions.md",
    label: "Unit 1 · Questions",
    group: "Unit I",
  },
  {
    file: "Unit_1/Unit_1_CheatSheet.md",
    label: "Unit 1 · Cheat Sheet",
    group: "Unit I",
  },
  { file: "Unit_2/Unit_2_Notes.md", label: "Unit 2 · Notes", group: "Unit II" },
  {
    file: "Unit_2/Unit_2_Questions.md",
    label: "Unit 2 · Questions",
    group: "Unit II",
  },
  {
    file: "Unit_2/Unit_2_CheatSheet.md",
    label: "Unit 2 · Cheat Sheet",
    group: "Unit II",
  },
  {
    file: "Unit_3/Unit_3_Notes.md",
    label: "Unit 3 · Notes",
    group: "Unit III",
  },
  {
    file: "Unit_3/Unit_3_Questions.md",
    label: "Unit 3 · Questions",
    group: "Unit III",
  },
  {
    file: "Unit_3/Unit_3_CheatSheet.md",
    label: "Unit 3 · Cheat Sheet",
    group: "Unit III",
  },
  { file: "Unit_4/Unit_4_Notes.md", label: "Unit 4 · Notes", group: "Unit IV" },
  {
    file: "Unit_4/Unit_4_Questions.md",
    label: "Unit 4 · Questions",
    group: "Unit IV",
  },
  {
    file: "Unit_4/Unit_4_CheatSheet.md",
    label: "Unit 4 · Cheat Sheet",
    group: "Unit IV",
  },
  { file: "Unit_5/Unit_5_Notes.md", label: "Unit 5 · Notes", group: "Unit V" },
  {
    file: "Unit_5/Unit_5_Questions.md",
    label: "Unit 5 · Questions",
    group: "Unit V",
  },
  {
    file: "Unit_5/Unit_5_CheatSheet.md",
    label: "Unit 5 · Cheat Sheet",
    group: "Unit V",
  },
  { file: "Unit_6/Unit_6_Notes.md", label: "Unit 6 · Notes", group: "Unit VI" },
  {
    file: "Unit_6/Unit_6_Questions.md",
    label: "Unit 6 · Questions",
    group: "Unit VI",
  },
  {
    file: "Unit_6/Unit_6_CheatSheet.md",
    label: "Unit 6 · Cheat Sheet",
    group: "Unit VI",
  },
  {
    file: "Practicals/Practicals_Step_By_Step.md",
    label: "Practicals 1–8",
    group: "Labs",
  },
  {
    file: "CSE423_Model_Exam_Paper.md",
    label: "Model Exam Papers",
    group: "Exam",
  },
  { file: "Glossary_of_Cloud_Terms.md", label: "Glossary", group: "Reference" },
  {
    file: "Unit_Topic_Flow.md",
    label: "Topic Flow & Mind Maps",
    group: "Reference",
  },
];

// ---------------------------------------------------------------------------
// Build content + nav
// ---------------------------------------------------------------------------
const sections = [];
const navGroups = new Map();

let fileIdx = 0;
for (const item of MANIFEST) {
  const full = path.join(ROOT, item.file);
  if (!fs.existsSync(full)) {
    console.warn("missing: " + item.file);
    continue;
  }
  const md = fs.readFileSync(full, "utf8");
  const id = "sec-" + fileIdx++;
  const html = mdToHtml(md);
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : item.label;
  sections.push({ id, title, label: item.label, group: item.group, html });
  if (!navGroups.has(item.group)) navGroups.set(item.group, []);
  navGroups.get(item.group).push({ id, label: item.label, title });
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------
function buildNav() {
  let html = "";
  for (const [group, items] of navGroups) {
    html +=
      '<div class="nav-group"><div class="nav-group-label">' +
      escapeHtml(group) +
      "</div>";
    for (const it of items) {
      html +=
        '<a class="nav-item" data-target="#' +
        it.id +
        '" href="#' +
        it.id +
        '">' +
        escapeHtml(it.label) +
        "</a>";
    }
    html += "</div>";
  }
  return html;
}

function buildContent() {
  return sections
    .map(
      (s) =>
        '<section class="doc" id="' +
        s.id +
        '" data-title="' +
        escapeHtml(s.title) +
        '">' +
        '<div class="doc-heading"><h1>' +
        escapeHtml(s.title) +
        "</h1>" +
        '<span class="doc-label">' +
        escapeHtml(s.label) +
        "</span></div>" +
        '<div class="doc-body">' +
        s.html +
        "</div></section>",
    )
    .join("\n");
}

const TITLE = "CSE423 · Study Pack";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%231f3d38'/%3E%3Ctext x='50' y='72' font-size='62' font-family='Georgia,serif' fill='%23e2a878' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E">
<title>${TITLE}</title>
<style>
:root{
  --ink:#232a2e;
  --ink-soft:#4a555b;
  --paper:#f7f3ec;
  --card:#fffdf8;
  --line:#e4ddd0;
  --brand:#1e3f38;        /* deep pine */
  --brand-2:#2b5a50;
  --brand-3:#12312b;
  --accent:#c25b2c;       /* terracotta */
  --accent-soft:#f1e3d4;
  --gold:#d9a45f;        /* antique gold accent */
  --gold-soft:#f5e9d6;
  --code-bg:#f2ede3;
  --ok:#2e6e4e;
  --ink-deep:#0f1a18;
  --shadow-sm:0 1px 2px rgba(20,40,36,.06),0 2px 8px rgba(20,40,36,.05);
  --shadow-lg:0 14px 40px rgba(20,40,36,.14);
  --radius:14px;
  --ring:0 0 0 3px rgba(194,91,44,.18);
  --side-w:312px;
  --font-body:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --font-display:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --font-mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,"Liberation Mono",monospace;
}

/* ---------- Dark / night mode ---------- */
body.dark{
  --paper:#131814;
  --card:#1b211d;
  --ink:#e8e3d9;
  --ink-soft:#aab1a7;
  --line:#2a332e;
  --brand:#7fb8a6;
  --brand-2:#5c9e8c;
  --brand-3:#2c4a42;
  --accent:#e08a55;
  --accent-soft:rgba(224,138,85,.16);
  --gold:#e4b77d;
  --gold-soft:rgba(228,183,125,.14);
  --code-bg:#222a26;
  --ok:#5fc48c;
  --ink-deep:#f2ede2;
  --shadow-sm:0 1px 2px rgba(0,0,0,.35),0 2px 10px rgba(0,0,0,.28);
  --shadow-lg:0 16px 44px rgba(0,0,0,.5);
  --ring:0 0 0 3px rgba(224,138,85,.28);
  background:
    radial-gradient(1100px 520px at 88% -8%, rgba(228,183,125,.12) 0%, transparent 55%),
    radial-gradient(900px 500px at -5% 30%, rgba(92,158,140,.12) 0%, transparent 50%),
    linear-gradient(180deg,#141a16 0%, var(--paper) 40%);
}
body.dark .topbar{background:rgba(19,24,20,.82)}
body.dark .reader-controls button{color:var(--ink);border-color:var(--line)}
body.dark .doc-body strong{color:#f4f1ea}
body.dark .doc-body code{border-color:#333d38}
body.dark .doc-body blockquote{color:#e9cdbb;border-left-color:var(--accent);background:linear-gradient(90deg,var(--accent-soft),transparent)}
body.dark .doc-body h2{background:linear-gradient(90deg,rgba(124,184,166,.10),transparent 70%)}
body.dark .doc-body h4{color:var(--brand)}
body.dark .doc-body a{text-decoration-color:rgba(224,138,85,.5)}
body.dark .doc-label::before{box-shadow:0 0 0 3px rgba(224,138,85,.25)}
body.dark .tbl-wrap{border-color:var(--line)}
body.dark .reader-controls .sep{background:var(--line)}
body.dark .doc-body tbody tr:hover td{background:#242c27}
body.dark .doc-body tr:nth-child(even) td{background:#202722}
body.dark .toc{background:var(--card)}
body.dark .search input{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark #toTop{box-shadow:0 10px 26px rgba(0,0,0,.5)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family:var(--font-body);
  color:var(--ink);
  background:
    radial-gradient(1100px 520px at 88% -8%, rgba(217,164,95,.28) 0%, transparent 55%),
    radial-gradient(900px 500px at -5% 30%, rgba(43,90,80,.10) 0%, transparent 50%),
    linear-gradient(180deg,#fbf8f1 0%, var(--paper) 40%);
  min-height:100vh;
  line-height:1.65;
  font-size:16px;
}
/* Smooth theme switching: animate color surfaces only */
body,.topbar,.doc-body table,.doc-body td,.doc-body th,.doc-body pre,.doc-body code,.doc-body blockquote,.toc,.reader-controls button,.search input,#toTop,.side{
  transition:background-color .4s ease,color .4s ease,border-color .4s ease,box-shadow .4s ease;
}
/* ---------- App layout ---------- */
.app{display:flex;min-height:100vh}
.side{
  width:var(--side-w);
  flex:0 0 var(--side-w);
  position:sticky;
  top:0;
  height:100vh;
  overflow-y:auto;
  background:
    radial-gradient(560px 380px at -20% -10%, rgba(217,164,95,.22) 0%, transparent 55%),
    linear-gradient(180deg,#1d4138 0%, #122c27 60%, #0e2420 100%);
  box-shadow:inset -1px 0 0 rgba(255,255,255,.06);
  color:#e9e2d5;
  padding:22px 0 40px;
  display:flex;
  flex-direction:column;
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,.25) transparent;
}
.brand{padding:0 26px 20px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:16px;position:relative}
.brand::after{content:"";display:block;width:44px;height:2px;background:linear-gradient(90deg,var(--gold),transparent);border-radius:2px;margin-top:16px}
.brand .mark{font-family:var(--font-display);font-size:23px;font-weight:700;letter-spacing:.4px;color:#fff;line-height:1.15}
.brand .mark em{font-style:normal;background:linear-gradient(90deg,#f0c394,#dda16a);-webkit-background-clip:text;background-clip:text;color:transparent}
.brand .sub{font-size:11.5px;opacity:.78;margin-top:6px;letter-spacing:.6px;text-transform:uppercase}
.search{padding:0 16px 12px}
.search input{
  width:100%;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.14);
  color:#fff;
  border-radius:12px;
  padding:10px 14px;
  font-size:13.5px;
  outline:none;
  transition:border-color .2s,background .2s,box-shadow .2s;
}
.search input::placeholder{color:rgba(255,255,255,.45)}
.search input:focus{border-color:#e2a878;background:rgba(255,255,255,.12)}
.nav{flex:1;padding:0 10px}
.nav-group{margin-bottom:14px}
.nav-group-label{
  font-size:11px;letter-spacing:1.6px;text-transform:uppercase;
  color:#e2a878;opacity:.9;padding:6px 14px 6px;font-weight:700;
}
.nav-item{
  display:block;
  color:#d8cebd;
  text-decoration:none;
  font-size:14px;
  padding:8px 16px;
  border-radius:9px;
  border-left:3px solid transparent;
  position:relative;
  transition:background .18s,color .18s,border-color .18s,padding-left .18s;
}
.nav-item:hover{background:rgba(255,255,255,.07);color:#fff;padding-left:19px}
.nav-item.active{background:linear-gradient(90deg,rgba(217,164,95,.16),rgba(217,164,95,.04));color:#fff;border-left-color:#e6b77e}
.side-foot{padding:14px 24px 0;font-size:11.5px;opacity:.6;border-top:1px solid rgba(255,255,255,.1);margin-top:10px}

.main{flex:1;min-width:0}
.topbar{
  position:sticky;top:0;z-index:20;
  background:rgba(250,247,240,.82);
  backdrop-filter:blur(12px) saturate(1.4);
  border-bottom:1px solid var(--line);
  padding:13px 36px;
  display:flex;align-items:center;gap:14px;
}
.topbar .crumb{font-size:13px;color:var(--ink-soft)}
.topbar .crumb b{color:var(--brand);font-weight:700}
.topbar .spacer{flex:1}
.reader-controls{display:flex;gap:6px;align-items:center}
.reader-controls .sep{width:1px;height:22px;background:var(--line);margin:0 4px}
.reader-controls button{
  border:1px solid var(--line);background:var(--card);color:var(--ink);
  width:36px;height:36px;border-radius:11px;cursor:pointer;font-size:15px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:var(--shadow-sm);
  transition:transform .15s,background .15s,border-color .15s;
}
.reader-controls button:hover{background:var(--accent-soft);transform:translateY(-1px);border-color:#dcc8b5}
.reader-controls #themeToggle{
  width:40px;height:36px;
  background:linear-gradient(180deg,var(--brand-2),var(--brand));
  color:#f4efe5;border-color:rgba(255,255,255,.14);
  font-size:15px;box-shadow:var(--shadow-sm);
}
.reader-controls #themeToggle:hover{background:linear-gradient(180deg,var(--brand),var(--brand-3));color:#fff;border-color:var(--gold)}
.content{padding:40px 52px 130px;max-width:1020px;margin:0 auto}

/* ---------- Document / Typography ---------- */
.doc{margin-bottom:64px}
.doc-heading{
  position:relative;
  border-bottom:1px solid var(--line);
  padding-bottom:20px;margin-bottom:30px;
}
.doc-heading::after{content:"";position:absolute;left:0;bottom:-1px;width:64px;height:2px;background:linear-gradient(90deg,var(--accent),var(--gold));border-radius:2px}
.doc-heading h1{margin:0;font-family:var(--font-display);font-size:32px;line-height:1.18;color:var(--ink);font-weight:700;letter-spacing:.2px}
.doc-label{display:inline-flex;align-items:center;gap:7px;margin-top:12px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:var(--accent);font-weight:700}
.doc-label::before{content:"";width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--gold));box-shadow:0 0 0 3px var(--accent-soft)}
.doc-body h1{font-size:26px}
.doc-body h2{font-family:var(--font-display);font-size:23px;color:var(--brand);margin:38px 0 12px;padding:10px 0 0 14px;border-left:3px solid var(--brand-2);border-radius:0 2px 2px 0;background:linear-gradient(90deg,rgba(43,90,80,.06),transparent 70%)}
.doc-body h3{font-size:17px;color:var(--ink);margin:26px 0 8px}
.doc-body h4{font-size:15px;color:var(--brand-2);margin:20px 0 6px}
.doc-body p{margin:10px 0}
.doc-body a{color:var(--accent);text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(194,87,43,.4)}
.doc-body a:hover{text-decoration-color:var(--accent)}
.doc-body strong{color:#181e1f}
.doc-body em{color:var(--ink-soft)}
.doc-body ul,.doc-body ol{margin:10px 0;padding-left:24px}
.doc-body li{margin:5px 0}
.doc-body code{font-family:var(--font-mono);font-size:.88em;background:var(--code-bg);border:1px solid #e2dacb;border-radius:6px;padding:1px 6px;color:#7a3a1f}
.doc-body pre{background:linear-gradient(180deg,#201f1c,#181715);color:#efe7db;padding:18px 20px;border-radius:14px;overflow-x:auto;font-size:13.5px;line-height:1.65;box-shadow:var(--shadow-lg);border:1px solid rgba(255,255,255,.06);margin:16px 0;position:relative}
.doc-body pre::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--accent),transparent);border-radius:14px 14px 0 0}
.doc-body pre code{background:transparent;border:none;color:inherit;padding:0}
.doc-body blockquote{border-left:3px solid var(--accent);background:linear-gradient(90deg,var(--accent-soft),rgba(241,227,212,.4));margin:16px 0;padding:14px 20px;border-radius:0 12px 12px 0;color:#5c2e18}
.doc-body hr{border:none;border-top:1px solid var(--line);margin:28px 0}
.tbl-wrap{overflow-x:auto;margin:16px 0;border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow-sm)}
.doc-body table{border-collapse:collapse;width:100%;min-width:420px;font-size:14px;background:var(--card)}
.doc-body th{background:linear-gradient(180deg,var(--brand),var(--brand-3));color:#f4efe5;text-align:left;padding:12px 14px;font-weight:600;font-size:12.5px;letter-spacing:.5px;white-space:nowrap;text-transform:uppercase}
.doc-body td{padding:10px 14px;border-top:1px solid var(--line);vertical-align:top}
.doc-body tbody tr{transition:background .15s}
.doc-body tbody tr:hover td{background:#fdf9f1}
.doc-body tr:nth-child(even) td{background:#faf5ee}
.toc{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:16px 22px;margin:0 0 24px;box-shadow:var(--shadow-sm)}
.toc b{color:var(--brand)}

/* ---------- Misc ---------- */
#toTop{
  position:fixed;right:28px;bottom:28px;
  background:linear-gradient(180deg,var(--brand-2),var(--brand));
  color:#fff;border:1px solid rgba(255,255,255,.14);
  width:48px;height:48px;border-radius:50%;
  cursor:pointer;font-size:20px;box-shadow:0 10px 26px rgba(20,40,36,.30);
  opacity:0;pointer-events:none;transition:opacity .25s, transform .25s, box-shadow .25s;
}
#toTop.show{opacity:1;pointer-events:auto}
#toTop:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(20,40,36,.38)}
.empty-msg{padding:40px;text-align:center;color:var(--ink-soft)}
#progress{position:fixed;top:0;left:0;height:3px;width:0%;z-index:60;background:linear-gradient(90deg,var(--accent),var(--gold));box-shadow:0 0 8px rgba(217,164,95,.6);transition:width .08s linear}
.app{animation:appIn .5s ease both}
@keyframes appIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

@media (max-width:900px){
  .app{display:block}
  .side{position:relative;height:auto;width:100%;flex:none}
  .main{padding:0}
  .content{padding:26px 20px 90px}
  .doc-heading h1{font-size:24px}
}
@media print{
  .side,.topbar,#toTop{display:none!important}
  .content{max-width:none;padding:0}
  .doc{break-inside:avoid;margin-bottom:30px}
}
</style>
</head>
<body>
<div id="progress"></div>
<div class="app">
  <aside class="side">
    <div class="brand">
      <div class="mark">CSE423 <em>·</em> Study Pack</div>
      <div class="sub">Virtualization &amp; Cloud Computing</div>
    </div>
    <div class="search">
      <input type="search" id="filter" placeholder="Search sections…" aria-label="Search sections">
    </div>
    <nav class="nav" id="nav">${buildNav()}</nav>
    <div class="side-foot">24 markdown sources · composed into one page</div>
  </aside>

  <main class="main">
    <div class="topbar">
      <span class="crumb">You are reading <b id="crumbTitle">Home &amp; Overview</b></span>
      <span class="spacer"></span>
      <div class="reader-controls">
        <button id="themeToggle" title="Toggle dark mode" aria-label="Toggle dark mode">☾</button>
        <span class="sep"></span>
        <button id="aDec" title="Smaller text">A−</button>
        <button id="aInc" title="Larger text">A+</button>
      </div>
    </div>
    <div class="content" id="content">${buildContent()}</div>
  </main>
</div>

<button id="toTop" title="Back to top">↑</button>

<script>
(function(){
  var sections = Array.prototype.slice.call(document.querySelectorAll('.doc'));
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
  var content = document.getElementById('content');
  var crumb = document.getElementById('crumbTitle');

  // ---- Filter ----
  var filterEl = document.getElementById('filter');
  filterEl.addEventListener('input', function(){
    var q = filterEl.value.trim().toLowerCase();
    sections.forEach(function(s){
      var title = (s.getAttribute('data-title') || '').toLowerCase();
      var text = (s.textContent || '').toLowerCase().slice(0,600);
      var match = !q || title.indexOf(q) > -1 || text.indexOf(q) > -1;
      s.style.display = match ? '' : 'none';
    });
    navItems.forEach(function(a){ a.style.display = ''; });
  });

  // ---- Scroll spy ----
  function onScroll(){
    var pos = window.scrollY + 140;
    var current = null;
    sections.forEach(function(s){
      if (s.offsetTop <= pos) current = s;
    });
    if (current){
      var id = current.id;
      navItems.forEach(function(a){
        a.classList.toggle('active', a.getAttribute('data-target') === '#' + id);
      });
      var t = current.getAttribute('data-title');
      crumb.textContent = t;
    }
    document.getElementById('toTop').classList.toggle('show', window.scrollY > 500);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById('progress').style.width = (max>0 ? (window.scrollY/max)*100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // ---- To top ----
  document.getElementById('toTop').addEventListener('click', function(){
    window.scrollTo({top:0, behavior:'smooth'});
  });

  // ---- Font-size controls ----
  var doc = document.documentElement;
  var base = 16;
  document.getElementById('aInc').addEventListener('click', function(){ base = Math.min(20, base+1); doc.style.fontSize = base + 'px'; });
  document.getElementById('aDec').addEventListener('click', function(){ base = Math.max(13, base-1); doc.style.fontSize = base + 'px'; });

  // ---- Clicking nav: also clear filter ----
  navItems.forEach(function(a){
    a.addEventListener('click', function(){ filterEl.value=''; sections.forEach(function(s){s.style.display='';}); });
  });

  // ---- Theme toggle (light/paper vs dark) ----
  var themeBtn = document.getElementById('themeToggle');
  function applyTheme(dark){
    document.body.classList.toggle('dark', !!dark);
    themeBtn.textContent = dark ? '☀' : '☾';
    themeBtn.setAttribute('title', dark ? 'Switch to paper / light mode' : 'Switch to dark mode');
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    try { localStorage.setItem('cse423-theme', dark ? 'dark' : 'light'); } catch(e){}
  }
  // First visit: default to the OS colour-scheme preference, then persist user choice.
  var saved = null;
  try { saved = localStorage.getItem('cse423-theme'); } catch(e){}
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : systemDark);
  // Live-follow the OS theme until the user explicitly chooses one.
  if (!saved && window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
      applyTheme(e.matches);
    });
  }
  themeBtn.addEventListener('click', function(){
    applyTheme(!document.body.classList.contains('dark'));
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html, "utf8");
console.log(
  "Wrote " + OUT + " (" + Buffer.byteLength(html, "utf8") + " bytes)",
);
