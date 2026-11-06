# CSE423 — Unit V Cheat Sheet (One-Page Revision)

**Topics:** AWS compute overview · Amazon EC2 · EC2 pricing & cost optimization · managed compute services · container services

---

## 1. AWS Compute — Overview
- Services that provide processing power in the cloud:
  - **EC2** — virtual servers (most flexible/control).
  - **Lambda** — serverless functions (event-driven).
  - **Elastic Beanstalk** — PaaS, auto-managed app deployment.
  - **ECS / EKS / Fargate** — containers.
  - **Lightsail** — simple VPS for beginners.
  - **Batch** — batch compute jobs.

## 2. Amazon EC2 Basics
- **EC2 = Elastic Compute Cloud** — resizable virtual servers (instances) in the cloud.
- **Key components:**
  - **AMI (Amazon Machine Image)** — template: OS + software + config.
  - **Instance type** — family + size (e.g., t2.micro, m5.large, c5.xlarge).
  - **Instance family letters:** t (burstable/general), m (general), c (compute), r (memory), i/d (storage), g/p (GPU), etc.
  - **Key pair** — SSH (Linux) / RDP password (Windows) auth.
  - **Security group** — instance-level firewall (allow inbound/outbound).
  - **EBS volume** — attached block storage (root volume).
  - **VPC/Subnet** — network placement (public/private).
- **Launch flow:** choose AMI → instance type → configure network/storage → security group → key pair → launch.

## 3. EC2 Pricing Models
| Plan | How it works | Best for |
|------|--------------|----------|
| **On-Demand** | Pay per second/hour, no commitment | Variable/unpredictable, short-term |
| **Reserved (RI)** | 1–3 yr commitment, big discount (up to 72%) | Steady, predictable workloads |
| **Savings Plans** | Commit to $/hr for 1–3 yr (compute or EC2) | Flexible usage across instances |
| **Spot** | Bid for spare capacity, up to 90% off, can be reclaimed | Fault-tolerant, batch, stateless |
| **Dedicated Hosts/Instances** | Physical server for you (compliance/licensing) | Regulatory, BYOL |
- **Data transfer:** egress (out) charged; ingress mostly free; inter-AZ charged.

## 4. Cost Optimization Techniques
- **Right-sizing:** match instance type to actual utilization (CloudWatch metrics).
- **Use Spot for interruptible workloads; Reserved/Savings Plans for baseline.**
- **Auto Scaling + Elastic Load Balancing:** scale to demand, terminate idle.
- **Use the cheapest instance family for the job; consider ARM (Graviton) instances.**
- **Move dev/test to on-demand briefly / schedule stop-start for non-production.**
- **EBS optimization:** choose gp3/io2 types, delete unattached volumes, use snapshots.
- **Monitor with Cost Explorer, budgets, and CloudWatch alarms.**
- **Tag resources for cost allocation.**

## 5. Managed Compute Services
- **AWS Lambda:** serverless — run code without provisioning servers; scales automatically; **per-invocation billing** (requests + duration). Event sources: S3, API Gateway, DynamoDB, SQS, etc. Limits: 15-min max duration, memory 128MB–10GB.
- **Elastic Beanstalk:** PaaS — you upload code, AWS handles capacity, load balancing, scaling, health monitoring.
- **Lightsail:** simplified VPS with fixed monthly price, includes storage/network bundle.

## 6. Container Services
- **Container:** packages app + dependencies; shares host kernel; lightweight, portable.
- **Docker** — image/container runtime. **ECS (Elastic Container Service)** — AWS's container orchestrator (uses Fargate or EC2). **EKS (Elastic Kubernetes Service)** — managed Kubernetes. **Fargate** — serverless compute for containers (no EC2 management).
- **ECS vs EKS:** ECS = AWS-native, simpler; EKS = open-source Kubernetes standard, portable.
- **Fargate vs EC2 launch type:** Fargate = serverless (you don't manage nodes); EC2 = you manage the cluster instances (more control/cost-saving at scale).

---

## Memory aids
- **Instance families:** "t = tiny/burstable, m = mainstream/general, c = compute, r = RAM, g = GPU, i = IO/storage."
- **Pricing ladder:** On-Demand (highest, most flexible) → Reserved/Savings Plans (discount for commitment) → Spot (cheapest, interruptible).
- **Reduce cost order:** "Right-size first, then use Spot/Reserved, then auto-scale."
- **Lambda = "code, not servers"; Fargate = "containers, not servers".**

## Quick carry-away
> Choose the service by control needed: EC2 (max control) → Beanstalk (PaaS) → Lambda (serverless). Size the right instance family, mix On-Demand + Reserved/Savings + Spot, and auto-scale to keep the bill low.

## External links (shortlist)
- EC2 docs: docs.aws.amazon.com/ec2
- EC2 instance types: aws.amazon.com/ec2/instance-types
- EC2 pricing: aws.amazon.com/ec2/pricing
- Spot Instances: aws.amazon.com/ec2/spot
- Lambda docs: docs.aws.amazon.com/lambda
- ECS docs: docs.aws.amazon.com/ecs
- EKS docs: docs.aws.amazon.com/eks
- Fargate: aws.amazon.com/fargate
- AWS Compute Blog: aws.amazon.com/blogs/compute
