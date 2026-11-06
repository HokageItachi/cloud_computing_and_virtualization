# CSE423: Virtualization and Cloud Computing — Unit III Questions

**Topics:** Cloud architecture (stack, workload distribution, capacity planning, cloud bursting, disk provisioning, SOA, SLAs) · Cloud economics (cloudonomics, cost estimation, economic strategy)

---

## Part A — Multiple Choice Questions (MCQs)

**Q1.** In the cloud computing stack, which layer gives the customer the most control (and the least abstraction)?
- A) SaaS
- B) PaaS
- C) IaaS
- D) User/business

**Q2.** Adding more instances of a service to handle load is called:
- A) Vertical scaling (scale-up)
- B) Horizontal scaling (scale-out)
- C) Thick provisioning
- D) Cloud bursting

**Q3.** Which hybrid-cloud pattern moves spillover traffic to a public cloud only during demand spikes?
- A) Cloud bursting
- B) Thin provisioning
- C) Load balancing
- D) SOA

**Q4.** A **thin-provisioned** disk:
- A) Allocates the full size at creation
- B) Allocates space on demand up to a maximum
- C) Cannot grow after creation
- D) Is always eager-zeroed

**Q5.** Which architectural style emphasizes loosely coupled, reusable services communicating over standard protocols?
- A) SOA
- B) Symmetric multiprocessing
- C) Peer-to-peer only
- D) Monolithic app

**Q6.** An SLA availability of 99.99% allows roughly how much downtime per year?
- A) ~8.76 hours
- B) ~52.6 minutes
- C) ~5.26 minutes
- D) ~1 hour

**Q7.** According to Weinman's Laws of Cloudonomics, the key reason cloud saves money is that you pay for:
- A) Peak capacity you rarely use
- B) Average usage while having capacity for peaks (utility pricing)
- C) Only software licenses
- D) Fixed annual fees

**Q8.** Which AWS pricing model is best for steady, predictable 24/7 workloads?
- A) Spot instances
- B) On-demand instances
- C) Reserved Instances / Savings Plans
- D) Free tier only

**Q9.** Which data transfer is typically billed (i.e., not free) in cloud pricing?
- A) Ingress into the cloud
- B) Egress out of the cloud
- C) Within the same Availability Zone
- D) Free-tier always

**Q10.** The discipline combining finance, engineering, and product to manage cloud spend is called:
- A) FinOps
- B) SLA
- C) SOA
- D) VDI

---

### Answers & Explanations

**A1. C) IaaS.**
IaaS gives the most control (you manage OS/apps/data), least abstraction. SaaS is most abstract; PaaS is in between.

**A2. B) Horizontal scaling (scale-out).**
Adding more instances is scale-out; adding more power to one instance is vertical (scale-up).

**A3. A) Cloud bursting.**
Cloud bursting runs a baseline on-prem/private and spills bursts to the public cloud on demand.

**A4. B) Allocates space on demand up to a maximum.**
Thin provisioning grows on demand; thick provisioning allocates the full size upfront.

**A5. A) SOA.**
Service-Oriented Architecture uses loosely coupled, reusable, standards-based services.

**A6. B) ~52.6 minutes.**
99.99% → 0.01% downtime = ~52.6 min/year. 99.9% → ~8.76 hr; 99.999% → ~5.26 min.

**A7. B) Average usage while having capacity for peaks (utility pricing).**
Cloud's utility pricing lets you pay for average usage while still having peak capacity, avoiding idle capacity cost.

**A8. C) Reserved Instances / Savings Plans.**
Steady, predictable workloads justify reserved commitments for large discounts; spot is for fault-tolerant/batch, on-demand for spiky/short-lived.

**A9. B) Egress out of the cloud.**
Egress (outbound) is usually billed; ingress and same-AZ traffic are typically free.

**A10. A) FinOps.**
FinOps is the cloud financial management discipline (finance + engineering + product).

---

## Part B — Subjective Questions

### Short-Answer Questions

**SA1. What is the cloud computing stack? List its layers from bottom to top.**

**Model Answer:**
From bottom (least abstraction) to top (most abstraction):
1. Physical/data center (servers, storage, network, cooling) — provider managed.
2. Virtualization layer (hypervisors, resource pools) — provider managed.
3. **IaaS** — VMs, virtual networks, block/object storage.
4. **PaaS** — runtimes, managed databases, middleware, build tools.
5. **SaaS** — ready-to-use applications.
6. User/business layer — your end users.
The stack shows each layer building on the one beneath it; higher layers abstract more.

**SA2. Differentiate between horizontal and vertical scaling, and state which is preferred in cloud-native design.**

**Model Answer:**
- **Vertical (scale-up):** add CPU/RAM to a single instance; simpler but hits a hardware ceiling and causes downtime during resize.
- **Horizontal (scale-out):** add more instances behind a load balancer; recommended in cloud because it is elastic, fault-tolerant, and can match demand automatically via autoscaling. Cloud-native apps are designed stateless so any instance can serve any request.

**SA3. What is cloud bursting? Give one scenario where it is useful and one drawback.**

**Model Answer:**
Cloud bursting is a hybrid-cloud pattern where a workload normally runs on-prem/private, and when demand exceeds local capacity, extra load is run in the public cloud and scaled back after the spike.
Useful for: seasonal sales, flash traffic, batch/HPC peaks.
Drawback: complexity — compatible images, data/state sharing, network latency, and egress costs, plus needing orchestration to burst and de-provision.

**SA4. What is an SLA, and what should it typically contain?**

**Model Answer:**
An SLA is a contract defining the guaranteed service level. It typically contains: availability/uptime targets (e.g., 99.9%), performance metrics (latency/throughput), reliability/durability guarantees, support response times by severity, service credits/penalties for breach, and exclusions (maintenance windows, customer-caused downtime).

**SA5. List the main pricing dimensions you must consider when estimating cloud compute and storage costs.**

**Model Answer:**
- Compute: instance type (vCPU/RAM), region, billing mode (on-demand/reserved/spot).
- Storage: volume type (e.g., gp3/io2), size, IOPS, snapshots.
- Data transfer: egress, inter-AZ/region transfer.
- Managed services: per-GB, per-node, per-request fees.
- Support plan and additional services (monitoring, backups).

### Long-Answer / Analytical Questions

**LA1. Explain how the Laws of Cloudonomics justify cloud adoption. Link each law to a concrete practice (right-sizing, autoscaling, reserved instances).**

**Model Answer (step-by-step):**
1. State the core laws (utility pricing, averaging/statistical multiplexing, no idle cost, time value, elasticity).
2. **Law 1 (peaks vs. average):** Demand peaks are far above average; cloud lets you pay for average usage while reserve peak capacity → practice: **autoscaling** follows the demand curve.
3. **Law 2 (aggregation):** many customers smooth aggregate load so provider servers are fuller → you benefit from provider economies of scale.
4. **Law 3 (idle cost):** idle on-prem hardware costs money without value → practice: **right-sizing** and turning off dev environments off-hours.
5. **Law 4 (time value):** speed of provisioning gets value sooner and reduces depreciation risk → practice: on-demand provisioning for time-to-market.
6. **Law 5 (elasticity):** supply should match demand; over-provisioning wastes money, under-provisioning loses revenue/latency. Practice: use **reserved instances** for steady load and **spot** for flexible/batch load.
7. Conclusion: cloud economics reward matching spend to actual demand (utility pricing) rather than pre-buying peak hardware.

**LA2. Describe the components of cloud architecture for a scalable web application and how workload distribution and capacity planning are implemented.**

**Model Answer (step-by-step):**
1. Layers: front-end (CDN/static), web/app tier (auto-scaled instances), data tier (managed DB + cache), and control plane (monitoring/orchestration).
2. **Workload distribution:** a load balancer (Layer 7) distributes HTTP to healthy app instances; health checks remove failing instances; autoscaling policy (e.g., based on CPU or request count) adds/removes instances between min and max.
3. **Capacity planning:** monitor historical load, set sensible min/max for the autoscaling group, and use metrics (CPU, latency p95) plus budgets. Design for peak by letting autoscaling handle spikes rather than buying oversized instances.
4. **Resilience:** deploy across multiple Availability Zones so capacity planning includes redundancy.
5. Tie to stack: this design uses IaaS (instances), PaaS (managed DB), and SaaS-ish services (CDN).

**LA3. Compare thick vs. thin disk provisioning, when to use each, and how this maps to cloud storage offerings.**

**Model Answer (step-by-step):**
1. **Thick provisioning:** allocate full size at creation (eager-zeroed = zeroed upfront for best performance, or lazy-zeroed = not zeroed until first write).
2. **Thin provisioning:** allocate only used space, growing on demand to a maximum; saves storage but risks overcommit and datastore exhaustion.
3. Use cases: thick/eager for high-performance, fault-tolerant or predictable-volume workloads; thin for dev/test or underutilized VMs.
4. Cloud mapping: EBS volume types (gp3 general purpose, io2 for high IOPS), instance store (ephemeral), and snapshots. You provision size and IOPS in the cloud; monitor thin/underutilized volumes and right-size.
5. Best practice: monitor free space, set alerts, and match IOPS to the workload.

---

## Part C — Exam Tips
- Know the **SLA downtime math** (99.9/99.99/99.999).
- Be able to name all **Weinman Cloudonomics laws** and tie each to a practice.
- Understand **cloud bursting** as a hybrid pattern (baseline on-prem + public for spikes).
- Distinguish **thick vs. thin provisioning**, and **horizontal vs. vertical scaling**.
- Use the **AWS Pricing Calculator** workflow in your answers (see Practical 8).
