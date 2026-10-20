# TOS Linux — Build & Environment Setup Guide

This document provides exact, tested step-by-step instructions to prepare the development environment and build **TOS 0.1 Alpha**.

---

## 1. Supported Host Environments

TOS can be compiled on:
1. **Native Linux** (Debian 12 Bookworm, Ubuntu 22.04/24.04 LTS, Linux Mint, Fedora, Arch Linux)
2. **Windows 10/11 via WSL2** (Ubuntu or Debian WSL distro recommended)

---

## 2. Windows Development Setup (WSL2)

If your host operating system is Windows, use WSL2.

### Step 2.1 — Open Windows PowerShell (As Administrator)
Run the following PowerShell command to enable WSL2 and install Ubuntu:

```powershell
# WINDOWS POWERSHELL (Admin)
wsl --install -d Ubuntu
```

Once installed, reboot Windows if prompted, open the **Ubuntu** app from your Start Menu, and create your UNIX username and password.

---

## 3. Host Dependencies Installation

Inside your **Linux terminal** or **WSL2 shell**, execute the following command to install the required build tools, kernel extractors, bootloader utilities, filesystem builders, and QEMU emulator:

```bash
# LINUX / WSL2 TERMINAL
sudo apt-get update && sudo apt-get install -y \
    binutils \
    debootstrap \
    squashfs-tools \
    xorriso \
    isolinux \
    syslinux-efi \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools \
    dosfstools \
    qemu-system-x86 \
    ovmf \
    curl \
    git \
    rsync
```

### Verification Command:
Check that the critical tools are present in your PATH:

```bash
which debootstrap mksquashfs xorriso qemu-system-x86_64
```

Expected output:
```text
/usr/sbin/debootstrap
/usr/bin/mksquashfs
/usr/bin/xorriso
/usr/bin/qemu-system-x86_64
```

---

## 4. Phase 1 & 2 Execution: Building the Minimal TOS RootFS

### Step 4.1 — Make Build Scripts Executable
Navigate to the root of your TOS repository and grant execution permissions:

```bash
chmod +x build/*.sh scripts/tos-* installer/*.sh
```

### Step 4.2 — Run the Build Script
Run the automated build script as root (required for `debootstrap` chroot mount operations):

```bash
sudo ./build/build.sh
```

### Step 4.3 — What the Build Script Does Under the Hood:
1. Validates host dependencies.
2. Initializes a clean Debian Bookworm minbase rootfs in `work/chroot` (~350 MB download, ~850 MB uncompressed).
3. Configures `/etc/apt/sources.list` and disables APT recommendation bloat (`APT::Install-Recommends "false";`).
4. Installs the minimal Linux LTS kernel (`linux-image-amd64`), systemd, network stack, and core utilities.
5. Injects the TOS branding (`/etc/os-release`, `/etc/issue`, `/etc/hostname`).
6. Installs the custom TOS CLI commands into `/usr/local/bin` (`tos-info`, `tos-size`, `tos-performance`, `tos-install`, `tos-remove`, `tos-update`).
7. Packages the filesystem into a compressed SquashFS image (`live/filesystem.squashfs`).
8. Generates the dual-mode UEFI and BIOS GRUB bootloader structure.
9. Produces a bootable ISO: `output/TOS-0.1-alpha-x86_64.iso`.

---

## 5. Testing with QEMU

Once the build completes, test your bootable ISO in QEMU:

### UEFI Boot Test:
```bash
qemu-system-x86_64 \
    -m 2048 \
    -smp 2 \
    -bios /usr/share/ovmf/OVMF.fd \
    -cdrom output/TOS-0.1-alpha-x86_64.iso \
    -boot d \
    -vga virtio \
    -net nic -net user
```

### Legacy BIOS Boot Test:
```bash
qemu-system-x86_64 \
    -m 2048 \
    -smp 2 \
    -cdrom output/TOS-0.1-alpha-x86_64.iso \
    -boot d \
    -vga std \
    -net nic -net user
```

---

## 6. Expected Output on Boot

1. **GRUB Boot Menu:**
   - `* TOS 0.1 Alpha (Try Live / Live RAM)`
   - `  TOS 0.1 Alpha (Install to Disk)`
   - `  TOS Safe Mode (nomodeset)`

2. **System Startup:**
   - Linux kernel initializes hardware devices.
   - Live SquashFS mounts read-only with tmpfs overlay.
   - Auto-login to live user or graphical environment.

3. **Terminal Verification:**
   Run:
   ```bash
   tos-info
   tos-size
   tos-performance
   ```

---

## 7. Troubleshooting Common Errors

### Error: `debootstrap: command not found`
- **Cause:** Package is missing on the host.
- **Fix:** Run `sudo apt-get install debootstrap`.

### Error: `mount: ... permission denied` during build
- **Cause:** `build.sh` was run without root privileges.
- **Fix:** Prefix with `sudo`: `sudo ./build/build.sh`.

### Error: `OVMF.fd: No such file or directory` in QEMU
- **Cause:** OVMF package path varies across distributions.
- **Fix:** On Ubuntu/Debian, search for the file:
  `find /usr/share -name "OVMF.fd" 2>/dev/null`
  Usually located at `/usr/share/ovmf/OVMF.fd` or `/usr/share/OVMF/OVMF_CODE.fd`.
