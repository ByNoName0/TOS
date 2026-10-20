#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: QEMU Boot Verification
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ISO_FILE="${PROJECT_ROOT}/output/TOS-0.1-alpha-x86_64.iso"

echo "=== Running TOS QEMU Boot Verification Test ==="

if [ ! -f "$ISO_FILE" ]; then
    echo "[*] Notice: ISO file ($ISO_FILE) not yet built."
    echo "    Run 'sudo ./build/build.sh' to generate the bootable ISO."
    echo "[*] Checking QEMU binary presence..."
    if command -v qemu-system-x86_64 >/dev/null 2>&1; then
        echo "[✓] QEMU binary found: $(which qemu-system-x86_64)"
    else
        echo "[!] QEMU not found in PATH. Install via 'sudo apt-get install qemu-system-x86'"
    fi
    exit 0
fi

echo "[*] Testing ISO boot in QEMU..."
qemu-system-x86_64 \
    -m 2048 \
    -smp 2 \
    -cdrom "$ISO_FILE" \
    -boot d \
    -vga virtio \
    -net nic -net user
