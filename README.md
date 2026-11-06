# CSE423 — Virtualization and Cloud Computing — Study Pack & Interactive Portal

Complete study materials, step-by-step practical guides, and an interactive web learning application for the course
**CSE423: VIRTUALIZATION AND CLOUD COMPUTING** (L:2 T:0 P:1, Credits: 3).

---

## 🚀 Interactive Web Portal

The repository includes a modern, zero-dependency, self-contained interactive web portal ([`index.html`](file:///d:/____Drive_Files/_Programming%20(P)/sem3/Cloud_computing_and_virtualization/index.html) & [`CSE423_Study_Pack.html`](file:///d:/____Drive_Files/_Programming%20(P)/sem3/Cloud_computing_and_virtualization/CSE423_Study_Pack.html)) featuring:

- **🧠 Dual-Mode Interactive MCQs:** 60 high-yield questions covering Units I–VI with instant feedback (Practice Mode) and timed mock exams with automated scoring (Exam Mode). Filter by Unit, Starred/Bookmarked, Missed/Incorrect, or take a quick 10-question random quiz.
- **✍️ Summative Q&As (48 Questions):** University-style short & long answer questions with step-by-step model answers, expand/collapse toggles, and 3-tier self-assessment mastery tracking (🟢 Mastered / 🟡 Reviewing / 🔴 Learning).
- **⚡ High-Yield Cheat Sheets:** 1-page condensed revision summaries for rapid pre-exam prep.
- **📖 Full Unit Notes:** Comprehensive textbook-level theory with architecture diagrams, comparisons, and exam formulas.
- **🛠️ Practicals 1–8 Manual & Viva Voce:** Step-by-step procedures, cloud scripts, policies, and oral viva Q&As.
- **🖨️ Print & PDF Ready:** 1-click printable format for offline study with clean `@media print` styling.
- **🌓 Dark / Light Mode:** Persistent theme selection and responsive mobile drawer navigation.

### Quick Start (Run Locally)

You can view the portal immediately by double-clicking `index.html` in your browser, or launch the built-in local preview server:

```bash
# Start local preview server (serves on http://localhost:3000)
npm start
# or: node scripts/server.js

# Regenerate portal bundle after editing markdown/styles
npm run build
# or: node scripts/build.js

# Run automated browser test suite (headless Microsoft Edge)
npm test
# or: node scripts/test.js
```

---

## 📁 Repository Directory Structure

The project is cleanly separated into dedicated directories:

```text
Cloud_computing_and_virtualization/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # GitHub Actions CI/CD deploying to GitHub Pages
├── content/                       # Cross-unit reference guides & curriculum specifications
│   ├── Course_Map.md              # Syllabus mapping & CO coverage checklist
│   ├── CSE423_Model_Exam_Paper.md # Mid-Term (50 Marks) & End-Term (100 Marks) papers
│   ├── Glossary_of_Cloud_Terms.md # 150+ categorized cloud terms & definitions
│   └── Unit_Topic_Flow.md         # Unit-wise mind maps & topic dependency diagrams
├── Unit_1/ ... Unit_6/            # Unit curriculum folders (Notes, Questions, CheatSheets)
├── Practicals/                    # Laboratory manual & step-by-step experiment procedures
│   ├── Practicals_Step_By_Step.md # Experiments 1–8 procedures, CLI commands, & Viva Q&A
│   └── assets/                    # Sample cloud configurations, policies, & scripts
├── src/                           # Dedicated frontend application source code
│   ├── css/
│   │   └── style.css              # Modern responsive CSS design system & print styles
│   ├── js/
│   │   └── app.js                 # Pure interactive client engine (quizzes, timer, filters)
│   └── template.html              # Clean semantic HTML application template
├── scripts/                       # Dedicated build, server, & testing tooling
│   ├── build.js                   # Markdown parser, question extractor, & HTML compiler
│   ├── server.js                  # Zero-dependency local preview server
│   └── test.js                    # Automated headless browser test verification suite
├── index.html                     # Compiled interactive portal (GitHub Pages entry point)
├── CSE423_Study_Pack.html         # Single-file offline portable study pack
└── package.json                   # Project scripts and configuration
```

---

## Course Outcomes (COs)

| CO  | Description                                                                | Units |
| --- | -------------------------------------------------------------------------- | ----- |
| CO1 | Fundamentals of virtualization, distributed computing, computing paradigms | I     |
| CO2 | Cloud concepts, models, migration, interoperability                        | II    |
| CO3 | Cloud architecture, workload, capacity, SOA, SLAs, cloudonomics            | III   |
| CO4 | AWS infrastructure, IAM, shared responsibility, security                   | IV    |
| CO5 | AWS compute services, EC2, containers, pricing/cost optimization           | V     |
| CO6 | AWS storage & database services and technology selection                   | VI    |

## Contents

| Folder        | File                         | What's inside                                                                                                          |
| ------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Unit_1/`     | `Unit_1_Notes.md`            | Virtualization fundamentals, x86, types, VLAN/VSAN; distributed systems & computing paradigms                          |
| `Unit_1/`     | `Unit_1_Questions.md`        | 10 MCQs + 5 short + 3 long model answers                                                                               |
| `Unit_1/`     | `Unit_1_CheatSheet.md`       | One-page revision cheat sheet                                                                                          |
| `Unit_2/`     | `Unit_2_Notes.md`            | Cloud intro, deployment/service models, NIST, cloud cube; Buyya's 7-step migration, VM migration, middleware, interoperability |
| `Unit_2/`     | `Unit_2_Questions.md`        | 10 MCQs + 5 short + 3 long model answers                                                                               |
| `Unit_2/`     | `Unit_2_CheatSheet.md`       | One-page revision cheat sheet                                                                                          |
| `Unit_3/`     | `Unit_3_Notes.md`            | Cloud stack, workload, capacity planning, bursting, disk provisioning, SOA, SLAs, all 10 Laws of Cloudonomics          |
| `Unit_3/`     | `Unit_3_Questions.md`        | 10 MCQs + 5 short + 3 long model answers                                                                               |
| `Unit_3/`     | `Unit_3_CheatSheet.md`       | One-page revision cheat sheet                                                                                          |
| `Unit_4/`     | `Unit_4_Notes.md`            | AWS infrastructure, service categories, console, shared responsibility, IAM, account security                          |
| `Unit_4/`     | `Unit_4_Questions.md`        | 10 MCQs + 5 short + 3 long model answers                                                                               |
| `Unit_4/`     | `Unit_4_CheatSheet.md`       | One-page revision cheat sheet                                                                                          |
| `Unit_5/`     | `Unit_5_Notes.md`            | Compute services, EC2, pricing/cost optimization, managed compute, containers                                          |
| `Unit_5/`     | `Unit_5_Questions.md`        | 10 MCQs + 5 short + 3 long model answers                                                                               |
| `Unit_5/`     | `Unit_5_CheatSheet.md`       | One-page revision cheat sheet                                                                                          |
| `Unit_6/`     | `Unit_6_Notes.md`            | EBS, S3, EFS, Glacier, storage selection, RDS, DynamoDB, Redshift, Aurora                                              |
| `Unit_6/`     | `Unit_6_Questions.md`        | 10 MCQs + 5 short + 3 long model answers                                                                               |
| `Unit_6/`     | `Unit_6_CheatSheet.md`       | One-page revision cheat sheet                                                                                          |
| `Practicals/` | `Practicals_Step_By_Step.md` | All 8 practicals: objectives, prerequisites, steps, CLI commands, troubleshooting, and Viva-Voce Q&A                  |
| Root          | `CSE423_Model_Exam_Paper.md` | Mid-Term (50 Marks) & End-Term (100 Marks) examination papers with complete marking schemes and model solutions         |
| Root          | `Course_Map.md`              | Complete syllabus mapping, CO coverage checklist, and textbook correlation                                            |

## Practicals index

| #   | Experiment                                                     | File section                            |
| --- | -------------------------------------------------------------- | --------------------------------------- |
| 1   | VMware Workstation install, VM creation, NAT/Bridged/Host-only | `Practicals/Practicals_Step_By_Step.md` |
| 2   | Snapshots, Clone, Restore VMs                                  | `Practicals/Practicals_Step_By_Step.md` |
| 3   | AWS resources, Availability Zones, Edge locations              | `Practicals/Practicals_Step_By_Step.md` |
| 4   | EC2 instance with AMI                                          | `Practicals/Practicals_Step_By_Step.md` |
| 5   | Remote connection via RDP                                      | `Practicals/Practicals_Step_By_Step.md` |
| 6   | S3 bucket with configuration                                   | `Practicals/Practicals_Step_By_Step.md` |
| 7   | Static website hosting on cloud                                | `Practicals/Practicals_Step_By_Step.md` |
| 8   | AWS pricing calculator / cost estimate                         | `Practicals/Practicals_Step_By_Step.md` |

## Study aids (cross-unit)

| File                         | What's inside                                                             |
| ---------------------------- | ------------------------------------------------------------------------- |
| `CSE423_Model_Exam_Paper.md` | Complete MTE & ETE model question papers, detailed marking scheme & keys |
| `Course_Map.md`              | Verification checklist, CO1–CO6 alignment & textbook mapping              |
| `Glossary_of_Cloud_Terms.md` | ~150 cloud & virtualization terms grouped by theme                        |
| `Unit_Topic_Flow.md`         | Unit-wise mind-maps and cross-link dependency map                         |

**One-page cheat sheets** (quick revision per unit):

- `Unit_1/Unit_1_CheatSheet.md` — virtualization, x86, types, VLAN/VSAN, distributed/parallel
- `Unit_2/Unit_2_CheatSheet.md` — cloud models (NIST/cube), migration, interoperability
- `Unit_3/Unit_3_CheatSheet.md` — architecture, workload/capacity/bursting, SOA, SLA, cloudonomics
- `Unit_4/Unit_4_CheatSheet.md` — AWS infrastructure, shared responsibility, IAM, security
- `Unit_5/Unit_5_CheatSheet.md` — EC2, pricing/cost optimization, managed compute, containers
- `Unit_6/Unit_6_CheatSheet.md` — EBS/S3/EFS/Glacier, storage selection, RDS/DynamoDB/Redshift/Aurora

## Textbooks / References

- Rajkumar Buyya, Christian Vecchiola, S. Thamarai Selvi — _Mastering Cloud Computing_ (McGraw Hill)
- Rishabh Sharma — _Cloud Computing: Fundamentals, Industry Approach and Trends_ (Wiley)
- Andrew S. Tanenbaum & Maarten van Steen — _Distributed Systems: Principles and Paradigms_ (Pearson)
- Thomas Erl — _Cloud Computing: Concepts, Technology & Architecture_ (Pearson)
