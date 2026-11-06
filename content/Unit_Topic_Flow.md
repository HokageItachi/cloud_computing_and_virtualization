# CSE423 — Unit-wise Topic Flow & Mind-Map

Visual map of how each unit's topics connect — plus an overview of the whole course. Use this to see "what leads to what" before deep revision.

---

## Course-Level Flow (Big Picture)

```
Virtualization (Unit I) ──► Cloud Computing (Unit II) ──► Cloud Architecture (Unit III)
        │                          │                               │
        │  provides the platform    │  the service model           │  economics & design
        ▼                          ▼                               ▼
  Distributed/Parallel        Migration & Interoperability   SOA · SLA · Cloudonomics
        │                          │                               │
        └──────────────►  AWS Implementation (Units IV – VI) ◄────┘
                            │            │            │
                            ▼            ▼            ▼
                         Fundamentals   Compute      Storage & Database
                          (IAM, infr)  (EC2, Lambda)(EBS/S3/EFS/Glacier,
                                          containers)  RDS/DynamoDB/Aurora/Redshift)
```

---

## Unit I Mind-Map

```
                    VIRTUALIZATION
                         │
        ┌────────────────┼───────────────────┐
        ▼                ▼                   ▼
   Fundamentals      x86 Virtualization    Types of Virtualization
   (hypervisor,      (rings, Popek–         (server, desktop, storage,
    host/guest,       Goldberg, binary       network, application, OS-level,
    Type1/Type2)      translation, para,     data)
                      hardware assist)
        │                │                   │
        │                └────┬──────────────┘
        ▼                     ▼
   VLAN / VSAN          Distributed & Parallel Computing
   (network seg)        (parallel vs distributed, Flynn's
   (storage seg)         taxonomy, Amdahl, CAP, paradigms)

Link: Virtualization is the enabler that makes Cloud (Unit II) practical.
```

---

## Unit II Mind-Map

```
             INTRODUCTION TO CLOUD COMPUTING
                        │
   ┌────────────────────┼─────────────────────────┐
   ▼                    ▼                         ▼
Characteristics      NIST Model              Cloud Cube Model (Jericho)
(5 essentials)       (5+3+4 taxonomy)          (internal/external, owned/3rd,
                                                de-perimeterized security)
   ▼
Deployment Models    Service Models
(public/private/     (IaaS/PaaS/SaaS)
 community/hybrid)    (SPI)
   │                    │
   └───────►  CLOUD MIGRATION ◄───────┐
              │                        │
              ▼                        ▼
      Seven-Step Model            VM Migration
      (assess→isolate→map→        (cold/suspended/live
       rearchitect→migrate→       pre-copy/post-copy)
       security→go-live)
              │
              ▼
      Cloud Middleware  Data Migration & Streaming  Interoperability
      (queues, RPC)     (bulk/ETL/Snowball)         (portability, lock-in)
```

---

## Unit III Mind-Map

```
                 CLOUD ARCHITECTURE
                       │
   ┌───────────────────┼────────────────────────┐
   ▼                   ▼                        ▼
Stack (layers)     Workload Distribution    Capacity Planning
(IaaS/PaaS/SaaS)   (load balancing,         (forecast, right-size,
                   auto-scaling,             metrics p95/p99)
                   horizontal/vertical)
   │                   ▼                        │
   │              Cloud Bursting          Disk Provisioning
   │              (on-prem + peak cloud)  (thick vs thin)
   ▼
   └────► SOA (loosely coupled services)  SLA (metrics, uptime)
                                         (3 nines=8.77h/yr)
   │
   ▼
        CLOUD ECONOMICS (cloudonomics)
        (laws, capex→opex, cost estimation, TCO, right-size/reserved/spot)
```

---

## Unit IV Mind-Map

```
                    AWS FUNDAMENTALS
                         │
        ┌────────────────┼────────────────────┐
        ▼                ▼                    ▼
Global Infrastructure   Service Categories   Management Console
(regions, AZs,          (compute/storage/db/  (UI + CLI + SDK + IaC)
 edge locations)         network/security/...)
        │                │                    │
        └───────►  Shared Responsibility Model ◄───────┘
                  (AWS secures the cloud vs
                   you secure in the cloud)
        │
        ▼
   IAM (users, groups, roles, policies, MFA, least privilege)
        │
        ▼
   AWS Account Security (root/MFA, CloudTrail, Config, Organizations, budgets)
```

---

## Unit V Mind-Map

```
                    AWS COMPUTE SERVICES
                          │
   ┌──────────────────────┼─────────────────────────┐
   ▼                      ▼                         ▼
EC2                    Managed Compute           Container Services
(AMI, instance types,   (Lambda serverless,       (Docker, ECS, EKS,
 key pair, security       Elastic Beanstalk PaaS,   Fargate serverless)
 group)                  Lightsail VPS)
   │
   ▼
EC2 Pricing & Cost Optimization
(On-Demand, Reserved, Savings Plans, Spot, Dedicated;
 right-size, auto-scale, tags, budgets)
```

---

## Unit VI Mind-Map

```
           AWS STORAGE & DATABASE SERVICES
                         │
   ┌─────────────────────┼──────────────────────────┐
   ▼                     ▼                          ▼
Block Storage          Object Storage           File Storage
(EBS — one EC2 disk,   (S3 buckets + classes,     (EFS — shared NFS,
 gp3/io2,              Glacier archive,           Linux instances)
 snapshots)             lifecycle, versioning)
                         │
                         ▼
             Storage Technology Selection
             (block vs file vs object; hot vs cold; cost vs perf)
                         │
   ┌─────────────────────┼──────────────────────────┐
   ▼                     ▼                          ▼
Relational (SQL)      NoSQL (DynamoDB)          Analytics (Redshift)
(RDS multi-engine,     (key-value/document,        (data warehouse, OLAP,
 Aurora 5× faster)      serverless, RCU/WCU)        petabyte-scale)
```

---

## Cross-Link Map (How Units Depend on Each Other)
| You need… | …to understand | Because |
|-----------|----------------|---------|
| Unit I virtualization | Unit II cloud | Cloud runs on virtualized pools |
| Unit II models | Unit III architecture | Architecture realizes the service models |
| Unit III economics | Unit V pricing | Cost methods apply to EC2/cloud |
| Unit III SLAs/architecture | Units IV–VI AWS | AWS is a concrete realization |
| Unit IV IAM/shared responsibility | Unit V compute | You secure instances per model |
| Unit IV infrastructure | Unit VI storage/db | Storage is region/AZ-bound |

---

> **Study tip:** Mind-maps are best used *after* reading the unit notes — try redrawing each map from memory, then check this file to fill gaps.
