# CSE423 — Glossary of Cloud & Virtualization Terms

A quick-reference dictionary covering the vocabulary used across all six units. Organized by theme.

---

## A. Virtualization & Hypervisors

| Term | Definition |
|------|-----------|
| **Virtualization** | Creating a virtual (rather than physical) version of a computing resource (server, storage, network, OS, app) decoupled from hardware. |
| **Hypervisor / VMM** | Software layer that creates and runs virtual machines (Virtual Machine Monitor). |
| **Host** | The physical machine that runs the hypervisor. |
| **Guest** | A virtual machine (and its OS) running on a hypervisor. |
| **Type 1 (bare-metal) hypervisor** | Runs directly on hardware (ESXi, Hyper-V, KVM, Xen). |
| **Type 2 (hosted) hypervisor** | Runs as an application on an OS (Workstation, VirtualBox). |
| **Binary translation** | Full-virtualization technique that rewrites non-virtualizable guest instructions in software. |
| **Paravirtualization** | Guest OS is modified and calls the hypervisor via hypercalls. |
| **Hardware-assisted virtualization** | CPU extensions (Intel VT-x / AMD-V) that trap sensitive instructions automatically. |
| **Ring 0 / Ring 3** | Highest/lowest CPU privilege levels in x86. |
| **Shadow page tables / EPT / NPT** | Memory-virtualization techniques (software vs hardware-assisted). |
| **SR-IOV / passthrough** | Techniques giving a guest direct access to a physical device. |
| **Snapshot** | Point-in-time state of a VM (disk + memory) used for rollback. |
| **Clone** | A copy of a VM derived from a source VM/template. |
| **Live migration (vMotion)** | Moving a running VM between hosts with zero (or minimal) downtime. |
| **Container** | OS-level virtualization: shared kernel, isolated user-space (Docker, LXC). |
| **Namespaces / cgroups** | Linux mechanisms that isolate and limit container resources. |

## B. Networking & Storage Virtualization

| Term | Definition |
|------|-----------|
| **VLAN** | Logical segmentation of a physical network into isolated broadcast domains (802.1Q). |
| **802.1Q tag** | 12-bit VLAN tag in Ethernet frames (up to ~4096 VLANs). |
| **Trunk** | A link that carries multiple tagged VLANs between switches. |
| **VSAN** | Logical partition of a Fibre Channel SAN fabric into isolated zones. |
| **SAN (Storage Area Network)** | A dedicated high-speed network connecting servers to block storage. |
| **vSAN (VMware)** | Software-defined storage pool built from local disks of ESXi hosts. |
| **VPC (Virtual Private Cloud)** | Isolated virtual network in a public cloud. |
| **VXLAN** | Overlay network protocol that encapsulates Layer-2 frames in UDP. |

## C. Distributed & Parallel Computing

| Term | Definition |
|------|-----------|
| **Parallel computing** | Solving one problem by splitting it across multiple processors. |
| **Distributed system** | Autonomous computers networked to cooperate as one coherent system. |
| **Amdahl's Law** | Limits speedup: Speedup ≤ 1/(S + (1−S)/N). |
| **Flynn's taxonomy** | SISD / SIMD / MISD / MIMD classification of computer architectures. |
| **SMP / NUMA / MPP** | Shared-memory, non-uniform memory access, massively parallel processing architectures. |
| **Middleware** | Software layer between apps and OS/network (RPC, message queues, CORBA). |
| **CAP theorem** | Consistency, Availability, Partition tolerance — choose two. |
| **Cluster / Grid / Cloud computing** | Tightly-coupled homogeneous group; heterogeneous geo-distributed; on-demand elastic service. |

## D. Cloud Service & Deployment Models

| Term | Definition |
|------|-----------|
| **IaaS** | Infrastructure as a Service — you manage OS/apps; provider manages infra. |
| **PaaS** | Platform as a Service — you manage app; provider manages runtime/infra. |
| **SaaS** | Software as a Service — provider manages everything. |
| **Public / Private / Community / Hybrid cloud** | Deployment models by ownership and access. |
| **Multi-cloud** | Using multiple public providers simultaneously. |
| **NIST model** | Standard definition: 5 characteristics + 3 service models + 4 deployment models. |
| **Cloud cube model** | Jericho Forum security classification: internal/external, owned/third-party, de-perimeterized. |
| **On-demand self-service** | Provision resources without human interaction. |
| **Rapid elasticity** | Scale up/down quickly, appearing unlimited. |
| **Measured service** | Metering and pay-per-use. |

## E. Cloud Architecture, Migration & Economics

| Term | Definition |
|------|-----------|
| **Cloud stack** | Layered model: data center → virtualization → IaaS → PaaS → SaaS. |
| **Workload distribution** | Spreading traffic across resources via load balancing/scaling. |
| **Load balancer (LB)** | Distributes traffic (round-robin, least connections, IP hash). |
| **Horizontal vs vertical scaling** | Add nodes vs enlarge a node. |
| **Auto-scaling** | Automatically adjusting capacity based on rules/metrics. |
| **Capacity planning** | Predicting future resource needs to avoid over/under-provisioning. |
| **Cloud bursting** | Hybrid pattern: baseline on-prem + burst to public cloud at peak. |
| **Thick vs thin provisioning** | Allocate storage ahead vs grow on demand. |
| **SOA** | Service-Oriented Architecture: loosely coupled reusable services. |
| **ESB** | Enterprise Service Bus (SOA integration backbone). |
| **Microservices** | Small independently deployable services (fine-grained SOA). |
| **SLA** | Service Level Agreement: contract defining QoS, metrics, penalties. |
| **RPO / RTO** | Recovery Point Objective / Recovery Time Objective (disaster recovery). |
| **Cloudonomics** | Economic laws of cloud computing (Weinman). |
| **Capex / Opex** | Capital expenditure vs operational expenditure. |
| **TCO** | Total Cost of Ownership. |

## F. AWS Global Infrastructure & Security

| Term | Definition |
|------|-----------|
| **Region** | Geographic cluster of data centers. |
| **Availability Zone (AZ)** | One or more data centers in a region with independent power/network/cooling. |
| **Edge location** | CDN/CloudFront cache and Route 53 endpoint for low latency. |
| **Shared Responsibility Model** | AWS secures the cloud; customer secures in the cloud. |
| **IAM** | Identity and Access Management — users, groups, roles, policies. |
| **Policy** | JSON document granting/denying AWS actions. |
| **Role** | Identity you can assume (no long-term credentials). |
| **MFA** | Multi-Factor Authentication. |
| **CloudTrail** | API audit log. |
| **CloudWatch** | Monitoring/alarms service. |
| **KMS** | Key Management Service (encryption keys). |
| **AWS Organizations / SCP** | Multi-account management and service control policies. |
| **Least privilege** | Grant only minimal necessary permissions. |

## G. Compute & Containers

| Term | Definition |
|------|-----------|
| **EC2** | Elastic Compute Cloud — resizable virtual servers. |
| **AMI** | Amazon Machine Image — template with OS + software + config. |
| **Instance type** | Family + size (t2.micro, m5.large, c5.xlarge). |
| **Security group** | Instance-level stateful firewall. |
| **Key pair** | SSH/RDP authentication credential. |
| **On-Demand / Reserved / Spot** | EC2 pricing models. |
| **Savings Plans** | Commit to usage ($/hr) for discount. |
| **Lambda** | Serverless function computing (event-driven, per-invocation billing). |
| **Elastic Beanstalk** | PaaS for deploying apps without managing infrastructure. |
| **Lightsail** | Simple fixed-price VPS. |
| **ECS / EKS** | Elastic Container Service / Elastic Kubernetes Service (container orchestration). |
| **Fargate** | Serverless compute for containers (no node management). |
| **Docker** | Container image/runtime standard. |

## H. Storage & Databases

| Term | Definition |
|------|-----------|
| **EBS** | Elastic Block Store — block storage volume attached to one EC2. |
| **S3** | Simple Storage Service — object storage in buckets. |
| **EFS** | Elastic File System — managed NFS, shared across instances. |
| **Glacier** | Low-cost archival object storage (Flexible/Deep Archive). |
| **Storage class** | Standard, IA, One Zone-IA, Glacier tiers. |
| **Lifecycle policy** | Rules to transition objects between storage classes. |
| **RDS** | Relational Database Service — managed SQL engines. |
| **Multi-AZ / Read replica** | High-availability standby / read scaling in RDS. |
| **DynamoDB** | Managed NoSQL key-value/document, serverless, low latency. |
| **RCU / WCU** | DynamoDB read/write capacity units. |
| **Redshift** | Managed petabyte-scale data warehouse (OLAP). |
| **Aurora** | Cloud-native MySQL/PG-compatible relational database. |

---

> **Tip:** Use this glossary with the per-unit cheat sheets and notes. Acronyms like EBS/S3/EFS/RDS/DynamoDB/Redshift are frequent exam questions — test yourself by covering the right column.
