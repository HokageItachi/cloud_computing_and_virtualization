# CSE423 — Unit I Cheat Sheet (One-Page Revision)

**Topics:** Virtualization fundamentals · x86 virtualization · Types of virtualization · VLAN/VSAN · Distributed & parallel computing paradigms

---

## 1. Virtualization — Core Ideas
- **Virtualization** = creating a *virtual* version of a resource (server, storage, network, OS, app) decoupled from physical hardware.
- **Hypervisor (VMM)** = software that creates/runs VMs. **Host** = physical machine; **Guest** = the VM/its OS.
- **Hypervisor types:**
  - **Type 1 (bare-metal):** runs directly on hardware — VMware ESXi, Hyper-V, KVM, Xen. Data centers/cloud.
  - **Type 2 (hosted):** runs as an app on an OS — VMware Workstation, VirtualBox. Desktop/dev.
- **Benefits:** server consolidation, isolation, resource optimization, fast provisioning, snapshots/migration, legacy support, safe testing.
- **Virtualization vs Emulation:** virtualization runs native ISA (near-native speed); emulation replicates hardware for another architecture (slow).

## 2. x86 Virtualization
- Problem: x86 was **not designed for virtualization** (violates Popek–Goldberg: ~16–17 sensitive instructions are *not trapable*).
- **Rings:** Ring 0 = kernel, Ring 3 = user. Guest OS wants Ring 0, but VMM needs it too.
- **Three approaches:**
  1. **Full virtualization (binary translation)** — VMM rewrites non-virtualizable guest instructions; guest unmodified; compatible but slower.
  2. **Paravirtualization** — guest OS is *modified*; uses **hypercalls**; fast but needs modified guest.
  3. **Hardware-assisted** — CPU modes (Intel VT-x / AMD-V); guest runs in separate mode; auto-traps; no translation/modification. **Modern standard.**
- **Memory:** shadow page tables (classic) vs nested page tables EPT/NPT (hardware, fast).
- **I/O:** emulation (slow) vs paravirtualized (virtio) vs passthrough/SR-IOV (near-native).

## 3. Types of Virtualization
| Type | What it is | Example |
|------|-----------|---------|
| Server | Partition one physical server into VMs | ESXi |
| Desktop (VDI) | Central-hosted virtual desktops | Horizon, Citrix |
| Storage | Pool physical storage into one logical unit | vSAN, SAN virtualization |
| Network | Abstract network into logical segments | VLAN, VXLAN, VPC |
| Application | Isolated app runtime, no host install | App-V, containers |
| OS-level | Shared kernel, isolated user-space | Docker, LXC |
| Data | Single logical view over multiple sources | Data virtualization |

## 4. VLAN & VSAN
- **VLAN** = logical segmentation of a *physical network* into isolated broadcast domains (802.1Q tags, 12-bit → 4096 VLANs). Inter-VLAN needs a **router**.
  - Benefits: broadcast control, security/isolation, flexibility, cost, easier management.
  - Types: port-based, tagged/trunk (802.1Q), MAC/protocol-based.
- **VSAN** = logical partition of a *Fibre Channel SAN fabric* (isolated zones with own fabric services). *(In VMware, "vSAN" = software-defined storage from local disks.)*
  - Benefits: isolation, security, availability, consolidation, independent management.
- **Memory aid:** VLAN = network segmentation; VSAN = storage network segmentation.

## 5. Distributed & Parallel Computing
- **Parallel:** tightly coupled processors on one machine, one problem split → speedup. Shared memory, low latency, synchronous. Example: GPU/supercomputer.
- **Distributed:** loosely coupled autonomous computers over a network cooperating to provide a service. Distributed memory, messages, asynchronous, partial failure. Example: web, Kubernetes, Google search.
- **Amdahl's Law:** Speedup ≤ 1 / (S + (1−S)/N), S = serial fraction.
- **Flynn's taxonomy:** SISD, SIMD (GPU), MISD (rare), MIMD (most parallel systems).
- **Memory architectures:** shared (SMP/UMA), NUMA, distributed memory (MPP/MPI), hybrid.
- **Distributed system essentials:** concurrency, no global clock, independent failures, message passing. Middleware (RPC, CORBA, message queues). CAP theorem (Consistency, Availability, Partition tolerance — pick 2).
- **Paradigm comparison:** Centralized (simple, SPOF) → Parallel (fast, tight) → Distributed (scalable, complex) → Cluster (commodity HPC) → Grid (heterogeneous geo-distributed) → Cloud (on-demand, elastic, pay-per-use).

---

## Mnemonics
- **"No-good x86" = H-F-P:** Hardware-assisted = Fast (no translation). Paravirtualized = faster but guest modified. Full = compatible.
- **"VLAN = what IP, VSAN = what Fibre Channel."**
- **"D in Distributed = Decoupled & Diverse; P in Parallel = Processors one machine."**
- **CAP pick 2:** "CA (single node), CP, or AP — never all three."

## Quick carry-away
> Hypervisor choice by workload → Type 1 prod / Type 2 lab · enable VT-x/AMD-V in BIOS · right-size vCPU/RAM · thin-provision storage but monitor · keep snapshots short-lived · tagged trunk VLANs · separate backup VSAN · design distributed systems for partial failure.

## External links (shortlist)
- VMware "What is virtualization": vmware.com/topics/glossary/content/virtualization
- VMware vSphere docs: docs.vmware.com/en/VMware-vSphere
- KVM: linux-kvm.org · Hyper-V: learn.microsoft.com/windows-server/virtualization
- Intel VT-x: intel.com/content/www/us/en/virtualization
- Popek–Goldberg: dl.acm.org/doi/10.1145/361011.361073
- LLNL parallel computing tutorial: hpc.llnl.gov/documentation/tutorials
- MIT 6.824 distributed systems: pdos.csail.mit.edu/6.824
