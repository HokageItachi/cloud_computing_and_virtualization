# CSE423: Virtualization and Cloud Computing — Unit I Notes

**Course:** CSE423: Virtualization and Cloud Computing
**Unit I Topics:** Virtualization fundamentals · x86 virtualization · Types of virtualization · VLAN/VSAN · Distributed & parallel computing paradigms

---

## Table of Contents
1. Fundamentals of Virtualization
2. x86 Virtualization
3. Types of Virtualization
4. VLAN and VSAN and their Benefits
5. Overview of Distributed Computing
6. Parallel vs. Distributed Systems
7. Parallel Computing
8. Parallel Computer Architecture
9. Distributed Systems
10. Comparison of Computing Paradigms
11. Implementation Tips & Tricks
12. External Links

---

## 1. Fundamentals of Virtualization

### 1.1 What is Virtualization?
**Virtualization** is the process of creating a *virtual* (rather than physical) version of a computing resource — such as a server, storage device, operating system, network, or application. A single physical machine can be partitioned into multiple isolated "virtual machines" (VMs), each running its own OS and applications.

**Key idea:** You decouple the **software** from the underlying **hardware**, so software can run independently of the physical hardware that hosts it.

### 1.2 Core Components
| Term | Description |
|------|-------------|
| **Hypervisor (VMM)** | The software layer that creates and runs virtual machines. Also called a Virtual Machine Monitor (VMM). |
| **Host** | The physical machine that runs the hypervisor. |
| **Guest** | The virtual machine (with its guest OS) running on top of the hypervisor. |
| **Virtual Machine (VM)** | An emulation of a computer system. A guest OS runs inside it. |

### 1.3 The Hypervisor — the heart of virtualization
A hypervisor manages hardware resources (CPU, memory, storage, network) and allocates them to guests. It performs **resource multiplexing**, **isolation**, and **scheduling**.

**Two main types:**
- **Type 1 (Bare-metal) Hypervisor:** Runs directly on physical hardware (no host OS). Examples: VMware ESXi, Microsoft Hyper-V, KVM, Xen. Used in data centers and clouds.
- **Type 2 (Hosted) Hypervisor:** Runs on top of an existing OS as an application. Examples: VMware Workstation, Oracle VirtualBox, VMware Player. Used for desktop/development use.

### 1.4 Why Virtualize? (Benefits)
- **Server consolidation:** Run many VMs on one physical server → lower hardware, power, cooling, and space costs.
- **Isolation:** Faults in one VM do not affect others.
- **Resource optimization:** Better utilization of often-idle hardware.
- **Fast provisioning:** Create a new VM in minutes vs. days to buy/rack a physical server.
- **Snapshots & migration:** Easy backup, cloning, disaster recovery, and live migration.
- **Legacy support:** Run old OSs on modern hardware.
- **Testing/development:** Safe sandboxes for experiments.

### 1.5 Virtualization vs. Emulation
- **Emulation** replicates hardware in software so software for a *different architecture* can run (slower).
- **Virtualization** runs native ISA instructions directly on the physical CPU (with some translation), so performance is near-native.

---

## 2. x86 Virtualization

### 2.1 Why x86 is challenging
The x86 architecture was **not originally designed for virtualization**. Classic requirements (Popek–Goldberg virtualization criteria) demand that:
- All sensitive instructions be executed in a **higher privilege ring** than the guest.
- Instructions be **trapable** so the VMM can intercept them.

x86 violates this because:
- It has **16–17 sensitive instructions** that are *not* trapable (they silently fail instead of trapping when executed at a lower privilege level).

### 2.2 The x86 Privilege Model (Rings)
x86 has 4 privilege levels (rings 0–3):
- Ring 0 — highest privilege (kernel).
- Ring 3 — lowest privilege (user).
- A guest OS expects to run its kernel in **Ring 0**, but the VMM also needs Ring 0. Conflict!

### 2.3 Approaches to x86 Virtualization
1. **Full Virtualization (Binary Translation)** — Early VMware approach. The VMM translates guest kernel instructions in software (rewrites non-virtualizable instructions on the fly). Guest OS is unmodified. Slow but compatible.
2. **Paravirtualization** — The guest OS is *modified* to be virtualization-aware. It makes explicit "hypercalls" to the VMM instead of using sensitive instructions. Much faster, but requires a modified guest OS.
3. **Hardware-Assisted Virtualization** — Modern CPUs (Intel VT-x, AMD-V) add new execution modes. The guest runs in a new, separate "guest mode" (Ring 0 is effectively virtualized). The CPU traps on sensitive instructions automatically. No binary translation, no guest modification. This is now the standard (VMware, KVM, Hyper-V, Xen all use it).

### 2.4 Memory Virtualization
- Guests have their own virtual address spaces.
- VMM uses **shadow page tables** (classic) or **nested page tables** (EPT/NPT on modern hardware) to map guest virtual → guest physical → host physical.
- Hardware-assisted nested paging greatly speeds up memory virtualization.

### 2.5 I/O Virtualization
- **Emulation:** VMM emulates a disk/network device (slow).
- **Paravirtualized I/O:** Fast shared-memory ring buffers (virtio) — used by KVM/Xen.
- **Device passthrough / SR-IOV:** Give the guest direct access to a physical device (near-native performance), used for high-performance NICs/GPUs.

---

## 3. Types of Virtualization

### 3.1 Server Virtualization
Partitioning one physical server into multiple VMs. (Most common; see §1–2.)

### 3.2 Desktop Virtualization (VDI)
End users access a virtual desktop hosted on a central server from a thin client, laptop, or tablet. Centralized management, data stays in the data center.
- Examples: Citrix Virtual Apps and Desktops, VMware Horizon, Microsoft Azure Virtual Desktop.

### 3.3 Storage Virtualization
Pooling physical storage from multiple devices into one logical storage unit that is managed centrally. Enables features like tiering, snapshots, replication.
- Examples: SAN (Storage Area Network) virtualization, VMware vSAN, software-defined storage.

### 3.4 Network Virtualization
Decoupling network resources from physical hardware by abstracting the network into logical segments.
- Examples: VLANs, virtual switches (vSwitch), overlay networks (VXLAN), virtual networks in clouds (VPCs).

### 3.5 Application Virtualization
Runs applications in isolated runtime environments without installing them on the host OS (e.g., Microsoft App-V, Docker containers are a related form).

### 3.6 OS-Level Virtualization (Containers)
The OS kernel is shared, but user-space instances are isolated (namespaces + cgroups). Very lightweight and fast to start.
- Examples: Docker, LXC, Podman, Kubernetes orchestration.

### 3.7 Data Virtualization
Presents data from multiple sources (databases, files) as a single logical view without copying/moving it. Used in data integration.

---

## 4. VLAN and VSAN

### 4.1 VLAN (Virtual Local Area Network)
A **VLAN** is a logical segmentation of a physical network into multiple isolated broadcast domains. Devices in the same VLAN behave as if they are on the same physical LAN, even if they are on different switches.

**How it works:** Switch ports are assigned a VLAN tag (using the 802.1Q standard). Frames carry a VLAN tag (12 bits → up to 4096 VLANs). Communication between different VLANs requires a **router** (Layer 3) or a layer-3 switch.

**Benefits of VLANs:**
- **Broadcast control:** Reduces broadcast traffic (smaller broadcast domains).
- **Security/isolation:** Separate departments/security zones (e.g., guest Wi-Fi vs. internal).
- **Flexibility:** Users can be regrouped logically without rewiring physical cables.
- **Cost reduction:** Fewer physical switches/routers; better use of existing hardware.
- **Simpler management:** Administrators can move a user between VLANs by reconfiguring a port.

**Types:**
- **Port-based VLAN:** Ports are assigned to a VLAN (most common).
- **Tagged (802.1Q) VLAN / Trunking:** Frames are tagged; used between switches to carry multiple VLANs over one link (trunk).
- **MAC-based / protocol-based VLANs:** Less common.

### 4.2 VSAN (Virtual Storage Area Network)
A **VSAN** (Virtual SAN) is a logical partition of a physical SAN (Storage Area Network) fabric. Fibre Channel zoning/fabric segmentation groups servers and storage into isolated logical SANs. (Note: In VMware vSAN context, "vSAN" is a software-defined storage pool built from local disks of ESXi hosts — different usage of the same acronym.)

**How it works:** A physical Fibre Channel switch fabric is partitioned into multiple logical VSANs (similar to VLANs but for the storage network). Each VSAN is an isolated zone with its own fabric services.

**Benefits of VSANs:**
- **Isolation:** Separate dev/test/prod storage traffic.
- **Security:** Restrict which servers can see which storage.
- **Availability:** A fault in one VSAN doesn't affect others.
- **Consolidation:** Multiple departments share one physical SAN fabric while keeping logical separation.
- **Management:** Independent configuration per VSAN (zoning, masking, performance).

**VLAN vs. VSAN (quick memory aid):** VLAN = logical segmentation of the **network**; VSAN = logical segmentation of the **storage network (SAN)**. VLAN for IP traffic, VSAN for Fibre Channel storage traffic.

---

## 5. Overview of Distributed Computing

**Distributed computing** involves multiple autonomous computers that communicate over a network and coordinate to solve a problem or provide a service. To the user, the collection often appears as a single coherent system.

**Goals:**
- Resource sharing (data, compute, storage)
- Scalability (add machines as load grows)
- Fault tolerance (no single point of failure)
- Performance and parallelism
- Transparency (location, access, migration, replication transparency)

---

## 6. Parallel vs. Distributed Systems

| Aspect | Parallel Computing | Distributed Computing |
|--------|--------------------|------------------------|
| **Hardware** | Tightly coupled processors (shared memory, one machine). | Loosely coupled, autonomous computers over a network. |
| **Memory** | Often shared memory (SMP) or distributed memory but within a single machine cluster. | Distributed memory; each node has its own local memory. |
| **Communication** | High-speed bus/interconnect; very low latency. | Network messages; higher latency, lower reliability. |
| **Synchronization** | Typically synchronous, coordinated. | Asynchronous, message passing; synchronization is harder. |
| **Failure handling** | A processor failure usually stops the job (often fail-fast). | Must handle partial failures; nodes can fail independently. |
| **Goal** | Speedup of a single large computation. | Service provision, resource sharing, scalability, availability. |
| **Topology** | SIMD/MIMD, NUMA, etc. | Client-server, peer-to-peer, three-tier. |
| **Example** | GPU computing, multi-core supercomputer. | Web services, Google search, Kubernetes cluster. |

**Key nuance:** Parallel computing usually implies a *single* problem split across processors to finish faster. Distributed computing often implies a *set of interacting* components cooperating to provide a service.

---

## 7. Parallel Computing

**Parallel computing** = performing many calculations simultaneously by dividing a problem into sub-problems each run on a different processor.

**Levels of parallelism:**
- **Bit-level, instruction-level (ILP):** pipelining, superscalar execution.
- **Data parallelism:** same operation on many data elements (SIMD — GPU, vector units).
- **Task parallelism:** different tasks run concurrently (MIMD).
- **Thread-level / process-level:** multi-threading, multi-process.

**Why parallelize:** To achieve **speedup** and handle problems that don't fit on one processor. Amdahl's Law limits the speedup based on the serial fraction:

> **Speedup ≤ 1 / (S + (1−S)/N)**, where S = serial fraction, N = number of processors.

**Challenges:** Overhead of communication, synchronization, load balancing, and the serial bottleneck (Amdahl).

---

## 8. Parallel Computer Architecture

Common taxonomies (Flynn's taxonomy):
- **SISD:** Single Instruction, Single Data (classic single-core).
- **SIMD:** Single Instruction, Multiple Data (GPUs, vector processors).
- **MISD:** Multiple Instruction, Single Data (rare, used in fault-tolerant/military).
- **MIMD:** Multiple Instruction, Multiple Data (most parallel systems today).

**Memory architecture:**
- **Shared Memory (SMP):** All processors share one address space; UMA/Uniform memory access. E.g., multi-core servers.
- **NUMA (Non-Uniform Memory Access):** Processors have local memory but can access all memory with different latencies.
- **Distributed Memory (MPP):** Each processor has private memory; message passing (MPI) to communicate. E.g., clusters, massively parallel supercomputers.
- **Hybrid:** Clusters of SMP nodes.

---

## 9. Distributed Systems

A **distributed system** is a collection of independent computers that appear to the user as one coherent system (Coulouris definition).

**Essential characteristics:**
- **Concurrency:** components run in parallel.
- **No global clock:** components can't share a single time reference; coordination via logical clocks / clocks.
- **Independent failures:** components fail independently; the system must handle partial failure.
- **Communication** via messages over a network.

**Architectural styles:**
- Client-server (centralized)
- Peer-to-peer (all nodes equal — BitTorrent)
- Three-tier / n-tier (web apps)
- Microservices (loosely coupled services)

**Middleware:** Software that sits between applications and the OS/network, providing services like messaging, transactions, naming, and RPC (e.g., CORBA, Java RMI, message queues).

**Key challenges:** Transparency, reliability, scalability, consistency, security, and managing the CAP theorem (Consistency, Availability, Partition tolerance — pick two).

**Examples:** The Internet, World Wide Web, Google search, Bitcoin blockchain, Kubernetes clusters, cloud platforms.

---

## 10. Comparison of Different Computing Paradigms

| Paradigm | Definition | Strengths | Weaknesses | Examples |
|----------|-----------|-----------|------------|----------|
| **Centralized Computing** | One machine does all processing. | Simple, easy to manage, deterministic. | Scalability limit, single point of failure. | Single mainframe. |
| **Parallel Computing** | Multiple processors on one machine/close interconnect solve one problem. | High throughput on a single big task, low latency. | Tight coupling, cost, hard to scale beyond a machine. | Supercomputers, GPUs. |
| **Distributed Computing** | Multiple autonomous computers cooperate over a network. | Scalable, fault-tolerant, resource sharing. | Complexity, network latency, consistency. | Web apps, Hadoop, cloud. |
| **Cluster Computing** | Group of closely connected homogeneous computers working as one. | Cheap via commodity hardware, high availability. | Single point of admin, tightly coupled. | HPC clusters, Kubernetes. |
| **Grid Computing** | Heterogeneous, geographically distributed resources coordinated to solve large problems. | Harnesses idle resources across organizations. | Security, coordination overhead, heterogeneity. | SETI@Home, EGEE. |
| **Cloud Computing** | On-demand, scalable, pay-as-you-go network access to a shared pool of configurable resources. | Elasticity, self-service, pay-per-use, economies of scale. | Internet dependency, vendor lock-in, security/trust. | AWS, Azure, GCP. |

**How they relate:** Cloud computing is a *service model* that builds on distributed/cluster computing concepts and virtualization (from Unit II onward).

---

## 11. Implementation Tips & Tricks (Real-World)

- **Choose hypervisor by workload:** For production data centers use a **Type 1 hypervisor** (ESXi, KVM, Hyper-V). For personal/classroom labs use **Type 2** (VirtualBox, VMware Workstation).
- **Enable hardware-assisted virtualization in BIOS/UEFI** (Intel VT-x / AMD-V). Check it's on — otherwise VMs will be painfully slow.
- **Right-size VMs:** Don't over-allocate vCPU/RAM. Overcommitment can cause "CPU ready time" and contention. Use 1 vCPU → 2-4 GB RAM as a starting point for general VMs.
- **Use thin provisioning** for storage when you expect low utilization, but monitor growth to avoid filling the datastore.
- **Always keep snapshots short-lived** — they consume storage and can grow unboundedly. Delete old snapshots.
- **VLAN hygiene:** Use *tagged* (802.1Q) trunk links between switches; use a distinct native VLAN on trunks; never put management traffic on a user VLAN.
- **Naming conventions:** Use consistent VLAN IDs across sites (e.g., 10 = mgmt, 20 = user, 30 = guest, 40 = storage) so configs are predictable.
- **Across VSANs:** Create a separate VSAN for backup/management traffic to keep bulk data movement from impacting production storage I/O.
- **Keep the guest OS unmodified for compatibility; use paravirtualized drivers (virtio)** for best I/O performance when possible.
- **Learn the Popek–Goldberg criteria** — exam favourite: it * why x86 needed hardware assist.
- **For distributed systems:** design for **partial failure**; assume the network can drop messages; use idempotent operations and retries; implement timeouts.

---

## 12. External Links (Curated Placeholders)

**Virtualization general:**
- VMware Docs — "What is Virtualization": https://www.vmware.com/topics/glossary/content/virtualization
- VMware vSphere Documentation (ESXi/Hypervisor): https://docs.vmware.com/en/VMware-vSphere/index.html
- KVM (Kernel-based Virtual Machine) main site: https://www.linux-kvm.org/
- Microsoft Hyper-V documentation: https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-on-windows-server
- Xen Project: https://xenproject.org/

**x86 Virtualization / hardware assist:**
- Intel VT-x docs: https://www.intel.com/content/www/us/en/virtualization/virtualization-technology/intel-virtualization-technology.html
- AMD-V: https://www.amd.com/en/technologies/virtualization
- Popek & Goldberg paper (classic): https://dl.acm.org/doi/10.1145/361011.361073
- VMware "Understanding Full Virtualization, Paravirtualization, and Hardware Assist": https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/techpaper/VMware_paravirtualization.pdf

**Networking & Storage:**
- IEEE 802.1Q VLAN standard overview: https://en.wikipedia.org/wiki/IEEE_802.1Q
- Cisco VLAN configuration guide: https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9500/software/release/17-1/configuration_guide/sec/b_sec_17_1_catalyst_9500_cfg/configureing_vlans.html
- Fibre Channel / VSAN (Cisco): https://www.cisco.com/c/en/us/products/storage-networking/virtual-san-vsan/index.html
- VMware vSAN product page: https://www.vmware.com/products/vsan.html

**Parallel & distributed computing:**
- "Introduction to Parallel Computing" — Lawrence Livermore National Laboratory: https://hpc.llnl.gov/documentation/tutorials/introduction-parallel-computing-tutorial
- Amdahl's Law explanation: https://en.wikipedia.org/wiki/Amdahl%27s_law
- Distributed systems textbook (Coulouris): https://www.distributed-systems.net/
- MPI (Message Passing Interface) standard: https://www.mpi-forum.org/
- MIT 6.824 Distributed Systems course (video lectures): https://pdos.csail.mit.edu/6.824/
- Flynn's taxonomy: https://en.wikipedia.org/wiki/Flynn%27s_taxonomy

**Video tutorials (YouTube placeholders):**
- "Virtualization Explained" — TechTerms / PowerCert (search: *Virtualization Explained*)
- "Hypervisors and Virtualization Explained" — IBM Cloud
- "What is a Hypervisor?" — VMware/CBT Nuggets
- "Network Virtualization VLAN vs VSAN" — storage/networking channels
- "Parallel Computing explained" — HPC / NPTEL lecture series
- "Distributed Systems" — NPTEL / MIT OCW 6.824 lecture videos

> Tip: Replace placeholder links with the latest official docs by searching the exact term on the vendor site.
