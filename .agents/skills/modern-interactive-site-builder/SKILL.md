---
name: modern-interactive-site-builder
description: Builds modern, zero-dependency, self-contained interactive websites, documentation hubs, product portals, and dashboards from any Markdown files or project docs. Includes dark/light mode, dynamic in-page TOCs, fast search, copyable code blocks, callouts, multi-language code & terminal output presentation (with live run/console views), and GitHub Pages CI/CD.
---

# Modern Interactive Site Builder

A universal, production-grade skill to transform any set of Markdown files, technical documentation, API specifications, or project notes into a modern, fast, zero-dependency interactive Single-Page Application (SPA).

Works for **any domain**: documentation portals, knowledge bases, developer hubs, product manuals, project dashboards, portfolios, or research workspaces.

---

## 1. Architectural Philosophy

1. **Zero External Runtime Dependencies:**
   - Pure HTML5, modern CSS3 variables, and vanilla ES6+ JavaScript.
   - Built using Node.js built-in modules (`fs`, `path`, `http`). No bloated node_modules or Webpack/Vite build lock-in unless explicitly requested.
2. **Decoupled Directory Architecture:**
   - Never dump build scripts, styles, logic, and content into a single root pile.
   - Maintain a clean separation between source assets, build tooling, content, and the deployable bundle.
3. **JAMstack & Client-Side Execution:**
   - Content is compiled at build time into an in-memory data bundle (`window.APP_DATA`) inside `index.html`.
   - Runs client-side in the browser: instant searching, tab switching, and reading progress with zero server latency.
   - Local state persists across sessions via safe `localStorage` wrappers.
4. **Offline & Cloud Ready:**
   - Double-clickable as a standalone local file (`file:///...`).
   - Easily served locally with a 1-file zero-dependency preview server (`npm start`).
   - Automatically deployable to GitHub Pages via an included GitHub Actions workflow.

---

## 2. Directory Structure Blueprint

Enforce this directory organization across projects:

```text
<project-root>/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # Automated GitHub Pages CI/CD deployment
├── content/                       # Source Markdown documents & assets
│   ├── overview.md
│   ├── guides/
│   └── references/
├── src/                           # Frontend source files
│   ├── css/
│   │   └── style.css              # Design tokens, components, responsive layout & print styles
│   ├── js/
│   │   └── app.js                 # Interactive logic (TOC, search, theme, copy, tabs, terminal runner)
│   └── template.html              # Clean semantic HTML application template
├── scripts/                       # Dedicated build, preview, & test tooling
│   ├── build.js                   # Markdown parser, callout generator, & HTML compiler
│   ├── server.js                  # Zero-dependency local preview server (port 3000)
│   └── test.js                    # Automated headless browser test verification suite
├── index.html                     # Compiled production single-page application
└── package.json                   # Project lifecycle scripts (start, build, test, serve)
```

---

## 3. Core UI & UX Superpowers

### A. Modern Design System (`src/css/style.css`)
- **Design Tokens:** Dark mode by default (`#080d1a` background, `#0f172a` surface, `#1e293b` cards) with smooth switching to high-contrast Light mode (`#f8fafc`).
- **Responsive Drawer:** Left sidebar sticky on desktop (280–300px), transforming into a smooth slide-out drawer with a blurred backdrop overlay (`backdrop-filter: blur(4px)`) on mobile.
- **Sticky Glassmorphism Topbar:** Displays breadcrumbs, live search bar, and custom stat badges.
- **Print Optimization:** High-fidelity `@media print` stylesheet that strips sidebars, headers, and UI controls for clean PDF generation.

### B. Dynamic In-Page Outline (Table of Contents)
- Inspects `h2` and `h3` tags in the currently active document.
- Generates a sticky or top-level interactive TOC with smooth anchor links (`#heading-id`).
- Calculates reading metrics: estimated reading time (`~X min read`) and word counts.

### C. Rich Admonitions & Callouts
Automatically parses blockquotes into styled alert containers:
- `> **Note:**` or `> [!NOTE]` $\rightarrow$ `callout-note` (📌 Accent/Sky blue)
- `> **Tip:**` or `> [!TIP]` $\rightarrow$ `callout-tip` (💡 Emerald green)
- `> **Warning:**` or `> [!WARNING]` $\rightarrow$ `callout-warning` (⚠️ Amber)
- `> **Danger:**` or `> [!CAUTION]` $\rightarrow$ `callout-danger` (🛑 Rose red)

### D. Client-Side Search & Filtering
- Instant, zero-latency keyword searching with match highlighting.
- Built-in clear button (`✕`) when input is non-empty.
- Keyboard shortcut support: `Ctrl + K` or `/` immediately focuses the search bar.

---

## 4. Universal Code & Output Presentation Patterns

Code in any language (Python, JavaScript, C++, Java, Bash, Go, SQL, Rust, etc.) must be presented cleanly with its corresponding **Output / Answer / Console execution**.

### Pattern 1: Integrated Code + Terminal Output Window (Stacked Console)
Pairs a source code block with its stdout/terminal output in a single cohesive IDE-style container.

#### Markdown Standard Convention:
Write a code block followed immediately by an `output`, `terminal`, or `console` block:
````markdown
```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(7)))
```
```output
[0, 1, 1, 2, 3, 5, 8]
```
````

#### Compiled HTML Structure:
The compiler (`scripts/build.js`) detects adjacent code and output blocks, fusing them into a unified component:
```html
<div class="code-output-container">
  <!-- Code Header -->
  <div class="code-header">
    <div class="code-lang-badge"><span class="lang-dot"></span> PYTHON</div>
    <div class="code-actions">
      <button class="code-action-btn code-copy-btn">📋 Copy</button>
      <button class="code-action-btn code-run-btn">▶ Run</button>
    </div>
  </div>
  <pre class="code-editor"><code class="lang-python">...</code></pre>
  
  <!-- Terminal Output Drawer -->
  <div class="terminal-drawer">
    <div class="terminal-header">
      <div class="terminal-dots">
        <span class="dot-red"></span>
        <span class="dot-yellow"></span>
        <span class="dot-green"></span>
      </div>
      <span class="terminal-title">Terminal Output / Stdout</span>
      <button class="terminal-clear-btn">Clear</button>
    </div>
    <pre class="terminal-body"><code>[0, 1, 1, 2, 3, 5, 8]</code></pre>
  </div>
</div>
```

---

### Pattern 2: Tabbed Code / Output Switcher
For long scripts or large datasets, use tabs to toggle between Code and Output without vertical clutter:

```html
<div class="tabbed-code-container">
  <div class="code-tabs-header">
    <button class="code-tab active" data-target="code-pane">💻 Code (C++)</button>
    <button class="code-tab" data-target="output-pane">🖥️ Output (stdout)</button>
    <button class="code-copy-btn">📋 Copy</button>
  </div>
  <div class="code-tab-pane active" id="code-pane">
    <pre><code class="lang-cpp">...</code></pre>
  </div>
  <div class="code-tab-pane" id="output-pane">
    <pre class="terminal-output"><code>Build succeeded. Output: 42</code></pre>
  </div>
</div>
```

---

### Pattern 3: Multi-Language Comparison Switcher
When explaining concepts implemented across multiple programming languages:

```html
<div class="multi-lang-container">
  <div class="lang-selector-bar">
    <button class="lang-pill active" data-lang="python">Python</button>
    <button class="lang-pill" data-lang="cpp">C++</button>
    <button class="lang-pill" data-lang="java">Java</button>
    <button class="lang-pill" data-lang="bash">Bash</button>
    <button class="code-copy-btn">📋 Copy</button>
  </div>
  <!-- Code snippets switched dynamically via JS -->
</div>
```

---

### Pattern 4: Live Client-Side Execution (Zero Backend Runner)

Make code interactive directly in the student's or user's browser without any server:

1. **JavaScript / HTML / CSS Execution:**
   - Execute user or sample code safely using a sandboxed `<iframe>` or `new Function()` with redirected `console.log`:
   ```javascript
   function executeJS(code, outputEl) {
     outputEl.textContent = '';
     const log = (...args) => {
       outputEl.textContent += args.join(' ') + '\n';
     };
     try {
       const fn = new Function('console', code);
       fn({ log, error: log, warn: log });
     } catch (err) {
       outputEl.textContent = 'Error: ' + err.message;
       outputEl.classList.add('terminal-error');
     }
   }
   ```
2. **Python Execution (Zero Server via WebAssembly):**
   - For interactive Python notebooks, dynamically import **Pyodide** via CDN:
   ```html
   <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
   ```
   Execute Python code in WebAssembly on the client thread and stream outputs directly into the terminal block.
3. **Static Simulated Execution:**
   - For compiled languages (C++, Java, Rust, Go, Bash), clicking **"▶ Run"** plays a smooth typing animation showing the pre-compiled expected output, exit codes, and execution duration (`Finished in 0.04s, exit code 0`).

---

### Pattern 5: Collapsible Long Outputs
For long outputs (e.g. 50+ lines of server logs, raw JSON API payloads, or stack traces):
- Cap output height with `max-height: 220px; overflow-y: auto;`.
- Add an expandable toggle button: `▾ Show Full Output (84 lines)` $\rightarrow$ `▴ Collapse`.

---

## 5. CSS Stylesheet for Code & Terminal Consoles

Add these styles to `src/css/style.css`:

```css
/* Code + Output Container */
.code-output-container {
  margin: 24px 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--code-bg);
  box-shadow: var(--shadow-sm);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  font-family: var(--font-mono);
}

.code-lang-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--accent);
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

.code-actions {
  display: flex;
  gap: 8px;
}

.code-action-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.code-action-btn:hover {
  background: var(--bg-card);
  color: var(--primary);
  border-color: var(--primary);
}

.code-editor {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
  background: transparent;
}

/* Terminal Drawer */
.terminal-drawer {
  background: #050811;
  border-top: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 13px;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.dot-red { width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; }
.dot-yellow { width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; }
.dot-green { width: 10px; height: 10px; border-radius: 50%; background: #27c93f; }

.terminal-title {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.terminal-body {
  padding: 14px 18px;
  color: #38bdf8;
  margin: 0;
  overflow-x: auto;
  line-height: 1.6;
}

.terminal-body::before {
  content: "$ ";
  color: var(--primary);
  font-weight: 700;
}
```

---

## 6. Implementation Checklist for Agents

When building an interactive site, always check:
- [ ] Code blocks from any language (`python`, `js`, `cpp`, `bash`, `java`, `sql`) carry language tags.
- [ ] Adjacent `output` or `terminal` markdown blocks merge into an integrated console window.
- [ ] 1-click **📋 Copy** buttons function with instant clipboard write and toast feedback.
- [ ] Optional **▶ Run** triggers client-side sandbox execution or animated mock simulation.
- [ ] Mobile responsive layout handles wide tables and code blocks with horizontal touch scrolling.
- [ ] Automated headless test suite validates that code blocks and copy buttons render without DOM errors.
