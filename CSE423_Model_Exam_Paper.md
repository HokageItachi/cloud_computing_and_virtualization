# CSE423: Virtualization and Cloud Computing — Model Examination Papers

**Course:** CSE423: Virtualization and Cloud Computing (Credits: 3 | L:2 T:0 P:1)  
**Applicability:** Mid-Term Examination (MTE), End-Term Examination (ETE), Continuous Assessment (CA)  
**Mapped Course Outcomes:** CO1, CO2, CO3, CO4, CO5, CO6  

---

## Table of Contents
1. Mid-Term Examination (MTE) Paper (Units I – III)
2. Mid-Term Examination Solutions & Marking Scheme
3. End-Term Examination (ETE) Comprehensive Paper (Units I – VI)
4. End-Term Examination Solutions & Marking Scheme

---

## 1. Mid-Term Examination (MTE) Paper

**Time Allowed:** 1.5 Hours | **Maximum Marks:** 50  
*Instructions: Answer all questions in Part A, any three from Part B, and any one from Part C.*

### Part A: Short Answer Questions (Compulsory — 5 × 2 = 10 Marks)

1. **[CO1 - Remember]** Define Popek–Goldberg virtualization criteria and explain why legacy x86 architecture violated them.
2. **[CO1 - Understand]** Differentiate between VLAN and VSAN with respect to the network layer and protocols used.
3. **[CO2 - Understand]** State the 5 essential characteristics of cloud computing defined in NIST SP 800-145.
4. **[CO2 - Remember]** List the four dimensions of the Jericho Forum Cloud Cube Model.
5. **[CO3 - Understand]** Explain the concept of Cloud Bursting and cite one business scenario where it is economically viable.

---

### Part B: Analytical Questions (Answer any 3 — 3 × 6 = 18 Marks)

6. **[CO1 - Analyze]** Compare Full Virtualization via Binary Translation, Paravirtualization, and Hardware-Assisted Virtualization (Intel VT-x / AMD-V) across guest OS modification, performance overhead, and trap handling.
7. **[CO1 - Evaluate]** Compare Parallel Computing and Distributed Computing across memory architecture, communication latency, failure handling models, and scalability limits.
8. **[CO2 - Apply]** Outline Rajkumar Buyya's 7-Step Model of Cloud Migration. Explain the core objectives of *Isolating Dependencies* and *Augmenting Applications*.
9. **[CO3 - Analyze]** A financial firm requires an SLA of 99.99% ("four nines") annual uptime. Calculate the maximum permitted downtime in minutes per year. Explain the trade-offs between RPO (Recovery Point Objective) and RTO (Recovery Time Objective).

---

### Part C: In-Depth / Design Questions (Answer any 1 — 1 × 22 = 22 Marks)

10. **[CO3 - Create]**
    *(a)* Systematically state and explain any **six** of Joe Weinman's 10 Laws of Cloudonomics. *(12 Marks)*  
    *(b)* An e-commerce startup experiences a baseline traffic of 500 requests/sec for 10 months and a flash spike of 10,000 requests/sec during November and December. Using Weinman's laws of aggregation and utility pricing, formulate an architectural and economic strategy comparing 100% on-premise hardware provisioning vs. a hybrid cloud bursting approach. *(10 Marks)*

11. **[CO2 & CO3 - Evaluate]**
    *(a)* Draw and analyze the complete Cloud Computing Stack from physical hardware up to the SaaS/User layer. Describe workload distribution mechanisms at Layer 4 and Layer 7. *(12 Marks)*  
    *(b)* Evaluate the Pre-copy and Post-copy live VM migration algorithms. Detail the dirty-page iteration loop and state how hypervisors prevent infinite dirty-rate loops. *(10 Marks)*

---

## 2. Mid-Term Examination Solutions & Marking Scheme

### Part A Solutions

**Ans 1 (2 Marks):**
- *Criteria (1 Mark):* Popek-Goldberg states an architecture is strictly virtualizable if and only if all sensitive instructions (those that expose or modify hardware privilege state) form a strict subset of privileged instructions (those that trap when executed in user mode).
- *x86 Violation (1 Mark):* The x86-32 architecture contained 17 sensitive, unprivileged instructions (e.g., `POPF`, `PUSHF`, `SGDT`, `SIDT`, `SLDT`) that failed silently or behaved differently in user space (Ring 1/2/3) without trapping to Ring 0.

**Ans 2 (2 Marks):**
- **VLAN (1 Mark):** Partitions physical Ethernet switches into isolated broadcast domains at Layer 2 using the IEEE 802.1Q tag (12-bit VLAN ID, up to 4096 tags) for IP traffic.
- **VSAN (1 Mark):** Partitions a physical Fibre Channel (FC) Storage Area Network fabric into isolated logical fabrics with dedicated fabric services and zone databases for SAN block storage traffic.

**Ans 3 (2 Marks):**
The 5 NIST essential characteristics (0.4 marks each):
1. *On-demand self-service* (automated provisioning without provider human intervention).
2. *Broad network access* (heterogeneous standard client platform access).
3. *Resource pooling* (multi-tenant physical/virtual resource pools).
4. *Rapid elasticity* (dynamic outward/inward provisioning matching demand).
5. *Measured service* (transparent metering and pay-per-use billing).

**Ans 4 (2 Marks):**
The 4 Cloud Cube dimensions (0.5 marks each):
1. *Internal vs. External (I/E):* Physical location inside vs. outside enterprise trust perimeter.
2. *Proprietary vs. Open (P/O):* Degree of vendor technology lock-in vs. open standards.
3. *Perimeterised vs. De-perimeterised (D/P):* Traditional boundary firewall security vs. identity/data-centric zero-trust security.
4. *Insourced vs. Outsourced:* Infrastructure operated by in-house staff vs. third-party contractor.

**Ans 5 (2 Marks):**
- *Concept (1 Mark):* A hybrid cloud deployment where baseline enterprise applications run on private/on-premise cloud infrastructure, and during unexpected or peak spikes that exceed local capacity, the overflow workload dynamically spills ("bursts") into a public cloud.
- *Scenario (1 Mark):* An online university admissions portal running normal batch jobs on campus servers that bursts to public cloud compute instances for 48 hours during national entrance result declarations.

---

### Part B Solutions

**Ans 6 (6 Marks):**
Comparison Table (2 marks per approach):
| Dimension | Full Virtualization (Binary Translation) | Paravirtualization | Hardware-Assisted (VT-x / AMD-V) |
|---|---|---|---|
| **Guest OS Modification** | None. Completely unmodified guest OS. | Required. Kernel source rewritten with hypercalls. | None. Unmodified standard guest OS. |
| **Trap Handling** | VMM scans binary code on-the-fly and rewrites sensitive non-trapping instructions into direct traps. | Sensitive instructions replaced at compile-time with explicit `hypercall` software interrupts. | Hardware adds "VMX Root" and "VMX Non-Root" modes. Hardware automatically traps on sensitive instructions (`VM-Exit`). |
| **Performance Overhead** | High runtime translation and caching overhead. | Near-native speed for CPU, low overhead. | Near-native speed; accelerated further by hardware Extended Page Tables (EPT/NPT). |

**Ans 7 (6 Marks):**
Comparison Table (1.5 marks per row):
| Feature | Parallel Computing | Distributed Computing |
|---|---|---|
| **Memory Model** | Tightly coupled shared memory (UMA/NUMA SMP) or high-speed bus. | Loosely coupled distributed private memory per node. |
| **Communication Latency** | Nanoseconds to microseconds across system bus / Infiniband. | Milliseconds across LAN/WAN network packets. |
| **Failure Handling** | Fail-fast: failure of one CPU core/node usually aborts the entire parallel job. | Partial failure resiliency: nodes fail independently; handled via consensus (Paxos/Raft) and replication. |
| **Scalability Limit** | Limited by bus contention and memory bandwidth (Amdahl's Law). | Scalable horizontally across thousands of commodity nodes. |

**Ans 8 (6 Marks):**
- *List of 7 Steps (2 Marks):* 1. Conduct Cloud Assessments → 2. Isolate Dependencies → 3. Map the Apps → 4. Re-architect Applications → 5. Augment Applications → 6. Test Cloud-Readiness → 7. Optimize & Iterate.
- *Isolating Dependencies (2 Marks):* Deconstruct monolithic legacy architectures to discover hard-coded IP addresses, database coupling, proprietary operating system libraries, and file-share dependencies. Group assets into isolated migration waves.
- *Augmenting Applications (2 Marks):* Infuse cloud-native services: replace custom messaging with managed Message-Oriented Middleware (e.g., SQS/Kafka), inject dynamic autoscaling triggers, attach centralized monitoring hooks (CloudWatch), and enable managed backup automation.

**Ans 9 (6 Marks):**
- *Uptime Math (3 Marks):*
  $$\text{Downtime Percentage} = 100\% - 99.99\% = 0.01\% = 0.0001$$
  $$\text{Minutes in a year} = 365 \times 24 \times 60 = 525,600 \text{ minutes}$$
  $$\text{Max Downtime} = 525,600 \times 0.0001 = 52.56 \text{ minutes per year}$$
- *RPO vs. RTO (3 Marks):*
  - **RPO (Recovery Point Objective):** The maximum tolerable volume of data loss measured in time backward from a disruption (e.g., a 15-minute RPO requires continuous snapshotting/replication so no more than 15 minutes of transactional data is lost).
  - **RTO (Recovery Time Objective):** The maximum permissible clock duration to restore service availability after a disaster (e.g., an RTO of 1 hour requires failover automation within 60 minutes).

---

### Part C Solutions

**Ans 10 (22 Marks):**
*(a) Weinman's Laws Explanation (12 Marks - 2 marks each for any 6 laws):*
1. *Law #1 (Utility Pricing):* Pay-per-use variable pricing beats private infrastructure ownership when average utilization $U$ is low ($P_{cloud} / P_{prem} < 1/U$).
2. *Law #2 (On-Demand Elasticity):* Eliminates forecasting risk. Avoids the twin penalties of over-provisioning (idle waste) and under-provisioning (SLA breaches, lost business).
3. *Law #3 (Peak Capacity Cost Premium):* Buying dedicated servers to handle the top 5% peak spike leaves capital idling 95% of the year.
4. *Law #4 (Penalty of Idle Capacity):* Depreciating physical hardware and standby data center overhead drag profit margins.
5. *Law #5 (Aggregation / Law of Large Numbers):* Summing $N$ uncorrelated independent workloads reduces the coefficient of variation ($CV = \sigma / \mu$) by $1/\sqrt{N}$, producing a predictable smooth aggregate demand curve.
6. *Law #8 (Space-Time Arbitrage):* Moving compute tasks across time zones and geographies exploits cheaper nighttime energy, off-peak rates, and cooler climates.
7. *Law #10 (Strategic Velocity):* Time-to-market speed and business agility generate higher Net Present Value (NPV) than pure infrastructure penny savings.

*(b) E-Commerce Strategy Formulation (10 Marks):*
- *Problem Characterization (3 Marks):* Peak-to-average ratio is $10,000 / 500 = 20:1$. Sizing on-premise hardware for 10,000 req/sec means 95% of server hardware sits completely idle for 10 months of the year, incurring power, rack space, cooling, and capital depreciation (violating Law #3 and #4).
- *Architectural Recommendation (4 Marks):* Implement a **Hybrid Cloud Bursting Architecture**:
  1. Base Load (500 req/sec): Host on private on-premise servers or 3-year All-Upfront AWS Reserved Instances / Savings Plans to achieve minimum base unit compute cost.
  2. Spikes (up to 10,000 req/sec): Configure auto-scaling groups to burst horizontally into AWS public cloud (EC2 On-Demand and Spot instances fronted by Application Load Balancers) during November/December.
- *Economic Impact (3 Marks):* Capital expenditure is kept minimal. Peak capacity is rented strictly for the 60-day window and decommissioned immediately, saving up to 70% in 3-year TCO.

---

## 3. End-Term Examination (ETE) Comprehensive Paper

**Time Allowed:** 3 Hours | **Maximum Marks:** 100  
*Instructions: Answer all questions in Section A (20 Marks), four questions from Section B (40 Marks), and two questions from Section C (40 Marks).*

### Section A: Objective & Short Conceptual Questions (Compulsory — 10 × 2 = 20 Marks)

1. **[CO1]** Explain the difference between Type 1 (Bare-Metal) and Type 2 (Hosted) hypervisors and name one enterprise product for each.
2. **[CO1]** What is Flynn’s Taxonomy? Categorize modern GPU and multi-core server processors within it.
3. **[CO2]** State the Shared Responsibility Model distinction between IaaS and PaaS regarding operating system security patches.
4. **[CO2]** How does Live VM Migration (vMotion) track memory changes occurring during the pre-copy phase?
5. **[CO3]** Define Service-Oriented Architecture (SOA) and contrast it with Microservices in terms of service granularity and governance.
6. **[CO4]** Distinguish between an AWS Region, an Availability Zone, and a CloudFront Edge Location.
7. **[CO4]** In AWS IAM, what is the evaluation logic when an explicit Allow and an explicit Deny policy apply to the same principal?
8. **[CO5]** Contrast Amazon EC2 Spot Instances with Reserved Instances regarding price discount, interruption guarantees, and ideal workloads.
9. **[CO6]** Under what specific technical requirements should an architect select Amazon EFS over Amazon EBS?
10. **[CO6]** Explain how Amazon DynamoDB achieves single-digit millisecond latency at horizontal scale compared to Amazon RDS.

---

### Section B: Core Subject Analytical Problems (Answer any 4 — 4 × 10 = 40 Marks)

11. **[CO1 - Virtualization & Distributed Paradigms]**  
    *(a)* Explain memory virtualization. Detail Shadow Page Tables vs. Hardware Nested Page Tables (Intel EPT). *(5 Marks)*  
    *(b)* Compare Cluster Computing, Grid Computing, and Cloud Computing across homogeneity, resource coordination, and pricing. *(5 Marks)*

12. **[CO2 - Cloud Models & Migration]**  
    *(a)* Differentiate Public, Private, Community, and Hybrid cloud deployment models across multi-tenancy, compliance control, CapEx/OpEx, and operational complexity. *(5 Marks)*  
    *(b)* Describe the technical architecture of AWS Database Migration Service (DMS) and explain how Continuous Change Data Capture (CDC) allows zero-downtime database migration. *(5 Marks)*

13. **[CO3 - Cloud Architecture & Economics]**  
    *(a)* Explain Thick Provisioning (Eager Zeroed vs. Lazy Zeroed) versus Thin Provisioning in virtual disks. Detail storage over-commitment risks. *(5 Marks)*  
    *(b)* Formulate a 3-year Total Cost of Ownership (TCO) model comparing on-premise enterprise server acquisition against AWS cloud migration. Detail 5 direct and 5 indirect cost parameters. *(5 Marks)*

14. **[CO4 & CO5 - AWS Security & Compute Services]**  
    *(a)* Formulate the top 5 AWS Account Security best practices for securing the root user and privileged IAM accounts. Include MFA, CloudTrail, and Least Privilege principles. *(5 Marks)*  
    *(b)* Explain AWS Lambda execution lifecycle (cold start vs. warm start), concurrency limits, and execution duration ceilings. Contrast with AWS Fargate. *(5 Marks)*

15. **[CO6 - AWS Storage & Database Architecture]**  
    *(a)* Compare Amazon S3 storage classes: S3 Standard, S3 Intelligent-Tiering, S3 Standard-IA, and S3 Glacier Deep Archive across durability, minimum storage duration, access latency, and retrieval fees. *(5 Marks)*  
    *(b)* Explain Amazon Aurora’s distributed log-structured storage architecture. How does it replicate 6 copies across 3 AZs and survive full AZ failure with quorum writes without degrading write performance? *(5 Marks)*

---

### Section C: Comprehensive Scenario & Architectural Design (Answer any 2 — 2 × 20 = 40 Marks)

16. **[CO4, CO5, CO6 - Enterprise Cloud Solution Architecture]**  
    A healthcare enterprise is migrating an on-premise patient monitoring system to AWS. Requirements:
    - Highly available, fault-tolerant web frontend accessible over HTTPS globally.
    - Application tier running scalable containerized microservices.
    - Transactional database requiring multi-AZ failover and strict ACID guarantees.
    - Long-term storage of encrypted patient medical scan images (PACS DICOM files) retained for 7 years for HIPAA compliance.
    - Zero plain-text credentials stored on virtual machines; strict least-privilege role assignment.
    
    *(a)* Design and sketch a complete AWS architecture diagram indicating all components (VPC, Public/Private Subnets, IGW, NAT Gateway, ALB, ECS/Fargate, Multi-AZ RDS/Aurora, S3 with Lifecycle Policies, KMS, and IAM Roles). *(10 Marks)*  
    *(b)* Detail the end-to-end security and storage tiering design: specify how patient scans transition over 7 years to minimize cost while maintaining instant retrieval when requested by emergency physicians. *(10 Marks)*

17. **[CO3 & CO5 - Capacity Planning, Auto-Scaling & Cost Optimization]**  
    *(a)* An enterprise media streaming platform experiences daily diurnal traffic swings: 2,000 requests/sec at 04:00 AM rising to 50,000 requests/sec at 09:00 PM. Design an automated Workload Distribution and Capacity Planning strategy utilizing AWS Application Load Balancers, Target Tracking Auto-Scaling, and EC2 Fleet mixing On-Demand and Spot instances. *(10 Marks)*  
    *(b)* Demonstrate how Joe Weinman's Law of Aggregation ($CV = \sigma / \mu$) and On-Demand Elasticity prevent capacity mismatches. Derive the cost optimization equation for a blended EC2 fleet with $70\%$ Spot and $30\%$ Reserved Instances. *(10 Marks)*

18. **[CO1 & CO2 - Virtualization Internals & Live Migration]**  
    *(a)* Provide an in-depth technical analysis of x86 CPU hardware virtualization extensions (Intel VT-x). Explain the VMCS (Virtual Machine Control Structure), VMXON/VMXOFF instructions, VM-Entry, VM-Exit, and the trap-and-emulate sequence. *(10 Marks)*  
    *(b)* Analyze the step-by-step memory and CPU state transfer mechanism during a VMware vMotion live migration over a 10 GbE vMotion network. Detail the iterative pre-copy dirty bitmap tracking, convergence conditions, network ARP announcement, and maximum freeze window (< 100 ms). *(10 Marks)*

---

## 4. End-Term Examination Solutions & Marking Scheme

### Section A Solutions

1. **Type 1 vs. Type 2 Hypervisors (2 Marks):**
   - Type 1 runs directly on bare-metal hardware without host OS; e.g., VMware ESXi, KVM.
   - Type 2 runs on top of a conventional host OS as an application; e.g., VMware Workstation, Oracle VirtualBox.
2. **Flynn's Taxonomy (2 Marks):**
   - Taxonomizes computers into SISD, SIMD, MISD, MIMD. Modern GPUs are **SIMD** (Single Instruction Multiple Data); multi-core server clusters are **MIMD** (Multiple Instruction Multiple Data).
3. **Shared Responsibility: IaaS vs. PaaS OS Patching (2 Marks):**
   - In **IaaS (EC2)**: Customer is responsible for installing guest OS security patches and updates.
   - In **PaaS (RDS/Beanstalk)**: Cloud provider (AWS) is responsible for patching the underlying OS and database runtime.
4. **Live Migration Memory Tracking (2 Marks):**
   - Hypervisors use **shadow page tables or hardware EPT page-fault monitoring** to maintain a **dirty page bitmap**. Any memory page modified by the running guest during pre-copy is flagged and transmitted in subsequent iterative rounds.
5. **SOA vs. Microservices (2 Marks):**
   - SOA features enterprise-wide scope, coarse-grained shared components, and centralized Enterprise Service Bus (ESB) governance. Microservices features application-scoped, fine-grained, independently deployable services communicating over lightweight REST/gRPC with decentralized data storage.
6. **Region vs. AZ vs. Edge Location (2 Marks):**
   - **Region:** Geographic cluster of 2+ isolated data center facilities.
   - **AZ:** One or more isolated physical data centers within a region with independent utilities.
   - **Edge Location:** CloudFront CDN Point of Presence caching content close to users globally.
7. **IAM Policy Evaluation Logic (2 Marks):**
   - Evaluation order: 1. Default Deny → 2. Explicit Allow → 3. **Explicit Deny always overrides any Allow**. If any matching policy contains an explicit Deny, the final decision is strictly Deny.
8. **Spot vs. Reserved Instances (2 Marks):**
   - **Spot:** Up to 90% discount on spare capacity; can be interrupted with 2-minute notice; ideal for stateless/batch jobs.
   - **Reserved:** 30–72% discount for 1- or 3-year term commitment; capacity reservation guaranteed; ideal for steady 24/7 baseline stateful workloads.
9. **EFS vs. EBS Selection (2 Marks):**
   - Choose **EFS** when multiple EC2 instances across different AZs require simultaneous shared concurrent read-write access to a single POSIX-compliant file system over NFS. Choose **EBS** for dedicated, ultra-low-latency block storage attached to a single instance in a single AZ.
10. **DynamoDB Millisecond Latency (2 Marks):**
    - DynamoDB hashes the partition key to store and retrieve items directly in distributed SSD storage partitions in memory/SSD clusters without executing relational table joins or locking constraints, scaling horizontally with partition splits.

---

### Section B Key Highlights (Evaluation Guidelines)

- **Q11 (10 Marks):**
  - *(a) Memory Virtualization (5 Marks):* Award 2.5 marks for explaining shadow page tables (VMM maintains virtual-to-machine mappings, software write-protect intercepts) and 2.5 marks for Intel EPT nested page tables (hardware 2D page walk: Guest Virtual $\rightarrow$ Guest Physical $\rightarrow$ Host Physical).
  - *(b) Computing Paradigms (5 Marks):* Award 1.5 marks each for Cluster (homogeneous, dedicated LAN), Grid (heterogeneous, cross-administrative, batch), and Cloud (utility, elastic, multi-tenant pay-per-use).
- **Q12 (10 Marks):**
  - *(a) Deployment Models (5 Marks):* Award 1.25 marks per model (Public, Private, Community, Hybrid) contrasting security boundary, tenancy, and financial CapEx/OpEx.
  - *(b) AWS DMS & CDC (5 Marks):* Award 2.5 marks for replication instance architecture and 2.5 marks for Change Data Capture (reading transaction logs—e.g., MySQL binary logs or Oracle redo logs—to replicate changes continuously while source DB stays online).
- **Q13 (10 Marks):**
  - *(a) Disk Provisioning (5 Marks):* Award 2 marks for thick eager-zeroed vs lazy-zeroed, 2 marks for thin provisioning on-demand block allocation, and 1 mark for datastore out-of-space crash hazards.
  - *(b) TCO Model (5 Marks):* Award 2.5 marks for direct costs (server purchase, storage arrays, network switches, data center lease, power/cooling electricity) and 2.5 marks for indirect costs (sysadmin salaries, training, hardware maintenance contracts, downtime business loss, security auditing).
- **Q14 (10 Marks):**
  - *(a) Account Security (5 Marks):* Award 1 mark each for: Hardware/Virtual MFA on root, locking away root access keys, dedicated IAM administrator groups with least-privilege, multi-region AWS CloudTrail audit logging, and billing budget alerts.
  - *(b) Lambda Lifecycle (5 Marks):* Award 2 marks for cold start (container download, runtime initialization) vs warm start, 1.5 marks for 15-minute timeout and 10 GB memory ceilings, and 1.5 marks contrasting with Fargate (no timeout limit, full container control).
- **Q15 (10 Marks):**
  - *(a) S3 Storage Classes (5 Marks):* Award 1.25 marks per tier evaluating Standard (active, immediate), Intelligent-Tiering (auto-switching), Standard-IA (30-day min, retrieval fee), and Glacier Deep Archive (cheapest, 12-hour retrieval, 180-day min).
  - *(b) Aurora Architecture (5 Marks):* Award 2.5 marks for log-is-the-database architecture (only redo log records transferred over network to storage) and 2.5 marks for 6-way storage replication across 3 AZs with 4/6 write quorum and 3/6 read quorum.

---

### Section C Key Highlights (Evaluation Guidelines)

- **Q16 (20 Marks - Solution Architecture):**
  - *(a) Diagram & Components (10 Marks):* Award marks for: Multi-AZ VPC with public subnets (ALB, NAT GW) and private subnets (ECS tasks, Aurora Multi-AZ); IAM roles assigned to ECS tasks via task execution role; KMS customer-managed encryption keys for EBS/RDS/S3.
  - *(b) Security & Storage Lifecycle (10 Marks):* S3 bucket with SSE-KMS encryption; S3 Lifecycle policy: Day 0–90 in S3 Standard $\rightarrow$ Day 91 in S3 Glacier Instant Retrieval (allowing millisecond emergency medical scan queries) $\rightarrow$ Day 365+ in S3 Glacier Deep Archive $\rightarrow$ Expiration at 7 years (Day 2555) with Object Lock for legal regulatory compliance.
- **Q17 (20 Marks - Workload Distribution & Auto-Scaling):**
  - *(a) Auto-Scaling Fleet (10 Marks):* Application Load Balancer target groups; Target Tracking policy tracking average CPU at 65% and ALB RequestCountPerTarget; Mixed Instances Policy specifying 30% On-Demand baseline + 70% Spot instances across diverse instance types (`c5.large`, `c5a.large`, `c6g.large`) with capacity-optimized Spot allocation.
  - *(b) Weinman's Math & Blended Fleet (10 Marks):* Derivation of coefficient of variation reduction via Law of Large Numbers; cost equation:
    $$\text{Cost}_{blended} = (0.30 \times \text{Cost}_{RI}) + (0.70 \times \text{Cost}_{Spot})$$
    Demonstrating over 75% savings relative to pure On-Demand sizing.
- **Q18 (20 Marks - Virtualization & Live Migration Internals):**
  - *(a) Intel VT-x Internals (10 Marks):* Virtual Machine Control Structure (VMCS) 6 areas (Guest-state, Host-state, VM-execution controls, VM-exit controls, VM-entry controls, VM-exit information); VMX transition sequence: host executes `VMLAUNCH`/`VMRESUME` $\rightarrow$ VM-Entry into VMX non-root $\rightarrow$ guest executes sensitive instruction $\rightarrow$ VM-Exit into VMX root $\rightarrow$ hypervisor handles event.
  - *(b) vMotion Memory Transfer Mechanics (10 Marks):* Phase 1 (pre-copy full memory) $\rightarrow$ Phase 2 (iterative dirty memory transfer tracking bitmap) $\rightarrow$ Convergence check (dirty rate < network transmission throughput) $\rightarrow$ Phase 3 (quiesce VM, final memory delta + CPU register push < 100 ms) $\rightarrow$ Phase 4 (target VM activates, Gratuitous ARP broadcast updates network switch MAC tables $\rightarrow$ source VM memory freed).