#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 3 RootFS & Kernel Configuration Audit
# Validates rootfs configuration integrity, kernel hooks, and size budgets
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CHROOT_DIR="${PROJECT_ROOT}/work/chroot"
BOOT_DIR="${PROJECT_ROOT}/work/boot"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 3: RootFS & Kernel Validation                 ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# Check required repository overlay files
echo "[*] Checking Phase 3 RootFS Overlay Configuration Files:"
REQUIRED_FILES=(
    "rootfs/etc/os-release:OS identification metadata"
    "rootfs/etc/issue:Minimal boot ASCII banner"
    "rootfs/etc/hostname:System hostname ('tos-pc')"
    "rootfs/etc/hosts:Loopback address mappings"
    "rootfs/etc/fstab:Live mount table (overlay + tmpfs)"
    "rootfs/etc/network/interfaces:DHCP networking"
    "rootfs/etc/apt/apt.conf.d/99tos-lean:Lean APT anti-bloat policy"
    "rootfs/etc/initramfs-tools/conf.d/tos-compression.conf:XZ initramfs compression"
    "build/config/tos-phase3-packages.list:Phase 3 minimal package list"
    "build/build-phase3-rootfs.sh:Phase 3 bootstrap build engine"
)

for item in "${REQUIRED_FILES[@]}"; do
    file="${item%%:*}"
    desc="${item#*:}"
    printf "  %-55s " "$file"
    if [ -f "${PROJECT_ROOT}/${file}" ]; then
        echo -e "${GREEN}[OK]${RESET}"
    else
        echo -e "${RED}[MISSING]${RESET}"
        ERRORS=$((ERRORS + 1))
    fi
done

# If work/chroot has been built on this machine, audit it
if [ -d "${CHROOT_DIR}" ]; then
    echo -e "\n[*] Auditing Generated RootFS in ${CHROOT_DIR}:"
    CRITICAL_TARGETS=("/bin/bash" "/bin/sh" "/sbin/init" "/etc/os-release" "/usr/local/bin/tos-info")
    for target in "${CRITICAL_TARGETS[@]}"; do
        printf "  %-30s " "$target"
        if [ -e "${CHROOT_DIR}${target}" ]; then
            echo -e "${GREEN}[FOUND]${RESET}"
        else
            echo -e "${RED}[MISSING]${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
    done

    # Check uncompressed size
    ROOTFS_MB=$(du -sm "${CHROOT_DIR}" | awk '{print $1}')
    echo -e "\n[*] Uncompressed RootFS Size: ${ROOTFS_MB} MB"
    if [ "$ROOTFS_MB" -lt 1500 ]; then
        echo -e "  ${GREEN}[✓] PASS: RootFS is ${ROOTFS_MB} MB (< 1500 MB budget target)${RESET}"
    else
        echo -e "  ${RED}[!] FAIL: RootFS exceeds 1500 MB threshold!${RESET}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "\n[*] Notice: work/chroot has not yet been built on this host."
    echo "    To build, run: sudo ./build/build-phase3-rootfs.sh"
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 3 CONFIGURATION VALIDATED: Ready for rootfs bootstrap.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 3 VALIDATION FAILED: $ERRORS errors detected.${RESET}"
    exit 1
fi
