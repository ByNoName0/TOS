#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: QEMU Bootloader Verification
# Tests generated hybrid ISO in QEMU across UEFI and Legacy BIOS modes.
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ISO_FILE="${PROJECT_ROOT}/output/TOS-0.1-alpha-x86_64.iso"
MODE="${1:---uefi}"

echo "======================================================================"
echo "          TOS 0.1 ALPHA — QEMU BOOTLOADER TEST HARNESS                "
echo "======================================================================"

if [ ! -f "$ISO_FILE" ]; then
    echo "[!] ISO image not found at ${ISO_FILE}."
    echo "    Run: ./build/build-phase4-bootloader.sh first."
    exit 1
fi

# Locate OVMF firmware for UEFI testing
OVMF_PATH=""
for p in /usr/share/ovmf/OVMF.fd /usr/share/OVMF/OVMF_CODE.fd /usr/share/edk2/ovmf/OVMF_CODE.fd; do
    if [ -f "$p" ]; then
        OVMF_PATH="$p"
        break
    fi
done

# Check KVM acceleration
KVM_FLAG=""
if [ -w /dev/kvm ]; then
    KVM_FLAG="-enable-kvm -cpu host"
    echo "[✓] Hardware KVM acceleration enabled."
else
    KVM_FLAG="-cpu qemu64"
    echo "[!] Using software emulation (KVM not accessible)."
fi

case "$MODE" in
    --uefi)
        if [ -z "$OVMF_PATH" ]; then
            echo "[!] OVMF UEFI firmware not found on host. Falling back to BIOS mode."
            qemu-system-x86_64 -m 2048 -smp 2 $KVM_FLAG -cdrom "$ISO_FILE" -boot d -vga virtio -net nic -net user
        else
            echo "[*] Launching QEMU in 64-bit UEFI Mode (Firmware: $OVMF_PATH)..."
            qemu-system-x86_64 \
                -m 2048 \
                -smp 2 \
                $KVM_FLAG \
                -bios "$OVMF_PATH" \
                -cdrom "$ISO_FILE" \
                -boot d \
                -vga virtio \
                -net nic -net user
        fi
        ;;

    --bios)
        echo "[*] Launching QEMU in Legacy BIOS Mode..."
        qemu-system-x86_64 \
            -m 2048 \
            -smp 2 \
            $KVM_FLAG \
            -cdrom "$ISO_FILE" \
            -boot d \
            -vga std \
            -net nic -net user
        ;;

    *)
        echo "Usage: $0 [--uefi | --bios]"
        exit 1
        ;;
esac
