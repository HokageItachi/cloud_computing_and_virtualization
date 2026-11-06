# CSE423 — Unit II Cheat Sheet (One-Page Revision)

**Topics:** Cloud computing intro (deployment/service models, characteristics, NIST, cloud cube) · Cloud migration (7-step, VM migration, middleware, data migration/streaming, interoperability)

---

## 1. Cloud Computing — Definition & Characteristics
- **Cloud =** on-demand, self-service, pay-as-you-go network access to a shared pool of configurable computing resources (NIST).
- **Essential characteristics (5):**
  1. **On-demand self-service** — provision without human interaction.
  2. **Broad network access** — accessible over network via standard clients.
  3. **Resource pooling** — multi-tenant, location-independent, pooled resources.
  4. **Rapid elasticity** — scale up/down quickly, appears unlimited.
  5. **Measured service** — metering, pay-per-use, transparency.

## 2. Service Models (SPI)
| Model | You manage | Provider manages |
|-------|-----------|------------------|
| **IaaS** | OS, apps, data, runtime | Compute, storage, network, hypervisor, data center |
| **PaaS** | Your app + data | Runtime, middleware, OS, infra |
| **SaaS** | Just usage/configuration | Everything |

- Examples: IaaS→EC2/VM; PaaS→Elastic Beanstalk/App Engine; SaaS→Gmail/Office 365.
- **Mnemonic:** IaaS = Infrastructure (most control), PaaS = Platform, SaaS = Software (least control).

## 3. Deployment Models
| Model | Who owns | Use case |
|-------|----------|----------|
| **Public** | Cloud provider | General/scalable workloads |
| **Private** | One org (own or hosted) | Compliance, sensitive data, full control |
| **Community** | Several orgs with shared concerns | e.g., government, research bodies |
| **Hybrid** | Public + private combined | Bursting, DR, keep sensitive on-prem |
| (Multi-cloud) | Multiple providers | Avoid vendor lock-in, resilience |

## 4. NIST Model
- NIST SP 800-145 defines cloud via **5 characteristics + 3 service models + 4 deployment models** (all above). "NIST model" = this standard taxonomy.

## 5. Cloud Cube Model (Jericho Forum)
- A 3-D/4-axis classification:
  1. **Internal vs External** (physical location).
  2. **Owned vs Third-party** (provider ownership).
  3. **Architected vs De-architected** (open standards vs proprietary) — dropped in 3-D version.
  4. **Perimeterized vs De-perimeterized** (traditional boundary vs de-perimeterized security).
- Used mainly for **security** analysis (where data sits, trust boundary).

## 6. Cloud Migration — Seven-Step Model (Buyya et al.)
1. **Conduct Cloud Assessments:** Technical/business feasibility, workload inventory, ROI & TCO analysis.
2. **Isolate the Dependencies:** Discover inter-system coupling, network dependencies, library bindings.
3. **Map the Applications:** Assign workloads to delivery models (IaaS/PaaS/SaaS) & target services.
4. **Re-architect the Applications:** Decouple state, eliminate SPOFs, implement 12-factor cloud-native patterns.
5. **Augment the Applications:** Add cloud middleware (message queues, auto-scaling, logging, telemetry).
6. **Test Cloud-Readiness & Governance:** Functional, integration, HA/DR failover, security/compliance drills.
7. **Optimize, Manage, and Iterate:** Production cutover, continuous SLA monitoring, FinOps right-sizing.
- *(Enterprise Strategy: Gartner 6 R's: Rehost, Replatform, Repurchase, Refactor, Retain, Retire.)*

## 7. Virtual Machine Migration
- **Cold migration:** VM is powered off before moving (downtime).
- **Suspended migration:** paused, moved, resumed.
- **Live migration (vMotion):** zero-downtime move of a *running* VM.
  - **Pre-copy:** copy memory pages while running; then stop-and-copy dirty pages (checkpoint) → resume. Short pause.
  - **Post-copy:** start target first, pull pages on-demand (fast start, risk of network faults).
  - **Storage migration:** move disks between datastores (often via Storage vMotion).
- Benefits: load balancing, maintenance (patch hosts), DR, consolidation.

## 8. Cloud Middleware
- Software layer between apps and OS/network: **message queues**, RPC/ORB (CORBA, Java RMI), transaction monitors, naming/registry, authentication, caching.
- In cloud: brokering, messaging (SQS/RabbitMQ), API gateways, orchestration.

## 9. Data Migration & Streaming
- **Data migration:** transfer on-prem → cloud (bulk). Techniques: batch extract/load, ETL, **snowball/import-export** devices for huge datasets, direct-connect/private links, continuous replication.
- **Data streaming:** real-time movement (Kafka/Kinesis) for live pipelines vs batch.

## 10. Interoperability & Portability
- **Interoperability:** different cloud systems work together (standard APIs, formats).
- **Portability:** move apps/data between clouds with minimal rework.
- **Challenges:** vendor lock-in, proprietary APIs, heterogeneous formats, security across boundaries.
- **Enablers:** open standards (OpenStack, OVF, Docker/OCI containers, Kubernetes), RESTful APIs, common data formats.

---

## Memory aids
- **NIST = 5 + 3 + 4** (5 characteristics, 3 service models, 4 deployment models) → "**5-3-4**".
- **SPI order = Control direction:** IaaS (max control) → SaaS (min control).
- **7-step migration = Q-I-M-R-M-S-G:** Quantify → Isolate → Map → Re-architect → Migrate → Security → Go-live.
- **Live migration copy order:** Pre-copy (copy-then-switch) vs Post-copy (switch-then-copy).

## Quick carry-away
> Pick deployment by data sensitivity & compliance; pick service model by how much you want to manage; plan migration with a 7-step/7R framework; prefer open standards for portability; use live migration for zero-downtime maintenance.

## External links (shortlist)
- NIST SP 800-145: nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf
- AWS 7Rs / migration strategies: docs.aws.amazon.com/prescriptive-guidance/latest/migration-7-rs
- VMware vMotion docs: docs.vmware.com/en/VMware-vSphere
- Jericho Forum Cloud Cube Model: en.wikipedia.org/wiki/Cloud_cube_model
- AWS Snowball: aws.amazon.com/snowball
- IBM Cloud / Azure migration white papers (search "cloud migration strategy")
