---
name: modern-interactive-site-builder
description: Builds modern, zero-dependency, self-contained interactive websites, documentation hubs, product portals, and dashboards from any Markdown files or project docs. Includes dark/light mode, dynamic in-page TOCs, fast search, copyable code blocks, callouts, and GitHub Pages CI/CD.
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
│   │   └── app.js                 # Interactive logic (TOC, search, theme, copy, tabs)
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

### D. Enhanced Code Blocks with 1-Click Copy
- Code blocks render inside `<div class="code-block-wrap">`.
- Header shows language tag (e.g., `BASH`, `JAVASCRIPT`, `YAML`) and a **📋 Copy** button.
- Copies raw code to clipboard and triggers an animated toast notification (`showToast()`).

### E. Client-Side Search & Filtering
- Instant, zero-latency keyword searching with match highlighting.
- Built-in clear button (`✕`) when input is non-empty.
- Keyboard shortcut support: `Ctrl + K` or `/` immediately focuses the search bar.

---

## 4. Implementation Steps

### Step 1: Initialize Project Structure
```bash
mkdir -p src/css src/js scripts content .github/workflows
```

### Step 2: Create `src/template.html`
A semantic HTML template with placeholders:
- `/* {{STYLES}} */`
- `<!-- {{CONTENT_HTML}} -->`
- `/* {{DATA_JSON}} */`
- `// {{APP_SCRIPT}}`

### Step 3: Write the Markdown Compiler (`scripts/build.js`)
The build compiler:
1. Reads all files in `content/` (or designated content directories).
2. Converts Markdown to HTML using a fast regex/line parser:
   - Fenced code blocks with copy headers.
   - Tables into responsive `<div class="tbl-wrap"><table>...</table></div>`.
   - Blockquotes into callout boxes.
3. Injects styles, compiled content, and client script into `src/template.html`.
4. Saves compiled output to root `index.html`.

### Step 4: Add Zero-Dependency Server (`scripts/server.js`)
Native Node.js `http` server mapping MIME types (`.html`, `.css`, `.js`, `.svg`, `.json`) that serves the site on `http://localhost:3000` with clean console banners.

### Step 5: Add CI/CD Workflow (`.github/workflows/deploy-pages.yml`)
Use official GitHub Pages actions (`actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`) to automatically compile and deploy `index.html` on every push to `main`.

### Step 6: Verify with Automated Browser Tests (`scripts/test.js`)
Launch headless Microsoft Edge or Chrome via DevTools Protocol (CDP) to confirm:
- Tab navigation transitions correctly.
- TOC generation and anchor links work.
- Zero JavaScript console errors or unhandled exceptions.
