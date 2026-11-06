# CSE423: Virtualization and Cloud Computing — Unit IV Questions

**Topics:** AWS fundamentals — infrastructure (Regions/AZ/Edge), service categories, Management Console, Shared Responsibility Model, IAM, account security

---

## Part A — Multiple Choice Questions (MCQs)

**Q1.** An **Availability Zone (AZ)** is best described as:
- A) A complete global region
- B) A distinct, isolated data center (or group) within a Region with independent power/cooling/network
- C) A CDN caching location
- D) A billing boundary

**Q2.** Which of the following AWS services is **global** (not region-scoped)?
- A) EC2
- B) S3 (global bucket namespace) and IAM
- C) EBS
- D) VPC

**Q3.** Edge Locations are primarily used for:
- A) Hosting EC2 instances
- B) Caching content close to users (CDN/CloudFront)
- C) Storing primary databases
- D) Running VPCs

**Q4.** Under the Shared Responsibility Model, who is responsible for patching the **guest OS** of an EC2 instance?
- A) AWS
- B) The customer
- C) A third-party auditor
- D) Both equally, always

**Q5.** Which IAM component lets a service (like EC2) obtain temporary credentials without embedding long-term keys?
- A) IAM User
- B) IAM Group
- C) IAM Role
- D) IAM password policy

**Q6.** An IAM policy uses which format?
- A) XML only
- B) JSON document with Effect/Action/Resource
- C) Bash script
- D) CSV

**Q7.** Which is the recommended practice for the AWS **root** user?
- A) Use it for all daily admin work
- B) Enable MFA and avoid using it for routine tasks; use an IAM admin user instead
- C) Share the password with the whole team
- D) Disable MFA

**Q8.** IAM is best described as:
- A) A regional compute service
- B) A service for controlling who can access which AWS resources and how
- C) A database service
- D) A CDN

**Q9.** Which AWS service records API activity for auditing?
- A) CloudTrail
- B) S3
- C) Route 53
- D) ElastiCache

**Q10.** In an IAM policy evaluation, which rule always wins?
- A) Allow
- B) Explicit Deny
- C) Default Allow
- D) Root user

---

### Answers & Explanations

**A1. B) A distinct, isolated data center (or group) within a Region with independent power/cooling/network.**
AZs are isolated data centers inside a Region, connected by low-latency fiber, enabling high availability.

**A2. B) S3 (global bucket namespace) and IAM.**
IAM is global; S3 bucket names are globally unique. EC2/EBS/VPC are regional/AZ-scoped.

**A3. B) Caching content close to users (CDN/CloudFront).**
Edge Locations are CloudFront/CDN points of presence, not Regions.

**A4. B) The customer.**
In IaaS (EC2), the customer manages the guest OS and its patches; AWS manages the host/hypervisor.

**A5. C) IAM Role.**
Roles provide temporary credentials (via STS) assumed by services/users; safer than long-term keys.

**A6. B) JSON document with Effect/Action/Resource.**
IAM policies are JSON (e.g., `{"Effect":"Allow","Action":"s3:GetObject","Resource":"..."}`).

**A7. B) Enable MFA and avoid using it for routine tasks; use an IAM admin user instead.**
Root should be MFA-protected and used only for a few account-level tasks.

**A8. B) A service for controlling who can access which AWS resources and how.**
IAM is the identity/access control service, global in scope.

**A9. A) CloudTrail.**
CloudTrail records API activity, an audit log.

**A10. B) Explicit Deny.**
Explicit deny always overrides any allow; otherwise default deny applies if nothing matches.

---

## Part B — Subjective Questions

### Short-Answer Questions

**SA1. Distinguish between Regions, Availability Zones, and Edge Locations.**

**Model Answer:**
- **Region:** a geographic area containing multiple isolated data centers (e.g., `us-east-1`).
- **Availability Zone (AZ):** one or more distinct data centers within a Region with independent power, cooling, and networking, interconnected by low-latency fiber (e.g., `us-east-1a`).
- **Edge Location:** a CDN (CloudFront) point of presence that caches content close to users for lower latency; not a Region.
Usage: place app instances across multiple AZs for availability; use Edge Locations for content delivery.

**SA2. Explain the Shared Responsibility Model. Who secures the physical data center, and who secures the customer's data?**

**Model Answer:**
AWS secures **of** the cloud — physical data centers, hardware, software, and the virtualized infrastructure. The customer secures **in** the cloud — their data, guest OS, applications, IAM config, network controls (security groups), and encryption. For IaaS (EC2), the customer manages the guest OS and apps; for PaaS (RDS/Lambda), AWS manages the runtime/patching and the customer manages data, access, and configuration.

**SA3. What is IAM? List its core components.**

**Model Answer:**
IAM (Identity and Access Management) controls who can access which AWS resources and how. Core components:
- **User** — an identity with long-term credentials.
- **Group** — a collection of users sharing permissions.
- **Role** — an identity assumed by users/services for temporary credentials.
- **Policy** — a JSON document granting/denying permissions (Effect/Action/Resource/Principal).
- Identity-based vs. resource-based policies.

**SA4. List four AWS account security best practices.**

**Model Answer:**
1. Enable MFA on the root account and all privileged users.
2. Avoid using root for daily work; use an IAM admin user/group.
3. Apply least privilege and use IAM Roles instead of long-term keys.
4. Enable CloudTrail, set billing alerts/Budgets, rotate access keys, and never hardcode keys.

**SA5. Why are IAM Roles preferred over access keys for EC2 instances?**

**Model Answer:**
Roles provide **temporary credentials** via STS, so no long-lived keys are embedded in the instance/AMI. This reduces the risk of key leakage, enables automatic rotation, works cross-account, and follows least privilege — safer and more manageable than static access keys.

### Long-Answer / Analytical Questions

**LA1. Draw/describe the AWS global infrastructure hierarchy and explain how you would use Regions and AZs to build a highly available web application.**

**Model Answer (step-by-step):**
1. Hierarchy: **Region** (geographic) → **Availability Zones** (isolated data centers within) → **Edge Locations** (CDN caching).
2. For high availability, deploy the app across **≥2 AZs** in a Region (e.g., EC2 instances in `us-east-1a` and `us-east-1b` behind an Application Load Balancer that health-checks both).
3. Data layer: use a managed DB with **Multi-AZ** replication (RDS/Aurora) so a failover keeps the app serving.
4. Content: use **CloudFront** Edge Locations to cache static content near users and reduce origin load.
5. Failure behavior: if an AZ fails, the load balancer routes only to healthy instances in the surviving AZ — the app stays up.
6. Conclusion: Regions give geographic distribution; AZs give failure isolation; Edge Locations give latency reduction.

**LA2. Write an IAM policy for a user who needs to list S3 buckets and read objects from a specific bucket only. Explain each JSON field.**

**Model Answer (step-by-step):**
1. Structure the policy as JSON:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListAllMyBuckets"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    }
  ]
}
```
2. Explain fields: **Version** (policy language version), **Effect** (Allow/Deny), **Action** (API operations), **Resource** (ARNs affected), plus optional **Condition** (e.g., MFA or IP).
3. Note least privilege: ListAllMyBuckets must be `*` (only called at account level), while object reads are scoped to the one bucket.
4. Describe attaching: attach the policy to the user via the Console (IAM → Users → Permissions → Add permissions).

**LA3. Explain the Shared Responsibility Model with a comparison table across IaaS, PaaS, and SaaS, and explain why a customer cannot "outsource" all security to AWS.**

**Model Answer (step-by-step):**
1. Introduce the two halves: AWS = security *of* the cloud; customer = security *in* the cloud.
2. Build the table:
   - **IaaS (EC2):** AWS: host, hypervisor, physical, network. Customer: guest OS, patches, apps, data, security groups, IAM.
   - **PaaS (RDS/Lambda):** AWS: runtime, OS, patching, platform. Customer: data, access, config, encryption at rest.
   - **SaaS:** Provider: nearly everything. Customer: data, usage policies, identity admin.
3. Explain that even for managed services the customer still controls data classification, access policies, encryption, and compliance obligations — so the customer cannot fully outsource security.
4. Conclude: the model helps you see your responsibilities and plan controls (IAM, encryption, monitoring, backups).

---

## Part C — Exam Tips
- Know **Regions → AZs → Edge Locations** hierarchy and which services are global vs. regional.
- Memorize the **Shared Responsibility split** (AWS: of the cloud; customer: in the cloud).
- Be ready to write/read a simple **IAM JSON policy**.
- List **account security best practices** (MFA, least privilege, no root, CloudTrail, budgets).
