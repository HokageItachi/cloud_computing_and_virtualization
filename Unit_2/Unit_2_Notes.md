# CSE423: Virtualization and Cloud Computing — Unit II Notes

**Course:** CSE423: Virtualization and Cloud Computing
**Unit II Topics:** Introduction to Cloud Computing · Deployment models · Service models · Characteristics · NIST model · Cloud cube model · Cloud Migration (Seven-Step model, VM migration, middleware, data migration/streaming, interoperability)

---

## Table of Contents
1. Introduction to Cloud Computing
2. Cloud Deployment Models
3. Cloud Service Models
4. Essential Characteristics of Cloud Computing
5. The NIST Model
6. The Cloud Cube Model
7. Cloud Migration — Overview
8. The Seven-Step Migration Model
9. Virtual Machine Migration
10. Cloud Middleware
11. Data Migration and Streaming
12. Interoperability and Portability
13. Implementation Tips & Tricks
14. External Links

---

## 1. Introduction to Cloud Computing

### 1.1 Definition (NIST SP 800-145)
> "Cloud computing is a model for enabling **ubiquitous, convenient, on-demand network access** to a **shared pool of configurable computing resources** (e.g., networks, servers, storage, applications, and services) that can be **rapidly provisioned and released** with minimal management effort or service provider interaction."

### 1.2 The Essence
Cloud computing delivers **IT as a service** over the Internet. Instead of owning hardware, you rent compute/storage/software on demand and pay for what you use (pay-as-you-go). It is enabled by **virtualization**, automation, and distributed systems.

### 1.3 Why Cloud? (Drivers)
- Reduced capital expenditure (CapEx) → operational expenditure (OpEx).
- Elasticity & scalability (scale up/down quickly).
- Global reach, high availability, disaster recovery.
- Faster time-to-market (provision in minutes).
- Managed services (offload operations).
- Innovation: AI/ML, big data, serverless available on demand.

---

## 2. Cloud Deployment Models

| Model | Description | Who uses it | Pros | Cons |
|-------|-------------|-------------|------|------|
| **Public Cloud** | Cloud services provided over the Internet by a third-party provider, shared by many tenants. | Startups, SMBs, web apps. | Low upfront cost, elastic, managed. | Less control, shared tenancy, security/privacy concerns. |
| **Private Cloud** | Cloud infrastructure operated solely for one organization (on-premise or hosted), single-tenant. | Enterprises, regulated industries (banking, healthcare, government). | Full control, compliance, customization. | High cost, in-house expertise needed. |
| **Hybrid Cloud** | Combination of public + private (or on-premise), connected so data/apps can be shared. | Enterprises that need elasticity + security. | Best of both: burst to public, keep sensitive on private. | Complexity, networking/integration effort. |
| **Community Cloud** | Infrastructure shared by several organizations with common concerns (e.g., mission, security, compliance). | Groups like universities, government agencies in one sector. | Shared cost, meets common compliance needs. | Limited to community, governance complexity. |

**Memory aid:** Think of **"P,H,C,C"** → Public, Hybrid, Community, Private (or drill into the security vs. cost tradeoff along a spectrum from public → community → private).

---

## 3. Cloud Service Models (SPI)

| Model | Full name | What you get | What the provider manages | Examples |
|-------|-----------|--------------|--------------------------|----------|
| **SaaS** | Software as a Service | Ready-to-use application via browser. | Everything (app, runtime, OS, server, network). | Gmail, Salesforce, Office 365. |
| **PaaS** | Platform as a Service | Platform/runtime to deploy your code (no server mgmt). | Runtime, OS, server, network; you manage your app & data. | AWS Elastic Beanstalk, Google App Engine, Heroku. |
| **IaaS** | Infrastructure as a Service | Virtualized compute, storage, networking. | Physical hardware, hypervisor, network; you manage OS, app, data. | AWS EC2, Azure VMs, GCP Compute Engine. |

**The "as a Service" ladder:** IaaS is the base (most control, most you manage) → PaaS → SaaS (least control, least you manage). Traditional on-premise = you manage everything.

**Other models (beyond SPI):** FaaS (Function as a Service / serverless), DBaaS, DRaaS, DaaS (Desktop), XaaS (everything as a service).

---

## 4. Essential Characteristics of Cloud Computing (NIST)

The NIST definition lists **five essential characteristics**:

1. **On-demand self-service:** Users can provision computing capabilities (server time, storage) without human interaction with the provider.
2. **Broad network access:** Capabilities are available over the network and accessed through standard mechanisms (browsers, thin clients, mobile).
3. **Resource pooling:** Provider's resources are pooled to serve multiple consumers using a multi-tenant model, with resources dynamically assigned/reassigned (physical/virtual).
4. **Rapid elasticity:** Capabilities can be elastically provisioned and released, sometimes automatically, to scale rapidly outward/inward.
5. **Measured service:** Cloud systems automatically control and optimize resource use via metering, with usage transparently monitored and charged (pay-per-use).

---

## 5. The NIST Model

**NIST SP 800-145** provides the authoritative definition and **visual model** with three parts:

1. **Five essential characteristics** (above).
2. **Three service models** (SaaS, PaaS, IaaS).
3. **Four deployment models** (Public, Private, Hybrid, Community).

This is often drawn as a layered "cloud stack" diagram:
- Bottom: **deployment models** (public/private/hybrid/community) — *where* the cloud runs.
- Middle: **service models** (IaaS/PaaS/SaaS) — *what* is delivered.
- Top: **essential characteristics** — *how* it behaves.

**Why NIST matters:** It provides a vendor-neutral, standardized vocabulary; exams love the five characteristics and SPI models.

---

## 6. The Cloud Cube Model (Jericho Forum)

The **Cloud Cube Model** is a framework (from the Jericho Forum) that helps classify cloud deployments on **four dimensions**:

1. **Internal vs. External (I/E):** Where the cloud sits relative to the organization's trust boundary. Internal = inside the corporate boundary; External = outside.
2. **Proprietary vs. Open (P/O):** Whether the technology/interfaces are proprietary (vendor-specific) or open/standard-based (interoperable).
3. **De-perimeterised vs. Perimeterised (D/P):** Whether security is enforced by the network perimeter (perimeterised) or data-centric/identity-based anywhere (de-perimeterised).
4. **Architecture — shared vs. dedicated** (sometimes added) — how resources are shared.

**Use:** The Cloud Cube helps you reason about **security posture** and **interoperability** — e.g., an external, open, de-perimeterised cloud is different from an internal, proprietary, perimeterised one. It complements NIST by focusing on security boundaries.

---

## 7. Cloud Migration — Overview

**Cloud migration** = moving digital assets (data, applications, workloads, IT processes) from on-premise (or one cloud) to the cloud. Goals: cost reduction, scalability, modernization, agility.

**Key migration styles (6 R's):**
- **Rehost** ("lift-and-shift") — move as-is, minimal change.
- **Replatform** ("lift-tinker-and-shift") — move with small optimizations (e.g., managed DB).
- **Repurchase** — replace with a SaaS product.
- **Refactor / Re-architect** — redesign for cloud-native (microservices, serverless).
- **Retire** — decommission.
- **Retain** — keep on-premise for now.

---

## 8. The Seven-Step Migration Model

In cloud literature and academic curricula (particularly **Rajkumar Buyya et al., *Mastering Cloud Computing***, Chapter 10), the migration of enterprise applications and data into a cloud environment is structured into a systematic **Seven-Step Model**:

```
[Step 1: Conduct Cloud Assessments]
                │
                ▼
[Step 2: Isolate the Dependencies]
                │
                ▼
[Step 3: Map the Applications]
                │
                ▼
[Step 4: Re-architect the Applications]
                │
                ▼
[Step 5: Augment the Applications]
                │
                ▼
[Step 6: Test Cloud-Readiness & Governance]
                │
                ▼
[Step 7: Optimize, Manage, and Iterate]
```

### 8.1 Detailed Breakdown of the Seven Steps

| Step | Name | Core Objectives & Activities | Key Deliverables / Artifacts |
|:---:|:---|:---|:---|
| **1** | **Conduct Cloud Assessments** | • Feasibility analysis: technical, economic, legal, and compliance viability.<br>• Inventory all enterprise assets (compute, storage, databases, networking, third-party licenses).<br>• Business case formulation: ROI, TCO, payback period, and risk matrices. | Workload inventory catalog, Cloud readiness assessment report, Cost-benefit model. |
| **2** | **Isolate the Dependencies** | • Discover coupling between applications, database dependencies, shared storage, and internal APIs.<br>• Uncover hidden architectural constraints (e.g., hard-coded IP addresses, local disk assumptions, OS-level bindings).<br>• Group applications into migration bundles/waves. | Application dependency graph, Inter-system communication matrix, Migration wave schedule. |
| **3** | **Map the Applications** | • Match isolated components to target cloud delivery models (**IaaS**, **PaaS**, or **SaaS**).<br>• Map applications to appropriate cloud services (e.g., legacy app → EC2 IaaS; relational DB → RDS PaaS; containerized microservice → ECS/EKS).<br>• Define target networking (VPCs, subnets, routing, Direct Connect/VPN). | Cloud target architecture blueprint, Service-level mapping document, SLA definitions. |
| **4** | **Re-architect the Applications** | • Modify or refactor application code and architecture to fit cloud elasticity and distributed computing.<br>• Eliminate single points of failure (SPOF) and decouple state (adopt stateless application tier + external session store/cache).<br>• Implement 12-factor application patterns (horizontal scalability, environment parity). | Refactored code repositories, Container definitions (Dockerfiles/Helm), Resilient cloud templates. |
| **5** | **Augment the Applications** | • Integrate cloud-native middleware and managed services.<br>• Introduce distributed messaging queues (SQS, RabbitMQ, Kafka) for asynchronous decoupling.<br>• Embed automated scaling policies, health checks, self-healing hooks, distributed tracing, and centralized logging. | Middleware configuration, Auto-scaling definitions, Telemetry & monitoring instrumentation. |
| **6** | **Test Cloud-Readiness & Governance** | • Comprehensive multi-tier validation: functional regression testing, end-to-end integration tests, load/stress testing.<br>• Test high availability (HA) and disaster recovery (DR): simulate AZ failover and network partitions.<br>• Verify security posture, encryption at rest/in transit, IAM policies, and regulatory compliance (HIPAA, PCI-DSS, GDPR). | UAT sign-off, Penetration testing & security audit report, DR failover drill report. |
| **7** | **Optimize, Manage, and Iterate** | • Production cutover / go-live (DNS switch, traffic migration using canary or blue-green deployment).<br>• Continuous monitoring of telemetry (CloudWatch, Prometheus) and real-time SLAs.<br>• Cloud financial governance (FinOps): right-sizing underutilized resources, applying reserved/spot instances, and continuous lifecycle tuning. | Go-live verification sign-off, FinOps optimization dashboard, Operational runbooks. |

---

### 8.2 Enterprise Complement: The "6 R's" (Gartner / AWS Migration Strategies)
While Buyya's 7-Step Model provides the **sequential migration pipeline**, organizations evaluate individual applications within Step 3 using the **6 R's Strategy Portfolio**:

1. **Rehost ("Lift-and-Shift"):** Move VMs/servers as-is to cloud IaaS without code changes. Fast, low risk, but misses cloud-native cost efficiencies.
2. **Replatform ("Lift-Tinker-and-Shift"):** Replace specific baseline components with managed equivalents (e.g., migrating MySQL on a physical server to Amazon RDS) without major core code redesign.
3. **Repurchase ("Drop-and-Shop"):** Decommission legacy custom software in favor of an established SaaS offering (e.g., migrating on-premise email to Microsoft 365 or Salesforce).
4. **Refactor / Re-architect:** Redesign and rewrite the application from scratch to exploit cloud-native features (serverless, microservices, distributed event buses). Highest ROI and agility, but highest initial engineering effort.
5. **Retain:** Keep the application on-premise due to compliance, latency constraints, or heavy dependencies until modern alternatives mature.
6. **Retire:** Identify and safely decommission redundant or zombie applications that provide no business value.

---

## 9. Virtual Machine Migration (Live / Cold)

**VM migration** = moving a VM from one physical host (or data center / cloud) to another.

**Types:**
- **Cold (offline) migration:** VM is shut down, its files (vmdk/vhdx) copied to the destination, then started. Simple but causes downtime.
- **Warm migration:** Suspend → copy memory/disk → resume.
- **Live migration:** move a *running* VM with no noticeable downtime — e.g., **VMware vMotion** or **KVM live migration**.

**How live migration works (roughly, a step-by-step):**
1. Pre-copy: copy all memory pages to destination while the VM keeps running; track dirty pages.
2. Iterative/pre-copy rounds: copy repeatedly dirtied pages (dirty bitmap) until the dirty set is small.
3. Stop-and-copy: pause the VM (brief), copy remaining dirty pages + CPU state, then resume at destination.
4. Post-copy (variant): start VM at destination and pull remaining pages on demand.

**Benefits:** zero-downtime maintenance, load balancing, disaster recovery, workload mobility across clouds.

---

## 10. Cloud Middleware

**Middleware** is software that sits between the application and the OS/network to facilitate communication and integration (RPC, messaging, transactions, naming). In the cloud, middleware is often **offered as a managed service** (PaaS or SaaS level).

**Cloud middleware capabilities:**
- Message queues & event streaming (e.g., Amazon SQS, Kafka as a service).
- API gateways and integration.
- Databases/queues/caches (managed DBaaS).
- Identity & authentication services.
- Orchestration (Kubernetes, workflow engines).

**Why it matters:** Middleware enables distributed cloud apps to talk reliably, decouple components, scale, and integrate with legacy systems.

---

## 11. Data Migration and Streaming

**Data migration** = moving data between storage types, formats, or systems (on-premise → cloud, or between clouds).

**Challenges:**
- Volume (TB/PB-scale), bandwidth limits, latency.
- Consistency & integrity (no corruption).
- Downtime windows and validation.

**Transfer strategies:**
- **Online transfer:** APIs/network (e.g., AWS S3 transfer acceleration, Azure Data Factory).
- **Offline/physical devices for huge datasets:** AWS Snowball/Snowmobile, Azure Data Box (physical shipping).
- **Database migration services:** AWS DMS, Azure DMS (minimal downtime replication).

**Data streaming:** Moving *continuous* data (events, telemetry, logs) into the cloud for real-time processing — e.g., Kinesis, Kafka, Pub/Sub. Streaming handles unbounded data with low latency, enables event-driven architectures.

---

## 12. Interoperability and Portability

- **Interoperability:** The ability of systems from different vendors to work together (e.g., a hybrid cloud app talks to both AWS and private VMware). Relies on open standards: REST, OAuth, OpenStack APIs, Kubernetes, OVF templates.
- **Portability:** The ability to move workloads/data *between* clouds or providers with minimal rework (e.g., a containerized app runs on AWS and GCP).
- **Anti-patterns to avoid:** deep vendor lock-in via proprietary APIs, managed services with no migration path, proprietary formats.

**How to improve:** use open standards (Docker/Kubernetes for containers; SQL/object storage APIs; OVF for VM images); design for the 6 R's; keep an exit strategy.

---

## 13. Implementation Tips & Tricks (Real-World)

- **Start with a small pilot** workload (non-critical) before a full migration — de-risk.
- **Use the "6 R's" not just "lift-and-shift":** refactoring to PaaS/serverless often saves more long-term cost.
- **Do a dependency map** before moving: find which servers talk to which before sequencing push.
- **Right-size at migrate time** — don't carry over oversized on-prem configurations; use the cloud's smallest/cheapest instance that meets load, then let autoscaling handle peaks.
- **For live migration,** ensure the source and destination share compatible CPU features (or use CPU compatibility masks) to avoid a "VM won't start" after vMotion.
- **Secure data in transit and at rest** during migration (TLS, encryption); use a VPN/Direct Connect for large transfers.
- **Budget for egress costs** — moving data *out* of a cloud is usually charged; plan data transfer.
- **Test the rollback plan** — migrations can fail; always have a way back.
- **For streaming:** think "bounded" vs. "unbounded" data; use partitioning and consumer groups for parallel processing.
- **Use managed migration tools** (AWS DMS, Azure Migrate, Google Velostrata) instead of manual copies where possible.

---

## 14. External Links (Curated Placeholders)

**Cloud definitions & models:**
- NIST SP 800-145 (full definition): https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf
- NIST Cloud Computing Reference Architecture (SP 500-292): https://www.nist.gov/publications/nist-cloud-computing-reference-architecture
- Cloud Cube Model (Jericho Forum): https://collaboration.opengroup.org/jericho/cloud_cube_model_v1.0.pdf

**Deployment & service models:**
- AWS "What is Cloud Computing": https://aws.amazon.com/what-is-cloud-computing/
- Azure cloud computing overview: https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/
- Google Cloud "What is IaaS/PaaS/SaaS": https://cloud.google.com/learn/what-is-iaas

**Migration:**
- AWS Prescriptive Guidance — Cloud Migration Strategies,6 R's): https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-strategies/welcome.html
- Microsoft "Cloud Adoption Framework" (migration methodology): https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/
- VMware vMotion (live migration) docs: https://docs.vmware.com/en/VMware-vSphere/index.html

**Middleware / data:**
- Amazon SQS & messaging: https://aws.amazon.com/sqs/
- Apache Kafka (streaming): https://kafka.apache.org/
- AWS Database Migration Service: https://aws.amazon.com/dms/
- AWS Snowball (offline data transfer): https://aws.amazon.com/snowball/
- Kubernetes (portability/orchestration): https://kubernetes.io/

**Video tutorials (YouTube placeholders):**
- "Cloud Computing Explained" — IBM Cloud / NPTEL
- "AWS Cloud Practitioner: Cloud Concepts" — freeCodeCamp / AWS
- "Cloud Migration Strategies (6 R's)" — AWS Online Tech Talks
- "What is Middleware?" — software architecture channels
- "Live VM Migration (vMotion) explained" — VMware
