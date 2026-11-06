# CSE423: Virtualization and Cloud Computing — Unit III Notes

**Course:** CSE423: Virtualization and Cloud Computing
**Unit III Topics:** Cloud Architecture (stack, workload distribution, capacity planning, cloud bursting, disk provisioning, SOA, SLAs) · Cloud Economics (laws of cloudonomics, cost estimation, economic strategy)

---

## Table of Contents
1. Cloud Architecture Overview
2. The Cloud Computing Stack
3. Workload Distribution
4. Capacity Planning
5. Cloud Bursting
6. Disk Provisioning
7. Service-Oriented Architecture (SOA)
8. Service Level Agreements (SLAs)
9. Cloud Economics — Introduction
10. The Laws of Cloudonomics
11. Cost Estimation
12. Economic Strategy
13. Implementation Tips & Tricks
14. External Links

---

## 1. Cloud Architecture Overview

**Cloud architecture** is the design of the components (front-end platforms, back-end platforms, cloud-based delivery, and the network) that combine to form a cloud system. It defines how resources are organized, how they scale, how workloads are distributed, and how quality of service (QoS) is guaranteed.

**Key layers (logical):**
- **Front end:** user interfaces (browser, mobile app).
- **Back end:** servers, storage, databases, management.
- **Middleware/network:** connects front and back ends.
- **Security & management planes:** identity, monitoring, orchestration.

---

## 2. The Cloud Computing Stack

The cloud stack organizes service models into layers:

| Layer | Examples | Managed by |
|-------|----------|-----------|
| **Physical/data center** | servers, storage, network, cooling | Provider (IaaS base) |
| **Virtualization layer** | hypervisors, pools | Provider |
| **IaaS** | VMs, virtual networks, object storage | Provider infra; you manage OS |
| **PaaS** | runtimes, DB, middleware, build tools | Provider platform; you manage app |
| **SaaS** | apps (email, CRM) | Provider entirely |
| **User/business layer** | your end users | You |

**Takeaway:** Higher layers abstract more; lower layers give more control. A "stack" implies each layer builds on the one below.

---

## 3. Workload Distribution (Load Balancing & Scaling)

**Workload distribution** = spreading incoming traffic/requests across multiple resources so no single node is overwhelmed, improving performance, availability, and reliability.

**Mechanisms:**
- **Load balancer (LB):** distributes traffic (round-robin, least connections, IP hash, weighted).
  - Layer 4 (transport, TCP/UDP) vs. Layer 7 (application, HTTP).
  - Examples: AWS ELB/ALB, NGINX, HAProxy.
- **Autoscaling:** automatically add/remove instances based on metrics (CPU, memory, request count).
- **Horizontal scaling (scale-out):** add more instances — the cloud-native approach.
- **Vertical scaling (scale-up):** add more power to one instance (limited by ceiling).
- **Geographic/regional distribution:** route users to the nearest region (edge/CDN).

**Design principles:** stateless application tiers (session state in cache/DB), idempotent requests, health checks, graceful shutdown.

---

## 4. Capacity Planning

**Capacity planning** = predicting future resource needs (compute, memory, storage, bandwidth) and sizing infrastructure so you neither under-provision (performance/sla failures) nor over-provision (waste money).

**Approaches:**
- **Analyze historical usage:** peak/typical loads, growth trends (linear/seasonal).
- **Forecast demand:** business growth, product launches, seasonal spikes.
- **Right-sizing:** match instance sizes to actual utilization (avoid idle compute).
- **Buffer/headroom:** keep spare capacity for spikes (or rely on autoscaling instead of static buffers).
- **In the cloud:** capacity is elastic, so planning focuses on *design* (autoscaling policies, quotas, budgets) rather than purchasing hardware.

**Metrics:** CPU utilization, memory, disk I/O, network throughput, latency percentiles (p95/p99), request rate.

---

## 5. Cloud Bursting

**Cloud bursting** is a **hybrid cloud** pattern: a workload normally runs on a **private/on-premise cloud**, but when demand exceeds local capacity ("bursts"), extra load is **spilled to a public cloud** on demand, then scaled back when the spike ends.

**How it works (step-by-step):**
1. Baseline workload runs on-premise (steady, predictable).
2. A spike is detected (e.g., a sale or seasonal peak) beyond local capacity.
3. Additional instances are provisioned in the public cloud within minutes.
4. Traffic is routed to the burst instances; once the spike subsides, they are de-provisioned (pay only for what you used).

**Use cases:** seasonal sales, testing, high-performance bursty jobs (scientific computing, rendering).
**Pros:** cost savings (avoid buying capacity for rare peaks), elasticity.
**Cons:** requires compatible images/data migration, network latency, data egress costs, complexity of orchestration.

---

## 6. Disk Provisioning

**Disk provisioning** = allocating storage to VMs/instances. Main types:

- **Thick provisioning (eager/zeroed or lazy):** Allocate the full disk size upfront at creation.
  - *Eager zeroed:* space allocated and zeroed immediately (best performance, slower creation; good for fault-tolerant clusters).
  - *Lazy zeroed:* allocated but not zeroed until written (faster create, slightly slower first writes).
- **Thin provisioning:** Allocate only what the VM actually uses, growing on demand up to a maximum. Saves storage but can overcommit and risk filling the datastore.

**In the cloud,** this maps to storage options: **EBS volumes**, **instance store**, **S3/EBS snapshots**, and capacity reservations. Provisioning decisions affect cost, performance (IOPS), and availability.

**Best practices:** monitor thin-provisioned growth; set alerts at thresholds; use snapshots for backup; provision IOPS to match workload (gp3 vs. io2 for high performance).

---

## 7. Service-Oriented Architecture (SOA)

**SOA** is an architectural style where software capabilities are provided as **loosely coupled, reusable services** that communicate via standard protocols (often over a network).

**Core principles:**
- **Encapsulation:** each service hides its internal implementation.
- **Loose coupling:** services depend on contracts (interfaces), not implementation details.
- **Reusability:** services are designed to be reused across apps.
- **Composability:** services can be assembled into larger workflows.
- **Discoverability:** services are findable (registry/service catalog).
- **Interoperability:** standards-based (SOAP/REST, JSON/XML, WSDL/OpenAPI).

**Components:** Service provider, service consumer, service registry/broker, messages (request/response), policies.
**Relationship to cloud:** Cloud PaaS/SaaS and microservices extend SOA ideas. **Microservices** are a finer-grained, modern evolution of SOA (each service = small independent deployable unit, usually with its own DB).

---

## 8. Service Level Agreements (SLAs)

An **SLA** is a formal contract between a provider and customer that defines the **level of service** expected: availability, performance, support, and remedies/penalties if not met.

**Common SLA elements:**
- **Availability/Uptime:** e.g., "99.9% monthly uptime" (downtime allowed ≈ 43 min/month; 99.99% ≈ 4.3 min/month).
- **Performance:** latency, throughput (e.g., p99 < 200 ms).
- **Reliability/durability:** e.g., 99.999999999% (11 nines) durability for S3.
- **Response/support times:** severity-based (e.g., critical ticket: 1-hour response).
- **Credit/penalty structure:** service credits if the SLA is breached.
- **Exclusions:** maintenance windows, force majeure, customer-caused downtime.

**SLA math you should know:**
- 99.9% → ~8.76 hours/year downtime.
- 99.99% → ~52.6 min/year.
- 99.999% → ~5.26 min/year.

**How to use:** pick providers whose SLAs match your business criticality; combine SLAs across a stack (your effective availability = product of component SLAs); design for redundancy (multi-AZ) to exceed a single component's SLA.

---

## 9. Cloud Economics — Introduction

**Cloud economics** = the financial analysis of cloud adoption: comparing total cost of ownership (TCO) against on-premise, optimizing spend, and choosing the right pricing models.

**Core financial concepts:**
- **CapEx vs. OpEx:** capital expenditure (buying hardware) → operational expenditure (pay-as-you-go).
- **TCO:** total cost over the lifecycle (hardware, power, cooling, staff, maintenance, and cloud fees).
- **Pay-per-use / metering:** bill by compute-hours, storage, data transfer.
- **Economies of scale:** providers buy in bulk, pass savings to you.

---

## 10. The Laws of Cloudonomics

**Joe Weinman's "10 Laws of Cloudonomics"** provide the foundational economic and mathematical theory explaining why multi-tenant, utility-based cloud computing fundamentally outperforms dedicated on-premise infrastructure for variable, unpredictable, or growing enterprise workloads.

```
                  THE 10 LAWS OF CLOUDONOMICS (Joe Weinman)
┌─────────────────────────────────┬─────────────────────────────────┐
│  Demand & Variability Laws      │  Scale, Arbitrage & Agility     │
├─────────────────────────────────┼─────────────────────────────────┤
│ 1. Utility Pricing vs Peak      │ 6. Asymmetric Demand Curves     │
│ 2. On-Demand Real-Time Supply   │ 7. Unit Cost of Extreme Scale   │
│ 3. Peak Capacity Cost Premium   │ 8. Space-Time Arbitrage         │
│ 4. Penalty of Idle Resources    │ 9. Dispersion vs. Concentration │
│ 5. Aggregation & Law of Large # │ 10. Strategic Velocity & ROI    │
└─────────────────────────────────┴─────────────────────────────────┘
```

### 10.1 Complete Formulation of Weinman's 10 Laws

1. **Law #1: Utility pricing beats owned infrastructure when demand is variable.**
   - *Explanation:* If demand fluctuates, paying a slightly higher unit price only when resources are consumed costs far less than paying 100% of the capital expenditure for private infrastructure sized for peak demand that sits idle most of the time.
   - *Mathematical formulation:* If $U$ is average utilization ($0 < U < 1$) and $P_{cloud} / P_{prem} < 1/U$, cloud is strictly cheaper.

2. **Law #2: On-demand real-time elasticity eliminates forecasting penalty.**
   - *Explanation:* Traditional IT requires predicting demand years ahead. Under-forecasting results in lost revenue, broken SLAs, and frustrated customers; over-forecasting results in wasted capital. Real-time on-demand elasticity aligns resource provisioning dynamically with actual demand without forecasting penalties.

3. **Law #3: The cost of peak capacity is far higher than the average cost.**
   - *Explanation:* Serving the highest 5% to 10% peak spike (e.g., Black Friday, flash sales) requires dedicated hardware that sits unused 90%+ of the year. The amortized cost per transaction during peaks on dedicated hardware is astronomically higher than offloading peaks to a shared cloud.

4. **Law #4: The cost of idle capacity exceeds the value of surplus capacity.**
   - *Explanation:* Dedicated hardware depreciates, consumes power, cooling, real estate, and maintenance even when idling at 0% CPU utilization. The economic drag of idle overhead consistently exceeds the safety value of owning excess headroom.

5. **Law #5: Aggregating independent workloads flattens overall variability (The Law of Large Numbers).**
   - *Explanation:* When multiple independent workloads with uncorrelated demand peaks are pooled together into a centralized cloud, the coefficient of variation ($CV = \sigma / \mu$) of aggregate demand drops proportionally to $1/\sqrt{N}$. The cloud provider experiences a predictable, smoothed aggregate demand curve, drastically reducing the reserve capacity needed per customer.

6. **Law #6: Asymmetric demand curves favor hybrid offloading.**
   - *Explanation:* Workloads characterized by a stable base load with sharp, periodic peaks achieve the optimal cost curve through a hybrid model: maintain steady base-load compute on highly utilized reserved/private capacity, and spill the short-duration burst peaks into the public cloud (cloud bursting).

7. **Law #7: Lower unit costs via extreme scale and hyper-efficiency.**
   - *Explanation:* Hyper-scale cloud providers (AWS, Azure, GCP) buy hardware in massive wholesale volumes (millions of servers), build proprietary custom silicon (AWS Graviton, Nitro), operate near low-cost energy sources (hydroelectric, geothermal), and achieve ultra-low Power Usage Effectiveness (PUE < 1.15). Private enterprise datacenters cannot match these unit costs.

8. **Law #8: Space-Time Arbitrage maximizes economic efficiency.**
   - *Explanation:* Workloads can be geographically shifted across global regions and time zones to take advantage of off-peak electricity rates, cooler nighttime ambient temperatures (cutting chiller power), and regional pricing differentials without moving physical hardware.

9. **Law #9: Network latency enforces a trade-off between dispersion and concentration.**
   - *Explanation:* While centralized mega-datacenters maximize economies of scale and resource pooling, real-time interactive user experiences are bound by the speed of light in fiber (~5 ms per 1,000 km). Therefore, optimal cloud economics requires a dual hierarchy: centralized compute/storage pools coupled with widely dispersed Edge Locations (CDNs/PoPs) to minimize transmission delay.

10. **Law #10: Strategic agility and time-to-market deliver higher ROI than pure infrastructure cost reduction.**
    - *Explanation:* The primary value of the cloud is not merely saving pennies on compute cycles; it is reducing the time required to provision infrastructure from 6 months to 60 seconds. Rapid experimentation, failing fast, pivoting, and seizing market opportunities first yields orders of magnitude higher Net Present Value (NPV) than operational hardware savings alone.

---

### 10.2 Actionable Takeaways for System Designers
- **Right-size** baseline instances to eliminate paying for unneeded vCPUs/memory.
- Implement **dynamic auto-scaling** to follow actual demand curves (Law #1, #2).
- Exploit **Spot Instances** (up to 90% savings) for fault-tolerant and batch compute (Law #3, #4).
- Use **CDN Edge Caching** (CloudFront) in front of centralized origin storage (Law #9).
- Structure architectural decisions using **FinOps** principles to align engineering decisions with unit economics (Law #10).

---

## 11. Cost Estimation

**How to estimate cloud costs:**

**Step 1 — Understand the pricing dimensions:**
- **Compute:** instance type, vCPU/RAM, region, billing mode (On-demand, Reserved, Spot/Savings Plans).
- **Storage:** volume type (gp3/io2), size, IOPS, snapshots.
- **Data transfer:** egress is charged; ingress usually free; inter-AZ/region egress also billed.
- **Managed services:** per-GB, per-request, per-node fees.

**Step 2 — Use provider cost calculators (AWS Pricing Calculator, Azure Pricing Calculator, GCP Pricing Calculator):**
- Select services, configure regions, instance types, storage, estimate monthly cost.
- Compare on-demand vs. reserved (Reserved Instances typically save 30–70%).
- Include data transfer and support fees.

**Step 3 — Measure & optimize:**
- **Cost explorer / billing dashboards:** track actual spend.
- **Right-size** underutilized instances (e.g., CPU < 10% → downsize).
- **Auto-stop/dev environments** off-hours.
- **Reserved Instances / Savings Plans** for steady, predictable workloads.
- **Spot instances** for fault-tolerant/batch jobs.
- **Storage tiering:** move cold data to S3 Glacier / Standard-IA.
- **Tag resources** to allocate cost to teams/projects.

**Example estimate (rough):** an m5.large (2 vCPU/8 GB) on-demand in us-east-1 ≈ $0.096/hr → ~$70/month; a 3-year all-upfront Reserved Instance would be notably cheaper. Always verify with the live calculator (prices change).

---

## 12. Economic Strategy

**Economic strategy = aligning cloud financial decisions with business goals.** Key strategies:

1. **FinOps** — a discipline combining finance, engineering, and product to manage cloud spend (visibility, allocation, optimization, continuous improvement).
2. **Choose the right pricing model** per workload:
   - On-demand: short-lived/elastic/spiky.
   - Reserved/Savings Plans: steady, predictable (24/7).
   - Spot: stateless, fault-tolerant, batch.
3. **Design for cost (architecture-level):**
   - Serverless/event-driven to reduce idle compute.
   - Autoscaling to match demand.
   - Object storage + tiering for data.
   - Cache and CDN to cut transfer/latency costs.
4. **Governance:** budgets, alerts, cost quotas, tags, and regular right-sizing reviews.
5. **TCO analysis:** quantify *all* costs (people, migration, exit) not just list price; compare against on-prem over 3–5 years.

---

## 13. Implementation Tips & Tricks

- **Always check the live pricing calculator** — list prices change; never quote from memory for a real decision.
- **Set up budget alerts early** (AWS Budgets / Azure cost alerts) before costs run away.
- **Use tags** (project, environment, owner) from day one so cost allocation is clean.
- **For cloud bursting,** build the burst image with the same version/config as on-prem so spillover is seamless; keep state in a shared layer (DB/object storage).
- **SLA math:** to hit "five nines" across a stack you need redundancy; don't promise what single components can't deliver.
- **Capacity planning in the cloud is mostly about autoscaling policies**, not buying hardware — define min/max and alarms.
- **For thin provisioning,** add monitoring on datastore free space and set a warning threshold to avoid filling-up surprises.
- **Use spot instances for stateless batch** (rendering, ML training, CI jobs) — huge savings if you design for interruption.
- **Watch egress costs** — the biggest hidden bill; keep data inside one region/cloud when you can.
- **Right-size continuously** — re-evaluate instance sizes quarterly against actual utilization.

---

## 14. External Links (Curated Placeholders)

**Architecture & design:**
- AWS Well-Architected Framework: https://aws.amazon.com/architecture/well-architected/
- AWS Architecture Center: https://aws.amazon.com/architecture/
- Azure Architecture Center: https://learn.microsoft.com/en-us/azure/architecture/
- Google Cloud Architecture Framework: https://cloud.google.com/architecture/framework

**Scaling, capacity, bursting:**
- AWS Auto Scaling docs: https://docs.aws.amazon.com/autoscaling/
- AWS Elastic Load Balancing: https://aws.amazon.com/elasticloadbalancing/
- Cloud bursting explainer (Azure): https://learn.microsoft.com/en-us/azure/architecture/patterns/cloud-bursting

**SOA & SLAs:**
- SOA overview (Microsoft): https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ee658117(v=pandp.10)
- AWS SLA page: https://aws.amazon.com/legal/service-level-agreements/
- Azure SLA page: https://azure.microsoft.com/en-us/support/legal/sla/

**Economics:**
- Joe Weinman's Cloudonomics: http://www.joeweinman.com/
- AWS Pricing Calculator: https://calculator.aws/
- Azure Pricing Calculator: https://azure.microsoft.com/en-us/pricing/calculator/
- Google Cloud Pricing Calculator: https://cloud.google.com/products/calculator
- FinOps Foundation: https://www.finops.org/

**Video tutorials (YouTube placeholders):**
- "Cloud Computing Architecture" — Simplilearn / NPTEL
- "AWS Well-Architected Framework" — AWS
- "Cloudonomics: The Economics of Cloud" — Joe Weinman talks
- "AWS Pricing and Cost Optimization" — freeCodeCamp / A Cloud Guru
- "FinOps for beginners" — FinOps Foundation
