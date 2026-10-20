# TOS Linux — Development Environment & Toolchain Guide (Phase 2)

This document specifies the exact host hardware, operating system, and software packages required to build, test, and package **TOS 0.1 Alpha**.

---

## 1. Host Operating System Requirements

TOS can be compiled on:

| Platform | Recommended Distribution | Minimum Specs | Notes |
| :--- | :--- | :--- | :--- |
| **Native Linux** | Ubuntu 22.04/24.04 LTS, Debian 12 (Bookworm), Arch Linux, Fedora 39+ | 2 CPU Cores, 4 GB RAM, 15 GB Free Disk | **Fastest compilation.** Direct access to `/dev/kvm` hardware acceleration for QEMU testing. |
| **Windows 10/11** | WSL2 with Ubuntu 22.04 or 24.04 LTS | 4 CPU Cores, 8 GB RAM, 25 GB Free Disk | Requires WSL2 (`wsl --set-default-version 2`). Build files must reside inside the WSL ext4 partition (`~/TOS`), not on `/mnt/c/`, to prevent NTFS permission issues. |
| **macOS (Apple Silicon)** | Debian/Ubuntu inside UTM or Multipass VM | 4 vCPUs, 6 GB RAM, 20 GB Free Disk | Requires `qemu-user-static` and `binfmt-support` for x86_64 cross-architecture debootstrap. |

---

## 2. Package Breakdown: Why Each Tool is Required

Building a lightweight Linux distribution from the ground up requires specific tool categories:

### 2.1 Compilers & Core Build Utilities
- `build-essential`, `gcc`, `make`, `binutils`: Core C/C++ compiler and assembler toolchain used for compiling custom TOS C binaries, kernel modules, and system helpers.
- `git`: Source version control.

### 2.2 Filesystem & RootFS Generators
- `debootstrap`: Creates the pristine, stripped Debian Bookworm root filesystem directory tree (`work/chroot`) without needing a virtual machine.
- `squashfs-tools` (`mksquashfs`): Compresses the entire 2.3 GB root filesystem into an ultra-dense, read-only XZ-compressed block (`live/filesystem.squashfs`, ~750 MB).
- `dosfstools` (`mkfs.vfat`): Formats the FAT32 EFI System Partition (ESP) required by UEFI firmware.
- `mtools`: Allows manipulating MS-DOS/FAT filesystems without requiring loopback root mounts.

### 2.3 Bootloader & ISO Hybrid Image Builders
- `grub-pc-bin`: Provides the 32-bit/64-bit BIOS Master Boot Record (MBR) bootloader modules for legacy PCs.
- `grub-efi-amd64-bin`: Provides the 64-bit UEFI bootloader binaries (`bootx64.efi`) for modern UEFI PCs.
- `xorriso`: Creates ISO 9660 hybrid disk images that can boot either as an optical disc (CD/DVD) or directly when written raw (`dd`) to a USB flash drive.
- `isolinux` & `syslinux-efi`: Fallback bootloaders for legacy hardware support.

### 2.4 Emulators & Test Firmware
- `qemu-system-x86`: Full system x86_64 emulator allowing instantaneous testing of the built ISO without rebooting your physical computer.
- `ovmf`: Open Virtual Machine Firmware containing genuine Intel/TianoCore UEFI ROMs for testing UEFI boot menus.

---

## 3. Installation Commands

### LINUX / WSL2
```bash
# Update repositories and install full toolchain
sudo apt-get update && sudo apt-get install -y \
    build-essential \
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
    parted \
    rsync \
    curl \
    git \
    qemu-system-x86 \
    ovmf
```

### WINDOWS POWERSHELL (Admin)
If setting up Windows from scratch:
```powershell
# Enable WSL2 & Install Ubuntu
wsl --install -d Ubuntu

# Once inside the Ubuntu terminal, execute:
sudo apt-get update && sudo apt-get install -y build-essential debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools qemu-system-x86 ovmf
```

---

## 4. Verification: Run the Automated Environment Diagnostic

Execute the TOS Phase 2 diagnostics script:

```bash
chmod +x tests/test_env.sh
./tests/test_env.sh
```

### Expected Output:
```text
======================================================================
             TOS Phase 2: Host Environment Diagnostics               
======================================================================
[*] Host Architecture: x86_64 (Supported)
[*] Free Disk Space on Build Partition: 42.5 GB (PASS: >= 10 GB required)
[*] Host RAM: 15.6 GB (PASS)

[*] Checking Required Host Toolchain Binaries:
  debootstrap          [INSTALLED] - Root filesystem bootstrap engine
  mksquashfs           [INSTALLED] - Compressed read-only live filesystem generator
  xorriso              [INSTALLED] - ISO 9660 hybrid filesystem creator
  grub-mkrescue        [INSTALLED] - Dual UEFI & BIOS bootable ISO generator
  mcopy                [INSTALLED] - FAT filesystem manipulator for EFI partition
  mkfs.vfat            [INSTALLED] - FAT32 EFI partition formatter
  qemu-system-x86_64   [INSTALLED] - x86_64 virtualization emulator for testing
  git                  [INSTALLED] - Source code version control
  curl                 [INSTALLED] - Network transport utility

[*] Hardware Virtualization (KVM):
  [✓] /dev/kvm is available and accessible (Hardware acceleration enabled)

----------------------------------------------------------------------
[✓] ENVIRONMENT READY: Host is fully configured to build and test TOS.
```

---

## 5. Troubleshooting Phase 2 Environment Issues

### 1. `Cannot open /dev/kvm: Permission denied`
- **Cause:** Current user is not in the `kvm` hardware virtualization group.
- **Fix:** Add your user to the kvm group and apply permissions:
  ```bash
  sudo usermod -aG kvm $USER
  newgrp kvm
  ```

### 2. `grub-mkrescue: command not found`
- **Cause:** On some Ubuntu versions, `grub-mkrescue` is supplied by `grub-common` and `xorriso`.
- **Fix:** Run:
  ```bash
  sudo apt-get install -y grub-common xorriso mtools
  ```

### 3. WSL2 Slow Build or Permission Errors
- **Cause:** Running the build inside `/mnt/c/Users/...` instead of the native Linux ext4 filesystem.
- **Fix:** Clone/copy the project to the native WSL path:
  ```bash
  cd ~
  git clone <repo> TOS
  cd TOS
  ```
