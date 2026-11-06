/**
 * CSE423 Portal — Application Engine
 * Pure client-side interactive controller for quizzes, exams, notes, and mastery tracking.
 */
(function() {
  'use strict';

  const data = window.CSE423_DATA || { mcqs: [], shortAnswers: [], longAnswers: [], notes: {}, cheatSheets: {} };

  // ----------------------------------------------------
  // Safe Storage & Toast Utilities
  // ----------------------------------------------------
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

  const toastEl = document.getElementById('toastMsg');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2200);
  }

  // ----------------------------------------------------
  // State
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // DOM Elements
  // ----------------------------------------------------
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const themeToggle = document.getElementById('themeToggle');
  const currentViewName = document.getElementById('currentViewName');
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // ----------------------------------------------------
  // Tab Navigation
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Floating Back to Top Button
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Print & Code Copy Utilities
  // ----------------------------------------------------
  ['btn-print-notes', 'btn-print-cheatsheet', 'btn-print-qa', 'btn-print-practicals', 'btn-print-exams', 'btn-print-glossary', 'btn-print-overview'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => window.print());
  });

  function setupCodeCopyButtons(container) {
    if (!container) return;
    container.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.code-block-wrap');
        const codeEl = wrap ? wrap.querySelector('code') : null;
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.innerText).then(() => {
            btn.textContent = '✓ Copied';
            showToast('Code snippet copied to clipboard');
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
          }).catch(err => console.warn('Clipboard write failed:', err));
        }
      });
    });
  }

  // ----------------------------------------------------
  // Theme Management
  // ----------------------------------------------------
  function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    themeToggle.textContent = isLight ? '☼' : '☾';
    safeSet('cse423_theme', isLight ? 'light' : 'dark');
  }
  const savedTheme = safeGet('cse423_theme', 'dark');
  if (savedTheme === 'light') applyTheme(true);
  themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light')));

  // ----------------------------------------------------
  // Render Notes with Dynamic In-Page Table of Contents
  // ----------------------------------------------------
  function generateTOC(container) {
    const headings = container.querySelectorAll('h2, h3');
    if (headings.length < 2) return '';

    const items = [];
    headings.forEach((h, idx) => {
      const id = 'heading-u' + currentUnitNotes + '-' + idx;
      h.id = id;
      const text = h.textContent.replace(/^#+\s*/, '').trim();
      const level = h.tagName.toLowerCase();
      items.push('<li class="toc-item-' + level + '"><a href="#' + id + '">↳ ' + text + '</a></li>');
    });

    return '<div class="toc-box">' +
      '<div class="toc-title"><span>📑</span> Unit Contents &amp; Topic Outline</div>' +
      '<ul class="toc-list">' + items.join('') + '</ul>' +
    '</div>';
  }

  function calculateReadingTime(text) {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return { words, minutes };
  }

  function loadUnitNotes(u) {
    currentUnitNotes = u;
    document.getElementById('notes-unit-select').value = u;
    document.getElementById('notes-title').innerHTML = '<span>📖</span> Unit ' + u + ' Study Notes';
    
    const contentEl = document.getElementById('notes-content');
    const rawHtml = data.notes[u] || '<p>Content not found.</p>';
    contentEl.innerHTML = rawHtml;

    // Reading time calculation
    const meta = calculateReadingTime(contentEl.innerText);
    const metaBarHtml = '<div class="unit-meta-bar">' +
      '<span class="unit-meta-pill">⏱️ ~' + meta.minutes + ' min read (' + meta.words + ' words)</span>' +
      '<span class="unit-meta-pill">🎯 Course Outcome: CO' + u + '</span>' +
      '<span class="unit-meta-pill">📘 Academic Session 2026-27</span>' +
    '</div>';

    // Generate in-page outline
    const tocHtml = generateTOC(contentEl);
    contentEl.innerHTML = metaBarHtml + tocHtml + rawHtml;

    // Attach copy button listeners for code blocks
    setupCodeCopyButtons(contentEl);

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

  // ----------------------------------------------------
  // Render CheatSheets
  // ----------------------------------------------------
  function loadCheatSheet(u) {
    currentUnitCheatSheet = u;
    document.getElementById('cheatsheet-unit-select').value = u;
    const contentEl = document.getElementById('cheatsheet-content');
    contentEl.innerHTML = data.cheatSheets[u] || '<p>Content not found.</p>';
    setupCodeCopyButtons(contentEl);

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
  // MCQ Engine (Practice & Exam Modes)
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
      mcqContainer.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-dim); background:var(--bg-surface); border-radius:var(--radius-md); border:1px dashed var(--border); margin:20px 0;">' +
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
          '<button class="bookmark-btn ' + (isBookmarked ? 'bookmarked' : '') + '" data-qid="' + q.id + '" title="Star / Bookmark question">★</button>' +
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
          // In-place update to preserve scroll position
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
          // Exam Mode: select option
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
          showToast('Question removed from starred list');
        } else {
          userBookmarks.push(qid);
          btn.classList.add('bookmarked');
          showToast('★ Question saved to starred list');
        }
        safeSet('cse423_bookmarks', userBookmarks);
        updateMCQPillCounts();
        if (activeMCQStatusFilter === 'bookmarked') renderMCQs();
      });
    });
  }

  // Status Filter Pills Click
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
    if (confirm('Reset all saved MCQ answers and exam scores?')) {
      userMCQAnswers = {};
      localStorage.removeItem('cse423_mcq_answers');
      examResultCard.style.display = 'none';
      renderMCQs();
      showToast('All MCQ progress has been reset');
    }
  });

  // Random 10 Quiz
  document.getElementById('btn-quick-quiz').addEventListener('click', () => {
    mcqUnitFilter.value = 'all';
    mcqSearch.value = '';
    activeMCQStatusFilter = 'all';
    document.querySelectorAll('#mcq-status-pills .pill-btn').forEach(p => p.classList.toggle('active', p.getAttribute('data-status') === 'all'));
    
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
    showToast('Generated 10 random cross-unit practice questions');
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
      ? '🌟 Outstanding performance! You have mastered the core concepts of this assessment.' 
      : pct >= 50 ? '👍 Solid work! Click "Review Missed Questions" below to strengthen your weak areas.' 
      : '📖 Keep practicing! Review the detailed explanations and revisit the Unit Notes.';

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
      qaContainer.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-dim); background:var(--bg-surface); border-radius:var(--radius-md); border:1px dashed var(--border); margin:20px 0;">' +
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
          setupCodeCopyButtons(ansEl);
        }
      });
    });

    document.querySelectorAll('.rate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-qid');
        const val = btn.getAttribute('data-val');
        userQARatings[qid] = val;
        safeSet('cse423_qa_ratings', userQARatings);

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
    document.querySelectorAll('.qa-answer').forEach(el => {
      el.style.display = 'block';
      setupCodeCopyButtons(el);
    });
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const visibleSearch = document.querySelector('.tab-pane.active .search-input');
      if (visibleSearch) visibleSearch.focus();
    }
  });

  // Initial Boot
  renderMCQs();
  renderQAs();
  loadUnitNotes(1);
  loadCheatSheet(1);
  updateStats();
  setupCodeCopyButtons(document);
})();
