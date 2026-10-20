#!/usr/bin/env bash
# ==============================================================================
# TOS Phase 2 — Environment & Toolchain Diagnostics
# Validates host system readiness for building TOS 0.1 Alpha
# ==============================================================================
set -e

# Visual colors
GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
YELLOW="\033[38;2;251;191;36m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 2: Host Environment Diagnostics               ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0
WARNINGS=0

# 1. Architecture Check
ARCH=$(uname -m)
echo -n "[*] Host Architecture: "
if [ "$ARCH" = "x86_64" ]; then
    echo -e "${GREEN}${ARCH} (Supported)${RESET}"
else
    echo -e "${RED}${ARCH} (Unsupported - TOS 0.1 targets x86_64)${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Free Disk Space Check (Need at least 10 GB free for rootfs + squashfs build)
echo -n "[*] Free Disk Space on Build Partition: "
FREE_KB=$(df -P . | awk 'NR==2 {print $4}')
FREE_GB=$(awk "BEGIN {printf \"%.1f\", ${FREE_KB}/1048576}")
if (( $(awk "BEGIN {print (${FREE_GB} >= 10.0)}") )); then
    echo -e "${GREEN}${FREE_GB} GB (PASS: >= 10 GB required)${RESET}"
else
    echo -e "${YELLOW}${FREE_GB} GB (WARNING: < 10 GB free, build may run out of space)${RESET}"
    WARNINGS=$((WARNINGS + 1))
fi

# 3. Memory Check
echo -n "[*] Host RAM: "
TOTAL_MEM_KB=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
TOTAL_MEM_GB=$(awk "BEGIN {printf \"%.1f\", ${TOTAL_MEM_KB}/1048576}")
if (( $(awk "BEGIN {print (${TOTAL_MEM_GB} >= 2.0)}") )); then
    echo -e "${GREEN}${TOTAL_MEM_GB} GB (PASS)${RESET}"
else
    echo -e "${YELLOW}${TOTAL_MEM_GB} GB (WARNING: >= 2 GB recommended for smooth builds)${RESET}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Critical Build Binaries Check
echo -e "\n[*] Checking Required Host Toolchain Binaries:"
TOOLS=(
    "debootstrap:Root filesystem bootstrap engine"
    "mksquashfs:Compressed read-only live filesystem generator"
    "xorriso:ISO 9660 hybrid filesystem creator"
    "grub-mkrescue:Dual UEFI & BIOS bootable ISO generator"
    "mcopy:FAT filesystem manipulator for EFI partition"
    "mkfs.vfat:FAT32 EFI partition formatter"
    "qemu-system-x86_64:x86_64 virtualization emulator for testing"
    "git:Source code version control"
    "curl:Network transport utility"
)

for item in "${TOOLS[@]}"; do
    bin="${item%%:*}"
    desc="${item#*:}"
    printf "  %-20s " "$bin"
    if command -v "$bin" >/dev/null 2>&1; then
        VERSION_STR=$( "$bin" --version 2>&1 | head -n 1 | cut -c1-40 || echo "installed" )
        echo -e "${GREEN}[INSTALLED]${RESET} - $desc"
    else
        echo -e "${RED}[MISSING]${RESET}   - $desc"
        ERRORS=$((ERRORS + 1))
    fi
done

# 5. KVM Virtualization Acceleration Check (Optional but recommended for fast QEMU)
echo -e "\n[*] Hardware Virtualization (KVM):"
if [ -e /dev/kvm ] && [ -w /dev/kvm ]; then
    echo -e "  ${GREEN}[✓] /dev/kvm is available and accessible (Hardware acceleration enabled)${RESET}"
elif [ -e /dev/kvm ]; then
    echo -e "  ${YELLOW}[!] /dev/kvm exists but requires 'sudo usermod -aG kvm \$USER'${RESET}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "  ${YELLOW}[!] /dev/kvm not detected (QEMU will use software emulation; slightly slower)${RESET}"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] ENVIRONMENT READY: Host is fully configured to build and test TOS.${RESET}"
    exit 0
else
    echo -e "${RED}[!] ENVIRONMENT NOT READY: $ERRORS required build tools are missing.${RESET}"
    echo -e "    Run: sudo ./build/setup-env.sh (or see docs/DEVELOPMENT.md)"
    exit 1
fi
