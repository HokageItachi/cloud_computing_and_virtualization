// scripts/build.js
// Dedicated compiler that builds CSE423 Portal from Markdown documents,
// styles, and modular scripts into index.html and CSE423_Study_Pack.html.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const TEMPLATE_PATH = path.join(SRC_DIR, "template.html");
const CSS_PATH = path.join(SRC_DIR, "css", "style.css");
const JS_PATH = path.join(SRC_DIR, "js", "app.js");

const OUT_INDEX = path.join(ROOT, "index.html");
const OUT_PORTAL = path.join(ROOT, "CSE423_Study_Pack.html");

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
    const target = isExt ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + u + '"' + target + ">" + t + "</a>";
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
  let blockquoteBuf = [];

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

  const flushBlockquote = () => {
    if (blockquoteBuf.length) {
      const rawText = blockquoteBuf.join(" ");
      let calloutClass = "callout-note";
      let title = "📌 Key Note";

      if (/exam\s*tip|exam\s*trap|key\s*takeaway/i.test(rawText)) {
        calloutClass = "callout-tip";
        title = "💡 Exam Key Takeaway";
      } else if (/warning|caution|danger|trap/i.test(rawText)) {
        calloutClass = "callout-warning";
        title = "⚠️ Important Notice";
      } else if (/formula|law|rule/i.test(rawText)) {
        calloutClass = "callout-note";
        title = "📐 Core Formula & Law";
      }

      out.push(
        '<div class="callout ' + calloutClass + '">' +
          '<div class="callout-title">' + title + '</div>' +
          '<p>' + inlineMd(rawText) + '</p>' +
        '</div>'
      );
      blockquoteBuf = [];
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
        const langDisplay = (fenceLang || "code").toUpperCase();
        out.push(
          '<div class="code-block-wrap">' +
            '<div class="code-header">' +
              '<span>' + langDisplay + '</span>' +
              '<button class="code-copy-btn">Copy</button>' +
            '</div>' +
            '<pre><code class="lang-' + fenceLang + '">' + escapeHtml(fenceBuf.join("\n")) + "</code></pre>" +
          '</div>'
        );
        inFence = false;
        fenceBuf = [];
        fenceLang = "";
      } else {
        flushPara();
        flushList();
        flushTable();
        flushBlockquote();
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
        flushBlockquote();
        tableBuf = [];
        inTable = true;
      }
      if (line) tableBuf.push(line);
      continue;
    }
    if (inTable) flushTable();

    // Blockquotes & Callouts
    if (/^>\s?/.test(line)) {
      flushPara();
      flushList();
      blockquoteBuf.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (blockquoteBuf.length) flushBlockquote();

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      flushTable();
      flushBlockquote();
      const level = h[1].length;
      out.push("<h" + level + ">" + inlineMd(h[2]) + "</h" + level + ">");
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushPara();
      flushList();
      flushTable();
      flushBlockquote();
      out.push("<hr>");
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
  flushBlockquote();
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

  // Parse Short Answers
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

  // Parse Long Answers
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
// Load Markdown Files from Content / Root
// ---------------------------------------------------------------------------
function loadMdHtml(relativePath) {
  let full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) {
    full = path.join(ROOT, "content", path.basename(relativePath));
  }
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
// Compile Final Bundle
// ---------------------------------------------------------------------------
const templateHtml = fs.readFileSync(TEMPLATE_PATH, "utf8");
const cssContent = fs.readFileSync(CSS_PATH, "utf8");
const jsContent = fs.readFileSync(JS_PATH, "utf8");

const dataJsonString = JSON.stringify({
  mcqs: allMCQs,
  shortAnswers: allShortAnswers,
  longAnswers: allLongAnswers,
  notes: notesHtml,
  cheatSheets: cheatSheetHtml
}).replace(/<\/script/gi, '<\\/script');

let finalHtml = templateHtml
  .replace("/* {{STYLES}} */", cssContent)
  .replace("<!-- {{PRACTICALS_HTML}} -->", practicalsHtml)
  .replace("<!-- {{EXAMPAPERS_HTML}} -->", examPapersHtml)
  .replace("<!-- {{GLOSSARY_HTML}} -->", glossaryHtml)
  .replace("<!-- {{COURSEMAP_HTML}} -->", courseMapHtml)
  .replace("<!-- {{TOPICFLOW_HTML}} -->", topicFlowHtml)
  .replace("<!-- {{HOME_HTML}} -->", homeHtml)
  .replace("/* {{DATA_JSON}} */", dataJsonString)
  .replace("// {{APP_SCRIPT}}", jsContent);

// Write outputs
fs.writeFileSync(OUT_INDEX, finalHtml, "utf8");
console.log(`Saved ${OUT_INDEX} (${Buffer.byteLength(finalHtml, "utf8")} bytes)`);

fs.writeFileSync(OUT_PORTAL, finalHtml, "utf8");
console.log(`Saved ${OUT_PORTAL} (${Buffer.byteLength(finalHtml, "utf8")} bytes)`);
