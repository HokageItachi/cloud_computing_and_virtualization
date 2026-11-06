# CSE423: Virtualization and Cloud Computing — Unit IV Notes

**Course:** CSE423: Virtualization and Cloud Computing
**Unit IV Topics:** AWS Fundamentals — AWS Cloud infrastructure · service categories · Management Console · Shared Responsibility Model · IAM · account security

---

## Table of Contents
1. AWS Overview
2. AWS Cloud Infrastructure (Regions, AZs, Edge Locations)
3. AWS Service Categories
4. AWS Management Console
5. The Shared Responsibility Model
6. Identity and Access Management (IAM)
7. AWS Account Security
8. Implementation Tips & Tricks
9. External Links

---

## 1. AWS Overview

**Amazon Web Services (AWS)** is Amazon's cloud platform — the most widely adopted cloud provider. It offers 200+ services across compute, storage, databases, networking, analytics, ML, security, and more, delivered on a pay-as-you-go basis. AWS is built on the same foundational ideas from Units I–III: virtualization, distributed systems, elasticity, and on-demand self-service.

---

## 2. AWS Cloud Infrastructure

AWS's global infrastructure is organized in a hierarchy:

### 2.1 Regions
A **Region** is a geographical area with multiple isolated data centers (e.g., `us-east-1` N. Virginia, `ap-south-1` Mumbai, `eu-west-1` Ireland).
- Each Region is **independent** (isolated from failures in others).
- You choose a Region to be close to users, meet compliance/data-residency, and control latency.
- Regions are named with a prefix + number (e.g., `us-east-1`).

### 2.2 Availability Zones (AZs)
Each Region contains **2+ (often 3+) Availability Zones** — distinct data centers (or groups) with independent power, cooling, and networking, connected by low-latency, redundant fiber.
- AZs let you build **high availability**: place app instances in multiple AZs so a failure in one doesn't take the app down.
- An AZ is identified by a letter suffix (e.g., `us-east-1a`).

### 2.3 Edge Locations / Points of Presence (PoP)
**Edge Locations** are CDN (CloudFront) sites that cache content close to users. They are not Regions — they serve cached content to reduce latency. AWS has 400+ edge locations globally.
- Used by **Amazon CloudFront** (CDN), Route 53 (DNS), and AWS Global Accelerator.
- Edge computing (Lambda@Edge) runs code near users.

### 2.4 The "global vs. regional vs. AZ" distinction
- **Global services:** IAM, Route 53, CloudFront, WAF, S3 (global namespace for buckets). Span all regions.
- **Regional services:** EC2, EBS, VPC, RDS (choose a region/AZ).
- **AZ-scoped resources:** an EC2 instance lives in one AZ (you can copy across AZs).

> **Exam/class takeaway:** "Regions are geographic areas; AZs are isolated data centers inside a Region; Edge Locations are CDN points in content to users." This is **Practical 3's** core topic.

---

## 3. AWS Service Categories

AWS organizes services into categories (domains):

| Category | What it covers | Example services |
|----------|----------------|------------------|
| **Compute** | Virtual servers, containers, serverless | EC2, Lambda, ECS, EKS, Fargate, Elastic Beanstalk |
| **Storage** | Object, block, file, archive | S3, EBS, EFS, S3 Glacier, FSx |
| **Databases** | Relational, NoSQL, warehouse, caching | RDS, DynamoDB, Redshift, Aurora, ElastiCache |
| **Networking & Content Delivery** | VPC, DNS, CDN, load balancing | VPC, Route 53, CloudFront, ELB/ALB, Direct Connect |
| **Security, Identity & Compliance** | Access mgmt, encryption, audit | IAM, KMS, Shield, WAF, Cognito, CloudTrail |
| **Analytics** | Big data, streaming, BI | Athena, EMR, Kinesis, QuickSight, Redshift |
| **Machine Learning & AI** | ML services | SageMaker, Rekognition, Comprehend, Polly |
| **Management & Governance** | Monitoring, deployment, cost | CloudWatch, CloudFormation, CloudTrail, Trusted Advisor, Budgets |
| **Application Integration** | Messaging, workflow | SQS, SNS, Step Functions, EventBridge |
| **Developer Tools & DevOps** | CI/CD, code | CodeCommit, CodeBuild, CodeDeploy, CodePipeline |
| **Migration & Transfer** | Moving workloads/data | DMS, Snowball, DataSync, Application Discovery |
| **Customer Engagement / Business Apps** | Contact center, productivity | Connect, WorkMail, Chime, Simple Email Service |
| **Well-Architected / Cost** | Best practices, cost | Well-Architected Tool, Pricing Calculator, Cost Explorer |

**Priority for this course:** Compute (Unit V), Storage & Databases (Unit VI), plus Security/Identity (this unit) and Networking.

---

## 4. AWS Management Console

The **AWS Management Console** is the browser-based web UI to manage AWS resources.

**Key elements:**
- **Sign-in:** IAM user or root; supports MFA.
- **Services menu:** search/navigate to services.
- **Region selector:** top-right; choose the active Region.
- **Resource dashboards:** per-service pages to view/create/edit resources.
- **Console Home:** overview of recent resources, costs, and recommendations.
- **AWS Console Mobile App:** manage from mobile.

**Alternatives to the Console (know all three):**
1. **AWS Management Console** — GUI.
2. **AWS CLI** — command-line tool (best for automation).
3. **AWS SDKs / CloudFormation / Terraform** — programmatic and infrastructure-as-code.

**Console "how-to" for lab work:** use the search bar to find EC2 → launch instance; use the top-right Region selector before creating resources (so you create them in the right Region).

---

## 5. The Shared Responsibility Model

The **Shared Responsibility Model** defines who is responsible for security of what in AWS.

**Core split:**
- **AWS (Customer of the cloud):** security **of** the cloud — physical data centers, hardware, software (compute, storage, DB, networking), and the virtualized infrastructure. AWS also manages global infrastructure and managed services' security.
- **Customer (Security in the cloud):** security **in** the cloud — your data, workloads, guest OS, applications, IAM config, network controls (security groups, firewall rules), encryption choices, and compliance with your own standards.

**How it varies by service model:**
- **IaaS (EC2):** customer manages guest OS, patches, apps, data, security groups; AWS manages host/hypervisor/network.
- **PaaS (RDS, Lambda):** AWS patches and manages the runtime/DB; customer manages data, access, and app config.
- **SaaS:** AWS/provider manages almost everything; customer manages data/usage policies.

**Practical implication:** You can't just "trust AWS" — you must configure IAM, encryption, patches, and monitoring. The model is often drawn as a pyramid/table: AWS manages the base (physical → virtualization), customer manages the top (data → access).

---

## 6. Identity and Access Management (IAM)

**IAM** lets you control **who** can access **which** AWS resources and **how** (with what permissions). It is global (not region-specific).

### 6.1 Core IAM components
- **User:** a person/app with long-term credentials (password, access keys). Belongs to an account.
- **Group:** a collection of users; permissions apply to the whole group.
- **Role:** an identity with permissions that can be **assumed** (by users, services, or cross-account). Roles are safer than sharing long-term keys (e.g., an EC2 instance assumes a role to call S3).
- **Policy:** a JSON document that grants/denies permissions (e.g., `{"Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mybucket/*"}`).
- **Identity-based vs. resource-based policies:** identity-based attach to a user/group/role; resource-based attach to a resource (e.g., S3 bucket policy).
- **Principal:** the identity the policy applies to.

### 6.2 Policies & permission model
- Policies are evaluated: explicit **deny** always overrides allow; **default deny** if no policy matches.
- **AWS managed policies** (pre-built by AWS) vs. **customer managed policies** (you write) vs. **inline policies** (embedded in a single identity).

### 6.3 Best practices (see also §7)
- **Least privilege:** grant only the permissions needed.
- Use **groups** instead of assigning permissions to each user.
- Prefer **roles** over long-lived access keys (especially for EC2/cloud).
- **Rotate access keys** regularly; never hardcode keys in code.
- Use **IAM Roles + AWS STS** for cross-account/temporary access (temporary credentials).
- Use **IAM policy conditions** (e.g., MFA required, IP restriction).

---

## 7. AWS Account Security

Securing the AWS account (root + IAM) is the foundation of cloud security.

### 7.1 Root user and Account (a.k.a. the "root" credential)
- The **root user** is the fully privileged account owner (email + password). It can do *anything*.
- **Best practice:** do **not** use the root for daily work. Create an **IAM admin user/group**, enable credential for, and use IAM users for day-to-day admin. Use root only for a very small set of account-level tasks (e.g., closing the account, changing support plan, root password recovery).

### 7.2 Key account security practices
1. **Enable Multi-Factor Authentication (MFA)** on the root account and all privileged IAM users (hardware key or virtual MFA).
2. **Create an IAM admin group** and add users to it; do not share the root password.
3. **Use strong, unique passwords** and a password policy.
4. **Never expose access keys** — rotate them; use roles where possible.
5. **Enable AWS CloudTrail** to record API activity (audit logging).
6. **Use AWS Config** to monitor resource config compliance.
7. **Set up billing alerts / Budgets** to catch spend anomalies,8. **Use IAM conditions + SCPs** (in AWS Organizations) for additional guardrails.
9. **Enable AWS Shield/GuardDuty** as needed for threat detection.
10. **Lock down the root account** (MFA + no keys).

### 7.3 Other security services to be aware of
- **KMS** — key management/encryption.
- **Security Groups & NACLs** — network-level firewalls (VPC).
- **GuardDuty** — threat detection.
- **WAF & Shield** — web app firewall & DDoS protection.
- **AWS Organizations + SCPs** — governance across accounts.
- **Artifact** — compliance reports.

---

## 8. Implementation Tips & Tricks

- **Never log in as root** for classes/labs — create an IAM admin user on day one and use that.
- **MFA on everything privileged** — it's the single best protection against account takeover.
- **Use IAM Roles for EC2** so instances get temporary credentials without embedding keys.
- **Use the search bar in the Console** to jump to services; pick the correct Region *before* creating resources.
- **Learn the CLI equivalents** — the Console teaches concepts, but automation uses the CLI/SDK.
- **Understand the "IAM is global, resources are regional"** rule — policies apply everywhere; EC2 instances are region-scoped.
- **Always write policies with least privilege** and test with a deny-first mindset.
- **Enable CloudTrail immediately** in a fresh account — good audit hygiene.
- **Tag resources** (owner/env) so IAM/billing policies can be enforced and tracked.
- **Memory aid for Shared Responsibility:** "AWS secures the cloud; you secure what's *in* the cloud."

---

## 9. External Links (Curated Placeholders)

**AWS infrastructure:**
- AWS Global Infrastructure: https://aws.amazon.com/about-aws/global-infrastructure/
- AWS Regions & AZs: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
- AWS Edge Locations (CloudFront): https://aws.amazon.com/cloudfront/features/

**Console & getting started:**
- AWS Management Console: https://console.aws.amazon.com/
- AWS "Set Up Your AWS Account" (getting started): https://docs.aws.amazon.com/accounts/latest/referenceusinggetting-started.html

**Shared responsibility:**
- AWS Shared Responsibility Model: https://aws.amazon.com/compliance/shared-responsibility-model/
- Shared responsibility white paper: https://docs.aws.amazon.com/whitepapers/latest/security-overview-aws/shared-responsibility-model.html

**IAM & security:**
- AWS IAM docs: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
- IAM best practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- AWS Security Best Practices: https://docs.aws.amazon.com/whitepapers/latest/security-overview-aws/welcome.html
- AWS account management / root user best practices: https://docs.aws.amazon.com/accounts/latest/reference/root-user-best-practices.html

**Video tutorials (YouTube placeholders):**
- "AWS Global Infrastructure explained" — AWS / freeCodeCamp
- "AWS Shared Responsibility Model" — AWS / CBT Nuggets
- "AWS IAM Tutorial" — freeCodeCamp / AWS
- "AWS Account Best Practices (MFA, IAM)" — AWS
- "AWS Cloud Practitioner Essentials" — freeCodeCamp (full course)
