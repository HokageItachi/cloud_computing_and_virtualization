# CSE423: Virtualization and Cloud Computing — Unit I Questions

**Topics:** Virtualization fundamentals · x86 virtualization · Types of virtualization · VLAN/VSAN · Parallel & distributed computing

---

## Part A — Multiple Choice Questions (MCQs)

### Instructions
Choose the single best answer for each question. Answers with explanations are at the end of Part A.

**Q1.** Which software layer creates and manages virtual machines?
- A) Hypervisor (VMM)
- B) Guest OS
- C) Device driver
- D) Application server

**Q2.** A Type 1 (bare-metal) hypervisor runs:
- A) On top of a host operating system
- B) Directly on the physical hardware
- C) Only inside a container
- D) On a remote management server

**Q3.** Which term describes a machine running on a host under a hypervisor's control, complete with its own guest OS?
- A) Container
- B) Virtual Machine (VM)
- C) Physical host
- D) vSwitch

**Q4.** The main reason x86 was historically difficult to virtualize is that:
- A) It had no privilege levels
- B) Several sensitive instructions were not trapable and silently failed in lower privilege rings
- C) It could not execute Ring 0 code
- D) It lacked a CPU cache

**Q5.** In paravirtualization, the guest OS:
- A) Remains completely unmodified
- B) Uses binary translation of every instruction
- C) Is modified to make explicit "hypercalls" to the hypervisor
- D) Runs only in user mode with no kernel

**Q6.** Hardware-assisted virtualization on modern x86 CPUs is provided by:
- A) Intel VT-x and AMD-V
- B) Hyper-threading alone
- C) SSE instructions
- D) PCIe slots

**Q7.** A VLAN (Virtual LAN) primarily provides:
- A) Logical segmentation of a physical network into isolated broadcast domains
- B) A way to pool storage disks
- C) CPU scheduling for VMs
- D) Encrypted hard disks

**Q8.** A VSAN (Virtual Storage Area Network) is used to:
- A) Segment a Fibre Channel SAN fabric into isolated logical storage networks
- B) Replace the need for a hypervisor
- C) Create IP subnets
- D) Provide a web server

**Q9.** Which system is characterized by tightly coupled processors sharing a single memory address space, typically within one machine?
- A) Distributed System
- B) Parallel System (shared-memory)
- C) Peer-to-peer network
- D) Serverless function

**Q10.** In distributed systems, which of the following is a key challenge that arises because components can fail independently?
- A) Partial failure handling
- B) Power management
- C) Keyboard layout
- D) Monitor refresh rate

---

### Answers & Explanations

**A1. A) Hypervisor (VMM).**
The hypervisor (Virtual Machine Monitor) is the layer that creates and manages VMs and allocates hardware resources to them.

**A2. B) Directly on the physical hardware.**
A Type 1 (bare-metal) hypervisor (ESXi, KVM, Hyper-V) runs on hardware, while a Type 2 hypervisor (VirtualBox, Workstation) runs on a host OS.

**A3. B) Virtual Machine (VM).**
A VM is the emulated computer with its own guest OS managed by the hypervisor. A container (D) shares the host kernel instead.

**A4. B) Several sensitive instructions were not trapable and silently failed in lower privilege rings.**
x86 has sensitive instructions that don't trap when run at a lower privilege level, violating Popek–Goldberg virtualization criteria and making naive full virtualization fail.

**A5. C) Is modified to make explicit "hypercalls" to the hypervisor.**
Paravirtualization uses a modified guest OS that makes hypercalls, avoiding sensitive instructions for better performance. Full virtualization (A) leaves the guest unmodified.

**A6. A) Intel VT-x and AMD-V.**
Hardware-assisted virtualization (VT-x / AMD-V) lets the guest run in a new mode where sensitive instructions trap automatically.

**A7. A) Logical segmentation of a physical network into isolated broadcast domains.**
VLANs reduce broadcast traffic, improve security, and allow logical regrouping without rewiring.

**A8. A) Segment a Fibre Channel SAN fabric into isolated logical storage networks.**
A VSAN is the storage-network analogue of a VLAN — logical partitioning of a physical SAN fabric.

**A9. B) Parallel System (shared-memory).**
Parallel systems are tightly coupled and often share memory within a single machine (SMP/NUMA), whereas distributed systems are loosely coupled over a network.

**A10. A) Partial failure handling.**
Components in a distributed system fail independently, so the system must operate correctly despite partial failures — a defining challenge.

---

## Part B — Subjective Questions

### Short-Answer Questions

**SA1. Define virtualization and list four benefits of virtualizing a server.**

**Model Answer:**
Virtualization is the creation of a virtual version of a computing resource (server, storage, network, OS, or application) by decoupling software from the underlying physical hardware using a hypervisor.

Four benefits:
1. **Server consolidation** — run many VMs on one physical machine, cutting hardware/power/cooling costs.
2. **Isolation** — faults or crashes in one VM do not affect others.
3. **Fast provisioning** — create a new VM in minutes instead of buying/racking hardware.
4. **Snapshots & migration** — easy backup, cloning, and live migration for DR and maintenance.

**SA2. Differentiate between Type 1 and Type 2 hypervisors and give one example of each.**

**Model Answer:**
- **Type 1 (bare-metal):** Runs directly on physical hardware, no host OS; better performance, isolation, and suited to data centers. Example: VMware ESXi, KVM, Microsoft Hyper-V.
- **Type 2 (hosted):** Runs as an application on top of an existing host OS; easier to set up for desktop/development use, but with more overhead. Example: VMware Workstation, Oracle VirtualBox.

**SA3. Why was the x86 architecture difficult to virtualize, and how does hardware-assisted virtualization (Intel VT-x / AMD-V) solve the problem?**

**Model Answer:**
x86 was difficult because it had sensitive instructions that were **not trapable** — when a guest OS ran them at a lower privilege level, they silently failed or gave wrong results instead of trapping to the VMM, violating the Popek–Goldberg criteria. Also, both the guest kernel and VMM wanted Ring 0.

Hardware-assisted virtualization adds a new "guest mode" execution state. The CPU provides VT-x/AMD-V extensions so the guest runs in its own mode at a high privilege, and any sensitive instruction **automatically traps** to the hypervisor. This eliminates the need for binary translation or guest OS modification, giving near-native performance and compatibility.

**SA4. What is a VLAN? List three benefits of using VLANs.**

**Model Answer:**
A VLAN is a logical segmentation of a physical network into multiple isolated broadcast domains (via 802.1Q tagging), so devices in the same VLAN act as if on the same LAN.

Three benefits:
1. **Broadcast control** — smaller broadcast domains reduce unnecessary traffic.
2. **Security/isolation** — separate departments or security zones without new hardware.
3. **Flexibility & cost reduction** — logical regrouping without rewiring; fewer physical switches needed.

**SA5. Distinguish between parallel and distributed computing.**

**Model Answer:**
**Parallel computing** uses tightly coupled processors (often shared memory, one machine) to split a single large problem for speedup; communication is via a fast interconnect and it is typically synchronous.
**Distributed computing** uses loosely coupled autonomous computers over a network that cooperate to provide a service; they have distributed memory, communicate by message passing, and must handle partial failures, asynchrony, and inconsistent clocks.

### Long-Answer / Analytical Questions

**LA1. Explain the types of virtualization (server, storage, network, desktop, application, OS-level/containers) with one application of each.**

**Model Answer (step-by-step):**
1. **Server virtualization** — one physical server partitioned into multiple VMs; used for server consolidation (e.g., running 10 legacy app servers on one blade).
2. **Storage virtualization** — pool physical storage into one logical unit; used in SANs and software-defined storage (e.g., VMware vSAN) for tiering and snapshots.
3. **Network virtualization** — abstract network resources into logical segments; used for VLANs, VXLAN overlays, and cloud VPCs.
4. **Desktop virtualization (VDI)** — host virtual desktops centrally and deliver them to thin clients; used by enterprises for secure remote work.
5. **Application virtualization** — run apps in isolated environments without installing them on the host; used for compatibility testing (e.g., Microsoft App-V).
6. **OS-level virtualization (containers)** — share the host kernel with isolated user-space instances; used for microservices and CI/CD (e.g., Docker, Kubernetes).

*Note the progression:* from full hardware virtualization (server) down to lightweight process isolation (containers).

**LA2. Compare the computing paradigms — centralized, parallel, distributed, cluster, grid, and cloud — and explain how cloud computing builds on virtualization and distributed computing.**

**Model Answer (step-by-step):**
1. Build a comparison table of paradigms (strengths/weaknesses) as summarized in the notes: centralized (simple, not scalable), parallel (fast single problem, hardware-bound), distributed (scalable/fault-tolerant, complex), cluster (cheap commodity hardware, single admin), grid (heterogeneous cross-org resources, coordination overhead), cloud (on-demand elastic self-service, pay-per-use, vendor lock-in risk).
2. **Centralized vs. distributed:** centralized has a single point of failure and scaling limit; distributed distributes load and risk but adds consistency/network complexity.
3. **Cloud's foundations:** cloud uses *virtualization* to pool and partition physical resources, and it is itself a *distributed system* (many data centers, redundant nodes, load balancers) for availability and elasticity.
4. **The service model:** cloud adds self-service provisioning, metering, and pay-as-you-go — the defining layer on top of cluster/distributed infrastructure.
5. **Conclusion:** cloud = distributed/cluster infrastructure + virtualization isolation stack management * a service-oriented, elastic delivery model.

**LA3. With a diagram/description, explain the x86 privilege rings and why a guest OS running in Ring 3 (as in classic full virtualization) causes problems. Then explain how hardware-assisted virtualization resolves this.**

**Model Answer (step-by-step):**
1. **Privilege rings:** x86 has rings 0–3. Ring 0 (kernel) = highest privilege; Ring 3 (user) = lowest.
2. **The conflict:** A guest OS kernel expects to run in Ring 0, but the VMM also occupies Ring 0; if the guest is pushed to Ring 1/3 it can't execute privileged instructions correctly.
3. **Classic full virtualization (binary translation):** The VMM scans and rewrites guest kernel instructions on the fly, replacing non-virtualizable sensitive instructions with safe equivalents — works but costs performance.
4. **Paravirtualization:** the guest is modified to call the hypervisor via hypercalls instead of using sensitive instructions — faster but requires guest changes.
5. **Hardware-assisted (VT-x/AMD-V):** the CPU adds a *guest mode*; the guest runs in guest mode with privileged instructions allowed, and any sensitive instruction traps automatically to the hypervisor. No rewriting, no guest modification — the modern solution.
6. **Memory:** shadow page tables or nested (EPT/NPT) page tables map guest→host memory efficiently.

---

## Part C — Exam Tips
- Remember the **Popek–Goldberg criteria** — prerequisite for a VMM: efficiency, resource control, equivalence.
- Know the **"pick two" CAP theorem** link when discussing distributed consistency.
- Be ready to draw the **VLAN vs VSAN** contrast (network vs. storage).
- Connect Unit I to Unit II: virtualization is the enabling tech for cloud resource pooling.
