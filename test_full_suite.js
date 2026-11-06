const { spawn } = require("child_process");
const path = require("path");

const htmlPath = path.resolve("index.html").replace(/\\/g, "/");
const fileUrl = "file:///" + htmlPath;

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9336;

const proc = spawn(edgePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  "--disable-gpu",
  fileUrl
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const listRes = await fetch(`http://127.0.0.1:${port}/json`);
  const tabs = await listRes.json();
  const target = tabs.find(t => t.url.includes("index.html")) || tabs[0];

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    const curId = id++;
    return new Promise((resolve, reject) => {
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(msg.error);
      else p.resolve(msg.result);
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      errors.push(msg.params.args.map(a => a.value || a.description).join(" "));
    }
    if (msg.method === "Runtime.exceptionThrown") {
      errors.push(JSON.stringify(msg.params.exceptionDetails));
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);
  await send("Runtime.enable");
  await send("Page.enable");

  const runTest = async (name, fnStr) => {
    const res = await send("Runtime.evaluate", {
      expression: `(${fnStr})()`,
      returnByValue: true
    });
    console.log(`[TEST] ${name}:`, res.result.value);
    return res.result.value;
  };

  // 1: Tab switching
  await runTest("Tab Switching", `function() {
    const tabs = ['tab-mcq', 'tab-qa', 'tab-cheatsheet', 'tab-notes', 'tab-practicals', 'tab-exams', 'tab-glossary', 'tab-overview'];
    const results = {};
    tabs.forEach(t => {
      const btn = document.querySelector('.nav-btn[data-tab="' + t + '"]');
      if (btn) {
        btn.click();
        const active = document.querySelector('.tab-pane.active')?.id;
        results[t] = (active === t);
      } else {
        results[t] = 'NOT_FOUND';
      }
    });
    return results;
  }`);

  // 2: In-place MCQ option click
  await runTest("In-Place Practice MCQ Click", `function() {
    document.querySelector('.nav-btn[data-tab="tab-mcq"]').click();
    const opt = document.querySelector('.option-btn[data-qid="mcq-u1-q1"][data-opt="2"]');
    if (!opt) return { error: 'MCQ opt not found' };
    opt.click();
    const card = document.getElementById('mcq-u1-q1');
    const isCorrectOrWrong = opt.classList.contains('correct') || opt.classList.contains('wrong');
    const explVisible = card.querySelector('.mcq-explanation').style.display === 'block';
    const accuracyText = document.getElementById('top-accuracy').textContent;
    return { isCorrectOrWrong, explVisible, accuracyText };
  }`);

  // 3: MCQ Status filter pills
  await runTest("MCQ Status Filter Pills", `function() {
    const starPill = document.querySelector('#mcq-status-pills .pill-btn[data-status="bookmarked"]');
    const allPill = document.querySelector('#mcq-status-pills .pill-btn[data-status="all"]');
    
    // Bookmark first question
    const starBtn = document.querySelector('#mcq-u1-q1 .bookmark-btn');
    if (starBtn && !starBtn.classList.contains('bookmarked')) starBtn.click();

    starPill.click();
    const countAfterStarFilter = document.querySelectorAll('.mcq-card').length;

    allPill.click();
    const countAfterAllFilter = document.querySelectorAll('.mcq-card').length;

    return { countAfterStarFilter, countAfterAllFilter };
  }`);

  // 4: Random 10 Quiz
  await runTest("Random 10 Quiz Button", `function() {
    document.getElementById('btn-quick-quiz').click();
    const count = document.querySelectorAll('.mcq-card').length;
    return { quizCardCount: count };
  }`);

  // 5: Exam Mode Scoped Test
  await runTest("Exam Mode Unit Scoping & Submit", `function() {
    document.getElementById('mcq-unit-filter').value = '2';
    document.getElementById('mcq-unit-filter').dispatchEvent(new Event('change'));
    document.getElementById('btn-mode-exam').click();

    const isExamBarVisible = document.getElementById('examBar').style.display !== 'none';
    const counterText = document.getElementById('exam-progress-counter').textContent;

    // Answer one question
    const opt = document.querySelector('#mcq-u2-q1 .option-btn[data-opt="1"]');
    if (opt) opt.click();

    // Submit
    document.getElementById('btn-submit-exam').click();
    const scoreText = document.getElementById('resultScore').textContent;
    const cardDisplay = document.getElementById('examResultCard').style.display;

    return { isExamBarVisible, counterText, scoreText, cardDisplay };
  }`);

  // 6: Q&A Markdown Rendering & Mastery Filter
  await runTest("Q&A Rich Formatting & Filters", `function() {
    document.querySelector('.nav-btn[data-tab="tab-qa"]').click();
    const firstAns = document.querySelector('#ans-sa-u1-q1');
    const hasHtmlTags = firstAns && (firstAns.innerHTML.includes('<p>') || firstAns.innerHTML.includes('<strong>') || firstAns.innerHTML.includes('<ol>'));
    
    // Rate as mastered
    const rateBtn = document.querySelector('#sa-u1-q1 .rate-btn[data-val="mastered"]');
    if (rateBtn) rateBtn.click();
    const isGreen = rateBtn.classList.contains('active-green');

    // Mastery filter
    document.getElementById('qa-mastery-filter').value = 'mastered';
    document.getElementById('qa-mastery-filter').dispatchEvent(new Event('change'));
    const masteredVisible = document.querySelectorAll('.qa-card').length;

    return { hasHtmlTags, isGreen, masteredVisibleCount: masteredVisible };
  }`);

  // 7: Unit prev/next navigation
  await runTest("Unit Notes Next/Prev Navigation", `function() {
    document.querySelector('.nav-btn[data-tab="tab-notes"]').click();
    const nextBtn = document.getElementById('notes-next-btn');
    nextBtn.click();
    const valAfterNext = document.getElementById('notes-unit-select').value;
    const prevBtn = document.getElementById('notes-prev-btn');
    prevBtn.click();
    const valAfterPrev = document.getElementById('notes-unit-select').value;
    return { valAfterNext, valAfterPrev };
  }`);

  // 8: Print Buttons Existence
  await runTest("Print Buttons Check", `function() {
    const ids = ['btn-print-notes', 'btn-print-cheatsheet', 'btn-print-qa', 'btn-print-practicals', 'btn-print-exams', 'btn-print-glossary', 'btn-print-overview'];
    const exists = ids.every(id => !!document.getElementById(id));
    return { allPrintButtonsPresent: exists };
  }`);

  console.log("Console Errors Captured:", errors);

  ws.close();
  proc.kill();
  process.exit(errors.length > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("Test error:", err);
  proc.kill();
  process.exit(1);
});
