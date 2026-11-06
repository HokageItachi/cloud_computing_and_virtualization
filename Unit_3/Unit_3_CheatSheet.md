# CSE423 — Unit III Cheat Sheet (One-Page Revision)

**Topics:** Cloud architecture (stack, workload distribution, capacity planning, cloud bursting, disk provisioning, SOA, SLAs) · Cloud economics (laws of cloudonomics, cost estimation, economic strategy)

---

## 1. Cloud Architecture
- **Layers:** front end (UI) + back end (servers/storage/DB) + middleware/network + security/management planes.
- **Stack (bottom→top):** physical data center → virtualization → IaaS → PaaS → SaaS → user/business.
  - Higher layer = more abstraction/less control; lower = more control.

## 2. Workload Distribution
- Spreading traffic across resources → performance, availability, reliability.
- **Load balancer (LB) algorithms:** round-robin, least connections, IP hash, weighted, health checks.
- **Scaling:** horizontal (add nodes — scale-out) vs vertical (bigger VM — scale-up). **Auto-scaling** uses rules/metrics.
- **Stateless vs stateful:** stateless apps scale easily; session affinity/sticky sessions handle state.

## 3. Capacity Planning
- Predicting resource needs (compute, memory, storage, network) to meet demand without over/under-provisioning.
- **Steps:** gather metrics/history → forecast demand (trends, seasonality) → size resources → plan for headroom/elasticity → monitor & revise.
- **Key ratios util metrics:** CPU/memory utilization, storage growth, network throughput, latency percentile (p95/p99).
- Trade-off: over-provisioning (waste) vs under-provisioning (SLA breach).

## 4. Cloud Bursting
- Hybrid pattern: run **baseline on-prem/private**, and **burst to public cloud** at peak demand.
- Benefits: handle spikes without buying permanent capacity; cost-effective (pay for peak only).
- Challenges: data sync, latency, security, interoperability between environments.

## 5. Disk Provisioning
| Type | Behavior | Use |
|------|----------|-----|
| **Thick (eager zeroed / lazy zeroed)** | Space allocated/zeroed upfront | Performance-critical, SQL |
| **Thin** | Grows on demand | Low-utilization workloads, saves space |
- Related: **storage tiering** (hot/warm/cold), snapshots, IOPS provisioning (provisioned vs burst).

## 6. Service-Oriented Architecture (SOA)
- Design where apps are built from **loosely coupled, reusable, discoverable services** that communicate over a network (via contracts).
- **Elements:** service, service contract (WSDL), interface, message, provider, consumer, registry/broker.
- **Principles:** reusability, loose coupling, abstraction, composability, autonomy, statelessness, discoverability.
- **vs Microservices:** SOA = coarse-grained, ESB (enterprise service bus), enterprise scope; microservices = fine-grained, independent deploy, decentralized.

## 7. Service Level Agreements (SLAs)
- **SLA =** formal contract defining the agreed service level (QoS metrics, responsibilities, penalties).
- **Common metrics:** uptime/availability (e.g., 99.9%), latency, throughput, RPO/RTO, response time, support response.
- **Uptime math:** 99.9% = ~8.77 h/yr downtime; 99.99% = ~52.6 min/yr; 99.999% = ~5.26 min/yr.
- **Components:** parties, scope, metrics, monitoring, reporting, penalties/remedies, exclusions, review.

## 8. Cloud Economics — The 10 Laws of Cloudonomics (Joe Weinman)
1. **Utility Pricing:** Variable demand favors pay-per-use over buying peak capacity.
2. **On-Demand Elasticity:** Real-time provisioning eliminates forecasting penalties (under/over-provisioning).
3. **Peak Cost Premium:** Peak capacity is disproportionately expensive when owned privately.
4. **Penalty of Idle Overhead:** Cost of idle capacity exceeds the safety value of surplus capacity.
5. **Aggregation & Law of Large Numbers:** Pooling independent demand reduces aggregate coefficient of variation ($1/\sqrt{N}$).
6. **Asymmetric Curves & Offloading:** Stable base load on-prem + spiky peak offloaded to cloud (bursting).
7. **Scale Economies:** Hyper-scale providers achieve lower unit costs for hardware, power, cooling, and PUE.
8. **Space-Time Arbitrage:** Shift workloads globally across time zones to exploit cheaper off-peak electricity.
9. **Dispersion vs. Concentration:** Balance centralized mega-datacenters with dispersed edge locations (CDNs) for latency.
10. **Agility Beats Cost:** Time-to-market acceleration and business velocity deliver higher NPV/ROI than raw infrastructure savings.

## 9. Cost Estimation & Economic Strategy
- **Cost drivers:** compute (instance type/time), storage (class/volume), data transfer (egress), network, managed services, support.
- **Models:** **capex vs opex** (capital vs operational expenditure). Cloud converts capex→opex.
- **TCO (Total Cost of Ownership):** hardware + power + cooling + space + admin + downtime vs cloud fees.
- **Optimization strategies:** right-sizing, reserved/spot instances, auto-scaling, storage lifecycle (tier to Glacier), delete idle resources, monitoring/budgets, rightsizing commitment plans.
- **Economic strategy:** match pricing plan to workload (on-demand for variable, reserved for predictable, spot for fault-tolerant). Use cost explorer/budgets. Avoid lock-in and idle spend.

---

## Memory aids
- **SLA uptime table:** 3 nines = 8.77 h; 4 nines = 52.6 min; 5 nines = 5.26 min/yr.
- **Cloudonomics:** "Pay for use (Law 1), align to demand (2), share to avoid under-utilization (3), scale economies (4), elasticity avoids idle+lost (5), pooling flattens variability (6)."
- **id provisioning:** "Thick = allocated ahead (fast, wastes); Thin = grows on demand (saves, slower)."
- **SOA = Loose Coupling + Reuse.** (Microservices = smaller, independently deployed.)

## Quick carry-away
> Distribute load horizontally + auto-scale · plan capacity from metrics (p95/p99) · burst to cloud for peaks · thin-provision for savings, thick for performance · formalize every promise in an SLA with measurable metrics · convert capex→opex, right-size, and use reserved/spot to cut cloud bills.

## External links (shortlist)
- AWS Well-Architected — Reliability/Cost pillar: docs.aws.amazon.com/wellarchitected
- AWS compute pricing (right-sizing/reserved/spot): aws.amazon.com/ec2/pricing
- Weinman "Cloudonomics" site: cloudonomics.com
- ISO/IEC 19086 (cloud SLA framework): iso.org
- AWS Cost Management/Budgets: aws.amazon.com/aws-cost-management
- VMware Cloud bursting / hybrid docs: docs.vmware.com
