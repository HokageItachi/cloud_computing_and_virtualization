# CSE423: Virtualization and Cloud Computing — Practicals (Step-by-Step)

**Course:** CSE423: Virtualization and Cloud Computing
**Scope:** All 8 practical experiments from the syllabus, with prerequisites, step-by-step instructions, CLI/command placeholders, and troubleshooting.

---

## Table of Contents

- General Prerequisites & Setup
- Practical 1 — VMware Workstation: Install, Create a VM, Configure Resources & Networking
- Practical 2 — Snapshots, Clone and Restore Virtual Machines
- Practical 3 — AWS Regions, Availability Zones, and Edge Locations
- Practical 4 — Create an EC2 Instance with an AMI
- Practical 5 — Connect to Remote VMs via RDP
- Practical 6 — Create an S3 Bucket with Proper Configurations
- Practical 7 — Create a Static Website for Cloud Deployment
- Practical 8 — Calculate a Services Bill with the AWS Pricing Calculator

---

## General Prerequisites & Setup

**For VMware practicals (1 & 2):**

- A Windows/Linux desktop with at least **8 GB RAM** (16 GB recommended) and ~30 GB free disk.
- **VMware Workstation** (free **Player** or Pro) — install from https://www.vmware.com/products/workstation-player.html (or a trial of Workstation Pro).
- An OS ISO: Ubuntu Desktop (https://ubuntu.com/download/desktop) or Windows/Linux Server ISO.
- VT-x/AMD-V (hardware virtualization) enabled in the host BIOS/UEFI — check it's on (Section: Troubleshooting).

**For AWS practicals (3–8):**

- An **AWS account** with an **IAM user** (recommended, avoid using root).
- **AWS CLI** installed and configured (`aws configure`) — optional but recommended.
- A **browser** for the AWS Management Console.
- Internet access and, ideally, a credit card for non-free-tier resources (practicals below stay within the **free tier** where possible).

> ⚠️ **Cost warning:** Always verify you are using free-tier-eligible resources (e.g., `t2.micro`/`t3.micro` EC2, S3 Standard) and **terminate/stop** resources after each lab to avoid unexpected charges.

---

## Practical 1 — VMware Workstation: Install, Create a VM, Configure Resources & Networking

### Objective

Install VMware Workstation, create a new virtual machine, allocate CPU/RAM/Storage, and configure **NAT**, **Bridged**, and **Host-only** networking.

### Prerequisites

- VMware Workstation/Player installed on your host.
- A Linux or Windows OS ISO file.

### Step-by-Step

**Part A — Install VMware Workstation**

1. Download the installer from the VMware website.
2. Run the `.exe`/`.dmg` installer; accept the EULA; choose **Typical/Default** install.
3. (Optional) Enter the license key for Pro, or keep Player free.
4. Reboot if prompted.

**Part B — Create a Virtual Machine**

1. Open **VMware Workstation** → click **Create a New Virtual Machine** (File → New Virtual Machine).
2. Choose **Custom (advanced)** or **Typical**.
3. Select **Installer disc image file (iso)** and browse to your ISO.
4. Choose the guest OS type/version (e.g., Ubuntu 64-bit).
5. Name the VM and choose where to store the virtual disk (e.g., `D:\VMs\UbuntuVM`).
6. Set the **disk size** (e.g., 20 GB) and select **Store virtual disk as a single file**.
7. Click **Finish**. The VM is created.

**Part C — Configure VM Resources (CPU, RAM, Storage)**

1. Select the VM in the library → click **Edit virtual machine settings**.
2. **Memory:** set RAM (e.g., 2048–4096 MB). Don't exceed ~half your host RAM.
3. **Processors:** set number of processors and cores per processor (e.g., 2 CPUs / 2 cores).
4. **Hard Disk:** review/adjust size; can add a second hard disk here.
5. Optional: enable **Accelerate 3D graphics** if needed.
6. Click **OK**.

**Part D — Configure Networking (NAT / Bridged / Host-only)**

1. Open **Edit virtual machine settings** → select **Network Adapter**.
2. Choose the network type:
   - **NAT:** the VM shares the host's IP (uses VMware NAT). VM can reach the outside world; outside cannot easily reach the VM. Good default for internet access.
   - **Bridged:** the VM gets its own IP on the same LAN as the host (like a real machine on the network). Choose this for the VM to be reachable from other LAN devices.
   - **Host-only:** the VM can talk only to the host and other VMs on the same host-only network (no external Internet).
3. Click **OK**, then **Power on** the VM and install the OS from the ISO.

### CLI / Command Placeholders

- List networks: `vmrun list` and `vmrun -T ws start "<path-to-vmx>" gui`.
- Host-only network config is managed via **Edit → Virtual Network Editor** (must run as administrator): you can enable/disable and set subnet for `vmnet1` (host-only) and `vmnet8` (NAT).

### Troubleshooting

- **"VMware does not support nested virtualization" / slow VM:** enable VT-x/AMD-V in BIOS; for virtualizing inside another VM, enable "Virtualize Intel VT-x/EPT" in the VM settings.
- **No Internet in NAT:** check the host's internet; reset the NAT adapter via Virtual Network Editor → restore defaults.
- **Bridged has no IP:** ensure the host is on a real network; check the virtual adapter is bound to the correct physical NIC.
- **Permission denied opening .vmx:** close all VMware windows; run as administrator.
- **VM won't boot from ISO:** confirm the ISO is attached to the CD/DVD drive and that boot order includes the CD drive.

### Viva-Voce / Lab Questions & Model Answers

**Q1. What is the key difference between NAT, Bridged, and Host-Only networking modes?**  
- **NAT (vmnet8):** The VM shares the host's IP address through VMware's internal NAT router. The VM can access external networks/Internet, but external devices cannot directly initiate connections into the VM.
- **Bridged (vmnet0):** The VM appears as an independent physical device on the same local physical network as the host, obtaining its own IP address from the external LAN's DHCP server.
- **Host-Only (vmnet1):** Creates an isolated virtual network connecting only the host OS and other VMs mapped to that host-only adapter. No direct external network or Internet connectivity exists.

**Q2. What type of hypervisor is VMware Workstation, and how does it differ from VMware ESXi?**  
- VMware Workstation is a **Type 2 (Hosted) Hypervisor**; it installs and runs as an application on top of an existing host OS (Windows/Linux).
- VMware ESXi is a **Type 1 (Bare-Metal) Hypervisor**; it installs directly onto the physical server hardware without an intermediate general-purpose OS, yielding lower latency and higher performance.

**Q3. What happens if hardware-assisted virtualization (VT-x/AMD-V) is disabled in the BIOS?**  
- The 64-bit guest operating system cannot execute hardware-assisted ring transitions, causing VM launch failure with errors like "VT-x/AMD-V is not enabled" or forcing sluggish software emulation/binary translation.

---

## Practical 2 — Snapshots, Clone and Restore Virtual Machines

### Objective

Use VMware snapshots to capture VM state, clone a VM, and restore a VM from a snapshot.

### Prerequisites

- A configured VM from Practical 1 (any OS).
- VMware Workstation Pro (snapshots and clones are Pro features; Player may not support snapshots).

### Step-by-Step

**Part A — Take a Snapshot**

1. Power on the VM and let the OS finish booting.
2. Optional: place a file on the VM (e.g., create `/home/user/state.txt`) so you can verify restore.
3. In the toolbar, click **Take Snapshot** (camera icon) or **VM → Snapshot → Take Snapshot**.
4. Name it (e.g., `After-Install`) and add a description. Click **Take Snapshot**.

**Part B — Create a Clone**

1. Ensure the VM is **powered off** (or use a linked clone of a snapshot).
2. **VM → Snapshot → Clone** (or right-click VM → Clone).
3. Choose **Linked clone** (shares the base disk; faster, smaller) or **Full clone** (independent copy; safer, larger).
4. Name the clone and choose a storage path. Click **Finish**.

**Part C — Restore from a Snapshot**

1. **Power off** the VM (strongly recommended before reverting).
2. **VM → Snapshot → Snapshot Manager** (or "Go to snapshot").
3. Select a snapshot (e.g., `After-Install`).
4. Click **Go To** → confirm **Yes** to revert the VM to that snapshot state.
5. Power on the VM; verify the earlier state (e.g., the file you created is gone if it was created _after_ the snapshot).

### CLI / Command Placeholders

```
# List snapshots
vmrun -T ws listSnapshots "<path-to-vmx>"

# Take a snapshot
vmrun -T ws snapshot "<path-to-vmx>" "After-Install"

# Revert to a snapshot
vmrun -T ws revertToSnapshot "<path-to-vmx>" "After-Install"
```

### Troubleshooting

- **Snapshot option greyed out:** confirm you're using Workstation Pro; the VM must not be in "suspended" or otherwise locked.
- **Clone fails while running:** power off the VM first (full clone), or clone from a snapshot (linked clone).
- **After restore, changes are gone:** that's expected — restore reverts to the snapshot's point in time. This is the feature's purpose.
- **Disk space:** linked clones share the base disk; full clones duplicate it — check free disk.

### Viva-Voce / Lab Questions & Model Answers

**Q1. What is the fundamental difference between a Linked Clone and a Full Clone?**  
- **Linked Clone:** A copy created with references to the parent virtual disk snapshot. It consumes very little initial disk space and creates rapidly, but requires ongoing access to the parent disk to operate.
- **Full Clone:** A completely independent copy of the VM duplicating the entire virtual disk file. It requires substantial disk storage and takes longer to clone, but can be freely moved or operated without any link to the parent VM.

**Q2. Does a snapshot serve as a permanent replacement for a full backup? Why or why not?**  
- **No.** Snapshots record differential changes (delta disks: `*-000001.vmdk`) relative to a base disk. If the underlying base virtual disk file gets corrupted or deleted, all snapshots are lost. Furthermore, keeping long-chain snapshots impairs VM disk I/O performance.

**Q3. What happens to the memory state when you take a snapshot of a running VM?**  
- VMware writes the active RAM contents into a `.vmem` file on the datastore. Restoring that snapshot restores the VM to the exact running execution state (including running processes and open windows) without a cold reboot.

---

## Practical 3 — Understanding AWS Resources, Availability Zones and Edge Locations

### Objective

Identify AWS **Regions**, **Availability Zones (AZs)**, and **Edge Locations**, and understand how they relate to the global infrastructure.

### Prerequisites

- An AWS account (or just the public AWS docs/global infrastructure map).
- Access to the AWS Management Console.

### Step-by-Step

1. **Login** to the AWS Console (https://console.aws.amazon.com).
2. In the top-right **Region selector**, expand the list — note the **Region names** (e.g., `us-east-1`, `ap-south-1`, `eu-west-2`) and their cities.
3. Open **EC2 → Instances → Launch Instances** and, in the **Network settings**, choose a VPC/subnet — note that subnets are tied to specific **Availability Zones** (e.g., `us-east-1a`, `us-east-1b`).
4. Create or view a VPC dashboard to see AZs within a Region.
5. Visit the **AWS Global Infrastructure** page (https://aws.amazon.com/about-aws/global-infrastructure/) to see Regions, edge locations, and local zones on the map.
6. Open **CloudFront → Distributions → Create distribution** and observe the **Edge Locations** (PoPs) used for content delivery (e.g., in major global cities).

### CLI / Command Placeholders

```bash
# List AWS regions
aws ec2 describe-regions --query "Regions[].RegionName" --output text

# List availability zones in the current region
aws ec2 describe-availability-zones --region us-east-1 --output table

# Describe your edge/PoP availability is informational; CloudFront uses edge locations automatically
aws cloudfront list-distributions --output table
```

### Key Concepts to Record

- **Region:** a geographic area with (typically) 2–6 AZs (e.g., `us-east-1`).
- **Availability Zone (AZ):** an isolated data center (or more) within a Region — used for HA (deploy across AZs).
- **Edge Location:** a CDN point-of-presence (CloudFront) that caches content closer to users; not a Region.
- **Local Zone / Wavelength:** closer-to-user compute extensions.

### Troubleshooting

- **Cannot find a Region:** use the Region menu top-right; not all services exist in all Regions.
- **AZ name is different across accounts** (e.g., `us-east-1a` may map to different physical DCs per account) — use AZ IDs if you need stable mapping.
- **Describe calls fail:** ensure the AWS CLI is configured (`aws configure`) and the IAM user has read permissions (e.g., `AmazonEC2ReadOnlyAccess`).

### Viva-Voce / Lab Questions & Model Answers

**Q1. How is an Availability Zone (AZ) designed to ensure fault isolation within an AWS Region?**  
- Each AZ comprises one or more discrete physical data centers housed in separate facilities with completely independent power grids, backup generators, cooling infrastructure, and networking. They are separated by a physical distance of meaningful miles (to avoid shared disaster risks like flooding) but interconnected via ultra-low-latency private fiber.

**Q2. What is an AWS Edge Location, and which AWS services make use of it?**  
- An Edge Location is a site that AWS uses to cache and deliver content with the lowest possible latency to end users globally. Services utilizing Edge Locations include:
  - **Amazon CloudFront:** Content Delivery Network (CDN) for video, images, APIs.
  - **Amazon Route 53:** Globally distributed Anycast DNS resolution.
  - **AWS Shield & WAF:** Edge security filtering against DDoS and web attacks.
  - **AWS Global Accelerator:** TCP/UDP performance routing over the AWS global backbone.

**Q3. Why does AWS randomly map AZ letter designations (e.g., `us-east-1a`) to different physical facilities across different AWS accounts?**  
- AWS applies AZ mapping randomization to prevent resource imbalance. If every customer defaulted to launching their instances into `us-east-1a`, that single physical facility would experience heavy resource contention while `us-east-1c` sat underutilized. To find the consistent physical mapping across accounts, AWS provides immutable **AZ IDs** (e.g., `use1-az1`).

---

## Practical 4 — Create an EC2 Instance with an AMI

### Objective

Launch an Amazon EC2 instance from an Amazon Machine Image (AMI), configure security groups and a key pair, and connect.

### Prerequisites

- AWS account with IAM user (permissions: `AmazonEC2FullAccess` or scoped).
- A key pair (created during the flow).

### Step-by-Step

1. **Sign in** to the AWS Console; select a Region (e.g., `us-east-1`).
2. Go to **EC2 → Instances → Launch Instances**.
3. **Name** the instance (e.g., `MyWebServer`).
4. **Amazon Machine Image (AMI):** choose an AMI — e.g., **Amazon Linux 2** (free tier) or **Ubuntu Server 22.04 LTS**.
5. **Instance type:** select **t2.micro** (or `t3.micro`) so it's free-tier eligible.
6. **Key pair:** click **Create new key pair** → name it (e.g., `mykey`) → **RSA** → **.pem** → download and save it safely. (You cannot download it again later.)
7. **Network settings:** keep the default VPC; enable **Auto-assign public IP**; click **Edit** on Security group to add a rule: type **SSH** (port 22), source **My IP** (your IP only).
8. **Configure storage:** keep the default EBS root volume (e.g., 8 GiB gp2/gp3).
9. (Optional) **User data:** add a short script to bootstrap (e.g., `#!/bin/bash\nyum install -y nginx` for Amazon Linux).
10. Click **Launch instance**; wait for the state to become **Running**.
11. **Connect:** select the instance → **Connect** → use the EC2 Instance Connect tab OR the SSH command with the private key.

### CLI / Command Placeholders

```bash
# Launch an instance from an AMI (get AMI id from EC2 console)
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t2.micro \
  --key-name mykey \
  --security-group-ids sg-0abc1234567890def \
  --subnet-id subnet-0abc1234567890def

# Describe running instances
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].InstanceId"

# Stop / terminate
aws ec2 stop-instances --instance-ids i-0abc1234567890def
aws ec2 terminate-instances --instance-ids i-0abc1234567890def
```

### Troubleshooting

- **Can't connect via SSH:** check the security group allows SSH from **your IP** (not `0.0.0.0/0` by preference); check the instance has a public IP; verify key file permissions (`chmod 400 mykey.pem` on Linux/Mac).
- **Instance type not available:** cheaper/older types may be unavailable in some Regions — choose another Region or type.
- **Key not recognized:** you must use the exact `.pem` file created; if lost, create a new key and (for Linux) you'll need to re-launch or recover through EC2 instance connect.
- **Free tier charges:** stop/terminate the instance when done to avoid charges.

### Viva-Voce / Lab Questions & Model Answers

**Q1. What three components are packaged inside an Amazon Machine Image (AMI)?**  
- An AMI packages:
  1. A template for the root volume for the instance (an OS, application server, and applications, typically an EBS snapshot).
  2. Launch permissions controlling which AWS accounts can use the AMI (public, private, or explicit account sharing).
  3. A block device mapping specifying the volumes to attach to the instance when launched.

**Q2. What is the operational difference between a Security Group and a Network Access Control List (NACL)?**  
- **Security Group:** Operates at the **instance** level; is **stateful** (if inbound traffic is allowed, corresponding outbound response traffic is automatically allowed); only supports *allow* rules.
- **Network ACL (NACL):** Operates at the **subnet** level; is **stateless** (inbound and outbound rules must be explicitly configured); supports both *allow* and *deny* rules evaluated in numbered order.

**Q3. What is the difference between Stopping and Terminating an EC2 instance?**  
- **Stopping:** The virtual CPU and RAM are deallocated; you stop paying compute hourly fees. However, attached persistent EBS root volumes remain intact, and you continue paying for EBS storage. The instance can be restarted later with the same configuration.
- **Terminating:** The instance is permanently deleted, its underlying resources are freed, and by default, its attached root EBS volume is destroyed. This action cannot be undone.

---

## Practical 5 — Establishing Connection with Remote VMs through RDP Client

### Objective

Connect to a remote Windows VM (EC2 Windows instance or a VMware Windows VM) using the **Remote Desktop Protocol (RDP)** client.

### Prerequisites

- A **Windows** VM: either a Windows EC2 instance (Practical 4-style) or a local VMware Windows VM with RDP enabled.
- The VM must have a public IP (for EC2) and port **3389** (RDP) open in the security group.

### Step-by-Step

**Part A — Prepare the Windows VM**

1. (EC2) Launch a **Windows Server** instance; note **Public IPv4 address**; add a security-group rule allowing **RDP (3389)** from your IP.
2. (VMware) Enable Remote Desktop on the guest: **Settings → System → Remote Desktop → Enable**.

**Part B — Connect with RDP**

1. On your local machine, open the **Remote Desktop Connection** (mstsc) app.
2. Enter the VM's **public IP** (or hostname) in the "Computer" field.
3. Click **Connect**; when prompted for credentials:
   - **EC2 Windows:** use username **Administrator** and the **password** you decrypt from the key pair (see below).
   - **VMware Windows:** use the local account username/password.
4. Accept the certificate warning (check "Don't ask again") and click **Yes**.
5. You will now see the remote desktop.

**Part C — Get the EC2 Windows Administrator Password**

1. In the EC2 console, select the Windows instance → **Actions → Security → Get Windows password**.
2. Click **Load private key file**, upload the `.pem` key, and click **Decrypt Password**.
3. Copy the decrypted password and use it in the RDP login.

### CLI / Command Placeholders

```
# Start RDP from Windows
mstsc

# RDP from Linux (rdesktop or xfreerdp)
xfreerdp /v:<PUBLIC_IP> /u:Administrator /cert-ignore

# Example full command
xfreerdp /v:203.0.113.10 /u:Administrator /p:<password> /cert-ignore
```

### Troubleshooting

- **RDP times out:** verify the security group allows TCP 3389 from your IP; confirm the instance is **running**; Windows firewall may need to allow RDP.
- **Credential errors:** double-check the decrypted password (Windows key passphrase is the `.pem` content). Ensure the username is correct.
- **"The remote computer is not reachable":** check public IP, instance state, and that you're not connecting to a private IP from outside the VPC.
- **VMware VM not reachable:** use **Bridged** networking so the VM has its own IP on your LAN.

### Viva-Voce / Lab Questions & Model Answers

**Q1. What protocol and default port does Remote Desktop use, and why is opening it to `0.0.0.0/0` hazardous?**  
- RDP runs over **TCP port 3389** (and optionally UDP 3389 for media streaming). Exposing port 3389 to `0.0.0.0/0` (the entire Internet) invites automated brute-force password scanning and vulnerability exploitation. In production, access must be restricted to specific management IP addresses or accessed via an AWS Systems Manager (SSM) Fleet Manager or VPN bastion host.

**Q2. How does AWS securely deliver the default Administrator password for newly launched Windows EC2 instances?**  
- AWS generates a cryptographically random Administrator password on first boot, encrypts that password using the public key of the EC2 key pair selected by the user, and stores the encrypted blob in EC2 metadata. The user must provide the corresponding private key (`.pem`) to decrypt it locally or in the console.

**Q3. In VMware Workstation, what network configuration must be applied to connect to a Windows VM using RDP from a different physical computer on the same office/campus network?**  
- The VM's virtual network adapter must be configured in **Bridged mode**. In NAT or Host-Only mode, the VM resides in an internal subnet inaccessible to other external physical machines on the local area network.

---

## Practical 6 — Create an S3 Bucket with Proper Configurations

### Objective

Create an Amazon S3 bucket with appropriate configuration: unique name, Region, versioning, encryption, and access controls.

### Prerequisites

- AWS account with IAM user with S3 permissions (e.g., `AmazonS3FullAccess`).
- AWS CLI (optional).

### Step-by-Step

1. Go to **S3 → Buckets → Create bucket**.
2. **Bucket name:** enter a globally unique name (e.g., `my-org-labs-bucket-2025`).
3. **Region:** choose a Region (e.g., `us-east-1`).
4. **Object Ownership:** leave default (ACLs disabled) or set as needed.
5. **Block Public Access settings:** keep **Block all public access** ON for a private bucket (recommended), unless you are building a public static site (Practical 7).
6. **Bucket Versioning:** **Enable** (protects against accidental overwrites/deletes).
7. **Default encryption:** choose **SSE-S3** (or SSE-KMS) for encryption at rest.
8. Under **Advanced settings**, you can attach a bucket policy later; click **Create bucket**.
9. Test: upload an object (drag-and-drop or `aws s3 cp`) and confirm it appears; check that public access is denied by default.

### CLI / Command Placeholders

```bash
# Create a bucket (region-specific)
aws s3api create-bucket --bucket my-org-labs-bucket-2025 --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning --bucket my-org-labs-bucket-2025 \
  --versioning-configuration Status=Enabled

# Upload a file
aws s3 cp hello.txt s3://my-org-labs-bucket-2025/hello.txt

# List objects
aws s3 ls s3://my-org-labs-bucket-2025/

# Delete the bucket (must be empty first)
aws s3 rb s3://my-org-labs-bucket-2025 --force
```

### Troubleshooting

- **"Bucket name already exists":** bucket names are globally unique — use a different/name-unique name.
- **Upload permission denied:** your IAM user needs S3 permissions; check bucket policy and block-public-access settings.
- **Versioning can't be disabled:** you can suspend versioning (not delete existing versions). Keep this in mind.
- **Public access warnings:** if you uncheck "Block all public access" and make a bucket public, you risk data exposure — for the lab use a clearly disposable test bucket.

### Viva-Voce / Lab Questions & Model Answers

**Q1. Why are Amazon S3 bucket names required to be globally unique across all AWS accounts worldwide?**  
- S3 buckets are accessible via public DNS endpoints formatted as `https://<bucket-name>.s3.<region>.amazonaws.com`. Because DNS hostnames must resolve unambiguously across the global Internet, no two AWS accounts can create a bucket with the same name.

**Q2. How does S3 Bucket Versioning handle object deletion?**  
- When versioning is enabled and an object is "deleted" without specifying a Version ID, S3 does not actually remove the object data. Instead, it inserts a **Delete Marker** as the current version. Previous versions remain preserved and can be retrieved or restored at any time. Permanent deletion requires explicitly deleting the object by its specific Version ID.

**Q3. What are the differences between SSE-S3, SSE-KMS, and SSE-C encryption modes in Amazon S3?**  
- **SSE-S3:** Server-side encryption where AWS fully manages and handles the cryptographic keys (AES-256) at zero extra key-management charge.
- **SSE-KMS:** Uses AWS Key Management Service (KMS), providing granular access control, key rotation, and an audit trail of key access in CloudTrail.
- **SSE-C:** Customer-Provided Keys; the customer manages and provides their own cryptographic keys, while AWS handles the encryption/decryption compute during write/read operations.

---

## Practical 7 — Create a Static Website for Cloud Deployment

### Objective

Host a static website on S3: create the bucket, enable static website hosting, upload `index.html`, set permissions, and access via the static website endpoint.

### Prerequisites

- An S3 bucket (Practical 6).
- A simple `index.html` file (and optionally `error.html`).

### Step-by-Step

1. **Create a bucket** with a unique name (e.g., `my-static-site-2025`), Region `us-east-1`; this time **uncheck "Block all public access"** and acknowledge the warning (public static site).
2. Go to **Properties** tab → **Static website hosting** → **Enable**. Set:
   - **Index document:** `index.html`
   - **Error document:** `error.html` (optional)
   - Save; copy the **Bucket website endpoint** (e.g., `http://my-static-site-2025.s3-website-us-east-1.amazonaws.com`).
3. **Upload files:** upload `index.html` (and CSS/JS) to the bucket; ensure the index file matches the name you set.
4. **Set permissions:**
   - Go to **Permissions → Bucket Policy** and add a policy allowing public reads:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::my-static-site-2025/*"
       }
     ]
   }
   ```

   - Save. (ALSO ensure **Block Public Access** is disabled for this bucket.)
5. **Test:** open the bucket website endpoint in a browser — you should see your page.

### CLI / Command Placeholders

```bash
# Enable static website hosting (via CLI)
aws s3api put-bucket-website --bucket my-static-site-2025 \
  --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"error.html"}}'

# Upload site files
aws s3 sync ./site/ s3://my-static-site-2025/

# Apply a public-read bucket policy
aws s3api put-bucket-policy --bucket my-static-site-2025 \
  --policy file://bucket-policy.json
```

### Troubleshooting

- **403 Forbidden on the endpoint:** the bucket policy is missing or "Block Public Access" is still on — add the policy and disable public-block.
- **Blank page / wrong file:** index document must match the uploaded file name; re-upload if needed.
- **HTTP (not HTTPS):** S3 static sites only provide HTTP on the direct endpoint. Add CloudFront to get HTTPS and a custom domain.
- **Files not showing:** check you uploaded to the bucket root (not a subfolder that doesn't match the path).

### Viva-Voce / Lab Questions & Model Answers

**Q1. What is the fundamental difference between an S3 REST API endpoint and an S3 Static Website Hosting endpoint?**  
- **REST API Endpoint (`<bucket>.s3.<region>.amazonaws.com`):** Expects standard S3 API requests with signing credentials, returns raw XML for errors or missing objects, and does not automatically route root requests to `index.html`.
- **Website Endpoint (`<bucket>.s3-website-<region>.amazonaws.com`):** Functions like a traditional HTTP web server. When a user requests `http://.../folder/`, it automatically serves `index.html`, and when a 404 occurs, it renders custom user-friendly HTML (`error.html`) instead of raw XML.

**Q2. Why does the direct S3 static website endpoint not support HTTPS with custom domain names? How is this resolved in production?**  
- The native S3 website endpoint is an unencrypted HTTP endpoint by architecture. To deliver a static website over **HTTPS with a custom SSL certificate (e.g., `https://www.example.com`)**, production architectures front the S3 bucket with **Amazon CloudFront (CDN)** and **AWS Certificate Manager (ACM)**.

**Q3. In the public-read bucket policy, what does `"Principal": "*"` signify, and why should it only be used on dedicated public static hosting buckets?**  
- `"Principal": "*"` grants permission to any anonymous, unauthenticated user on the Internet. Applying this to private or corporate buckets leads to massive data leaks; it is reserved strictly for public read-only assets like static web graphics, styles, and web pages.

---

## Practical 8 — Calculate the Services Bill with the AWS Pricing Calculator

### Objective

Use the **AWS Pricing Calculator** (https://calculator.aws/) to estimate the monthly cost of an architecture (e.g., EC2 + S3) and interpret the bill.

### Prerequisites

- Access to https://calculator.aws/ (free to use, no sign-in required for basic use).

### Step-by-Step

1. Open the **AWS Pricing Calculator** in a browser.
2. Click **Create estimate** → name it (e.g., `Lab-Workload`).
3. **Add a service — EC2:**
   - Search **Amazon EC2**, click **Configure**.
   - Choose **Region** (e.g., US East (N. Virginia)).
   - **Quick estimate:** pick an instance type (`t2.micro`), OS (Linux), usage (e.g., monthly), and quantity.
   - Note the estimated monthly cost; add it.
4. **Add a service — S3:**
   - Add **Amazon S3**; set storage amount (GB), storage class (Standard), requests, and data transfer (optional).
   - Add it.
5. (Optional) Add more services (EBS, RDS) to build the full architecture.
6. Click **Save and view estimate** to see the total monthly estimate, and review the **cost breakdown by service**.
7. Experiment: compare `t2.micro` vs. Reserved/Spot pricing by toggling purchase options; note the differences.

### CLI / Command Placeholders

- The Pricing Calculator is a web tool; there is no direct required CLI. The **AWS Cost Explorer** (https://console.aws.amazon.com/cost-management/) shows _actual_ usage costs.

### Troubleshooting

- **Numbers seem too high:** double-check the instance type and usage hours; use **free-tier** sizes (e.g., `t2.micro`, 750 hrs/month) and correct region.
- **Can't find a service:** use the search box; some services require more configuration before "Add".
- **Estimate vs. actual bill:** the calculator is an _estimate_; add a **budget alert** (Cost Explorer → Budgets) to monitor real spend.
- **Regions differ in price:** prices vary by region — pick the same region you actually deploy in.

### Viva-Voce / Lab Questions & Model Answers

**Q1. What is the fundamental difference between the AWS Pricing Calculator and AWS Cost Explorer?**  
- **AWS Pricing Calculator:** An ex-ante (forward-looking) modeling tool used to plan and estimate proposed cloud architecture costs *before* provisioning resources.
- **AWS Cost Explorer:** An ex-post (historical) reporting and visualization dashboard used to analyze, chart, and diagnose *actual* billed spend and usage across active accounts.

**Q2. How do Reserved Instances (RI) and Savings Plans lower compute costs in an estimate?**  
- By committing to consistent usage (1-year or 3-year term, with No Upfront, Partial Upfront, or All Upfront payment options), AWS grants predictable discounts ranging between 30% and 72% compared to standard On-Demand hourly rates.

**Q3. Why do regional data transfer and inter-AZ data transfer fees often surprise cloud engineers in actual bills?**  
- Data transfer *into* AWS (ingress) is free, but data transfer *out* of AWS to the Internet (egress) or traffic crossing different Availability Zones or Regions incurs per-GB egress charges that must be modeled explicitly in the pricing calculator.

---

## Final Checklist & Cost-Safety Reminders

- [ ] After every lab, **stop/terminate** EC2 instances and **empty & delete** S3 buckets you no longer need.
- [ ] Verify your **IAM user** has only the permissions required (least privilege).
- [ ] Enable **Cost Explorer/Budgets** to catch unexpected spend.
- [ ] Keep private keys (`.pem`) secure and never upload them to a public bucket.
- [ ] Use the **free tier** (t2.micro/t3.micro, 5 GB S3, etc.) wherever possible for these practicals.
