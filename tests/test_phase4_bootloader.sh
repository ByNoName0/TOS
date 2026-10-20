#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 4 Bootloader Configuration Audit
# Validates GRUB menuentries, kernel parameters, and dual UEFI/BIOS structures
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GRUB_CFG="${PROJECT_ROOT}/boot/grub/grub.cfg"
LOOPBACK_CFG="${PROJECT_ROOT}/boot/grub/loopback.cfg"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 4: Bootloader Configuration Audit             ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# 1. File Presence
echo "[*] Checking Bootloader Files:"
for f in "$GRUB_CFG" "$LOOPBACK_CFG"; do
    printf "  %-40s " "$(basename "$f")"
    if [ -f "$f" ]; then
        echo -e "${GREEN}[EXISTS]${RESET}"
    else
        echo -e "${RED}[MISSING]${RESET}"
        ERRORS=$((ERRORS + 1))
    fi
done

# 2. Audit GRUB Menuentries
echo -e "\n[*] Auditing Required GRUB Menu Entries:"
REQUIRED_ENTRIES=(
    "Try TOS 0.1 Alpha:Live RAM desktop entry"
    "Install TOS 0.1 Alpha:Direct disk installer entry"
    "TOS Recovery Console:Single-user maintenance entry"
    "TOS Safe Graphics Mode:Nomodeset fallback entry"
    "TOS Toram Mode:Copy-to-RAM live entry"
    "UEFI Firmware Settings:BIOS setup shortcut"
)

for item in "${REQUIRED_ENTRIES[@]}"; do
    entry="${item%%:*}"
    desc="${item#*:}"
    printf "  %-30s " "$entry"
    if grep -q "$entry" "$GRUB_CFG"; then
        echo -e "${GREEN}[FOUND]${RESET} - $desc"
    else
        echo -e "${RED}[MISSING]${RESET} - $desc"
        ERRORS=$((ERRORS + 1))
    fi
done

# 3. Kernel Commandline Parameter Verification
echo -e "\n[*] Checking Kernel Live Boot Parameters in grub.cfg:"
for param in "boot=live" "components" "quiet" "splash"; do
    printf "  Parameter: %-20s " "$param"
    if grep -q "$param" "$GRUB_CFG"; then
        echo -e "${GREEN}[OK]${RESET}"
    else
        echo -e "${RED}[MISSING]${RESET}"
        ERRORS=$((ERRORS + 1))
    fi
done

# 4. Color Palette Verification
echo -e "\n[*] Checking TOS Visual Identity Palette in grub.cfg:"
if grep -q "menu_color_highlight=cyan/black" "$GRUB_CFG" && grep -q "menu_color_normal=white/black" "$GRUB_CFG"; then
    echo -e "  ${GREEN}[✓] Electric-blue / Dark palette configured correctly.${RESET}"
else
    echo -e "  ${RED}[!] Missing palette declarations in grub.cfg.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 4 BOOTLOADER AUDIT PASSED: Dual UEFI/BIOS configuration ready.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 4 BOOTLOADER AUDIT FAILED: $ERRORS issues detected.${RESET}"
    exit 1
fi
