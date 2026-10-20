#!/usr/bin/env bash
# ==============================================================================
# TOS 0.1 Alpha — WSL2 Fast Native Builder
# Builds completely in native Linux ext4 (/tmp/tos-build) to bypass Windows NTFS
# limitations, then exports the completed ISO directly to your Windows drive.
# ==============================================================================
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "[!] ERROR: Please run as root: sudo $0"
    exit 1
fi

CURRENT_DIR="$(pwd)"
OUTPUT_DIR="${CURRENT_DIR}/output"
WORK_EXT4="/tmp/tos-build"
CHROOT_DIR="${WORK_EXT4}/chroot"
LIVE_DIR="${WORK_EXT4}/image"

echo "======================================================================"
echo "          TOS LINUX 0.1 ALPHA — WSL2 NATIVE EXT4 BUILDER              "
echo "======================================================================"
echo " Source Path       : ${CURRENT_DIR}"
echo " Native Workspace  : ${WORK_EXT4} (High Speed Linux ext4)"
echo " Windows Output ISO: ${OUTPUT_DIR}/TOS-0.1-alpha-x86_64.iso"
echo "======================================================================"

cleanup() {
    echo "[*] Cleaning up chroot mount points..."
    for m in "${CHROOT_DIR}/dev/pts" "${CHROOT_DIR}/dev" "${CHROOT_DIR}/proc" "${CHROOT_DIR}/sys" "${CHROOT_DIR}/run"; do
        if mountpoint -q "$m" 2>/dev/null; then
            umount -lf "$m" 2>/dev/null || true
        fi
    done
}
trap cleanup EXIT INT TERM

# Clean previous build
rm -rf "${WORK_EXT4}"
mkdir -p "${WORK_EXT4}" "${CHROOT_DIR}" "${LIVE_DIR}/live" "${LIVE_DIR}/boot/grub" "${OUTPUT_DIR}"

echo "[1/6] Debootstrapping clean Debian Bookworm base on native ext4..."
debootstrap --variant=minbase --arch=amd64 bookworm "${CHROOT_DIR}" http://deb.debian.org/debian

echo "[2/6] Mounting virtual kernel filesystems..."
mount --bind /dev "${CHROOT_DIR}/dev"
mount --bind /dev/pts "${CHROOT_DIR}/dev/pts"
mount -t proc proc "${CHROOT_DIR}/proc"
mount -t sysfs sysfs "${CHROOT_DIR}/sys"
mount -t tmpfs tmpfs "${CHROOT_DIR}/run"

echo "nameserver 1.1.1.1" > "${CHROOT_DIR}/etc/resolv.conf"

cat << 'EOF' > "${CHROOT_DIR}/etc/apt/apt.conf.d/99tos-clean"
APT::Install-Recommends "false";
APT::Install-Suggests "false";
EOF

cat << 'EOF' > "${CHROOT_DIR}/etc/apt/sources.list"
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
EOF

echo "[3/6] Installing Linux LTS Kernel, Live-Boot, and Core Utilities..."
chroot "${CHROOT_DIR}" /bin/bash << 'EOF'
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y linux-image-amd64 live-boot systemd-sysv busybox sudo e2fsprogs dosfstools \
    xserver-xorg-core xserver-xorg-video-all xinit openbox tint2 rofi picom feh pcmanfm lxterminal mousepad \
    iproute2 isc-dhcp-client wpasupplicant curl

if ! id "tos" >/dev/null 2>&1; then
    useradd -m -s /bin/bash -g users -G sudo,audio,video,plugdev,netdev tos
    echo "tos:tos" | chpasswd
    echo "root:tos" | chpasswd
fi
echo "tos ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/tos
chmod 0440 /etc/sudoers.d/tos

apt-get clean
rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/apt/archives/*
EOF

echo "[4/6] Injecting TOS Desktop Configuration and Scripts..."
mkdir -p "${CHROOT_DIR}/etc/hostname" "${CHROOT_DIR}/etc/issue" "${CHROOT_DIR}/usr/local/bin"
echo "tos-pc" > "${CHROOT_DIR}/etc/hostname"
cp "${CURRENT_DIR}/rootfs/etc/issue" "${CHROOT_DIR}/etc/issue" 2>/dev/null || true
cp "${CURRENT_DIR}/scripts/tos-"* "${CHROOT_DIR}/usr/local/bin/" 2>/dev/null || true
chmod +x "${CHROOT_DIR}/usr/local/bin/tos-"* 2>/dev/null || true

# Extract Kernel and Initrd
VMLINUZ=$(ls -1 "${CHROOT_DIR}/boot/vmlinuz-"* | head -n 1)
INITRD=$(ls -1 "${CHROOT_DIR}/boot/initrd.img-"* | head -n 1)
cp "${VMLINUZ}" "${LIVE_DIR}/live/vmlinuz"
cp "${INITRD}" "${LIVE_DIR}/live/initrd.img"

# Unmount before SquashFS
echo "[*] Unmounting virtual kernel filesystems before creating SquashFS..."
for m in "${CHROOT_DIR}/dev/pts" "${CHROOT_DIR}/dev" "${CHROOT_DIR}/proc" "${CHROOT_DIR}/sys" "${CHROOT_DIR}/run"; do
    if mountpoint -q "$m" 2>/dev/null; then
        umount -lf "$m" 2>/dev/null || true
    fi
done

echo "[5/6] Generating compressed live SquashFS (takes ~45 seconds)..."
mksquashfs "${CHROOT_DIR}" "${LIVE_DIR}/live/filesystem.squashfs" \
    -comp xz \
    -Xbcj x86 \
    -b 1048576 \
    -wildcards \
    -e "boot/vmlinuz*" "boot/initrd.img*" "proc/*" "sys/*" "dev/*" "run/*" "tmp/*"

echo "[6/6] Building dual UEFI & BIOS Bootable Hybrid ISO..."
cp "${CURRENT_DIR}/boot/grub/grub.cfg" "${LIVE_DIR}/boot/grub/grub.cfg"

grub-mkrescue -o "${OUTPUT_DIR}/TOS-0.1-alpha-x86_64.iso" "${LIVE_DIR}"

ISO_SIZE=$(du -h "${OUTPUT_DIR}/TOS-0.1-alpha-x86_64.iso" | cut -f1)

echo "======================================================================"
echo "[✓] SUCCESS: TOS Live ISO successfully created!"
echo " Location in Windows : S:\\TOS\\output\\TOS-0.1-alpha-x86_64.iso"
echo " Location in WSL     : ${OUTPUT_DIR}/TOS-0.1-alpha-x86_64.iso"
echo " ISO Size            : ${ISO_SIZE}"
echo "======================================================================"
