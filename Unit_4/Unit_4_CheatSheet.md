# CSE423 — Unit IV Cheat Sheet (One-Page Revision)

**Topics:** AWS Cloud infrastructure (regions/AZs/edge) · service categories · Management Console · Shared Responsibility Model · IAM · AWS account security

---

## 1. AWS Global Infrastructure
| Term | What it is |
|------|-----------|
| **Region** | A geographic cluster of data centers (e.g., us-east-1). Isolated failure domain. |
| **Availability Zone (AZ)** | One or more data centers in a region with independent power/network/cooling. AZs are connected by low-latency links. |
| **Edge location** | CDN/CloudFront cache and Route 53 endpoints — brings content closer to users; not a full region. |
| **Local Zone / Wavelength** | Even closer to end users (edge compute). |
- **Best practice:** spread workloads across multiple AZs for high availability; choose region by latency/compliance/data-residency.

## 2. AWS Service Categories
- **Compute:** EC2, Lambda, Elastic Beanstalk, ECS/EKS/Fargate, Lightsail.
- **Storage:** S3, EBS, EFS, Glacier, Storage Gateway.
- **Databases:** RDS, DynamoDB, Aurora, Redshift, ElastiCache.
- **Networking:** VPC, Route 53, CloudFront, ELB, Direct Connect, VPN.
- **Security/Identity:** IAM, KMS, Shield, WAF, Cognito, Secrets Manager.
- **Management/Governance:** CloudWatch, CloudTrail, CloudFormation, Cost Explorer, Organizations.
- **Analytics/AI/ML, App Integration, DevOps, Migration, IoT, etc.**

## 3. AWS Management Console
- Web-based UI to provision & manage resources. Features: dashboard, region selector, search, service menus.
- **Alternatives:** AWS CLI (command line), SDKs (boto3 etc.), CloudFormation/Terraform (IaC), API.
- **Tips:** pin frequently used services, use tags, watch the "N. Virginia" default region.

## 4. Shared Responsibility Model
- **AWS ("Security OF the cloud"):** physical data centers, hardware, network, virtualization, managed service internals.
- **Customer ("Security IN the cloud"):** IAM policies, data encryption (client-side), OS patches inside EC2, app config, network ACLs/security groups, customer data.
- **Varies by service:** on IaaS you manage more; on SaaS AWS manages more.
- **Mnemonic:** AWS owns the *building/hardware*; you own *what's inside your guests and the locks*.

## 5. IAM (Identity and Access Management)
- Manages **users, groups, roles, policies** and authentication/authorization for AWS.
- **Concepts:**
  - **User:** a person/service identity with long-term credentials (access key/secret).
  - **Group:** collection of users sharing policies (easier management).
  - **Role:** an identity with permissions that can be *assumed* (no long-term creds) — for cross-account, EC2 instance profiles, federated access.
  - **Policy:** JSON document granting/denying actions on resources (json:Allow/Deny, Effect, Action, Resource, Condition).
  - **Policy types:** AWS managed, customer managed, inline.
  - **MFA (Multi-Factor Authentication):** adds a second factor.
- **Principle of least privilege:** grant only the minimal permissions needed.
- **Identity federation:** SSO via SAML/OIDC, Active Directory, Cognito.

## 6. AWS Account Security
- **Best practices:**
  - Use **root account only for account-level tasks** (billing, closing account); enable MFA on root.
  - Create IAM users/groups with least privilege for daily work.
  - **Enable MFA** on all privileged users.
  - Use **roles** (not long-lived keys) for EC2/apps.
  - Enable **CloudTrail** (API audit log), **CloudWatch** alarms, **AWS Config** (compliance).
  - Use **AWS Organizations** to manage multiple accounts (SCPs).
  - Rotate credentials; delete unused keys; use **KMS** for key management.
  - Use **Trusted Advisor / Security Hub / GuardDuty** to monitor.
  - Set **budgets + billing alarms** for cost control.

---

## Memory aids
- **Region vs AZ vs Edge:** "Region = city, AZ = building(s), Edge = roadside kiosk (CDN)."
- **Shared responsibility:** "AWS secures the cloud; you secure what's in the cloud."
- **IAM objects:** "Users & Groups = identities; Roles = assumed hats; Policies = permission documents."
- **Least privilege:** "Give exactly enough, nothing more."

## Quick carry-away
> Design for multi-AZ availability · know the shared boundary (you patch your EC2 OS, AWS patches the host) · use IAM roles over long-lived keys · MFA on root + admins · least-privilege policies · audit with CloudTrail/Config and track costs with budgets.

## External links (shortlist)
- AWS Global Infrastructure: aws.amazon.com/about-aws/global-infrastructure
- AWS Regions/AZs map: aws.amazon.com/about-aws/global-infrastructure/regions_az
- Shared Responsibility Model: aws.amazon.com/compliance/shared-responsibility-model
- IAM docs: docs.aws.amazon.com/IAM/latest/UserGuide
- IAM best practices: docs.aws.amazon.com/IAM/latest/UserGuide/best-practices
- Root account security: docs.aws.amazon.com/accounts/latest/referenceguide
- AWS Security Hub / Trusted Advisor: aws.amazon.com/security-hub
