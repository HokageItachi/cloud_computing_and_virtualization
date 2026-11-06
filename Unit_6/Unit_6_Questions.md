# CSE423: Virtualization and Cloud Computing — Unit VI Questions

**Topics:** AWS storage (EBS, S3, EFS, Glacier) · storage technology selection · AWS databases (RDS, DynamoDB, Redshift, Aurora)

---

## Part A — Multiple Choice Questions (MCQs)

### Instructions
Choose the single best answer for each question. Answers with explanations are at the end of Part A.

**Q1.** Which AWS storage service provides persistent block-level volumes that attach to a single EC2 instance (in the same Availability Zone)?
- A) Amazon S3
- B) Amazon EBS
- C) Amazon EFS
- D) Amazon Glacier

**Q2.** Which service is best described as a shared, elastic NFS file system that many EC2 instances can mount at once?
- A) Amazon EBS
- B) Amazon S3
- C) Amazon EFS
- D) Amazon DynamoDB

**Q3.** Amazon S3 is best categorized as:
- A) Block storage
- B) Object storage
- C) File storage
- D) A relational database

**Q4.** Which S3 storage class provides the lowest storage cost and is meant for cold, long-term archives with retrieval times of up to ~12 hours?
- A) S3 Standard
- B) S3 Standard-IA
- C) S3 One Zone-IA
- D) S3 Glacier Deep Archive

**Q5.** A developer wants to host a static website with minimal cost. Which AWS service is the most appropriate?
- A) Amazon EBS
- B) Amazon S3 (Static website hosting)
- C) E RDS
- D) Amazon Redshift

**Q6.** Which database is a fully managed NoSQL key-value/document service with single-digit-millisecond performance and no fixed schema?
- A) Amazon RDS
- B) Amazon DynamoDB
- C) Amazon Redshift
- D) Amazon Aurora

**Q7.** Which service is a petabyte-scale columnar data warehouse used for analytical (OLAP) queries?
- A) Amazon RDS
- B) Amazon DynamoDB
- C) Amazon Redshift
- D) Amazon EFS

**Q8.** What is the main difference between Amazon RDS and Amazon Aurora?
- A) Aurora supports only SQL Server
- B) Aurora is a MySQL-/PostgreSQL-compatible engine with cloud-native distributed storage and up to 5× MySQL performance
- C) RDS is serverless and Aurora is not
- D) There is no difference; they are the same service

**Q9.** Which EBS volume type is designed for high, consistent IOPS (commonly used for production databases)?
- A) gp3
- B) io1 / io2 (Provisioned IOPS SSD)
- C) st1
- D) sc1

**Q10.** A "snapshot" of an EBS volume is stored in:
- A) A separate EBS volume
- B) Amazon S3 (incrementally)
- C) Amazon EFS
- D) DynamoDB

---

### Answers & Explanations

**A1. B) Amazon EBS.**
EBS is block storage attached to a single instance within the same AZ. S3 is object, EFS is file, Glacier is archive.

**A2. C) Amazon EFS.**
EFS is a managed NFS file share mountable by many instances. EBS is per-instance block; S3 is object storage.

**A3. B) Object storage.**
S3 stores objects (key + data + metadata) over HTTPS in buckets — it is not block or file storage, and not a database.

**A4. D) S3 Glacier Deep Archive.**
Deep Archive is the cheapest class with the longest retrieval (~12 hours). Standard has fast retrieval but highest cost.

**A5. B) Amazon S3 (Static website hosting).**
S3 can serve static HTML/CSS/JS directly via its website endpoint — the simplest, cheapest static-site host.

**A6. B) Amazon DynamoDB.**
DynamoDB is the managed NoSQL key-value/document database with single-digit-ms reads and schema-less items.

**A7. C) Amazon Redshift.**
Redshift is the columnar MPP data warehouse for OLAP analytics. RDS and Aurora are transactional databases; EFS is file storage.

**A8. B) Aurora is a MySQL-/PostgreSQL-compatible engine with cloud-native distributed storage and up to 5× MySQL performance.**
Aurora is built for the cloud, with up to 5× MySQL / 3× PostgreSQL throughput, auto-scaling storage to 128 TiB, and six copies of data across three AZs.

**A9. B) io1 / io2 (Provisioned IOPS SSD).**
Provisioned IOPS volumes deliver consistent high IOPS for demanding database workloads. st1/sc1 are HDD tiers; gp3 is general purpose.

**A10. B) Amazon S3 (incrementally).**
EBS snapshots are incremental point-in-time backups stored in S3 — only changed blocks are saved after the first snapshot.

---

## Part B — Subjective Questions

### Short-Answer Questions

**SA1. Differentiate between EBS, EFS, and S3.**

**Model Answer:**
- **EBS:** block-level storage attached to a single EC2 instance in the same AZ — like a virtual hard disk; persistence independent of the instance; supports snapshots.
- **EFS:** managed, elastic NFS file system mountable by many Linux instances simultaneously — for shared files that grow automatically.
- **S3:** object storage — flat namespace of objects (key/data/metadata) over HTTPS; massively scalable, 11-nines durability; used for static assets, backups, data lakes, and website hosting.

**SA2. List the main S3 storage classes and when you would choose each.**

**Model Answer:**
1. **S3 Standard** — frequently accessed data.
2. **S3 Intelligent-Tiering** — unknown or changing access patterns (auto tiers).
3. **S3 Standard-IA** — infrequent but important data (lower storage cost, retrieval fee).
4. **S3 One Zone-IA** — infrequent data recreatable easily, stored in one AZ.
5. **Glacier (Instant/Flexible)** — archival with millisecond-to-hours retrieval.
6. **Glacier Deep Archive** — coldest, cheapest archive with ~12-hr retrieval.

**SA3. What is a Multi-AZ deployment in RDS and what does it provide?**

**Model Answer:**
A Multi-AZ RDS deployment maintains a synchronous standby replica of the primary database in another Availability Zone. It provides **high availability**: if the primary fails, AWS automatically fails over to the standby in ~60–120 seconds. It is not used for read scaling — that is the job of read replicas.

**SA4. Compare Amazon RDS and Amazon DynamoDB.**

**Model Answer:**
- **RDS:** managed relational (SQL) database (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora). Fixed schema, joins, ACID transactions. Scales vertically and with read replicas.
- **DynamoDB:** managed NoSQL key-value/document database. Schema-less, scales horizontally automatically with low latency. Best when you need massive scale and flexible data models and don't need complex SQL joins.

**SA5. When should you choose Amazon Redshift over Amazon RDS?**

**Model Answer:**
Choose **Redshift** for analytical/OLAP workloads over huge datasets (data warehousing, BI, historical aggregations) using columnar storage and MPP. Choose **RDS** for transactional/OLTP workloads (e.g., user accounts, orders) with many small reads/writes and ACID guarantees — Redshift is not designed for high-frequency point transactions.

### Long-Answer / Analytical Questions

**LA1. Walk through uploading a file to S3 and hosting a static website, explaining bucket creation, permissions, and the endpoint.**

**Model Answer (step-by-step):**
1. **Create a bucket** (S3 → Create bucket) with a globally unique name, choose a Region; uncheck "Block all public access" only if you intend public reads (with care).
2. **Enable static website hosting** (Properties tab) → select "Static website hosting", set the index document (`index.html`) and error document (`error.html`); note the generated **Endpoint** URL.
3. **Upload objects** (files) via console `aws s3 cp` or drag-and-drop; ensure the file name matches the index document.
4. **Set permissions:** add a bucket policy granting `s3:GetObject` to `arn:aws:s3:::your-bucket/*` for `Principal: "*"` (public read). If not public, use CloudFront with signed URLs —5. **Test:** open the Endpoint URL in a browser to confirm the page loads.
6. **Optional:** attach CloudFront for a custom domain, HTTPS, and caching.

**LA2. Explain EBS snapshots: how they work (incremental), how to restore, and how to copy across regions. Include a scenario.**

**Model Answer (step-by-step):**
1. **Create a snapshot:** select the EBS volume → Actions → Create snapshot. Optionally stop the instance for a consistent volume.
2. **Incremental mechanism:** only data blocks that changed since the previous snapshot are stored; the first snapshot stores the full volume. Deleting an old snapshot never corrupts later ones (the latest holds continuity).
3. **Store in S3:** snapshots are stored durably in S3 (you pay per GB stored).
4. **Restore:** from a snapshot you can (a) create a *new EBS volume* (state restore) or (b) create a new AMI to launch instances from it.
5. **Cross-region copy:** copy the snapshot to another region for DR; create a volume/AMI there.
6. **Scenario:** before upgrading a database, take a snapshot. If the upgrade fails, restore by creating a new volume from the snapshot and attaching it to the instance, or from a pre-upgrade AMI.

**LA3. Compare S3, EBS, and EFS across durability, performance, use case, and cost, then recommend storage for: (a) a static website, (b) a database volume, (c) a shared codebase across instances.**

**Model Answer (step-by-step):**
1. Build a comparison table: S3 (object, 11-nines durability, HTTP access, cheap per GB, best for static/data lake/backups); EBS (block, single-instance, low latency, per-GB + IOPS cost, best for OS/database disks); EFS (file/NFS, shared multi-instance, elastic, cost per GB, best for shared content).
2. **(a) Static website → S3** (host directly; add CloudFront for delivery).
3. **(b) Database volume → EBS** (io1/io2 for high IOPS, or use managed RDS/Aurora which use EBS under the hood and handle snapshots).
4. **(c) Shared codebase across instances → EFS** (mounted by many EC2 instances at once, elastic).
5. **Conclusion:** match the storage "shape" (object/file/block) to the access pattern; use lifecycle policies to tier cost.

---

## Part C — Exam Tips
- Remember the **"shape" rule**: EBS = block (one instance), EFS = file (many instances), S3 = object (HTTPS).
- Know the **storage classes in order of cost** and their retrieval times (Standard → IA → Glacier → Deep Archive).
- **RDS** = managed relational (SQL); **DynamoDB** = NoSQL key-value; **Redshift** = OLAP warehouse; **Aurora** = cloud-native MySQL/PostgreSQL-compatible engine.
- Connect to the practicals: Practical 6 (S3 bucket), Practical 7 (static website in S3), and Practical 3 (regions/AZs) all depend on this unit.
- For analytical questions, always show you can map workloads to the right storage/database service.

---

## Part D — Quick-Reference (abridged)
| Service | Type | Key facts |
|---------|------|-----------|
| **EBS** | Block | Per-instance; snapshots in S3; gp3 default; io1/io2 for IOPS. |
| **S3** | Object | 11-nines durability; buckets globally unique; classes Standard→Deep Archive; static hosting. |
| **EFS** | File | Shared NFS; elastic; Linux instances. |
| **Glacier** | Archive | Cheapest; minutes–12hr retrieval; lifecycle transitions. |
| **RDS** | Relational | SQL engines; Multi-AZ HA; read replicas; managed. |
| **DynamoDB** | NoSQL | Key-value/document; single-digit-ms; on-demand/provisioned; TTL. |
| **Redshift** | Warehouse | Columnar MPP; OLAP; Spectrum to query S3. |
| **Aurora** | Relational | MySQL/PG-compatible; 5×/3× perf; 128 TiB auto storage; Serverless. |
