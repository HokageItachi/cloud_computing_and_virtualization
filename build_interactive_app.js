// build_interactive_app.js
// Modern, student-friendly, professional interactive portal for CSE423.
// Generates CSE423_Study_Pack.html and index.html.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT_PORTAL = path.join(ROOT, "CSE423_Study_Pack.html");
const OUT_INDEX = path.join(ROOT, "index.html");

function escapeHtml(s) {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineMd(md) {
  if (!md) return "";
  const codeSpans = [];
  let s = md.replace(/`([^`]+)`/g, (m, c) => {
    codeSpans.push(escapeHtml(c));
    return "\u0000" + (codeSpans.length - 1) + "\u0000";
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?![*])/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => {
    const isExt = u.startsWith("http");
    const href = isExt ? u : u;
    const target = isExt ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + href + '"' + target + ">" + t + "</a>";
  });

  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => "<code>" + codeSpans[+i] + "</code>");
  return s;
}

function mdToHtml(md) {
  if (!md) return "";
  const lines = md.split(/\r?\n/);
  const out = [];
  let inFence = false, fenceBuf = [], fenceLang = "";
  let listType = null, listBuf = [];
  let paraBuf = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push("<p>" + inlineMd(paraBuf.join(" ")) + "</p>");
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

  let tableBuf = [], inTable = false;
  const flushTable = () => {
    if (!tableBuf.length) return;
    const html = [];
    const isSep = (r) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(r) && r.includes("-");
    const rows = tableBuf.filter((r) => !isSep(r));
    rows.forEach((r, i) => {
      const cells = r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
      const tag = i === 0 ? "th" : "td";
      html.push("<tr>" + cells.map((c) => "<" + tag + ">" + inlineMd(c) + "</" + tag + ">").join("") + "</tr>");
    });
    out.push('<div class="tbl-wrap"><table>' + html.join("") + "</table></div>");
    tableBuf = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (/^```/.test(line)) {
      if (inFence) {
        out.push('<pre><code class="lang-' + fenceLang + '">' + escapeHtml(fenceBuf.join("\n")) + "</code></pre>");
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

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      flushTable();
      const level = h[1].length;
      out.push("<h" + level + ">" + inlineMd(h[2]) + "</h" + level + ">");
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushPara();
      flushList();
      flushTable();
      out.push("<hr>");
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushPara();
      flushList();
      out.push("<blockquote>" + inlineMd(line.replace(/^>\s?/, "")) + "</blockquote>");
      continue;
    }

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
      listBuf.push("<li>" + inlineMd(content) + "</li>");
      continue;
    }
    if (listType) flushList();

    if (line === "") {
      flushPara();
      continue;
    }

    paraBuf.push(line);
  }
  flushPara();
  flushList();
  flushTable();
  if (inFence) out.push('<pre><code class="lang-' + fenceLang + '">' + escapeHtml(fenceBuf.join("\n")) + "</code></pre>");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Extract Question Data (MCQs, Short Answers, Long Answers)
// ---------------------------------------------------------------------------
const UNIT_TITLES = {
  1: "Unit I — Virtualization & Distributed Computing",
  2: "Unit II — Cloud Concepts, Models & Migration",
  3: "Unit III — Cloud Architecture, SOA & Cloudonomics",
  4: "Unit IV — AWS Fundamentals, IAM & Security",
  5: "Unit V — AWS Compute, EC2 & Containers",
  6: "Unit VI — AWS Storage & Database Services"
};

const allMCQs = [];
const allShortAnswers = [];
const allLongAnswers = [];

for (let u = 1; u <= 6; u++) {
  const filePath = path.join(ROOT, `Unit_${u}`, `Unit_${u}_Questions.md`);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, "utf8");

  // Parse MCQs
  const partASplit = content.split("### Answers & Explanations");
  const questionsPart = partASplit[0] || "";
  const answersPart = partASplit[1] ? partASplit[1].split("## Part B")[0] : "";

  const answersMap = {};
  const ansRegex = /\*\*A(\d+)\.\s+([A-D])\)(.*?)\*\*\s*([\s\S]*?)(?=(?:\*\*A\d+\.|$))/g;
  let aMatch;
  while ((aMatch = ansRegex.exec(answersPart)) !== null) {
    const qNum = parseInt(aMatch[1], 10);
    const letter = aMatch[2].trim();
    const brief = aMatch[3].trim();
    const expl = aMatch[4].trim().replace(/\n*---+\s*$/, "");
    answersMap[qNum] = {
      letter,
      correctIndex: letter.charCodeAt(0) - 65,
      explanation: (brief ? brief + " " : "") + expl
    };
  }

  const qRegex = /\*\*Q(\d+)\.\*\*\s*([\s\S]*?)(?=(?:\*\*Q\d+\.\*\*|$))/g;
  let qMatch;
  while ((qMatch = qRegex.exec(questionsPart)) !== null) {
    const qNum = parseInt(qMatch[1], 10);
    const block = qMatch[2].trim();
    const lines = block.split("\n");
    let qText = "";
    const options = [];
    for (const line of lines) {
      const optMatch = line.trim().match(/^-\s*([A-D]\))\s*(.*)$/);
      if (optMatch) {
        options.push(optMatch[1] + " " + optMatch[2]);
      } else if (options.length === 0 && line.trim()) {
        qText += (qText ? " " : "") + line.trim();
      }
    }
    const ansInfo = answersMap[qNum] || { correctIndex: 0, explanation: "" };
    allMCQs.push({
      id: "mcq-u" + u + "-q" + qNum,
      unit: u,
      unitTitle: UNIT_TITLES[u],
      num: qNum,
      question: qText,
      options: options,
      correct: ansInfo.correctIndex,
      explanation: ansInfo.explanation
    });
  }

  // Parse Subjective
  const partB = content.split("## Part B")[1] || "";
  const saPart = partB.split("### Long-Answer")[0];
  const laPart = partB.split("### Long-Answer")[1] || "";

  const saRegex = /\*\*SA(\d+)\.\s*([\s\S]*?)\*\*\s*\*\*Model Answer:?\*\*\s*([\s\S]*?)(?=(?:\*\*SA\d+\.|$))/g;
  let saMatch;
  while ((saMatch = saRegex.exec(saPart)) !== null) {
    allShortAnswers.push({
      id: "sa-u" + u + "-q" + saMatch[1],
      unit: u,
      unitTitle: UNIT_TITLES[u],
      type: "Short Answer",
      marks: "3–5 Marks",
      num: parseInt(saMatch[1], 10),
      question: saMatch[2].trim(),
      answer: mdToHtml(saMatch[3].trim())
    });
  }

  const laClean = laPart.split("## Part C")[0];
  const laRegex = /\*\*LA(\d+)\.\s*([\s\S]*?)\*\*\s*\*\*Model Answer[^:]*:?\*\*\s*([\s\S]*?)(?=(?:\*\*LA\d+\.|$))/g;
  let laMatch;
  while ((laMatch = laRegex.exec(laClean)) !== null) {
    allLongAnswers.push({
      id: "la-u" + u + "-q" + laMatch[1],
      unit: u,
      unitTitle: UNIT_TITLES[u],
      type: "Long Answer",
      marks: "8–10 Marks",
      num: parseInt(laMatch[1], 10),
      question: laMatch[2].trim(),
      answer: mdToHtml(laMatch[3].trim())
    });
  }
}

// ---------------------------------------------------------------------------
// Load & Render Markdown Content Sections
// ---------------------------------------------------------------------------
function loadMdHtml(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return "";
  return mdToHtml(fs.readFileSync(full, "utf8"));
}

const notesHtml = {};
const cheatSheetHtml = {};
for (let u = 1; u <= 6; u++) {
  notesHtml[u] = loadMdHtml(`Unit_${u}/Unit_${u}_Notes.md`);
  cheatSheetHtml[u] = loadMdHtml(`Unit_${u}/Unit_${u}_CheatSheet.md`);
}

const homeHtml = loadMdHtml("README.md");
const practicalsHtml = loadMdHtml("Practicals/Practicals_Step_By_Step.md");
const examPapersHtml = loadMdHtml("CSE423_Model_Exam_Paper.md");
const glossaryHtml = loadMdHtml("Glossary_of_Cloud_Terms.md");
const courseMapHtml = loadMdHtml("Course_Map.md");
const topicFlowHtml = loadMdHtml("Unit_Topic_Flow.md");

console.log(`Parsed ${allMCQs.length} MCQs, ${allShortAnswers.length} Short Answers, ${allLongAnswers.length} Long Answers.`);

// ---------------------------------------------------------------------------
// Portal App HTML Template
// ---------------------------------------------------------------------------
const DATA_JSON_STRING = JSON.stringify({
  mcqs: allMCQs,
  shortAnswers: allShortAnswers,
  longAnswers: allLongAnswers,
  notes: notesHtml,
  cheatSheets: cheatSheetHtml
}).replace(/<\/script/gi, '<\\/script');

const PORTAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23059669'/%3E%3Ctext x='50' y='72' font-size='60' font-family='system-ui,sans-serif' font-weight='bold' fill='%23ffffff' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E">
<title>CSE423 · Cloud Computing &amp; Virtualization | Student Portal</title>
<style>
:root {
  --bg-app: #090d16;
  --bg-surface: #111827;
  --bg-card: #1f2937;
  --bg-card-hover: #263346;
  --border: #374151;
  --border-focus: #10b981;
  --text-main: #f9fafb;
  --text-muted: #9ca3af;
  --text-dim: #6b7280;
  
  --primary: #10b981;
  --primary-hover: #059669;
  --primary-soft: rgba(16, 185, 129, 0.15);
  
  --accent: #38bdf8;
  --accent-soft: rgba(56, 189, 248, 0.15);
  
  --warn: #f59e0b;
  --warn-soft: rgba(245, 158, 11, 0.15);
  
  --danger: #ef4444;
  --danger-soft: rgba(239, 68, 68, 0.15);
  
  --code-bg: #1e293b;
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.35);
  --shadow-lg: 0 12px 30px rgba(0,0,0,0.45);
}

body.light {
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f1f5f9;
  --border: #e2e8f0;
  --border-focus: #059669;
  --text-main: #0f172a;
  --text-muted: #475569;
  --text-dim: #94a3b8;
  
  --primary: #059669;
  --primary-hover: #047857;
  --primary-soft: rgba(5, 150, 105, 0.1);
  
  --accent: #0284c7;
  --accent-soft: rgba(2, 132, 199, 0.1);
  
  --warn: #d97706;
  --warn-soft: rgba(217, 119, 6, 0.1);
  
  --danger: #dc2626;
  --danger-soft: rgba(220, 38, 38, 0.1);
  
  --code-bg: #f1f5f9;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-sans);
  background-color: var(--bg-app);
  color: var(--text-main);
  line-height: 1.6;
  font-size: 15px;
  overflow-x: hidden;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg-app); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }

/* Layout */
.app-container {
  display: flex;
  min-height: 100vh;
}

/* Backdrop for mobile drawer */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  z-index: 38;
}
.sidebar-backdrop.active {
  display: block;
}

/* Sidebar */
.sidebar {
  width: 290px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 40;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-header {
  padding: 20px 22px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.brand-title h1 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.brand-title span {
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Sidebar Navigation */
.nav-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}

.nav-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-dim);
  font-weight: 700;
  padding: 12px 10px 6px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  margin-bottom: 3px;
}

.nav-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-main);
}

.nav-btn.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.nav-btn .icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-btn .badge-pill {
  margin-left: auto;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-dim);
}

.nav-btn.active .badge-pill {
  background: var(--primary);
  color: #fff;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-stat {
  font-size: 12px;
  color: var(--text-muted);
}

.theme-toggle-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-main);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: rotate(15deg);
}

/* Main Content Area */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Topbar */
.topbar {
  height: 64px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 20px;
  cursor: pointer;
}

.breadcrumb {
  font-size: 13.5px;
  color: var(--text-muted);
}

.breadcrumb strong {
  color: var(--text-main);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.quick-stats {
  display: flex;
  gap: 16px;
  font-size: 12.5px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.stat-item strong {
  color: var(--primary);
}

/* Main Content Views */
.content-area {
  flex: 1;
  padding: 32px 36px 80px;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.tab-pane {
  display: none;
  animation: fadeIn 0.25s ease-out;
}

.tab-pane.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page Header Banner */
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-header-text h2 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header-text p {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 6px;
}

.header-action-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.header-action-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--primary);
  color: var(--primary);
}

/* Filter / Controls Bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
}

.filter-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  outline: none;
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--primary);
}

.search-box-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 8px 30px 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  outline: none;
}

.search-input:focus {
  border-color: var(--primary);
}

.search-clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  display: none;
}
.search-clear-btn:hover {
  color: var(--text-main);
}

/* Filter Pills Bar */
.filter-pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  padding-top: 4px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

.pill-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pill-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-main);
}

.pill-btn.active {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 600;
}

/* Mode Switcher Tabs */
.mode-switcher {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px;
  gap: 4px;
}

.mode-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn.active {
  background: var(--primary);
  color: #fff;
}

/* ---------------- MCQ Component ---------------- */
.mcq-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.mcq-card:hover {
  border-color: rgba(16, 185, 129, 0.4);
}

.mcq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.mcq-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-unit {
  background: var(--accent-soft);
  color: var(--accent);
}

.badge-qnum {
  background: var(--primary-soft);
  color: var(--primary);
}

.badge-marks {
  background: var(--warn-soft);
  color: var(--warn);
}

.bookmark-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-dim);
  transition: transform 0.15s ease, color 0.15s ease;
}

.bookmark-btn.bookmarked {
  color: var(--warn);
}

.bookmark-btn:hover {
  transform: scale(1.15);
}

.mcq-question {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.5;
  margin-bottom: 18px;
}

.mcq-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  position: relative;
}

.option-btn:hover:not(:disabled) {
  background: var(--bg-card-hover);
  border-color: var(--text-dim);
  transform: translateX(4px);
}

.option-btn .opt-marker {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

/* MCQ Interactive States */
.option-btn.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.option-btn.correct {
  border-color: var(--primary) !important;
  background: var(--primary-soft) !important;
  color: var(--primary) !important;
  font-weight: 600;
}

.option-btn.correct .opt-marker {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.option-btn.wrong {
  border-color: var(--danger) !important;
  background: var(--danger-soft) !important;
  color: var(--danger) !important;
}

.option-btn.wrong .opt-marker {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

.mcq-explanation {
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--bg-card);
  border-left: 4px solid var(--primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.6;
  display: none;
  animation: slideDown 0.2s ease-out;
}

.mcq-explanation strong {
  color: var(--primary);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Exam Mode Controls */
.exam-summary-bar {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 76px;
  z-index: 25;
  box-shadow: var(--shadow-md);
}

.exam-timer {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 800;
  color: var(--warn);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--bg-card-hover);
  border-color: var(--text-dim);
}

.score-card {
  background: var(--bg-surface);
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  margin-bottom: 28px;
  box-shadow: var(--shadow-lg);
}

.score-number {
  font-size: 48px;
  font-weight: 900;
  color: var(--primary);
  margin: 12px 0 8px;
}

/* ---------------- Summative Q&A Component ---------------- */
.qa-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.qa-question {
  font-size: 16.5px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.5;
  margin-bottom: 16px;
}

.reveal-answer-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--accent);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.reveal-answer-btn:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.qa-answer {
  display: none;
  margin-top: 18px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent);
  color: var(--text-main);
  line-height: 1.7;
  font-size: 14.5px;
}
.qa-answer p { margin-bottom: 12px; }
.qa-answer p:last-child { margin-bottom: 0; }
.qa-answer ul, .qa-answer ol { margin: 10px 0 14px 24px; }
.qa-answer li { margin-bottom: 6px; }
.qa-answer code { background: var(--code-bg); padding: 2px 6px; border-radius: 4px; font-size: 13.5px; color: var(--accent); }
.qa-answer pre { background: var(--code-bg); padding: 14px; border-radius: var(--radius-md); overflow-x: auto; margin: 14px 0; }
.qa-answer .tbl-wrap { overflow-x: auto; margin: 14px 0; }
.qa-answer table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.qa-answer th, .qa-answer td { padding: 8px 12px; border: 1px solid var(--border); text-align: left; }
.qa-answer th { background: var(--bg-surface); }

.self-assess-bar {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.self-assess-label {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 600;
}

.rate-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rate-btn:hover {
  color: var(--text-main);
  background: var(--bg-card-hover);
}

.rate-btn.active-green {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 600;
}

.rate-btn.active-yellow {
  background: var(--warn-soft);
  color: var(--warn);
  border-color: var(--warn);
  font-weight: 600;
}

.rate-btn.active-red {
  background: var(--danger-soft);
  color: var(--danger);
  border-color: var(--danger);
  font-weight: 600;
}

/* ---------------- Notes / Markdown Typography ---------------- */
.notes-container {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 36px 40px;
  line-height: 1.75;
  box-shadow: var(--shadow-sm);
}

.notes-container h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.notes-container h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.notes-container h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-main);
  margin: 24px 0 12px;
}

.notes-container p {
  margin-bottom: 16px;
  color: var(--text-muted);
}

.notes-container strong {
  color: var(--text-main);
}

.notes-container ul, .notes-container ol {
  margin: 12px 0 18px 26px;
  color: var(--text-muted);
}

.notes-container li {
  margin-bottom: 8px;
}

.notes-container code {
  background: var(--code-bg);
  padding: 2px 7px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--accent);
}

.notes-container pre {
  background: var(--code-bg);
  padding: 16px 20px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  border: 1px solid var(--border);
  margin: 16px 0;
}

.notes-container pre code {
  background: transparent;
  padding: 0;
  color: var(--text-main);
}

.notes-container .tbl-wrap {
  overflow-x: auto;
  margin: 20px 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.notes-container table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.notes-container th {
  background: var(--bg-card);
  color: var(--text-main);
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.notes-container td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
}

.notes-container tr:last-child td { border-bottom: none; }

.notes-container hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

/* Unit Navigation Buttons (Bottom of Notes/CheatSheet) */
.unit-nav-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  gap: 12px;
}

/* Floating Back To Top Button */
.back-to-top-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-surface);
  color: var(--primary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 45;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-to-top-btn.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top-btn:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  transform: translateY(-3px);
}

/* Responsive */
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .mobile-menu-btn {
    display: block;
  }
  .content-area {
    padding: 20px 16px 60px;
  }
  .topbar {
    padding: 0 16px;
  }
  .notes-container {
    padding: 22px 18px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Print Optimization */
@media print {
  .sidebar, .topbar, .filter-bar, .self-assess-bar, .reveal-answer-btn, .mode-switcher, .back-to-top-btn, .sidebar-backdrop, .unit-nav-footer, .header-action-btn {
    display: none !important;
  }
  .main-wrapper {
    margin: 0 !important;
    width: 100% !important;
  }
  .content-area {
    padding: 0 !important;
    max-width: 100% !important;
  }
  .tab-pane {
    display: block !important;
  }
  .tab-pane:not(.active) {
    display: none !important;
  }
  .qa-answer {
    display: block !important;
  }
  body {
    background: #fff !important;
    color: #000 !important;
  }
  .notes-container, .mcq-card, .qa-card {
    border: 1px solid #ccc !important;
    background: #fff !important;
    box-shadow: none !important;
    color: #000 !important;
  }
}
</style>
</head>
<body>

<div class="sidebar-backdrop" id="sidebarBackdrop"></div>

<div class="app-container">
  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar">
    <div class="brand-header">
      <div class="brand-icon">☁</div>
      <div class="brand-title">
        <h1>CSE423 Portal</h1>
        <span>Cloud &amp; Virtualization</span>
      </div>
    </div>

    <div class="nav-scroll">
      <div class="nav-section-title">Interactive Learning</div>
      <button class="nav-btn active" data-tab="tab-mcq">
        <span class="icon">🧠</span>
        <span>Interactive MCQs</span>
        <span class="badge-pill" id="badge-mcq-count">60</span>
      </button>
      <button class="nav-btn" data-tab="tab-qa">
        <span class="icon">✍️</span>
        <span>Summative Q&amp;As</span>
        <span class="badge-pill">48</span>
      </button>
      <button class="nav-btn" data-tab="tab-cheatsheet">
        <span class="icon">⚡</span>
        <span>Cheat Sheets</span>
        <span class="badge-pill">6</span>
      </button>

      <div class="nav-section-title">Unit Notes &amp; Theory</div>
      <button class="nav-btn" data-tab="tab-notes" data-unit="1">
        <span class="icon">📖</span>
        <span>Unit I · Virtualization</span>
      </button>
      <button class="nav-btn" data-tab="tab-notes" data-unit="2">
        <span class="icon">📖</span>
        <span>Unit II · Cloud Models</span>
      </button>
      <button class="nav-btn" data-tab="tab-notes" data-unit="3">
        <span class="icon">📖</span>
        <span>Unit III · Architecture</span>
      </button>
      <button class="nav-btn" data-tab="tab-notes" data-unit="4">
        <span class="icon">📖</span>
        <span>Unit IV · AWS Fundamentals</span>
      </button>
      <button class="nav-btn" data-tab="tab-notes" data-unit="5">
        <span class="icon">📖</span>
        <span>Unit V · AWS Compute</span>
      </button>
      <button class="nav-btn" data-tab="tab-notes" data-unit="6">
        <span class="icon">📖</span>
        <span>Unit VI · AWS Storage/DB</span>
      </button>

      <div class="nav-section-title">Labs &amp; Examination</div>
      <button class="nav-btn" data-tab="tab-practicals">
        <span class="icon">🛠️</span>
        <span>Practicals 1–8 + Viva</span>
      </button>
      <button class="nav-btn" data-tab="tab-exams">
        <span class="icon">📝</span>
        <span>Model Exam Papers</span>
      </button>
      <button class="nav-btn" data-tab="tab-glossary">
        <span class="icon">📚</span>
        <span>Glossary (150+ terms)</span>
      </button>
      <button class="nav-btn" data-tab="tab-overview">
        <span class="icon">🗺️</span>
        <span>Syllabus &amp; Mind Maps</span>
      </button>
    </div>

    <div class="sidebar-footer">
      <div class="user-stat">
        <span>Mastery Progress</span>
        <div style="font-weight:700; color:var(--primary)" id="sidebar-progress">0% Complete</div>
      </div>
      <button class="theme-toggle-btn" id="themeToggle" title="Toggle Light/Dark Theme">☾</button>
    </div>
  </aside>

  <!-- Main Content Wrapper -->
  <div class="main-wrapper">
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle Navigation Menu">☰</button>
        <div class="breadcrumb">
          Course: <strong>CSE423 (Credits: 3)</strong> &bull; <span id="currentViewName">Interactive MCQs</span>
        </div>
      </div>
      <div class="topbar-right">
        <div class="quick-stats">
          <div class="stat-item">MCQ Accuracy: <strong id="top-accuracy">0%</strong></div>
          <div class="stat-item">Q&amp;As Mastered: <strong id="top-qa-mastered">0/48</strong></div>
        </div>
      </div>
    </header>

    <main class="content-area">
      <!-- ================= TAB 1: INTERACTIVE MCQs ================= -->
      <section class="tab-pane active" id="tab-mcq">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>🧠</span> Interactive Multiple Choice Questions</h2>
            <p>Master all 60 high-yield questions covering Units I–VI. Switch between immediate Practice Mode and scored Mock Exam Mode.</p>
          </div>
          <button class="header-action-btn" id="btn-quick-quiz">⚡ Random 10 Quiz</button>
        </div>

        <!-- Filter & Control Bar -->
        <div class="filter-bar">
          <label style="font-size:13px; font-weight:600; color:var(--text-muted)">Unit Filter:</label>
          <select class="filter-select" id="mcq-unit-filter">
            <option value="all">All Units (60 MCQs)</option>
            <option value="1">Unit I — Virtualization &amp; Distributed Systems (10)</option>
            <option value="2">Unit II — Cloud Concepts &amp; Migration (10)</option>
            <option value="3">Unit III — Architecture &amp; Cloudonomics (10)</option>
            <option value="4">Unit IV — AWS Fundamentals &amp; IAM (10)</option>
            <option value="5">Unit V — AWS Compute, EC2 &amp; Containers (10)</option>
            <option value="6">Unit VI — AWS Storage &amp; Databases (10)</option>
          </select>

          <div class="search-box-wrap">
            <input type="text" class="search-input" id="mcq-search" placeholder="Search questions or options by keyword...">
            <button class="search-clear-btn" id="mcq-search-clear" title="Clear Search">✕</button>
          </div>

          <div class="mode-switcher">
            <button class="mode-btn active" id="btn-mode-practice">Practice Mode</button>
            <button class="mode-btn" id="btn-mode-exam">Exam Mode</button>
          </div>

          <button class="btn-secondary" id="btn-reset-mcqs" style="padding:6px 12px; font-size:12.5px">Reset Answers</button>

          <!-- Status Filter Pills -->
          <div class="filter-pills-row" id="mcq-status-pills">
            <button class="pill-btn active" data-status="all">All (<span id="pill-count-all">60</span>)</button>
            <button class="pill-btn" data-status="bookmarked">★ Starred (<span id="pill-count-bookmarked">0</span>)</button>
            <button class="pill-btn" data-status="wrong">❌ Needs Review (<span id="pill-count-wrong">0</span>)</button>
            <button class="pill-btn" data-status="correct">✅ Mastered (<span id="pill-count-correct">0</span>)</button>
            <button class="pill-btn" data-status="unanswered">⚪ Unanswered (<span id="pill-count-unanswered">60</span>)</button>
          </div>
        </div>

        <!-- Exam Timer / Score Bar (Shown in Exam Mode) -->
        <div class="exam-summary-bar" id="examBar" style="display:none;">
          <div style="display:flex; align-items:center; gap:16px;">
            <span style="font-size:14px; font-weight:600;">⏱ Time Remaining:</span>
            <span class="exam-timer" id="examTimer">20:00</span>
            <span style="font-size:13px; color:var(--text-muted); margin-left:12px;" id="exam-progress-counter">Answered: 0/60</span>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn-primary" id="btn-submit-exam">Submit Exam</button>
          </div>
        </div>

        <!-- Exam Results Card (Initially Hidden) -->
        <div id="examResultCard" style="display:none;" class="score-card">
          <div class="badge" style="background:var(--primary-soft); color:var(--primary);">Exam Completed</div>
          <div class="score-number" id="resultScore">0 / 0</div>
          <p id="resultFeedback" style="font-size:16px; color:var(--text-muted); margin-bottom:18px;">Great job completing the exam!</p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
            <button class="btn-primary" id="btn-review-exam">Review Missed Questions</button>
            <button class="btn-secondary" id="btn-retake-exam">Retake Exam</button>
            <button class="btn-secondary" id="btn-back-to-practice">Return to Practice Mode</button>
          </div>
        </div>

        <!-- MCQ Cards Container -->
        <div id="mcq-list-container">
          <!-- Dynamic MCQ Cards Rendered via JS -->
        </div>
      </section>

      <!-- ================= TAB 2: SUMMATIVE Q&As ================= -->
      <section class="tab-pane" id="tab-qa">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>✍️</span> Summative Short &amp; Long Answer Questions</h2>
            <p>Comprehensive university-style analytical questions with detailed model answers, step-by-step solutions, and self-assessment mastery tracking.</p>
          </div>
          <button class="header-action-btn" id="btn-print-qa">🖨️ Print / Save PDF</button>
        </div>

        <!-- QA Filter Bar -->
        <div class="filter-bar">
          <label style="font-size:13px; font-weight:600; color:var(--text-muted)">Unit:</label>
          <select class="filter-select" id="qa-unit-filter">
            <option value="all">All Units (48 Questions)</option>
            <option value="1">Unit I (8 Questions)</option>
            <option value="2">Unit II (8 Questions)</option>
            <option value="3">Unit III (8 Questions)</option>
            <option value="4">Unit IV (8 Questions)</option>
            <option value="5">Unit V (8 Questions)</option>
            <option value="6">Unit VI (8 Questions)</option>
          </select>

          <select class="filter-select" id="qa-type-filter">
            <option value="all">All Types (SA + LA)</option>
            <option value="Short Answer">Short Answers (3–5 Marks)</option>
            <option value="Long Answer">Long Answers (8–10 Marks)</option>
          </select>

          <select class="filter-select" id="qa-mastery-filter">
            <option value="all">All Mastery Levels</option>
            <option value="mastered">🟢 Mastered Only</option>
            <option value="reviewing">🟡 Reviewing Only</option>
            <option value="learning">🔴 Learning Only</option>
            <option value="unrated">⚪ Unrated Only</option>
          </select>

          <div class="search-box-wrap">
            <input type="text" class="search-input" id="qa-search" placeholder="Filter questions by topic (e.g. vMotion, SLA, EFS)...">
            <button class="search-clear-btn" id="qa-search-clear" title="Clear Search">✕</button>
          </div>

          <button class="btn-secondary" id="btn-expand-all-qa" style="padding:6px 12px; font-size:12.5px">Expand All</button>
          <button class="btn-secondary" id="btn-collapse-all-qa" style="padding:6px 12px; font-size:12.5px">Collapse All</button>
        </div>

        <!-- QA Cards Container -->
        <div id="qa-list-container">
          <!-- Dynamic Q&A Cards Rendered via JS -->
        </div>
      </section>

      <!-- ================= TAB 3: CHEAT SHEETS ================= -->
      <section class="tab-pane" id="tab-cheatsheet">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>⚡</span> High-Yield Revision Cheat Sheets</h2>
            <p>One-page condensed summaries with key definitions, formulas, memory aids, and carry-away exam takeaways.</p>
          </div>
          <button class="header-action-btn" id="btn-print-cheatsheet">🖨️ Print / Save PDF</button>
        </div>

        <div class="filter-bar">
          <label style="font-size:13px; font-weight:600; color:var(--text-muted)">Select Unit Cheat Sheet:</label>
          <select class="filter-select" id="cheatsheet-unit-select">
            <option value="1">Unit I — Virtualization &amp; Distributed Computing</option>
            <option value="2">Unit II — Cloud Concepts, NIST &amp; Migration</option>
            <option value="3">Unit III — Cloud Architecture &amp; 10 Laws of Cloudonomics</option>
            <option value="4">Unit IV — AWS Fundamentals, Shared Responsibility &amp; IAM</option>
            <option value="5">Unit V — AWS Compute, EC2 &amp; Containers</option>
            <option value="6">Unit VI — AWS Storage &amp; Database Services</option>
          </select>
        </div>

        <div class="notes-container">
          <div id="cheatsheet-content">
            <!-- Dynamic Cheat Sheet HTML Loaded -->
          </div>
          <div class="unit-nav-footer">
            <button class="btn-secondary" id="cs-prev-btn">← Previous Unit</button>
            <span style="font-size:13px; color:var(--text-muted);" id="cs-unit-indicator">Unit 1 of 6</span>
            <button class="btn-secondary" id="cs-next-btn">Next Unit →</button>
          </div>
        </div>
      </section>

      <!-- ================= TAB 4: STUDY NOTES ================= -->
      <section class="tab-pane" id="tab-notes">
        <div class="page-header">
          <div class="page-header-text">
            <h2 id="notes-title"><span>📖</span> Unit Study Notes</h2>
            <p id="notes-subtitle">Full in-depth syllabus textbook notes, architecture diagrams, and real-world guidelines.</p>
          </div>
          <button class="header-action-btn" id="btn-print-notes">🖨️ Print / Save PDF</button>
        </div>

        <div class="filter-bar">
          <label style="font-size:13px; font-weight:600; color:var(--text-muted)">Switch Unit:</label>
          <select class="filter-select" id="notes-unit-select">
            <option value="1">Unit I — Virtualization Fundamentals &amp; Distributed Systems</option>
            <option value="2">Unit II — Cloud Concepts, Models &amp; Migration</option>
            <option value="3">Unit III — Cloud Architecture, SOA &amp; Cloudonomics</option>
            <option value="4">Unit IV — AWS Fundamentals, IAM &amp; Security</option>
            <option value="5">Unit V — AWS Compute Services, EC2 &amp; Containers</option>
            <option value="6">Unit VI — AWS Storage &amp; Database Services</option>
          </select>
        </div>

        <div class="notes-container">
          <div id="notes-content">
            <!-- Dynamic Unit Notes HTML Loaded -->
          </div>
          <div class="unit-nav-footer">
            <button class="btn-secondary" id="notes-prev-btn">← Previous Unit</button>
            <span style="font-size:13px; color:var(--text-muted);" id="notes-unit-indicator">Unit 1 of 6</span>
            <button class="btn-secondary" id="notes-next-btn">Next Unit →</button>
          </div>
        </div>
      </section>

      <!-- ================= TAB 5: PRACTICALS & VIVA ================= -->
      <section class="tab-pane" id="tab-practicals">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>🛠️</span> Practicals 1–8 Lab Manual &amp; Viva-Voce Q&amp;As</h2>
            <p>Complete step-by-step procedures, CLI commands, and oral exam viva questions with model answers for all 8 syllabus practicals.</p>
          </div>
          <button class="header-action-btn" id="btn-print-practicals">🖨️ Print / Save PDF</button>
        </div>
        <div class="notes-container">
          ${practicalsHtml}
        </div>
      </section>

      <!-- ================= TAB 6: MODEL EXAM PAPERS ================= -->
      <section class="tab-pane" id="tab-exams">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>📝</span> Mid-Term &amp; End-Term Model Exam Papers</h2>
            <p>Full question papers with marking schemes and complete solutions mapped to Course Outcomes (CO1–CO6) and Bloom's taxonomy.</p>
          </div>
          <button class="header-action-btn" id="btn-print-exams">🖨️ Print / Save PDF</button>
        </div>
        <div class="notes-container">
          ${examPapersHtml}
        </div>
      </section>

      <!-- ================= TAB 7: GLOSSARY ================= -->
      <section class="tab-pane" id="tab-glossary">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>📚</span> Cloud &amp; Virtualization Glossary</h2>
            <p>Quick-reference dictionary covering over 150 essential cloud and virtualization terms grouped by theme.</p>
          </div>
          <button class="header-action-btn" id="btn-print-glossary">🖨️ Print / Save PDF</button>
        </div>
        <div class="notes-container">
          ${glossaryHtml}
        </div>
      </section>

      <!-- ================= TAB 8: SYLLABUS & MIND MAPS ================= -->
      <section class="tab-pane" id="tab-overview">
        <div class="page-header">
          <div class="page-header-text">
            <h2><span>🗺️</span> Course Syllabus, Outcomes &amp; Mind Maps</h2>
            <p>Visual dependency maps, Course Outcomes (CO1–CO6), textbook references, and syllabus flow.</p>
          </div>
          <button class="header-action-btn" id="btn-print-overview">🖨️ Print / Save PDF</button>
        </div>
        <div class="notes-container">
          ${courseMapHtml}
          <hr>
          ${topicFlowHtml}
          <hr>
          ${homeHtml}
        </div>
      </section>
    </main>
  </div>
</div>

<!-- Floating Back to Top Button -->
<button class="back-to-top-btn" id="backToTopBtn" title="Back to top">↑</button>

<!-- Raw Embedded Data -->
<script>
window.CSE423_DATA = ${DATA_JSON_STRING};
</script>

<!-- Application Engine Script -->
<script>
(function() {
  'use strict';
  const data = window.CSE423_DATA || { mcqs: [], shortAnswers: [], longAnswers: [], notes: {}, cheatSheets: {} };

  // Safe localStorage Helpers
  function safeGet(key, def) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : def;
    } catch (e) {
      console.warn('Error reading ' + key + ' from localStorage:', e);
      return def;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Error writing ' + key + ' to localStorage:', e);
    }
  }

  let activeTab = 'tab-mcq';
  let currentUnitNotes = 1;
  let currentUnitCheatSheet = 1;
  let isExamMode = false;
  let examTimeSeconds = 20 * 60;
  let timerInterval = null;
  let activeMCQStatusFilter = 'all';

  let userMCQAnswers = safeGet('cse423_mcq_answers', {});
  let userBookmarks = safeGet('cse423_bookmarks', []);
  let userQARatings = safeGet('cse423_qa_ratings', {});

  // DOM Elements
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const themeToggle = document.getElementById('themeToggle');
  const currentViewName = document.getElementById('currentViewName');
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Navigation Logic
  function switchTab(tabId, unit) {
    activeTab = tabId;
    tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === tabId));
    navButtons.forEach(btn => {
      const matchTab = btn.getAttribute('data-tab') === tabId;
      const matchUnit = !unit || btn.getAttribute('data-unit') == unit;
      btn.classList.toggle('active', matchTab && matchUnit);
    });

    if (tabId === 'tab-notes') {
      if (unit) currentUnitNotes = parseInt(unit, 10);
      document.getElementById('notes-unit-select').value = currentUnitNotes;
      loadUnitNotes(currentUnitNotes);
      currentViewName.textContent = 'Unit ' + currentUnitNotes + ' Study Notes';
    } else if (tabId === 'tab-cheatsheet') {
      if (unit) currentUnitCheatSheet = parseInt(unit, 10);
      document.getElementById('cheatsheet-unit-select').value = currentUnitCheatSheet;
      loadCheatSheet(currentUnitCheatSheet);
      currentViewName.textContent = 'Unit ' + currentUnitCheatSheet + ' Cheat Sheet';
    } else if (tabId === 'tab-mcq') {
      currentViewName.textContent = 'Interactive MCQs';
    } else if (tabId === 'tab-qa') {
      currentViewName.textContent = 'Summative Q&As';
    } else if (tabId === 'tab-practicals') {
      currentViewName.textContent = 'Practicals 1–8 Manual';
    } else if (tabId === 'tab-exams') {
      currentViewName.textContent = 'Model Exam Papers';
    } else if (tabId === 'tab-glossary') {
      currentViewName.textContent = 'Glossary of Cloud Terms';
    } else if (tabId === 'tab-overview') {
      currentViewName.textContent = 'Course Overview & Maps';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileSidebar();
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('active');
  }

  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('active');
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      const unit = btn.getAttribute('data-unit');
      switchTab(tab, unit);
    });
  });

  mobileMenuBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) closeMobileSidebar();
    else openMobileSidebar();
  });
  sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Floating Back to Top Button
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Print Handlers
  ['btn-print-notes', 'btn-print-cheatsheet', 'btn-print-qa', 'btn-print-practicals', 'btn-print-exams', 'btn-print-glossary', 'btn-print-overview'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => window.print());
  });

  // Theme Management
  function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    themeToggle.textContent = isLight ? '☼' : '☾';
    safeSet('cse423_theme', isLight ? 'light' : 'dark');
  }
  const savedTheme = safeGet('cse423_theme', 'dark');
  if (savedTheme === 'light') applyTheme(true);
  themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light')));

  // Render Notes & Unit Navigation
  function loadUnitNotes(u) {
    currentUnitNotes = u;
    document.getElementById('notes-unit-select').value = u;
    document.getElementById('notes-title').innerHTML = '<span>📖</span> Unit ' + u + ' Study Notes';
    document.getElementById('notes-content').innerHTML = data.notes[u] || '<p>Content not found.</p>';
    document.getElementById('notes-unit-indicator').textContent = 'Unit ' + u + ' of 6';
    document.getElementById('notes-prev-btn').disabled = (u === 1);
    document.getElementById('notes-next-btn').disabled = (u === 6);
  }

  document.getElementById('notes-unit-select').addEventListener('change', (e) => {
    loadUnitNotes(parseInt(e.target.value, 10));
  });
  document.getElementById('notes-prev-btn').addEventListener('click', () => {
    if (currentUnitNotes > 1) loadUnitNotes(currentUnitNotes - 1);
  });
  document.getElementById('notes-next-btn').addEventListener('click', () => {
    if (currentUnitNotes < 6) loadUnitNotes(currentUnitNotes + 1);
  });

  // Render CheatSheets & Unit Navigation
  function loadCheatSheet(u) {
    currentUnitCheatSheet = u;
    document.getElementById('cheatsheet-unit-select').value = u;
    document.getElementById('cheatsheet-content').innerHTML = data.cheatSheets[u] || '<p>Content not found.</p>';
    document.getElementById('cs-unit-indicator').textContent = 'Unit ' + u + ' of 6';
    document.getElementById('cs-prev-btn').disabled = (u === 1);
    document.getElementById('cs-next-btn').disabled = (u === 6);
  }

  document.getElementById('cheatsheet-unit-select').addEventListener('change', (e) => {
    loadCheatSheet(parseInt(e.target.value, 10));
  });
  document.getElementById('cs-prev-btn').addEventListener('click', () => {
    if (currentUnitCheatSheet > 1) loadCheatSheet(currentUnitCheatSheet - 1);
  });
  document.getElementById('cs-next-btn').addEventListener('click', () => {
    if (currentUnitCheatSheet < 6) loadCheatSheet(currentUnitCheatSheet + 1);
  });

  // ----------------------------------------------------
  // MCQ Engine
  // ----------------------------------------------------
  const mcqContainer = document.getElementById('mcq-list-container');
  const mcqUnitFilter = document.getElementById('mcq-unit-filter');
  const mcqSearch = document.getElementById('mcq-search');
  const mcqSearchClear = document.getElementById('mcq-search-clear');
  const btnPractice = document.getElementById('btn-mode-practice');
  const btnExam = document.getElementById('btn-mode-exam');
  const examBar = document.getElementById('examBar');
  const examTimer = document.getElementById('examTimer');
  const examProgressCounter = document.getElementById('exam-progress-counter');
  const btnSubmitExam = document.getElementById('btn-submit-exam');
  const examResultCard = document.getElementById('examResultCard');

  function cleanOptText(text) {
    if (!text) return '';
    return text.replace(/^[A-D][).]/, '').trim();
  }

  function getFilteredMCQs() {
    const selectedUnit = mcqUnitFilter.value;
    const searchVal = mcqSearch.value.toLowerCase().trim();

    return data.mcqs.filter(q => {
      const matchUnit = selectedUnit === 'all' || q.unit == selectedUnit;
      const matchSearch = !searchVal || q.question.toLowerCase().includes(searchVal) || q.options.some(o => o.toLowerCase().includes(searchVal));

      let matchStatus = true;
      const userAns = userMCQAnswers[q.id];
      if (activeMCQStatusFilter === 'bookmarked') {
        matchStatus = userBookmarks.includes(q.id);
      } else if (activeMCQStatusFilter === 'wrong') {
        matchStatus = userAns !== undefined && userAns !== q.correct;
      } else if (activeMCQStatusFilter === 'correct') {
        matchStatus = userAns !== undefined && userAns === q.correct;
      } else if (activeMCQStatusFilter === 'unanswered') {
        matchStatus = userAns === undefined;
      }

      return matchUnit && matchSearch && matchStatus;
    });
  }

  function updateMCQPillCounts() {
    const selectedUnit = mcqUnitFilter.value;
    const unitQuestions = data.mcqs.filter(q => selectedUnit === 'all' || q.unit == selectedUnit);

    let bookmarkedCount = 0;
    let wrongCount = 0;
    let correctCount = 0;
    let unansweredCount = 0;

    unitQuestions.forEach(q => {
      if (userBookmarks.includes(q.id)) bookmarkedCount++;
      const ans = userMCQAnswers[q.id];
      if (ans === undefined) {
        unansweredCount++;
      } else if (ans === q.correct) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    document.getElementById('pill-count-all').textContent = unitQuestions.length;
    document.getElementById('pill-count-bookmarked').textContent = bookmarkedCount;
    document.getElementById('pill-count-wrong').textContent = wrongCount;
    document.getElementById('pill-count-correct').textContent = correctCount;
    document.getElementById('pill-count-unanswered').textContent = unansweredCount;
  }

  function renderMCQs() {
    const filtered = getFilteredMCQs();
    updateMCQPillCounts();

    if (filtered.length === 0) {
      mcqContainer.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-dim); background:var(--bg-surface); border-radius:var(--radius-lg); border:1px dashed var(--border); margin:20px 0;">' +
        '<p style="font-size:16px; margin-bottom:10px;">🔍 No questions match your current filter.</p>' +
        '<button class="btn-secondary" id="btn-clear-mcq-filter" style="margin-top:8px;">Reset Filters</button>' +
        '</div>';
      const clearBtn = document.getElementById('btn-clear-mcq-filter');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          mcqUnitFilter.value = 'all';
          mcqSearch.value = '';
          mcqSearchClear.style.display = 'none';
          activeMCQStatusFilter = 'all';
          document.querySelectorAll('#mcq-status-pills .pill-btn').forEach(p => p.classList.toggle('active', p.getAttribute('data-status') === 'all'));
          renderMCQs();
        });
      }
      return;
    }

    mcqContainer.innerHTML = filtered.map(q => {
      const isBookmarked = userBookmarks.includes(q.id);
      const userAnswer = userMCQAnswers[q.id];
      const hasAnswered = userAnswer !== undefined;

      const optionsHtml = q.options.map((opt, optIdx) => {
        const letters = ['A', 'B', 'C', 'D'];
        let optClass = 'option-btn';
        if (!isExamMode && hasAnswered) {
          if (optIdx === q.correct) optClass += ' correct';
          else if (optIdx === userAnswer) optClass += ' wrong';
        } else if (isExamMode && hasAnswered && userAnswer === optIdx) {
          optClass += ' selected';
        }

        const disabled = (!isExamMode && hasAnswered) ? 'disabled' : '';
        return '<button class="' + optClass + '" data-qid="' + q.id + '" data-opt="' + optIdx + '" ' + disabled + '>' +
          '<span class="opt-marker">' + letters[optIdx] + '</span>' +
          '<span>' + cleanOptText(opt) + '</span>' +
        '</button>';
      }).join('');

      const explDisplay = (!isExamMode && hasAnswered) ? 'block' : 'none';

      return '<div class="mcq-card" id="' + q.id + '">' +
        '<div class="mcq-header">' +
          '<div class="mcq-meta">' +
            '<span class="badge badge-unit">Unit ' + q.unit + '</span>' +
            '<span class="badge badge-qnum">Q' + q.num + '</span>' +
          '</div>' +
          '<button class="bookmark-btn ' + (isBookmarked ? 'bookmarked' : '') + '" data-qid="' + q.id + '" title="Star/Bookmark question">★</button>' +
        '</div>' +
        '<div class="mcq-question">' + q.question + '</div>' +
        '<div class="mcq-options">' + optionsHtml + '</div>' +
        '<div class="mcq-explanation" style="display:' + explDisplay + '">' +
          '<strong>Answer: ' + ['A','B','C','D'][q.correct] + ')</strong> ' + q.explanation +
        '</div>' +
      '</div>';
    }).join('');

    attachMCQListeners();
    updateStats();
  }

  function attachMCQListeners() {
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-qid');
        const optIdx = parseInt(btn.getAttribute('data-opt'), 10);
        userMCQAnswers[qid] = optIdx;
        safeSet('cse423_mcq_answers', userMCQAnswers);

        if (!isExamMode) {
          // In-place update of this question card to avoid scroll jump
          const card = document.getElementById(qid);
          if (card) {
            const q = data.mcqs.find(item => item.id === qid);
            if (q) {
              card.querySelectorAll('.option-btn').forEach(b => {
                const bOpt = parseInt(b.getAttribute('data-opt'), 10);
                b.disabled = true;
                b.classList.remove('selected', 'correct', 'wrong');
                if (bOpt === q.correct) b.classList.add('correct');
                else if (bOpt === optIdx) b.classList.add('wrong');
              });
              const expl = card.querySelector('.mcq-explanation');
              if (expl) expl.style.display = 'block';
            }
          }
          updateStats();
          updateMCQPillCounts();
        } else {
          // Exam Mode: update selected state
          const card = document.getElementById(qid);
          if (card) {
            card.querySelectorAll('.option-btn').forEach(b => {
              const bOpt = parseInt(b.getAttribute('data-opt'), 10);
              b.classList.toggle('selected', bOpt === optIdx);
            });
          }
          updateExamProgressCounter();
        }
      });
    });

    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-qid');
        if (userBookmarks.includes(qid)) {
          userBookmarks = userBookmarks.filter(id => id !== qid);
          btn.classList.remove('bookmarked');
        } else {
          userBookmarks.push(qid);
          btn.classList.add('bookmarked');
        }
        safeSet('cse423_bookmarks', userBookmarks);
        updateMCQPillCounts();
        if (activeMCQStatusFilter === 'bookmarked') renderMCQs();
      });
    });
  }

  // Status Pills Click
  document.querySelectorAll('#mcq-status-pills .pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#mcq-status-pills .pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeMCQStatusFilter = pill.getAttribute('data-status');
      renderMCQs();
    });
  });

  mcqUnitFilter.addEventListener('change', () => {
    renderMCQs();
    if (isExamMode) startExamTimer();
  });

  mcqSearch.addEventListener('input', () => {
    mcqSearchClear.style.display = mcqSearch.value ? 'block' : 'none';
    renderMCQs();
  });

  mcqSearchClear.addEventListener('click', () => {
    mcqSearch.value = '';
    mcqSearchClear.style.display = 'none';
    renderMCQs();
  });

  document.getElementById('btn-reset-mcqs').addEventListener('click', () => {
    if (confirm('Reset all saved MCQ answers and mock test scores?')) {
      userMCQAnswers = {};
      localStorage.removeItem('cse423_mcq_answers');
      examResultCard.style.display = 'none';
      renderMCQs();
    }
  });

  // Quick 10 Random Quiz
  document.getElementById('btn-quick-quiz').addEventListener('click', () => {
    mcqUnitFilter.value = 'all';
    mcqSearch.value = '';
    activeMCQStatusFilter = 'all';
    document.querySelectorAll('#mcq-status-pills .pill-btn').forEach(p => p.classList.toggle('active', p.getAttribute('data-status') === 'all'));
    
    // Select 10 random questions
    const shuffled = [...data.mcqs].sort(() => 0.5 - Math.random()).slice(0, 10);
    mcqContainer.innerHTML = shuffled.map(q => {
      const isBookmarked = userBookmarks.includes(q.id);
      const userAnswer = userMCQAnswers[q.id];
      const hasAnswered = userAnswer !== undefined;

      const optionsHtml = q.options.map((opt, optIdx) => {
        const letters = ['A', 'B', 'C', 'D'];
        let optClass = 'option-btn';
        if (hasAnswered) {
          if (optIdx === q.correct) optClass += ' correct';
          else if (optIdx === userAnswer) optClass += ' wrong';
        }
        const disabled = hasAnswered ? 'disabled' : '';
        return '<button class="' + optClass + '" data-qid="' + q.id + '" data-opt="' + optIdx + '" ' + disabled + '>' +
          '<span class="opt-marker">' + letters[optIdx] + '</span>' +
          '<span>' + cleanOptText(opt) + '</span>' +
        '</button>';
      }).join('');

      return '<div class="mcq-card" id="' + q.id + '">' +
        '<div class="mcq-header">' +
          '<div class="mcq-meta">' +
            '<span class="badge badge-unit">Unit ' + q.unit + '</span>' +
            '<span class="badge badge-qnum">Quiz Question</span>' +
          '</div>' +
          '<button class="bookmark-btn ' + (isBookmarked ? 'bookmarked' : '') + '" data-qid="' + q.id + '">★</button>' +
        '</div>' +
        '<div class="mcq-question">' + q.question + '</div>' +
        '<div class="mcq-options">' + optionsHtml + '</div>' +
        '<div class="mcq-explanation" style="display:' + (hasAnswered ? 'block' : 'none') + '">' +
          '<strong>Answer: ' + ['A','B','C','D'][q.correct] + ')</strong> ' + q.explanation +
        '</div>' +
      '</div>';
    }).join('');

    attachMCQListeners();
    window.scrollTo({ top: mcqContainer.offsetTop - 80, behavior: 'smooth' });
  });

  // Mode Toggling
  btnPractice.addEventListener('click', () => {
    isExamMode = false;
    btnPractice.classList.add('active');
    btnExam.classList.remove('active');
    examBar.style.display = 'none';
    examResultCard.style.display = 'none';
    clearInterval(timerInterval);
    renderMCQs();
  });

  btnExam.addEventListener('click', () => {
    isExamMode = true;
    btnExam.classList.add('active');
    btnPractice.classList.remove('active');
    examBar.style.display = 'flex';
    examResultCard.style.display = 'none';
    startExamTimer();
    renderMCQs();
  });

  function getActiveExamQuestions() {
    const selectedUnit = mcqUnitFilter.value;
    return data.mcqs.filter(q => selectedUnit === 'all' || q.unit == selectedUnit);
  }

  function updateExamProgressCounter() {
    const questions = getActiveExamQuestions();
    let answered = 0;
    questions.forEach(q => {
      if (userMCQAnswers[q.id] !== undefined) answered++;
    });
    examProgressCounter.textContent = 'Answered: ' + answered + ' / ' + questions.length;
  }

  function startExamTimer() {
    clearInterval(timerInterval);
    const questions = getActiveExamQuestions();
    // Allocate 1.5 minutes per question (minimum 5 mins)
    examTimeSeconds = Math.max(300, questions.length * 90);
    updateTimerDisplay();
    updateExamProgressCounter();

    timerInterval = setInterval(() => {
      examTimeSeconds--;
      if (examTimeSeconds <= 0) {
        clearInterval(timerInterval);
        submitExam();
      }
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(examTimeSeconds / 60);
    const secs = examTimeSeconds % 60;
    examTimer.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function submitExam() {
    clearInterval(timerInterval);
    examBar.style.display = 'none';
    isExamMode = false;
    btnPractice.classList.add('active');
    btnExam.classList.remove('active');

    const examQuestions = getActiveExamQuestions();
    let totalScore = 0;
    let totalQuestions = examQuestions.length;

    examQuestions.forEach(q => {
      if (userMCQAnswers[q.id] === q.correct) totalScore++;
    });

    const pct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    document.getElementById('resultScore').textContent = totalScore + ' / ' + totalQuestions + ' (' + pct + '%)';
    document.getElementById('resultFeedback').textContent = pct >= 80 
      ? '🌟 Outstanding performance! You are exceptionally well prepared for the exam.' 
      : pct >= 50 ? '👍 Solid work! Click "Review Missed Questions" below to master the concepts you missed.' 
      : '📖 Keep practicing! Review the detailed model explanations below and revisit the Unit Notes.';

    examResultCard.style.display = 'block';
    window.scrollTo({ top: examResultCard.offsetTop - 80, behavior: 'smooth' });
    renderMCQs();
  }

  btnSubmitExam.addEventListener('click', submitExam);

  document.getElementById('btn-review-exam').addEventListener('click', () => {
    activeMCQStatusFilter = 'wrong';
    document.querySelectorAll('#mcq-status-pills .pill-btn').forEach(p => p.classList.toggle('active', p.getAttribute('data-status') === 'wrong'));
    renderMCQs();
    mcqContainer.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btn-retake-exam').addEventListener('click', () => {
    const examQuestions = getActiveExamQuestions();
    examQuestions.forEach(q => delete userMCQAnswers[q.id]);
    safeSet('cse423_mcq_answers', userMCQAnswers);
    btnExam.click();
  });

  document.getElementById('btn-back-to-practice').addEventListener('click', () => {
    examResultCard.style.display = 'none';
    btnPractice.click();
  });

  // ----------------------------------------------------
  // Summative Q&A Component
  // ----------------------------------------------------
  const qaContainer = document.getElementById('qa-list-container');
  const qaUnitFilter = document.getElementById('qa-unit-filter');
  const qaTypeFilter = document.getElementById('qa-type-filter');
  const qaMasteryFilter = document.getElementById('qa-mastery-filter');
  const qaSearch = document.getElementById('qa-search');
  const qaSearchClear = document.getElementById('qa-search-clear');
  const combinedQA = [...data.shortAnswers, ...data.longAnswers];

  function renderQAs() {
    const selectedUnit = qaUnitFilter.value;
    const selectedType = qaTypeFilter.value;
    const selectedMastery = qaMasteryFilter.value;
    const searchVal = qaSearch.value.toLowerCase().trim();

    const filtered = combinedQA.filter(q => {
      const matchUnit = selectedUnit === 'all' || q.unit == selectedUnit;
      const matchType = selectedType === 'all' || q.type === selectedType;
      const matchSearch = !searchVal || q.question.toLowerCase().includes(searchVal) || q.answer.toLowerCase().includes(searchVal);
      
      const rating = userQARatings[q.id] || 'unrated';
      const matchMastery = selectedMastery === 'all' || rating === selectedMastery;

      return matchUnit && matchType && matchSearch && matchMastery;
    });

    if (filtered.length === 0) {
      qaContainer.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-dim); background:var(--bg-surface); border-radius:var(--radius-lg); border:1px dashed var(--border); margin:20px 0;">' +
        '<p style="font-size:16px;">🔍 No questions match your current filters.</p>' +
        '</div>';
      return;
    }

    qaContainer.innerHTML = filtered.map(q => {
      const currentRating = userQARatings[q.id] || 'unrated';
      return '<div class="qa-card" id="' + q.id + '">' +
        '<div class="qa-header">' +
          '<div style="display:flex; gap:8px; align-items:center;">' +
            '<span class="badge badge-unit">Unit ' + q.unit + '</span>' +
            '<span class="badge badge-qnum">' + (q.type === 'Short Answer' ? 'SA' : 'LA') + q.num + '</span>' +
            '<span class="badge badge-marks">' + q.marks + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="qa-question">' + q.question + '</div>' +
        '<button class="reveal-answer-btn" data-target="ans-' + q.id + '">' +
          '<span>👁️ Reveal Model Answer</span>' +
        '</button>' +
        '<div class="qa-answer" id="ans-' + q.id + '">' + q.answer + '</div>' +
        '<div class="self-assess-bar">' +
          '<span class="self-assess-label">Your Mastery:</span>' +
          '<button class="rate-btn ' + (currentRating === 'mastered' ? 'active-green' : '') + '" data-qid="' + q.id + '" data-val="mastered">🟢 Mastered</button>' +
          '<button class="rate-btn ' + (currentRating === 'reviewing' ? 'active-yellow' : '') + '" data-qid="' + q.id + '" data-val="reviewing">🟡 Reviewing</button>' +
          '<button class="rate-btn ' + (currentRating === 'learning' ? 'active-red' : '') + '" data-qid="' + q.id + '" data-val="learning">🔴 Learning</button>' +
        '</div>' +
      '</div>';
    }).join('');

    attachQAListeners();
    updateStats();
  }

  function attachQAListeners() {
    document.querySelectorAll('.reveal-answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const ansEl = document.getElementById(targetId);
        if (ansEl.style.display === 'block') {
          ansEl.style.display = 'none';
          btn.innerHTML = '<span>👁️ Reveal Model Answer</span>';
        } else {
          ansEl.style.display = 'block';
          btn.innerHTML = '<span>✕ Hide Answer</span>';
        }
      });
    });

    document.querySelectorAll('.rate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-qid');
        const val = btn.getAttribute('data-val');
        userQARatings[qid] = val;
        safeSet('cse423_qa_ratings', userQARatings);

        // Update rating in-place on card
        const card = document.getElementById(qid);
        if (card) {
          card.querySelectorAll('.rate-btn').forEach(b => {
            const bVal = b.getAttribute('data-val');
            b.classList.remove('active-green', 'active-yellow', 'active-red');
            if (bVal === val) {
              if (val === 'mastered') b.classList.add('active-green');
              else if (val === 'reviewing') b.classList.add('active-yellow');
              else if (val === 'learning') b.classList.add('active-red');
            }
          });
        }
        updateStats();
      });
    });
  }

  qaUnitFilter.addEventListener('change', renderQAs);
  qaTypeFilter.addEventListener('change', renderQAs);
  qaMasteryFilter.addEventListener('change', renderQAs);

  qaSearch.addEventListener('input', () => {
    qaSearchClear.style.display = qaSearch.value ? 'block' : 'none';
    renderQAs();
  });
  qaSearchClear.addEventListener('click', () => {
    qaSearch.value = '';
    qaSearchClear.style.display = 'none';
    renderQAs();
  });

  document.getElementById('btn-expand-all-qa').addEventListener('click', () => {
    document.querySelectorAll('.qa-answer').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.reveal-answer-btn').forEach(btn => btn.innerHTML = '<span>✕ Hide Answer</span>');
  });

  document.getElementById('btn-collapse-all-qa').addEventListener('click', () => {
    document.querySelectorAll('.qa-answer').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.reveal-answer-btn').forEach(btn => btn.innerHTML = '<span>👁️ Reveal Model Answer</span>');
  });

  // ----------------------------------------------------
  // Statistics & Progress
  // ----------------------------------------------------
  function updateStats() {
    const totalMCQs = data.mcqs.length;
    let correctCount = 0;
    let answeredCount = 0;

    data.mcqs.forEach(q => {
      if (userMCQAnswers[q.id] !== undefined) {
        answeredCount++;
        if (userMCQAnswers[q.id] === q.correct) correctCount++;
      }
    });

    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    document.getElementById('top-accuracy').textContent = accuracy + '% (' + correctCount + '/' + answeredCount + ')';

    let masteredCount = 0;
    Object.values(userQARatings).forEach(v => {
      if (v === 'mastered') masteredCount++;
    });
    document.getElementById('top-qa-mastered').textContent = masteredCount + ' / ' + combinedQA.length;

    const totalItems = totalMCQs + combinedQA.length;
    const completedItems = correctCount + masteredCount;
    const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    document.getElementById('sidebar-progress').textContent = overallPct + '% Complete';
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileSidebar();
      if (examResultCard) examResultCard.style.display = 'none';
    }
  });

  // Initial Boot
  renderMCQs();
  renderQAs();
  loadUnitNotes(1);
  loadCheatSheet(1);
  updateStats();
})();
</script>
</body>
</html>`;

// Write both CSE423_Study_Pack.html and index.html
fs.writeFileSync(OUT_PORTAL, PORTAL_HTML, "utf8");
console.log(`Saved ${OUT_PORTAL} (${Buffer.byteLength(PORTAL_HTML, "utf8")} bytes)`);

fs.writeFileSync(OUT_INDEX, PORTAL_HTML, "utf8");
console.log(`Saved ${OUT_INDEX} (${Buffer.byteLength(PORTAL_HTML, "utf8")} bytes)`);
