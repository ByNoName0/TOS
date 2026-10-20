# TOS — Lightweight Linux Operating System

**TOS** is a custom, fast, modern, and lightweight Linux operating system designed specifically for low-resource hardware, older PCs, and virtualized environments.

---

## 🎯 Core Targets & Constraints

- **Primary Storage Limit:** Total installed size **≤ 10 GB** (Ideal target: **2–5 GB**).
- **Minimal ISO Target:** **< 2.0 GB** bootable live hybrid ISO.
- **RAM Target:** Idle consumption **500 MB – 1 GB** (Optimized build reaches **~220 MB**).
- **CPU Target:** Near-zero idle CPU overhead (< 1% idle).
- **Design Language:** Dark minimal futuristic aesthetic with electric blue accents:
  - Background: `#05070A`
  - Secondary: `#0A0F16`
  - Panel: `#0D1520`
  - Accent: `#1683FF`
  - Bright Accent: `#38A9FF`
  - Text: `#EAF4FF`

---

## 📁 Repository Structure

```text
TOS/
├── VERSION                     # TOS version (0.1-alpha)
├── LICENSE                     # Dual OSS Notice (MIT for TOS tools, upstream licenses preserved)
├── README.md                   # This project overview
├── docs/
│   ├── ARCHITECTURE.md         # Comprehensive evaluation of Buildroot, Alpine, Debian, Arch, LFS
│   └── BUILD.md                # Step-by-step build instructions for Linux, WSL2, & Windows
├── build/
│   ├── build.sh                # Automated rootfs & ISO builder
│   ├── clean.sh                # Build scratch cleaner
│   └── config/
│       └── tos-packages.list   # Strict minimal package manifest
├── scripts/
│   ├── tos-info                # Detailed system specification utility
│   ├── tos-size                # 10 GB storage budget compliance audit tool
│   ├── tos-performance         # RAM, CPU, services, and boot time auditor
│   └── tos-install             # Lightweight package management wrapper
└── installer/
    └── tos-installer.sh        # Guided installer with disk wipe protection
```

---

## 🚀 Quick Start (Building the OS)

For full build instructions on Native Linux and Windows WSL2, see [`docs/BUILD.md`](docs/BUILD.md).

### Host Dependencies:
```bash
sudo apt-get update && sudo apt-get install -y \
    debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin \
    mtools dosfstools qemu-system-x86 ovmf
```

### Build Command:
```bash
sudo ./build/build.sh
```

### Test in QEMU:
```bash
qemu-system-x86_64 -m 2048 -smp 2 -cdrom output/TOS-0.1-alpha-x86_64.iso -boot d
```
