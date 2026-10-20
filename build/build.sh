#!/usr/bin/env bash
# ==============================================================================
# TOS LINUX — Official Live ISO & RootFS Build Pipeline (Phase 1–3)
# Target: TOS 0.1 Alpha (x86_64)
# Max Installed Target: 10 GB | Target ISO: < 1.5 GB | Idle RAM Target: < 400 MB
# ==============================================================================
set -euo pipefail

# Ensure script is run with root permissions
if [ "$(id -u)" -ne 0 ]; then
    echo "[!] ERROR: The TOS build script must be run as root (or via sudo)."
    echo "    Usage: sudo $0"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if running on a Windows drvfs/NTFS drive (/mnt/c, /mnt/d, /mnt/s, etc.)
# Windows NTFS does not support Linux rootfs POSIX symlinks/devices, causing "tar failed"
if [[ "$PROJECT_ROOT" == /mnt/* ]] || df -T "$PROJECT_ROOT" 2>/dev/null | grep -qE "drvfs|9p"; then
    echo "[*] Detected Windows NTFS filesystem mount ($PROJECT_ROOT)."
    echo "    Using Linux native ext4 workspace (/tmp/tos-work) for rootfs bootstrap..."
    WORK_DIR="/tmp/tos-work"
else
    WORK_DIR="${PROJECT_ROOT}/work"
fi

CHROOT_DIR="${WORK_DIR}/chroot"
LIVE_IMAGE_DIR="${WORK_DIR}/image"
OUTPUT_DIR="${PROJECT_ROOT}/output"
ISO_NAME="TOS-0.1-alpha-x86_64.iso"

DEBIAN_RELEASE="bookworm"
DEBIAN_MIRROR="http://deb.debian.org/debian"

echo "======================================================================"
echo "                   TOS LINUX BUILD SYSTEM 0.1 ALPHA                   "
echo "======================================================================"
echo " Base Distribution : Debian Minimal (${DEBIAN_RELEASE})"
echo " Target Arch       : x86_64"
echo " Build Workspace   : ${WORK_DIR} (Linux native ext4)"
echo " Final Output ISO  : ${OUTPUT_DIR}/${ISO_NAME}"
echo " Max Storage Target: 10 GB (Ideal RootFS < 2.5 GB)"
echo " Visual Identity   : Dark Minimal / Electric Blue (#05070A / #1683FF)"
echo "======================================================================"

# Clean up mounts upon script termination (success or error)
cleanup() {
    echo "[*] Cleaning up chroot mount points..."
    for m in "${CHROOT_DIR}/dev/pts" "${CHROOT_DIR}/dev" "${CHROOT_DIR}/proc" "${CHROOT_DIR}/sys" "${CHROOT_DIR}/run"; do
        if mountpoint -q "$m" 2>/dev/null; then
            umount -lf "$m" 2>/dev/null || true
        fi
    done
}
trap cleanup EXIT INT TERM

# Step 1: Check dependencies
echo "[1/8] Checking host build dependencies..."
REQUIRED_TOOLS=("debootstrap" "mksquashfs" "xorriso" "grub-mkrescue")
MISSING_TOOLS=()
for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo "[!] ERROR: Missing host dependencies: ${MISSING_TOOLS[*]}"
    echo "    Please run: sudo apt-get update && sudo apt-get install -y debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools debian-archive-keyring"
    exit 1
fi
echo "[✓] All host dependencies verified."

# Step 2: Prepare directories
echo "[2/8] Preparing build directories..."
mkdir -p "${WORK_DIR}"
mkdir -p "${CHROOT_DIR}"
mkdir -p "${LIVE_IMAGE_DIR}/live"
mkdir -p "${LIVE_IMAGE_DIR}/boot/grub"
mkdir -p "${OUTPUT_DIR}"

# Step 3: Debootstrap Minimal System
# Verify complete debootstrap by checking /etc/debian_version and no leftover /debootstrap dir
if [ ! -f "${CHROOT_DIR}/etc/debian_version" ] || [ -d "${CHROOT_DIR}/debootstrap" ]; then
    echo "[3/8] Running clean debootstrap for ${DEBIAN_RELEASE} (minimal base)..."
    rm -rf "${CHROOT_DIR}"
    mkdir -p "${CHROOT_DIR}"
    DEBOOTSTRAP_OPTS=(--variant=minbase --arch=amd64)
    if [ ! -f /usr/share/keyrings/debian-archive-keyring.gpg ]; then
        DEBOOTSTRAP_OPTS+=(--no-check-gpg)
    fi
    debootstrap "${DEBOOTSTRAP_OPTS[@]}" "${DEBIAN_RELEASE}" "${CHROOT_DIR}" "${DEBIAN_MIRROR}"
    echo "[✓] Base system bootstrapped successfully."
else
    echo "[3/8] Base debootstrap chroot verified. Re-using cached rootfs."
fi

# Step 4: Configure chroot environment
echo "[4/8] Mounting kernel filesystems into chroot..."
mount --bind /dev "${CHROOT_DIR}/dev"
mount --bind /dev/pts "${CHROOT_DIR}/dev/pts"
mount -t proc proc "${CHROOT_DIR}/proc"
mount -t sysfs sysfs "${CHROOT_DIR}/sys"
mount -t tmpfs tmpfs "${CHROOT_DIR}/run"

# Configure APT inside chroot (disable recommendations to keep system lean)
cat << 'EOF' > "${CHROOT_DIR}/etc/apt/apt.conf.d/99tos-clean"
APT::Install-Recommends "false";
APT::Install-Suggests "false";
APT::AutoRemove::RecommendsImportant "false";
APT::AutoRemove::SuggestsImportant "false";
EOF

# Inject Debian repositories
cat << EOF > "${CHROOT_DIR}/etc/apt/sources.list"
deb ${DEBIAN_MIRROR} ${DEBIAN_RELEASE} main contrib non-free non-free-firmware
deb ${DEBIAN_MIRROR} ${DEBIAN_RELEASE}-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security ${DEBIAN_RELEASE}-security main contrib non-free non-free-firmware
EOF

# Configure DNS for chroot package downloads
echo "nameserver 1.1.1.1" > "${CHROOT_DIR}/etc/resolv.conf"

# Step 5: Install packages inside chroot
echo "[5/8] Installing core Linux kernel and TOS base packages inside chroot..."
PACKAGES=$(grep -v '^#' "${PROJECT_ROOT}/build/config/tos-packages.list" | grep -v '^$' | tr '\n' ' ')

chroot "${CHROOT_DIR}" /bin/bash << EOF
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ${PACKAGES}

# Create default live user 'tos' with password 'tos'
if ! id "tos" >/dev/null 2>&1; then
    useradd -m -s /bin/bash -g users -G sudo,audio,video,plugdev,netdev tos
    echo "tos:tos" | chpasswd
    echo "root:tos" | chpasswd
fi

# Enable passwordless sudo for live session
echo "tos ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/tos
chmod 0440 /etc/sudoers.d/tos

# Clean package cache to minimize squashfs size
apt-get clean
rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/apt/archives/*
EOF

# Step 6: Inject TOS Branding and Scripts
echo "[6/8] Injecting TOS branding, configuration, and custom CLI tools..."

# Hostname and hosts
echo "tos-pc" > "${CHROOT_DIR}/etc/hostname"
cat << 'EOF' > "${CHROOT_DIR}/etc/hosts"
127.0.0.1   localhost
127.0.1.1   tos-pc
EOF

# OS identification
cat << 'EOF' > "${CHROOT_DIR}/etc/os-release"
NAME="TOS"
VERSION="0.1 Alpha"
ID=tos
ID_LIKE=debian
PRETTY_NAME="TOS 0.1 Alpha (Lightweight Linux)"
VERSION_ID="0.1"
HOME_URL="https://github.com/tos-os"
BUG_REPORT_URL="https://github.com/tos-os/issues"
EOF

# Copy custom scripts into /usr/local/bin
cp "${PROJECT_ROOT}/scripts/tos-info" "${CHROOT_DIR}/usr/local/bin/tos-info"
cp "${PROJECT_ROOT}/scripts/tos-size" "${CHROOT_DIR}/usr/local/bin/tos-size"
cp "${PROJECT_ROOT}/scripts/tos-performance" "${CHROOT_DIR}/usr/local/bin/tos-performance"
cp "${PROJECT_ROOT}/scripts/tos-install" "${CHROOT_DIR}/usr/local/bin/tos-install"
chmod +x "${CHROOT_DIR}/usr/local/bin/tos-"*

# Copy installer
mkdir -p "${CHROOT_DIR}/usr/local/tos"
cp "${PROJECT_ROOT}/installer/tos-installer.sh" "${CHROOT_DIR}/usr/local/tos/tos-installer.sh"
chmod +x "${CHROOT_DIR}/usr/local/tos/tos-installer.sh"
ln -sf /usr/local/tos/tos-installer.sh "${CHROOT_DIR}/usr/local/bin/tos-installer"

# Copy kernel and initrd out of chroot for live boot image
VMLINUZ=$(ls -1 "${CHROOT_DIR}/boot/vmlinuz-"* | head -n 1)
INITRD=$(ls -1 "${CHROOT_DIR}/boot/initrd.img-"* | head -n 1)

cp "${VMLINUZ}" "${LIVE_IMAGE_DIR}/live/vmlinuz"
cp "${INITRD}" "${LIVE_IMAGE_DIR}/live/initrd.img"

# Step 7: Unmount kernel filesystems & Build SquashFS
echo "[*] Unmounting virtual kernel filesystems before creating SquashFS..."
for m in "${CHROOT_DIR}/dev/pts" "${CHROOT_DIR}/dev" "${CHROOT_DIR}/proc" "${CHROOT_DIR}/sys" "${CHROOT_DIR}/run"; do
    if mountpoint -q "$m" 2>/dev/null; then
        umount -lf "$m" 2>/dev/null || true
    fi
done

echo "[7/8] Generating compressed live SquashFS (takes ~45 seconds)..."
rm -f "${LIVE_IMAGE_DIR}/live/filesystem.squashfs"
mksquashfs "${CHROOT_DIR}" "${LIVE_IMAGE_DIR}/live/filesystem.squashfs" \
    -comp xz \
    -Xbcj x86 \
    -b 1048576 \
    -wildcards \
    -e "boot/vmlinuz*" "boot/initrd.img*" "proc/*" "sys/*" "dev/*" "run/*" "tmp/*"

# Step 8: Configure GRUB & Build Hybrid ISO
echo "[8/8] Building bootable hybrid UEFI / BIOS ISO..."

cat << 'EOF' > "${LIVE_IMAGE_DIR}/boot/grub/grub.cfg"
set default="0"
set timeout=10

# TOS Dark Theme Palette
set menu_color_normal=white/black
set menu_color_highlight=cyan/black

insmod all_video
insmod font

menuentry "TOS 0.1 Alpha (Try Live without installing)" {
    linux /live/vmlinuz boot=live quiet splash components
    initrd /live/initrd.img
}

menuentry "TOS 0.1 Alpha (Install TOS to Disk)" {
    linux /live/vmlinuz boot=live quiet splash components tos-mode=install
    initrd /live/initrd.img
}

menuentry "TOS 0.1 Alpha (Safe Graphics / Fallback Nomodeset)" {
    linux /live/vmlinuz boot=live nomodeset
    initrd /live/initrd.img
}
EOF

# Create ISO with hybrid boot
grub-mkrescue -o "${OUTPUT_DIR}/${ISO_NAME}" "${LIVE_IMAGE_DIR}"

ISO_SIZE=$(du -h "${OUTPUT_DIR}/${ISO_NAME}" | cut -f1)
echo "======================================================================"
echo "[✓] SUCCESS: TOS Live ISO successfully created!"
echo " Location: ${OUTPUT_DIR}/${ISO_NAME}"
echo " ISO Size: ${ISO_SIZE} (Target was < 2.0 GB)"
echo " Run in QEMU: qemu-system-x86_64 -m 2048 -cdrom ${OUTPUT_DIR}/${ISO_NAME}"
echo "======================================================================"
