# CSE423: Virtualization and Cloud Computing — Unit VI Notes

**Course:** CSE423: Virtualization and Cloud Computing
**Unit VI Topics:** AWS Storage & Database Services — Amazon EBS · Amazon S3 · Amazon EFS · S3 Glacier · Storage Technology Selection · Amazon RDS · Amazon DynamoDB · Amazon Redshift · Amazon Aurora

---

## Table of Contents

1. AWS Storage Overview & Storage Types
2. Amazon Elastic Block Store (EBS)
3. Amazon S3 (Simple Storage Service)
4. Amazon EFS (Elastic File System)
5. Amazon S3 Glacier
6. Storage Technology Selection (Choosing the right storage)
7. Amazon RDS (Relational Database Service)
8. Amazon DynamoDB
9. Amazon Redshift
10. Amazon Aurora
11. Implementation Tips & Tricks
12. External Links

---

## 1. AWS Storage Overview

AWS offers a family of storage services, each tuned to a different access pattern. The three fundamental "shapes" are:

| Shape              | What it is                                                                     | AWS service    |
| ------------------ | ------------------------------------------------------------------------------ | -------------- |
| **Block storage**  | Fixed-size volumes attached to a single EC2 instance, like a hard disk         | EBS            |
| **File storage**   | A shared file system over NFS, mountable by many instances                     | EFS            |
| **Object storage** | Scalable, flat namespace of objects (files + metadata) accessible over HTTP(S) | S3, S3 Glacier |

**A note for Unit VI:** "Storage" in AWS is typically _decoupled_ from compute. You attach volumes (EBS), mount file systems (EFS), or push/retrieve objects (S3) — each with different durability, performance, and cost trade-offs.

---

## 2. Amazon Elastic Block Store (EBS)

**EBS** provides _persistent block-level storage volumes_ for use with EC2 instances. Think of it as a virtual hard disk in the cloud.

### 2.1 Key concepts

- **Volume:** a durable, block-level device (like a virtual HDD/SSD) you attach to an instance.
- **Availability Zone (AZ) scoped:** a volume lives in a specific AZ and can be attached only to instances in that same AZ.
- **Instance store vs. EBS:** _instance store_ (ephemeral) is temporary — data is lost if the instance stops/terminates. _EBS_ is durable and persists independently of the instance.
- **Snapshots:** point-in-time backups of a volume, stored in S3 (incrementally). See Practical 2 for the VMware analogue.
- **Replication:** EBS volumes are replicated within their AZ for durability.

### 2.2 EBS volume types (performance tiers)

| Volume type                          | Use case                                          | Performance notes                                  |
| ------------------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| **gp3** (General Purpose SSD)        | Default; boot volumes; balanced price/performance | Baseline 3000 IOPS, up to 16,000 IOPS / 1000 MiB/s |
| **gp2**                              | Older general-purpose SSD                         | Burst-based; up to 16,000 IOPS                     |
| **io1 / io2** (Provisioned IOPS SSD) | Databases needing high, consistent IOPS           | Up to 64,000 IOPS (io2 up to 256k)                 |
| **st1** (Throughput Optimized HDD)   | Big data, log processing, streaming               | High throughput, low cost                          |
| **sc1** (Cold HDD)                   | Infrequently accessed cold data                   | Lowest cost, lowest performance                    |

### 2.3 EBS features

- **Attach / detach** volumes while the instance runs (most types), or use multi-attach (io1/io2) for shared access.
- **Encryption:** EBS encryption at rest (AES-256) with AWS KMS keys, and in transit between instance and volume.
- **Snapshots & restore:** snapshot to S3; create new volumes from snapshots; copy across regions. Snapshots are incremental — only changed blocks are stored.
- **EBS-optimized instances:** dedicated bandwidth for EBS I/O.

---

## 3. Amazon S3 (Simple Storage Service)

**S3** is _object storage_ — massively scalable, durable (99.999999999% / 11 nines durability), and accessed over HTTP(S)/HTTPS via a flat bucket namespace.

### 3.1 Core concepts

- **Bucket:** a top-level container (its name must be globally unique across all AWS accounts).
- **Object:** the stored unit = key (name) + value (data) + metadata + version ID.
- **Key:** the unique identifier for an object within a bucket (like a path, but the namespace is flat).
- **Region:** buckets are created in a Region; data is stored there (choose for latency/compliance).

### 3.2 S3 characteristics

- **Durability/availability:** 11 nines object durability; 99.99% availability.
- **Versioning:** keep multiple versions of an object to protect against accidental deletes/overwrites.
- **Lifecycle policies:** transition objects between storage classes and expire them automatically.
- **Server-side encryption (SSE):** SSE-S3, SSE-KMS, or SSE-C.
- **Access control:** IAM policies, bucket policies, ACLs, and bucket/object public settings (careful — see Practical 6 & 7).
- **Static website hosting:** host static sites directly from a bucket (see Practical 7) — combine with enabled Website Hosting.
- **Cross-region replication (CRR):** replicate buckets across regions for DR/compliance.

### 3.3 S3 storage classes (the "tiers")

| Class                                           | Use case                            | Notes                                                       |
| ----------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| **S3 Standard**                                 | Frequently accessed data            | Default; lowest latency; highest cost                       |
| **S3 Intelligent-Tiering**                      | Unknown/changing access patterns    | Auto-moves objects between tiers for a small monitoring fee |
| **S3 Standard-IA**                              | Infrequent but important access     | Lower storage cost, retrieval fee                           |
| **S3 One Zone-IA**                              | Infrequent, easily recreatable data | Stored in one AZ only (lower durability)                    |
| **S3 Glacier (Instant/ Flexible/Deep Archive)** | Archival                            | See section 5                                               |
| **S3 Glacier Deep Archive**                     | Long-term cold archive              | Cheapest storage, longest retrieval (12 hrs)                |

---

## 4. Amazon EFS (Elastic File System)

**EFS** provides a fully managed, scalable _file system_ (NFS) that can be mounted on _multiple_ EC2 instances simultaneously — a shared filesystem for Linux workloads.

- **Elastic:** grows and shrinks automatically as you add/remove files; no provisioning of capacity.
- **Use cases:** shared content, web serving, content management, big-data analytics, home directories.
- **Performance modes:** General Purpose (default) and Max I/O (for high throughput).
- **Throughput modes:** Bursting (burstable) and Provisioned.
- **Access:** mount via `mount -t nfs4` using an EFS mount target in your VPC; works with security groups to control access.
- **Lifecycle:** transition infrequently accessed files to EFS IA (Infrequent Access) to save cost.

> **Note:** EBS is _block_ storage for a single instance; EFS is a _shared file system_ for many instances. New students often confuse these — remember "EBS = a disk for one VM; EFS = a network drive shared by many VMs."

---

## 5. Amazon S3 Glacier

**Glacier** is AWS's _archival_ storage class — extremely cheap but designed for rarely accessed data with retrieval taking from minutes to hours.

### 5.1 Three main tiers

| Tier                           | Retrieval                        | Use case                                      |
| ------------------------------ | -------------------------------- | --------------------------------------------- |
| **Glacier Instant Retrieval**  | Milliseconds                     | Archive that may be accessed occasionally     |
| **Glacier Flexible Retrieval** | Minutes to hours (1–12 hr tiers) | Archives, backups, recovery                   |
| **Glacier Deep Archive**       | Up to 12 hours                   | Coldest, rarely accessed, long-term retention |

### 5.2 Key points

- **Cost:** lowest storage price on AWS, but you pay **retrieval fees** (per GB retrieved) and per-request costs.
- **Lifecycle:** use the3 lifecycle policies to move objects Standard → IA → Glacier → Deep Archive automatically as data ages.
- **Retrieval options:** Expedited (a few minutes, higher cost), Standard (3–5 hours), Bulk (5–12 hours).
- **Vaults & archives:** the classic Glacier API uses _vaults_ and _archives_; the S3 Glacier storage classes integrate with S3 object lifecycle.
- **Security:** supports SSE, IAM, and Vault Lock policies (write-once-read-many / WORM compliance).

---

## 6. Storage Technology Selection

Choosing the right storage = matching **access pattern**, **size**, **performance**, **durability**, and **cost** to the workload.

### 6.1 Decision framework

1. **Is it a database, OS disk, or needs low-latency random I/O?** → **Block (EBS)** for a single EC2 instance.
2. **Do multiple Linux instances need a shared, growing file system?** → **File (EFS)**.
3. **Is it files/objects served over HTTP, static assets, backups, or data lake?** → **Object (S3)**.
4. **Is the data archival/cold?** → **Glacier** (move via S3 lifecycle).
5. **Is it a structured relational dataset?** → use a database service (RDS/Aurora), not EBS/S3.
6. **Compliance/latency/region?** → choose Region and storage class accordingly.

### 6.2 Summary table

| Workload                                           | Recommended storage          |
| -------------------------------------------------- | ---------------------------- |
| EC2 boot volume / OS disk                          | EBS (gp3)                    |
| Databases requiring high IOPS                      | EBS io1/io2 (or RDS-managed) |
| Shared Linux file system across instances          | EFS                          |
| Static website, images, videos, backups, data lake | S3                           |
| Long-term archive / compliance retention           | S3 Glacier / Deep Archive    |
| Content served globally with low latency           | S3 + CloudFront (CDN)        |

---

## 7. Amazon RDS (Relational Database Service)

**RDS** makes it easy to set up, operate, and scale a _relational database_ in the cloud. You get a managed DB engine — AWS handles patching, backups, replication, failover, and storage.

### 7.1 Supported engines

MySQL · PostgreSQL · MariaDB · Oracle · SQL Server · and Amazon Aurora.

### 7.2 Core features

- **Managed:** automated backups, snapshots, software patching, minor version upgrades.
- **Multi-AZ:** synchronous standby replica in another AZ for high availability (automatic failover).
- **Read replicas:** up to 15 async read replicas for read scaling (not automatic failover).
- **Storage:** provisioned storage, auto-scaling option; uses EBS compression (gp2/gp3/io1).
- **Security:** VPC isolation, IAM, encryption (KMS), SSL/TLS, parameter groups.
- **You still manage:** schema, tuning, indexes, and may choose instance size; you do **not** manage the OS/DB binaries.

### 7.3 When to use

Transactional workloads (OLTP), web apps, e-commerce, and any app that needs SQL with ACID guarantees — without managing the server.

---

## 8. Amazon DynamoDB

**DynamoDB** is a fully managed _NoSQL key-value and document database_ that delivers single-digit-millisecond performance at any scale.

### 8.1 Key concepts

- **Tables, items, attributes:** a table holds items (rows); each item has attributes (columns). No fixed schema.
- **Primary key:** partition key (and optional sort key) — you must design the key for even access.
- **Eventually consistent reads (default)** vs. **strongly consistent reads** (higher cost).
- **On-Demand vs. Provisioned capacity mode** for read/write throughput.
- **DAX (DynamoDB Accelerator):** in-memory cache for microsecond reads.
- **Global tables:** multi-region, multi-master replication for low-latency global access.
- **TTL:** expire items automatically (e.g., session data).

### 8.2 Use cases

Serverless apps, real-time analytics, gaming (leaderboards), IoT, session/cart data, and any workload needing predictable low-latency at massive scale.

### 8.3 DynamoDB vs. RDS

| Aspect     | RDS (relational)                     | DynamoDB (NoSQL)                         |
| ---------- | ------------------------------------ | ---------------------------------------- |
| Data model | Tables with fixed schema, SQL, joins | Key-value / document, schema-less        |
| Scaling    | Vertical + read replicas             | Horizontal, automatic, serverless        |
| Best fit   | Transactional, complex queries, BI   | High-scale, low-latency, flexible schema |

## 9. Amazon Redshift

**Redshift** is a fully managed, _petabyte-scale data warehouse_ based on columnar storage and massively parallel processing (MPP).

### 9.1 Purpose

Analyze huge datasets with SQL (OLAP / business intelligence) — not for OLTP transactions, but for complex analytical queries over billions of rows.

### 9.2 Key concepts

- **Cluster:** a set of nodes (leader node + compute nodes).
- **Columnar storage:** data stored by column → highly compact, fast aggregations.
- **Massively Parallel Processing (MPP):** queries are parallelized across nodes.
- **Node types:** Dense Compute (DC2) and Dense Storage (DS2/RA3).
- **Redshift Spectrum:** query data directly in S3 without loading it.
- **Concurrency scaling:** adds query capacity automatically during bursts.
- **Integrations:** works with S3 (COPY from S3, UNLOAD to S3), QuickSight, and other BI tools.

### 9.3 When to use

BI/reporting, analytics, time-series aggregations, and ad-hoc analytical queries over large data. Not designed for point lookups or high-write transactional workloads.

---

## 10. Amazon Aurora

**Aurora** is a MySQL- and PostgreSQL-compatible _relational database engine built for the cloud_, offering the performance and availability of commercial databases at one-tenth the cost.

### 10.1 Key features

- **Compatibility:** Drop-in replacement for MySQL and PostgreSQL (same drivers/tools).
- **Performance:** up to 5× MySQL and 3× PostgreSQL throughput vs. standard RDS.
- **Storage:** distributed, self-healing storage that scales automatically (up to 128 TiB).
- **Durability/HA:** six copies of data across three AZs; automatic failover (typically < 30 seconds).
- **Replication:** up to 15 read replicas; Global Database for cross-region.
- **Serverless:** Aurora Serverless v2 scales compute automatically on demand.
- **Backtrack:** in-place time-travel to restore a DB to a previous point without restoring from backup.

### 10.2 RDS vs. Aurora

| Aspect      | RDS                                            | Aurora                                                        |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Engines     | MySQL, PostgreSQL, MariaDB, Oracle, SQL Server | MySQL-, PostgreSQL-compatible (custom engine)                 |
| Storage     | EBS-based (provisioned)                        | Distributed auto-scaling (to 128 TiB)                         |
| Performance | Standard                                       | Up to 5× MySQL / 3× PostgreSQL                                |
| Cost        | Pay for provisioned storage                    | Slightly higher per-hour, but lower total for large workloads |

### 10.3 When to use

When you need relational DB compat (MySQL/PostgreSQL) with cloud-native performance, HA, and scalability — e.g., SaaS apps, e-commerce, and web backends.

---

## 11. Implementation Tips & Tricks

- **EBS → S3 for backups:** take EBS snapshots (stored in S3) — they're incremental and cheap; use lifecycle policies to move old snapshots to Glacier.
- **Use gp3 by default** on new EBS volumes — cheaper and more flexible than gp2.
- **Mind AZ locality:** an EBS volume only attaches to an instance in the _same_ AZ; plan placement.
- **S3 bucket names are globally unique** — prefix with your org/project (e.g., `myco-static-assets`).
- **Never make an S3 bucket public by accident** — use S3 Block Public Access; serve private content via CloudFront signed URLs.
- **For static sites (Practical 7):** enable _Static website hosting_, add a bucket policy for `s3:GetObject` on `arn:aws:s3:::bucket/*` (public reads), and use the **Endpoint** URL.
- **Use S3 lifecycle to save money:** move Standard → IA → Glacier → Deep Archive automatically.
- **EFS is for Linux/shared; EBS is per-instance block.** Use EFS for shared state; use EBS for OS/database disks.
- **RDS multi-AZ for HA; read replicas for read scaling** — don't use replicas to survive a primary failure (they're async and don't auto-failover).
- **DynamoDB On-Demand mode** for unpredictable traffic; Provisioned for steady high traffic; design partition keys to avoid hot partitions.
- **Redshift:** choose node types by workload; use Redshift Spectrum to query S3 for cold analytics.
- **Aurora Serverless v2** for variable, bursty relational workloads; enable Backtrack for quick point-in-time recovery.
- **Enable encryption (KMS) at rest** for EBS, S3, RDS, and Redshift by default where the budget allows.

---

## 12. External Links (Curated Placeholders)

**Block & file storage:**

- Amazon EBS docs: https://docs.aws.amazon.com/ebs/
- EBS volume types: https://aws.amazon.com/ebs/volume-types/
- Amazon EFS docs: https://docs.aws.amazon.com/efs/
- Mounting EFS: https://docs.aws.amazon.com/efs/latest/ug/mounting-fs.html

**Object & archive storage:**

- Amazon S3 docs: https://docs.aws.amazon.com/s3/
- S3 storage classes: https://aws.amazon.com/s3/storage-classes/
- S3 static website hosting: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- S3 Glacier: https://aws.amazon.com/glacier/

**Databases:**

- Amazon RDS: https://aws.amazon.com/rds/
- Amazon DynamoDB: https://aws.amazon.com/dynamodb/
- Amazon Redshift: https://aws.amazon.com/redshift/
- Amazon Aurora: https://aws.amazon.com/rds/aurora/
- Choosing the right AWS database: https://aws.amazon.com/products/databases/

**Interactive / learning:**

- AWS Storage fundamentals (video playlists): AWS "Storage" channel on YouTube.
- AWS Database & Analytics training: AWS Skill Builder.

**Video tutorials (YouTube placeholders):**

- "AWS S3 Crash Course" — freeCodeCamp / AWS
- "AWS EBS vs EFS vs S3 explained" — AWS
- "AWS RDS vs DynamoDB vs Redshift" — Data with Jay / Stephane Maarek
- "AWS Aurora overview" — AWS
- "S3 lifecycle & Glacier" — AWS
