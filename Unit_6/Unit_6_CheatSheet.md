# CSE423 — Unit VI Cheat Sheet (One-Page Revision)

**Topics:** Amazon EBS · S3 · EFS · S3 Glacier · Storage technology selection · RDS · DynamoDB · Redshift · Aurora

---

## 1. Storage Services — At a Glance
| Service | Type | Use case |
|---------|------|----------|
| **EBS** | Block storage (network-attached) for one EC2 | OS/database volumes, low-latency |
| **S3** | Object storage, highly durable, unlimited | Files, backups, static web, data lakes |
| **EFS** | Network file system (NFS) for many instances | Shared file storage, Linux |
| **Glacier** | Archival object storage (S3 class) | Long-term, rarely accessed backups |
| (Instance Store) | Ephemeral block storage on the host | Cache/temp data (lost on stop) |

## 2. Amazon EBS
- Block-level storage volumes attached to EC2 (like a virtual disk). Survives instance stop; **persists** independently.
- **Volume types:** gp2/gp3 (general SSD), io1/io2 (provisioned IOPS), st1/sc1 (HDD throughput/cold).
- **Snapshots:** point-in-time backups stored in S3; can create new volumes/AMIs; cross-region copy.
- **Features:** encryption (KMS), multi-attach (limited), resizing, lifecycle.
- **Note:** EBS is *per-AZ*; attach only to instances in same AZ.

## 3. Amazon S3 (Simple Storage Service)
- **Object storage** — store files (objects) in **buckets** (global namespace, per-region).
- **Key concepts:** bucket, object (key + data + metadata), prefixes/folders (virtual).
- **Durability/availability:** 99.999999999% (11 nines) durability; 99.99% availability (standard).
- **Storage classes:** Standard → Intelligent-Tiering → Standard-IA → One Zone-IA → Glacier (Flexible/Deep Archive).
- **Versioning, lifecycle policies (auto-tier/expire), static website hosting, presigned URLs, encryption (SSE-S3/KMS/C), bucket policies, ACLs.**
- **Cost:** per GB-month + requests + data transfer (egress charged).

## 4. Amazon EFS
- Managed **NFS file system** — elastic, scalable, shared across many EC2 instances (and on-prem via Direct Connect).
- **Performance modes:** General Purpose vs Max I/O; throughput modes: Bursting vs Provisioned.
- **Storage classes:** Standard vs Infrequent Access (IA) — lifecycle moves files.
- **Linux-only** (NFS); not for Windows (use FSx for Windows instead).

## 5. Amazon S3 Glacier
- Low-cost archival storage (within S3 family). **Retrieval options:** Expedited (minutes), Standard (3–5 h), Bulk (5–12 h).
- **Classes:** S3 Glacier Flexible Retrieval (ex-Glacier) and S3 Glacier Deep Archive (cheapest, ~12 h retrieval).
- Use **lifecycle policies** to auto-archive S3 objects → Glacier after N days.

## 6. Storage Technology Selection (How to Choose)
1. **Block (EBS) vs File (EFS) vs Object (S3):** block = OS/db disks; file = shared/NFS; object = scale-out web/backup/data lake.
2. **Access frequency:** hot → S3 Standard; warm → IA; cold/archive → Glacier.
3. **Compute coupling:** single instance → EBS; many Linux instances → EFS.
4. **Durability/retention/regulatory** → Glacier + versioning (WORM/object lock).
5. **Cost vs performance trade-off:** provisioned IOPS for DB vs standard for bulk.

## 7. Amazon RDS (Relational Database Service)
- Managed relational DB supporting **MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora**.
- **Managed features:** automated backups, Multi-AZ (standby replica), read replicas, patching, scaling, encryption, monitoring.
- You still choose instance class, storage, engine; AWS handles ops.

## 8. Amazon DynamoDB
- Fully managed **NoSQL key-value/document** database. **Serverless**, single-digit-ms latency, scales automatically.
- **Concepts:** tables, items, attributes; **partition key** (required) + optional sort key; primary key = partition or partition+sort.
- **Capacity:** on-demand vs provisioned (RCU/WCU); supports TTL, streams, global tables, DAX cache.
- Best for: high-scale web, gaming, session data, IoT, shopping carts.

## 9. Amazon Redshift
- **Data warehouse** (columnar, SQL, petabyte-scale) for **OLAP/analytics** over huge datasets.
- Uses S3 for staging, can query S3/Glue catalog (spectrum). MPP (massively parallel) clusters. Not for OLTP.

## 10. Amazon Aurora
- **MySQL/PG-compatible relational database** built for cloud — up to 5× faster than MySQL, 3× than PG; distributed storage across 3 AZs, 6 replicas.
- **Features:** auto-scaling storage, read replicas, Multi-AZ, performance insights, serverless option.
- Cost: more than standard RDS, but high performance/availability.

---

## Memory aids
- **EBS = block = one VM's disk / S3 = object = bucket of files / EFS = file = shared NFS.**
- **S3 durability = "11 nines" (99.999999999%).**
- **Glacier retrieval speed:** "Expedited = minutes, Standard = 3–5 h, Bulk = 5–12 h."
- **DynamoDB = 'DB' + 'NoSQL + serverless + single-digit-ms'.** **Redshift = 'warehouse/OLAP'.**
- **Aurora = 'MySQL/PG-compatible, 5× faster, cloud-native'.**

## Quick carry-away
> Pick storage by access pattern: block for disks, file for shared, object for scale-out/backup; move cold data to Glacier via lifecycle. Choose DB by workload: RDS for managed SQL, Aurora for performance, DynamoDB for NoSQL scale, Redshift for analytics.

## External links (shortlist)
- EBS docs: docs.aws.amazon.com/ebs
- S3 docs: docs.aws.amazon.com/AmazonS3
- EFS docs: docs.aws.amazon.com/efs
- Glacier docs: docs.aws.amazon.com/AmazonS3/latest/userguide/glacier
- Storage services overview: aws.amazon.com/products/storage
- RDS docs: docs.aws.amazon.com/AmazonRDS
- DynamoDB docs: docs.aws.amazon.com/amazondynamodb
- Redshift docs: docs.aws.amazon.com/redshift
- Aurora docs: docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide
