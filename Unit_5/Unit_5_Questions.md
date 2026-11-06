# CSE423: Virtualization and Cloud Computing — Unit V Questions

**Topics:** AWS compute services overview · Amazon EC2 · EC2 pricing & cost optimization · managed compute services · container services

---

## Part A — Multiple Choice Questions (MCQs)

### Instructions
Choose the single best answer for each question. Answers with explanations are at the end of Part A.

**Q1.** Which AWS compute service provides the most control by giving you virtual servers (instances) you fully manage?
- A) AWS Lambda
- B) Amazon EC2
- C) AWS Fargate
- D) Amazon EKS

**Q2.** An Amazon Machine Image (AMI) is:
- A) A firewall rule for EC2 traffic
- B) A template that includes the OS, software, and config used to launch an instance
- C) A billing report
- D) A VPC subnet setting

**Q3.** Which instance family is best suited for CPU-intensive workloads such as batch processing and video encoding?
- A) M (general purpose)
- B) T (burstable)
- C) C (compute optimized)
- D) R (memory optimized)

**Q4.** You need to run a steady, predictable 24/7 production workload. Which pricing model is most cost-effective?
- A) Spot Instances
- B) On-Demand
- C) Reserved Instances (or Savings Plans)
- D) Dedicated Hosts only

**Q5.** Which EC2 pricing model gives up to ~90% discount but can be interrupted with a 2-minute warning?
- A) On-Demand
- B) Reserved Instances
- C) Spot Instances
- D) Savings Plans

**Q6.** Which service runs your code without you provisioning or managing servers (event-driven, per-request + duration billing)?
- A) Amazon EC2
- B) AWS Lambda
- C) Amazon Lightsail
- D) Amazon ECR

**Q7.** A stateless container that should run without you managing the underlying EC2 instances or cluster is best run on:
- A) Amazon EKS with self-managed nodes
- B) AWS Fargate
- C) A Dedicated Host
- D) Amazon Lightsail

**Q8.** What is the smallest deployable unit in Kubernetes?
- A) Container
- B) Pod
- C) Deployment
- D) Service

**Q9.** Which of the following is NOT a valid EC2 instance lifecycle state?
- A) Pending
- B) Running
- C) Frozen
- D) Terminated

**Q10.** After the free tier, which best practice most directly reduces EC2 compute spend on an idle dev instance?
- A) Leaving it running forever
- B) Stopping it outside working hours (EBS still billed, compute stopped)
- C) Assigning an Elastic IP
- D) Moving it to a larger instance type

---

### Answers & Explanations

**A1. B) Amazon EC2.**
EC2 provides resizable virtual servers you fully control (IaaS). Lambda (A) is serverless, Fargate (C) and EKS (D) are container platforms.

**A2. B) A template that includes the OS, software, and config used to launch an instance.**
An AMI is the launch template (OS + software + root volume + launch permissions + block device mapping).

**A3. C) C (compute optimized).**
C-family instances (c5, c6g) have a high CPU-to-memory ratio for compute-intensive workloads. R is memory-optimized, M is balanced, T is burstable.

**A4. C) Reserved Instances (or Savings Plans).**
For steady, predictable workloads, committing to 1/3 years (RIs or Savings Plans) saves ~30–60%+ vs. on-demand. Spot (A) is risky for 24/7; on-demand (B) is the most expensive.

**A5. C) Spot Instances.**
Spot runs on spare capacity at up to ~90% discount but can be reclaimed with a 2-minute warning, so it requires fault-tolerant/stateless workloads.

**A6. B) AWS Lambda.**
Lambda is FaaS: you upload code, AWS runs it, billed per request and compute duration, and scales automatically.

**A7. B) AWS Fargate.**
Fargate is serverless compute for containers — you define the image and resources, and AWS runs/scales containers without you managing instances.

**A8. B) Pod.**
In Kubernetes a Pod is the smallest/simplest deployable unit (one or more containers sharing storage/network).

**A9. C) Frozen.**
Valid lifecycle states include Pending, Running, Stopping, Stopped, Terminated — there is no "Frozen" state.

**A10. B) Stopping it outside working hours.**
Stopping an instance stops compute billing (EBS still billed); terminating removes it entirely. A larger instance (D) would cost more.

---

## Part B — Subjective Questions

### Short-Answer Questions

**SA1. List the main AWS compute services and state the primary use case of each.**

**Model Answer:**
1. **EC2** — VMs (IaaS) with full control; for traditional or custom workloads.
2. **Lambda** — serverless functions (FaaS) for event-driven, short-lived code.
3. **Elastic Beanstalk** — PaaS that deploys and manages web apps automatically.
4. **Fargate** — serverless containers (with ECS/EKS) without managing instances.
5. **ECS / EKS** — container orchestration (ECS AWS-native; EKS for Kubernetes).
6. **Lightsail** — simple, fixed-price VPS for easy sites/dev.
7. **Batch** — managed batch/HPC jobs.

**SA2. Explain how EC2 instance types are named, using `m5.large` as an example.**

**Model Answer:**
EC2 families follow `Family + Generation + Size`:
- `m` = family/purpose (general purpose in this case).
- `5` = generation (5th gen hardware).
- `large` = size (vCPU/RAM tier, e.g., 2 vCPU / 8 GB).
So `m5.large` is a 5th-generation general-purpose instance of "large" size (2 vCPU, 8 GiB RAM). Other letters: `t` burstable, `c` compute-optimized, `r` memory-optimized, `g`-suffix (Graviton ARM), `p`/`g`/`inf` accelerated.

**SA3. Differentiate between On-Demand, Reserved Instances, and Spot pricing.**

**Model Answer:**
- **On-Demand:** pay per second/hour with no commitment; flexible but highest per-unit price; for spiky/unpredictable loads.
- **Reserved Instances:** commit to 1–3 years for a specific instance config; ~30–60% savings; for steady, predictable workloads.
- **Spot:** bid for spare capacity, up to ~90% off, but can be interrupted (2-min warning); for stateless, fault-tolerant workloads (batch, CI, ML).

**SA4. What are the benefits and limitations of using AWS Lambda over EC2?**

**Model Answer:**
Benefits: no servers to manage, automatic scaling, only pay for actual compute time, ideal for event-driven short-lived tasks, no idle cost.
Limitations: execution timeout (up to 15 minutes), cold-start latency, memory/CPU limits, stateless by default (externalize state), and not suited to long-running or heavy stateful applications.

**SA5. Compare ECS, EKS, and Fargate for running containers.**

**Model Answer:**
- **ECS:** AWS-native container orchestration; simpler, tightly integrated with AWS; you can run it on EC2 instances (you manage cluster) or Fargate.
- **EKS:** managed Kubernetes; portable across clouds/on-prem; you manage worker nodes (or use Fargate for serverless nodes).
- **Fargate:** serverless compute for containers — AWS manages the instances entirely for both ECS and EKS; you only define the image/resources. Choose Fargate for simplicity, EKS for Kubernetes portability.

### Long-Answer / Analytical Questions

**LA1. Walk through the complete process of launching an EC2 instance, covering AMI, instance type, key pair, security group, storage, and connection. Explain why each step matters.**

**Model Answer (step-by-step):**
1. **Sign in to AWS Console** as an IAM user in the correct region.
2. **Navigate to EC2 → Instances → Launch Instances.**
3. **Name the instance** (resource tagging for cost tracking).
4. **Choose an AMI** — this defines the OS and preinstalled software; e.g., Amazon Linux 2 (free tier) or Ubuntu. The AMI drives compatibility with drivers and your stack.
5. **Choose the instance type** — e.g., `t2.micro` (free tier) — matches vCPU/RAM to workload.
6. **Key pair** — create/download the private `.pem`; the public key is injected for SSH login. You cannot re-download it later.
7. **Network settings** — VPC/subnet, auto-assign public IP, and **security group** rules (e.g., allow SSH 22 from your IP only).
8. **Configure storage** — EBS root volume; size/type (gp2/gp3) affects durability/IOPS.
9. **Optional:** user-data bootstrap script; tags.
10. **Launch** → wait for state `Running`.
11. **Connect:** Linux via SSH `ssh -i mykey.pem ec2-user@<public-ip>`; Windows via RDP with the admin password.

**LA2. Explain the EC2 cost optimization levers and how you would reduce monthly EC2 spend for a company running a web cluster plus background batch jobs.**

**Model Answer (step-by-step):**
1. **Right-size:** use CloudWatch utilization metrics to downsize over-provisioned instances (e.g., a `t3.large` at 5% CPU → `t3.small`).
2. **Reserved/Savings Plans** for the steady web cluster (predictable 24/7). 
3. **Spot Instances** for the interruptible batch jobs (up to 90% off).
4. **Autoscaling:** scale web cluster with demand; set min/max; scale to zero off-hours for dev.
5. **Stop idle resources:** stop dev/test instances outside working hours (EBS still billed; compute stops).
6. **Choose the right family/generation:** Graviton (e.g., `m6g`) is ~20% cheaper per performance for suitable workloads.
7. **Use burstable T-family** for low/steady CPU with bursts.
8. **Consolidate:** move peaky or low-utilization apps to containers/Lambda to reduce idle compute.
9. **Monitor:** use Cost Explorer/Budgets to catch waste and enforce tags.

**LA3. Compare a self-managed EC2 deployment, Elastic Beanstalk, and Lambda as ways to deploy the same web application. Recommend a strategy.**

**Model Answer (step-by-step):**
1. **EC2:** full control of OS, packages, scaling; high operational overhead (patching, monitoring, HA, autoscaling). Best when you need control/custom infra.
2. **Elastic Beanstalk:** you upload code; AWS provisions EC2, load balancer, autoscaling, health checks, rolling updates. Good middle ground for teams that want PaaS speed while staying on VMs.
3. **Lambda + API Gateway:** serverless; you only write functions. Cheapest for low/spiky traffic, no servers to patch; but can be harder for long requests, state, or constant high-frequency traffic.
4. **Recommendation:** For a simple CRUD API with spiky traffic → Lambda. For a traditional framework web app that needs to scale predictably → Beanstalk. For a regulated/custom app with specific OS/tuning needs → EC2. Many teams mix: static assets in S3/CloudFront, API on Lambda, heavy compute on EC2/containers.

---

## Part C — Exam Tips
- Remember the **family-letter → purpose** mapping (T burstable, M general, C compute, R memory, G/P/Inf accelerated).
- Know the **pricing comparison table**: On-Demand vs. Reserved vs. Spot vs. Savings Plans.
- Be clear that **Fargate is serverless compute for containers**; **EKS is managed Kubernetes**; **ECS is AWS-native orchestration**.
- Connect Unit V to the practicals: Practical 4 (EC2 launch), Practical 5 (RDP to a VM) both rely on this unit.
- For cost questions, always mention right-sizing, RIs/Savings Plans, Spot, autoscaling, and stopping idle resources.

---

## Part D — Quick-Reference (abridged)
| Topic | Key facts |
|-------|-----------|
| **I** | Virtual servers; AMI template; key pair; security group; EBS. |
| **Instance families** | T/M/C/R/G-P-Inf. |
| **Pricing** | On-Demand, RI (1–3y, ~30–60%), Spot (~90%, interruptible), Savings Plans, Dedicated Hosts. |
| **Lambda** | FaaS; per-request+duration; ≤15 min; cold starts. |
| **Beanstalk** | PaaS; auto-provisions EC2 + LB + scaling. |
| **Containers** | Docker packages app; ECS/EKS orchestrate; Fargate = serverless. |
