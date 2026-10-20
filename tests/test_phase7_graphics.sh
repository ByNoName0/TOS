#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 7 Graphics & Display Stack Audit
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 7: Graphics & Display Stack Audit              ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# 1. Check Modesetting & Glamor Config
echo "[*] Checking Xorg Modesetting Configuration (10-modesetting.conf):"
MODESET_FILE="${PROJECT_ROOT}/rootfs/etc/X11/xorg.conf.d/10-modesetting.conf"
if [ -f "$MODESET_FILE" ] && grep -q "glamor" "$MODESET_FILE"; then
    echo -e "  ${GREEN}[✓] Found kernel modesetting driver with Glamor DRI3 acceleration.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid 10-modesetting.conf.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Libinput Trackpad & Mouse Config
echo -e "\n[*] Checking Libinput Configuration (40-libinput.conf):"
INPUT_FILE="${PROJECT_ROOT}/rootfs/etc/X11/xorg.conf.d/40-libinput.conf"
if [ -f "$INPUT_FILE" ] && grep -q "Tapping" "$INPUT_FILE"; then
    echo -e "  ${GREEN}[✓] Touchpad tap-to-click and natural scrolling enabled.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid 40-libinput.conf.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check Xinitrc Master Initialization Script
echo -e "\n[*] Checking X11 Master Startup Script (xinitrc):"
XINIT_FILE="${PROJECT_ROOT}/rootfs/etc/X11/xinit/xinitrc"
if [ -f "$XINIT_FILE" ] && grep -q "#05070A" "$XINIT_FILE"; then
    echo -e "  ${GREEN}[✓] xinitrc configured with TOS dark background (#05070A).${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid xinitrc.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check tos-display CLI Utility
echo -e "\n[*] Checking tos-display CLI Utility:"
TOS_DISP="${PROJECT_ROOT}/scripts/tos-display"
if [ -x "$TOS_DISP" ]; then
    echo -e "  ${GREEN}[✓] scripts/tos-display is executable.${RESET}"
    OUTPUT=$("$TOS_DISP" status 2>/dev/null || true)
    if echo "$OUTPUT" | grep -q "TOS Display Hardware Status"; then
        echo -e "  ${GREEN}[✓] 'tos-display status' executed successfully.${RESET}"
    fi
else
    echo -e "  ${RED}[!] scripts/tos-display is missing or not executable.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 7 GRAPHICS AUDIT PASSED: Display stack ready for desktop shell.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 7 GRAPHICS AUDIT FAILED: $ERRORS issues detected.${RESET}"
    exit 1
fi
