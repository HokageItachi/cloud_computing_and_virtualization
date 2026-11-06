# CSE423: Virtualization and Cloud Computing — Unit II Questions

**Topics:** Cloud computing introduction · Deployment & service models · NIST & Cloud Cube models · Migration (Seven-Step, VM migration, middleware, data migration/streaming, interoperability)

---

## Part A — Multiple Choice Questions (MCQs)

**Q1.** Which NIST deployment model is operated for a single organization and hosted either on-premise or by a third party?
- A) Public cloud
- B) Private cloud
- C) Hybrid cloud
- D) Community cloud

**Q2.** In the **PaaS** model, the customer manages:
- A) Physical servers and hypervisor
- B) The application and, typically, its data
- C) The network hardware
- D) The facility cooling
- Q3.** Which characteristic of cloud computing means users can provision resources automatically without human provider interaction?
- A) Broad network access
- B) On-demand self-service
- C) Resource pooling
- D) Measured service

**Q4.** The NIST model defines cloud computing using:
- A) 3 characteristics, 5 models, 4 deployments
- B) 5 characteristics, 3 service models, 4 deployment models
- C) 4 characteristics, 4 service models, 5 deployments
- D) 6 characteristics, 2 models, 3 deployments

**Q5.** In the Cloud Cube Model (Jericho Forum), "internal vs. external" refers to:
- A) Whether hardware is on-premise or not
- B) Position relative to the organization's trust boundary
- C) The number of tenants
- D) The billing model

**Q6.** Which migration strategy moves a workload "as-is" with minimal change, often called "lift-and-shift"?
- A) Rehost
- B) Refactor
- C) Repurchase
- D) Retire

**Q7.** The first step of the Seven-Step Migration Model is:
- A) Optimize
- B) Assess / inventory assets
- C) Cut over
- D) Operate

**Q8.** Which VM migration type moves a *running* VM with no noticeable downtime?
- A) Cold migration
- B) Warm migration
- C) Live migration (e.g., vMotion)
- D) Snapshot restore

**Q9.** Which of the following enables the ability to move a workload between different cloud providers with minimal rework?
- A) Vendor lock-in
- B) Portability
- C) Measured charging
- D) De-perimeterisation

**Q10.** For very large datasets (petabyte-scale) that cannot move over the network quickly, cloud providers offer:
- A) Physical offline transfer devices (e.g., AWS Snowball)
- B) Larger monitor screens
- C) P2P torrents only
- D) RAM upgrades

---

### Answers & Explanations

**A1. B) Private cloud.**
A private cloud is single-tenant, dedicated to one organization, on-premise or hosted; it maximizes control and compliance.

**A2. B) The application and, typically, its data.**
In PaaS the provider manages the platform/runtime/OS/server/network; the customer develops, deploys, and manages the application and its data.

**A3. B) On-demand self-service.**
This is the NIST characteristic where users provision computing capabilities without human interaction with the provider.

**A4. B) 5 characteristics, 3 service models, 4 deployment models.**
NIST SP 800-145 defines five essential characteristics, three service models (IaaS/PaaS/SaaS), and four deployment models.

**A5. B) Position relative to the organization's trust boundary.**
Internal = inside the corporate trust boundary; External = outside it.

**A6. A) Rehost.**
Rehost = "lift-and-shift" (move as-is). Refactor = redesign; Repurchase = replace with SaaS; Retire = decommission.

**A7. B) Assess / inventory assets.**
The first step is inventorying servers, VMs, apps, and data before prioritizing.

**A8. C) Live migration (e.g., vMotion).**
Live migration moves a running VM with minimal/zero downtime (memory pre-copy + brief pause). Cold migration requires shutdown.

**A9. B) Portability.**
Portability is moving workloads/data between providers with minimal rework; lock-in (A) is the opposite.

**A10. A) Physical offline transfer devices (e.g., AWS Snowball).**
For huge data volumes, providers ship physical devices (Snowball, Data Box) for offline transfer.

---

## Part B — Subjective Questions

### Short-Answer Questions

**SA1. List the five essential characteristics of cloud computing per the NIST definition.**

**Model Answer:**
1. **On-demand self-service** — provision resources without human interaction.
2. **Broad network access** — available over the network via standard mechanisms.
3. **Resource pooling** — multi-tenant sharing of provider resources with dynamic assignment.
4. **Rapid elasticity** — scale up/down quickly, sometimes automatically.
5. **Measured service** — metering, monitoring, and pay-per-use.

**SA2. Compare IaaS, PaaS, and SaaS in terms of what the consumer manages.**

**Model Answer:**
- **IaaS:** consumer manages OS, runtime, applications, and data; provider manages hardware, hypervisor, and network.
- **PaaS:** consumer develops and manages applications and data; provider manages runtime, OS, servers, and network.
- **SaaS:** consumer just uses the application via a browser; provider manages everything.
So control decreases from IaaS → PaaS → SaaS.

**SA3. What is the Cloud Cube Model? Name its key dimensions and its purpose.**

**Model Answer:**
The Cloud Cube Model (Jericho Forum) classifies cloud deployments to reason about security and interoperability. Dimensions:
1. **Internal vs. External (I/E)** — trust boundary position.
2. **Proprietary vs. Open (P/O)** — vendor-specific vs. standard interfaces.
3. **De-perimeterised vs. Perimeterised (D/P)** — perimeter-based vs. data-centric/identity security.
4. (Often added) Shared vs. dedicated architecture.
Its purpose is to evaluate the security posture and openness of a cloud arrangement.

**SA4. Describe the difference between cold, warm, and live VM migration.**

**Model Answer:**
- **Cold:** VM is shut down, its files copied, then restarted at the destination — simplest, but full downtime.
- **Warm:** VM is suspended, memory/disk copied, then resumed — brief downtime.
- **Live:** VM keeps running through the move (memory pre-copy with iterative dirty-page copying, then a short pause for final state) — minimal/zero downtime; used by vMotion and KVM live migration.

**SA5. What is cloud middleware, and why is it important for distributed cloud applications?**

**Model Answer:**
Cloud middleware is software between applications and the network/OS that enables communication, integration, messaging, and orchestration (often delivered as managed services like queues, API gateways, managed databases, and Kubernetes). It is important because it lets distributed components communicate reliably, decouples services, handles async messaging, and supports scaling and integration with legacy systems.

### Long-Answer / Analytical Questions

**LA1. Explain the four cloud deployment models, compare them on cost, control, and security, and recommend one for a regulated bank and one for a startup.**

**Model Answer (step-by-step):**
1. Define each model (public, private, hybrid, community) with its characteristics.
2. Build a comparison: **Public** = lowest cost, elastic, least control/security (multi-tenant); **Private** = highest cost, full control, best compliance (single-tenant); **Hybrid** = moderate, balances elasticity with control by mixing; **Community** = shared cost among a group with common compliance needs.
3. Recommendation — **Bank:** private cloud (or hybrid to satisfy strict regulatory/compliance requirements). **Startup:** public cloud for low upfront cost, speed, and elasticity.
4. Justify using NIST characteristics (elasticity for startup; control/security for bank).

**LA2. Detail the Seven-Step Migration Model and explain how the "6 R's" strategies slot into it.**

**Model Answer (step-by-step):**
1. Step 1 — Assess/inventory; Step 2 — Prioritize/triage; Step 3 — Design target architecture; Step 4 — Migrate/implement; Step 5 — Validate/test; Step 6 — Optimize; Step 7 — Operate & manage.
2. Align the 6 R's: at Step 3 you choose per-workload strategy — Rehost (move as-is), Replatform (minor optimization), Repurchase (replace with SaaS), Refactor (cloud-native redesign), Retire (decommission), Retain (keep on-prem).
3. Explain how Step 6 (optimize) maps to right-sizing, autoscaling, reserved instances, monitoring.
4. Emphasize that the model is iterative and that Steps 5 and 7 include rollback planning and ongoing operations.

**LA3. Explain how live VM migration works (pre-copy algorithm) and why the "dirty page" tracking and a brief pause are needed.**

**Model Answer (step-by-step):**
1. Pre-copy: copy all memory pages to destination while VM keeps running.
2. The VM keeps modifying pages, so we track **dirty pages** (pages changed since last copy).
3. Iterative rounds: re-copy dirty pages until the dirty set becomes small enough.
4. Stop-and-copy: briefly pause the VM, copy remaining dirty pages + CPU registers/state, then resume at the destination.
5. Why brief pause: to capture a consistent final snapshot; the pause is milliseconds, so downtime is negligible.
6. Variants: post-copy starts the VM at destination and pulls pages on demand.
7. Benefits: zero-downtime maintenance, load balancing, workload mobility.

---

## Part C — Exam Tips
- Memorize the **NIST definition and its three-part model** (5 characteristics, 3 services, 4 deployments).
- Practice explaining **Cloud Cube dimensions** and how they differ from NIST.
- Know the **6 R's** and the **Seven-Step order** — common exam mapping questions.
- Be able to draw the **IaaS→PaaS→SaaS control ladder**.
