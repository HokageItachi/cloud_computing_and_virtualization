# CSE423: Virtualization and Cloud Computing — Unit V Notes

**Course:** CSE423: Virtualization and Cloud Computing
**Unit V Topics:** AWS Compute Services — Overview of compute services · Amazon EC2 · EC2 pricing & cost optimization · managed compute services · container services

---

## Table of Contents
1. AWS Compute Services Overview
2. Amazon EC2 — Fundamentals
3. EC2 Instance Types
4. Creating/Launching an EC2 Instance
5. EC2 Pricing Models
6. EC2 Cost Optimization
7. Managed Compute Services (Elastic Beanstalk, Lambda, Fargate, Lightsail)
8. Container Services (ECS, EKS, Fargate, Docker, Kubernetes)
9. Implementation Tips & Tricks
10. External Links

---

## 1. AWS Compute Services Overview

**Compute** = the processing power (CPU + memory) that runs your applications. AWS offers multiple compute options to match different needs:

| Service | Type | Best for |
|---------|------|----------|
| **EC2** | Virtual machines (IaaS) | Full control, custom OS, traditional apps |
| **Lightsail** | Simple VPS | Simple websites, easy setup |
| **Lambda** | Serverless functions (FaaS) | Event-driven, short-lived code, no server mgmt |
| **Elastic Beanstalk** | PaaS (managed platform) | Deploying apps without managing infra |
| **ECS / EKS / Fargate** | Containers | Containerized apps, orchestration |
| **Batch** | Managed batch computing | HPC/batch jobs |
| **Elastic GPU / Parallel Computing / HPC** | Specialized compute | Graphics, scientific computing |
| **Outposts / Local Zones** | Hybrid/edge compute | On-prem/edge requirements |

**Choice guidance:** If you need full control → EC2; if you want to focus on code → container or serverless; if you want managed platform → Beanstalk.

---

## 2. Amazon EC2 — Fundamentals

**Amazon Elastic Compute Cloud (EC2)** = a web service that provides secure, resizable **virtual servers** (instances) in the cloud.

### 2.1 Core concepts
- **Instance:** a virtual machine (one VM = one instance) running an Amazon Machine Image.
- **AMI (Amazon Machine Image):** a template (OS + software + config) used to launch instances. Includes the root volume, launch permissions, and block device mapping.
- **Instance type:** the hardware profile (vCPU, RAM, storage, network, GPU).
- **Key pair:** SSH key (public/private) for secure login to Linux instances (Windows uses password/RDP).
- **Security group:** a virtual firewall controlling inbound/outbound traffic to the instance.
- **EBS volumes:** persistent block storage attached to instances (detail in Unit VI).
- **Elastic IP:** a static public IP address.
- **Placement groups:** strategies for placing instances (cluster, spread, partition).
- **User data:** scripts run at instance launch (bootstrap).

### 2.2 Instance lifecycle
`Pending` → `Running` → (`Stopping` → `Stopped`) → `Terminated`. You pay while Running (and storage for EBS even when stopped).

---

## 3. EC2 Instance Types

EC2 instance families are named by **family + size** (e.g., `t2.micro`, `m5.large`, `c5.xlarge`, `r5.2xlarge`).

**Family naming convention (letter = purpose):**
- **T** — Burstable/general purpose (t2, t3, t4g) — good for dev/test, low/steady load.
- **M** — General purpose (balanced compute/memory) — m5, m6g.
- **C** — Compute optimized (high CPU) — c5, c6g — for batch, web, ML inference.
- **R** — Memory optimized (high RAM) — r5, r6g — for in-memory caches, databases.
- **I / D / H** — Storage optimized (high I/O) — i3, d2, h1 — for big data, databases.
- **G / P / Inf** — Accelerated compute (GPU, FPGA, inference) — p4, g5, inf1 — for ML, rendering.
- **X / Z** — Memory/EPYC high-RAM — x1e, z1d.
- **U** — Ultra-high memory; **F** — FPGA.

**Naming breakdown:** `m5.large`: family `m` (general), generation `5`, size `large` (2 vCPU/8 GB for m5.large).

> **Practical 4 relevance:** you will choose an AMI (e.g., Amazon Linux 2) and an instance type (e.g., `t2.micro` free tier) and a key pair + security group.

---

## 4. Creating / Launching an EC2 Instance (you flow)

These are the high-level steps (full detail in Practicals guide):

1. **Sign in** to the AWS Console (use IAM user, region selected).
2. Go to **EC2 → Instances → Launch Instances**.
3. **Name** the instance and choose an **AMI** (OS).
4. Choose **Instance type** (e.g., `t2.micro` for free tier).
5. Configure **Key pair** (create or select; download the private `.pem`).
6. Configure **Network settings** (VPC, subnet, auto-assign public IP, **Security group** rules — e.g., allow SSH port 22 from your IP).
7. Configure **Storage** (EBS root volume size/type).
8. Add **User data** (optional bootstrap script) and **Tags**.
9. **Review & Launch** → download key → wait for `Running` state.
10. **Connect:** SSH (Linux) with the key, or RDP (Windows) using the admin password.

---

## 5. EC2 Pricing Models

| Model | How it works | When to use | Savings |
|-------|--------------|-------------|---------|
| **On-Demand** | Pay per second (or hour) with no commitment. | Spiky/short-lived, unpredictable workloads; dev/test. | None (list price). |
| **Reserved Instances (RI)** | Commit to 1 or 3 years (Standard or Convertible). | Steady, predictable 24/7 workloads. | ~30–60% (up to 72% with all-upfront + Convertible). |
| **Savings Plans** | Commit to a $/hr spend for 1 or 3 years across compute. | Flexible workload mix across EC2/Fargate/Lambda. | Similar to RI (~30–66%). |
| **Spot Instances** | Bid for spare capacity; can be interrupted with 2-min warning. | Stateless, fault-tolerant, batch, CI, ML training. | up to ~90%. |
| **Dedicated Hosts / Instances** | A physical server dedicated to you. | Compliance, licensing (BYOL), multi-tenant issues. | Pricing differs (no discount vs. on-demand but isolates you). |

**Billing details:**
- Linux on-demand: billed per-second (min 60s); Windows and some others per-hour.
- Pricing varies by **Region**, instance type, and AZ.
- You pay for **EBS volumes** separately (even when instance is stopped).
- **Data transfer** egress is charged; inter-AZ transfers too.

---

## 6. EC2 Cost Optimization

**Key levers:**
1. **Right-size:** analyze utilization (CloudWatch), downsize over-provisioned instances (e.g., a `t3.large` running at 5% CPU → `t3.small`).
2. **Use Reserved/Savings Plans** for steady loads (predictable baseline).
3. **Use Spot** for interruptible/stateless workloads.
4. **Autoscaling:** add/remove instances to match demand; set min/max; scale down off-hours.
5. **Stop idle resources:** stop dev/test instances outside working hours (you still pay for EBS, but not compute).
6. **Choose the right family/generation** (e.g., Graviton `g`/`m6g`/`c6g` are ~20% cheaper per performance).
7. **Use T-family burstable** for low/steady CPU bursts.
8. **Consolidate** with containers/serverless to reduce idle compute.
9. **Monitor with Cost Explorer / Budgets** to catch waste.
10. **Data transfer:** keep traffic in-region; use CloudFront for egress reduction.

---

## 7. Managed Compute Services

**Managed compute** = AWS handles the infrastructure so you focus on your app/code.

### 7.1 AWS Lambda (Serverless / FaaS)
- Run code without provisioning servers; only pay for **compute time actually used** (per request + duration).
- Event-driven: triggers from S3, DynamoDB, API Gateway, SQS, etc.
- Limits: execution timeout (default 3s/ up to 15 min), memory 128 MB–10,240 MB, ephemeral storage.
- Best for: APIs, cron-like jobs, image/event processing, automation.
- **Pros:** no servers to manage, auto-scales, cost-efficient for low/spiky loads.
- **Cons:** cold starts, timeout limits, not ideal for long-running stateful apps.

### 7.2 AWS Elastic Beanstalk (PaaS)
- Deploy your web app (code) without managing the platform.
- Automatically provisions and manages EC2, load balancing, autoscaling, health monitoring, and rolling updates.
- Supports Java, .NET, Node.js, Python, Ruby, PHP, Go, Docker.
- Best for: traditional web apps that want PaaS convenience.

### 7.3 AWS Fargate (Serverless containers)
- Run containers without managing the underlying EC2 instances or cluster.
- You define the container image and resources; Fargate runs and scales it.
- Works with ECS and EKS.
- Best for: containerized apps that want serverless simplicity.

### 7.4 Amazon Lightsail (Simple VPS)
- Simplified, fixed-price VPS for simple workloads (websites, dev).
- Includes compute, storage, DNS, load balancer with predictable pricing.

### 7.5 AWS Batch
- Fully managed batch processing at any scale (HPC, rendering, data processing).

---

## 8. Container Services

**Containers** package code + dependencies (OS-level virtualization from Unit I). AWS offers:

### 8.1 Amazon ECS (Elastic Container Service)
- Fully managed **container orchestration** service for Docker containers.
- Two launch types: **EC2** (you manage the cluster of instances) and **Fargate** (serverless — AWS manages compute).
- Uses task definitions, services, clusters; integrates with ALB, CloudWatch, IAM.

### 8.2 Amazon EKS (Elastic Kubernetes Service)
- Managed **Kubernetes** service (upstream Kubernetes).
- You run Kubernetes control plane managed by AWS; worker nodes run in your account (EC2 or Fargate).
- Good if you already use Kubernetes and want portability.

### 8.3 Amazon ECR (Elastic Container Registry)
- Managed **Docker container registry** to store and share images.

### 8.4 Docker & Kubernetes essentials
- **Docker:** builds and runs containers (images → containers). `Dockerfile` defines the image.
- **Kubernetes (K8s):** orchestrates containers across a cluster — scheduling, scaling, load balancing, self-healing, rolling updates.
- **Concepts:** Pod (smallest unit), Deployment, Service, Ingress, ConfigMap, Secret, Namespace.

**Docker vs. VM reminder (from Unit I):** containers share the host kernel (lightweight, fast start); VMs each have their own OS (heavier, more isolation).

**Which to choose:**
- **ECS** if you want a fully managed, simpler AWS-native orchestration.
- **EKS** if you need Kubernetes compatibility/portability.
- **Fargate** if you want to avoid managing instances altogether.

---

## 9. Implementation Tips & Tricks

- **Use `t2.micro` (or `t3.micro`) for the free tier** in labs (Practical 4) to avoid cost.
- **Always download the key pair (.pem)** when creating an instance; you can't re-download its later (you create a new one).
- **Fix your security group to your own IP** (e.g., SSH from `203.0.113.x/32`) — don't open port 22 to `0.0.0.0/0` (world).
- **Set `chmod 400 mykey.pem`** on Linux/Mac before SSH or the client will refuse the key.
- **Stop (not terminate) instances** between labs to keep running the EBS; terminate when fully done to stop all billing.
- **Use User data scripts** to bootstrap (e.g., install nginx on launch) — great for reproducibility.
- **For cost labs:** use the AWS Pricing Calculator to compare On-Demand vs. Reserved vs. Spot.
- **Enabled CloudWatch monitoring** and set alarms for high CPU to trigger autoscaling.
- **For containers:** use Fargate for simplicity; use EKS if you need Kubernetes portability; always tag images with a version.
- **Mind cold starts** with Lambda for latency-sensitive apps; warm up with provisioned concurrency if needed.

---

## 10. External Links (Curated Placeholders)

**EC2:**
- Amazon EC2 documentation: https://docs.aws.amazon.com/ec2/
- EC2 instance types: https://aws.amazon.com/ec2/instance-types/
- EC2 pricing: https://aws.amazon.com/ec2/pricing/
- EC2 free tier: https://aws.amazon.com/free/
- Launching an instance tutorial: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

**Managed compute / containers:**
- AWS Lambda docs: https://docs.aws.amazon.com/lambda/
- Elastic Beanstalk docs: https://docs.aws.amazon.com/elasticbeanstalk/
- Amazon ECS: https://aws.amazon.com/ecs/
- Amazon EKS: https://aws.amazon.com/eks/
- AWS Fargate: https://aws.amazon.com/fargate/
- Amazon Lightsail: https://aws.amazon.com/lightsail/
- Docker docs: https://docs.docker.com/
- Kubernetes docs: https://kubernetes.io/docs/

**Cost optimization:**
- AWS Cost Management / Cost Explorer: https://aws.amazon.com/aws-cost-management/
- AWS Pricing Calculator: https://calculator.aws/
- AWS cost optimization pillar (Well-Architected): https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html

**Video tutorials (YouTube placeholders):**
- "AWS EC2 Full Course" — freeCodeCamp
- "How to create an EC2 instance" — AWS / A Cloud Guru
- "AWS Lambda for beginners" — AWS / freeCodeCamp
- "ECS vs EKS vs Fargate explained" — AWS / Tech With Tim
- "Docker and Kubernetes in 1 hour" — freeCodeCamp
- "AWS EC2 Pricing (On-Demand vs Reserved vs Spot)" — AWS
