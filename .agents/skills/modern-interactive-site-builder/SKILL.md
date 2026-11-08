---
name: modern-interactive-site-builder
description: Universal Project Showcase & Interactive Documentation Platform. Transforms any Markdown files, project docs, codebases, diagrams, and assets into a modern, zero-dependency, self-contained interactive website. Combines a developer portfolio, interactive project showcase, technical documentation system, code runner, and knowledge hub with dark/light themes, search, and GitHub Pages CI/CD.
---

# Universal Project Showcase & Interactive Documentation Platform

A master architectural skill and production playbook to transform any collection of Markdown files, project documentation, source-code examples, images, diagrams, and resources into a modern, self-contained, zero-runtime-dependency web platform.

**This is NOT a simple Markdown notes website or conventional documentation reader.**

The goal is to create a **Universal Project Showcase Platform** combining:
- A premium developer portfolio.
- An interactive project presentation platform.
- A technical documentation system.
- A knowledge and resource hub.
- An interactive code showcase.
- A static and dynamic content experience.

Capable of professionally presenting virtually any project across domains: software, AI/ML, cybersecurity, networking, research experiments, hardware/IoT, academic courses, business dashboards, creative multimedia, APIs, and frameworks.

**Core principle: Every project should feel like a professionally presented product, not another Markdown document displayed in a browser.**

---

## 1. Design Philosophy & Visual Direction

The platform must project a sophisticated, modern, premium, and professional editorial appearance.

### Visual Characteristics
- Minimalist but visually engaging with modern editorial and product-design aesthetics.
- Thoughtful glassmorphism: subtle translucent surfaces, controlled backdrop blur (`backdrop-filter: blur(8px)`), soft ambient shadows, and delicate borders.
- Selective glassmorphism: applied to navigation bars, floating panels, search overlays, modal dialogs, and contextual elements—never overused on basic content reading surfaces.
- Excellent typography, strong visual hierarchy, generous whitespace, and balanced layouts.
- Smooth transitions and meaningful micro-interactions without performance overhead.
- Consistent design language across all views.

### Color Direction
Sophisticated neutral palette:
- **Preferred:** Off-white, warm white, deep slate, charcoal, muted grey, soft silver, and restrained semantic accent colors (emerald, sky, amber, rose, purple).
- **Avoid:** Neon colors, excessive saturation, gaming-style aesthetics, flashy gradients, excessive glow effects, and overly heavy visual clutter.

---

## 2. Universal Website Architecture & Sections

The platform delivers a cohesive multi-page-style Single-Page Application (SPA) driven by client-side routing and pre-compiled data.

### 2.1 Home / Overview
- **Hero Section:** Clear platform title, concise description, and contextual call-to-actions.
- **Repository / Platform Highlights:** Derived statistics (e.g., total projects, docs, categories, code examples) calculated directly from real content (never fabricated).
- **Featured Projects Grid:** Highlighted flagship projects with metadata and visual badges.
- **Category Overview:** Interactive category pills or cards (AI/ML, Web, Security, Systems, Academic, Research).
- **Recently Updated:** Timeline or grid of recent projects and guides.
- **Quick Links & Global Footer.**

### 2.2 Project Explorer
- **Interactive Discovery Grid:** Responsive card layout with category chips, technology badges, and live search.
- **Multi-Facet Filtering:** Filter in real-time by Category, Technology Stack, and Project Status (Completed, Active, Prototype, Benchmark).
- **Sorting Options:** Sort by name, date, complexity, or featured status.
- **Live Search:** Instant keyword matching across titles, tags, and summaries with zero page reload.
- **Empty & No-Results States:** Helpful feedback with a 1-click "Clear Filters" action.

### 2.3 Individual Project Showcase (Dynamic Template Adaptation)
Adapts layout dynamically based on the project's actual domain:
- **AI / ML Project:** Highlights datasets, model architecture, training curves, evaluation metrics, and inference examples.
- **Cybersecurity / Systems:** Emphasizes attack scenarios, detection workflows, log analysis, and defense architectures.
- **Web / Mobile App:** Focuses on user journey, UI screenshots, live component demos, and API contracts.
- **Research / Academic:** Prioritizes problem statements, formal methodology, experimental findings, and references.
- **Modular Sections Supported:** Overview, Objectives, System Architecture, Tech Stack, Code Examples, Screenshots & Demos, Setup/Usage, Results, Limitations, and Future Scope.

### 2.4 Documentation Hub
- **Focused Reading Interface:** Left navigation sidebar (grouped by topic/unit), central long-form reading pane, and right-hand sticky Table of Contents (TOC).
- **Reading Metadata:** Real-time calculated reading time (`~X min read`), word count, and last-updated tag.
- **In-Page Smooth Scroll:** Active scrollspy highlighting the current section as the user reads.
- **Admonitions & Callouts:** Distinct visual containers for Tips (💡), Warnings (⚠️), Notes (📌), and Critical Alerts (🛑).

### 2.5 Code Showcase & Interactive Terminal
- **IDE-Style Window:** Header with window control dots (`🔴 🟡 🟢`), language badge, file path, and 1-click "📋 Copy" button.
- **Code + Output Pairing:** Detects adjacent code and output blocks in Markdown, fusing them into a unified editor + terminal drawer.
- **Live Client-Side Execution:** Runs JavaScript in sandboxed environments, renders live HTML/CSS previews, and offers simulated terminal execution with realistic timing for compiled languages (Python, C++, Java, Bash).

### 2.6 Resources & Knowledge Base
- Centralized index of diagrams, architecture schematics, downloadable assets, configuration templates, and curated reference links organized by topic.

### 2.7 About & Repository Specifications
- Explains repository structure, build process, deployment instructions, and platform architecture. Only rendered when meaningful data is present.

---

## 3. Modular Directory Structure Blueprint

Always decouple project code, assets, content, and scripts into dedicated folders:

```text
<project-root>/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # Automated GitHub Pages CI/CD deployment
├── content/                       # Source Markdown documents & media assets
│   ├── projects/                  # Project detail files (*.md with frontmatter)
│   ├── documentation/             # Technical guides, notes, & specifications
│   ├── resources/                 # Reference docs, glossaries, & roadmaps
│   └── assets/                    # Screenshots, diagrams, & policy files
├── src/                           # Frontend application source code
│   ├── css/
│   │   ├── base.css               # Design tokens, reset, & typography
│   │   ├── layout.css             # App shell, navigation, drawer, & topbar
│   │   ├── components.css         # Cards, terminal, TOC, badges, & modals
│   │   ├── themes.css             # Dark and light mode variable overrides
│   │   └── style.css              # Main compiled / imported stylesheet
│   ├── js/
│   │   ├── app.js                 # App bootstrapper & global state
│   │   ├── navigation.js          # SPA route switcher & drawer controller
│   │   ├── search.js              # Instant client-side search & filter engine
│   │   ├── projects.js            # Project explorer & dynamic detail renderer
│   │   ├── terminal.js            # Code runner, copy handler, & terminal HUD
│   │   └── theme.js               # Theme toggle with localStorage persistence
│   └── template.html              # Clean semantic HTML application template shell
├── scripts/                       # Dedicated build, preview, & test tooling
│   ├── build.js                   # Recursive Markdown parser, compiler & bundler
│   ├── server.js                  # Zero-dependency local preview server (port 3000)
│   └── test.js                    # Automated headless browser test verification suite
├── index.html                     # Compiled production single-page application
└── package.json                   # Project lifecycle scripts (start, build, test, serve)
```

---

## 4. Design System & Design Tokens (`src/css/`)

Enforce consistent CSS variables across dark and light themes:

```css
:root {
  /* Surface & Background */
  --bg-app: #080d1a;
  --bg-surface: #0f172a;
  --bg-card: #1e293b;
  --bg-card-hover: #273549;
  
  /* Borders & Glassmorphism */
  --border: #334155;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-focus: #10b981;
  --glass-bg: rgba(15, 23, 42, 0.75);
  --glass-blur: blur(12px);
  
  /* Typography Colors */
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  
  /* Semantic Accents */
  --primary: #10b981;
  --primary-soft: rgba(16, 185, 129, 0.12);
  --primary-glow: rgba(16, 185, 129, 0.25);
  --accent: #38bdf8;
  --accent-soft: rgba(56, 189, 248, 0.12);
  --purple: #a855f7;
  --purple-soft: rgba(168, 85, 247, 0.12);
  --warn: #f59e0b;
  --warn-soft: rgba(245, 158, 11, 0.12);
  --danger: #f43f5e;
  --danger-soft: rgba(244, 63, 94, 0.12);
  
  /* Font Stacks */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
  
  /* Radii & Elevation */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-pill: 999px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 6px 18px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.55);
}

body.light {
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f1f5f9;
  --border: #e2e8f0;
  --border-subtle: rgba(0, 0, 0, 0.05);
  --border-focus: #059669;
  --glass-bg: rgba(255, 255, 255, 0.82);
  --text-main: #0f172a;
  --text-muted: #475569;
  --text-dim: #94a3b8;
  --primary: #059669;
  --primary-soft: rgba(5, 150, 105, 0.1);
  --accent: #0284c7;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.12);
}
```

---

## 5. Multi-Language Code Presentation & Execution Engine

Present code in any programming language (Python, JavaScript, TypeScript, C, C++, Java, Bash, Go, SQL, Rust, HTML, CSS) paired with its corresponding **Output / Answer / Console execution**.

### Pattern A: Stacked Code Editor + Terminal Drawer
Adjacent code and output blocks in Markdown merge automatically:

````markdown
```python
def analyze_traffic(packets):
    return {"total": len(packets), "flagged": sum(1 for p in packets if p.is_suspicious)}

print(analyze_traffic(sample_stream))
```
```output
{"total": 1420, "flagged": 3}
```
````

**Compiled Terminal UI:**
```html
<div class="code-output-container">
  <div class="code-header">
    <div class="code-lang-badge"><span class="lang-dot"></span> PYTHON</div>
    <div class="code-actions">
      <button class="code-action-btn code-copy-btn">📋 Copy</button>
      <button class="code-action-btn code-run-btn">▶ Run</button>
    </div>
  </div>
  <pre class="code-editor"><code class="lang-python">...</code></pre>
  
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
    <pre class="terminal-body"><code>{"total": 1420, "flagged": 3}</code></pre>
  </div>
</div>
```

### Pattern B: Client-Side Interactive "▶ Run" Functionality
- **JavaScript Execution:** Evaluated in a sandboxed execution context, redirecting `console.log` and `console.error` directly into the terminal window.
- **HTML / CSS Live Preview:** Rendered into an isolated sandboxed `<iframe>` with live reload.
- **Compiled Languages (Python, C++, Java, Rust, Go, Bash):** Plays an animated simulated terminal execution with typing effect, realistic timing (`Finished in 0.03s`), and return codes.
- **Collapsible Drawer for Long Outputs:** Automatically caps terminal body at `max-height: 220px` with a **"▾ Show Full Output (N lines)"** toggle.

---

## 6. Build Compiler & Data Extraction (`scripts/build.js`)

The build script compiles Markdown files into `window.APP_DATA`:

1. **Recursive Discovery:** Walks `content/` to find all `.md` files.
2. **Metadata Extraction:** Parses YAML frontmatter (title, description, category, tags, status, featured, cover, date).
3. **Smart Content Classification:**
   - Detects whether a document is a **Project Showcase**, a **Technical Guide**, an **API Reference**, or a **Curriculum Resource**.
4. **Markdown-to-HTML Conversion:**
   - Converts headings and assigns persistent anchor IDs.
   - Generates Table of Contents tree per document.
   - Formats blockquotes matching `note|tip|warning|danger` into styled `<div class="callout callout-...">`.
   - Wraps tables inside responsive `<div class="tbl-wrap"><table>...</table></div>`.
   - Detects adjacent code and output blocks and fuses them into `.code-output-container`.
5. **Data Serialization:** Serializes all structured data into `window.APP_DATA` in `index.html`.
   - Ensures `</script` is safely escaped as `<\\/script` to prevent premature script termination.

---

## 7. Implementation Workflow (7-Phase Lifecycle)

When transforming a repository into a Universal Showcase Platform, execute these phases systematically:

### Phase 1: Repository Discovery & Content Analysis
- Scan the entire repository for Markdown files, images, code examples, and configuration files.
- Catalog content types (Projects, Docs, Guides, Resources). Do not delete or overwrite source docs.

### Phase 2: Design System & Template Preparation
- Establish `src/css/style.css` design tokens and responsive breakpoints.
- Build `src/template.html` containing application shell, drawer, topbar, search overlay, and section containers.

### Phase 3: Build Compiler Engineering
- Implement `scripts/build.js` with robust recursive parsing, frontmatter extraction, and HTML bundling.

### Phase 4: Core View Implementations
- **Home / Overview:** Hero, statistics, featured cards, and category browser.
- **Project Explorer:** Multi-facet filter bar, live search, and card grid.
- **Project Detail View:** Domain-adaptive showcase templates.
- **Documentation Hub:** Left nav, reader pane, right-side dynamic TOC, and reading time.
- **Code & Output Showcase:** IDE containers with copy buttons and terminal drawer.
- **Resources & Knowledge Base:** Asset catalogs and external link hubs.

### Phase 5: Interactive Client Features
- `Ctrl+K` global search overlay across all projects and docs.
- Theme switching (dark/light) with `localStorage` and system theme detection.
- In-page Table of Contents with scrollspy anchor highlighting.
- 1-click code copying with animated toast notifications.
- Client-side code execution and live previews.

### Phase 6: Responsive & Print Optimization
- Ensure zero horizontal scrolling across mobile viewports.
- Configure `@media print` rules for clean, paginated PDF exports.

### Phase 7: Verification & Automated CI/CD
- Test locally using zero-dependency `scripts/server.js` (`npm start`).
- Run automated headless browser verification via `scripts/test.js` (`npm test`) checking zero console errors.
- Commit `.github/workflows/deploy-pages.yml` for automated GitHub Pages hosting.

---

## 8. Final Acceptance Checklist

Before declaring a platform complete, verify:
- [ ] Universal Project Showcase: Adapts flexibly to software, AI, security, research, academic, and business projects.
- [ ] Zero Runtime Backend: Runs 100% client-side with precompiled `window.APP_DATA`.
- [ ] No Empty Shells: Every nav link and project card points to real, populated content.
- [ ] Multi-Language Code Presentation: IDE window styling, language tags, and copy buttons on all code blocks.
- [ ] Code + Output Integration: Adjacent code and terminal output are visually paired.
- [ ] Dynamic Outline (TOC): Sticky headings tree with active scrollspy and reading time estimates.
- [ ] Global Search: Instant `Ctrl+K` search across projects and docs.
- [ ] Flawless Responsive Behavior: Verified on mobile, tablet, and desktop with zero horizontal overflow.
- [ ] Clean Theme Switching: Dark/light mode persistence without initial page flicker.
- [ ] Automated GitHub Pages CI/CD: Ready `.github/workflows/deploy-pages.yml` deploying on push.
- [ ] Zero Console Errors: Validated in headless browser test runs.
