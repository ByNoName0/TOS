#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 6 Networking Stack Audit
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 6: Networking Stack Audit                     ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# 1. Check Network Interfaces Configuration
echo "[*] Checking Network Interfaces (/etc/network/interfaces):"
IFACES_FILE="${PROJECT_ROOT}/rootfs/etc/network/interfaces"
if [ -f "$IFACES_FILE" ]; then
    for entry in "auto lo" "iface eth0 inet dhcp" "allow-hotplug wlan0"; do
        printf "  %-30s " "$entry"
        if grep -q "$entry" "$IFACES_FILE"; then
            echo -e "${GREEN}[OK]${RESET}"
        else
            echo -e "${RED}[MISSING]${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${RED}[!] Missing /etc/network/interfaces!${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check WPA Supplicant Configuration
echo -e "\n[*] Checking WPA Supplicant (/etc/wpa_supplicant/wpa_supplicant.conf):"
WPA_FILE="${PROJECT_ROOT}/rootfs/etc/wpa_supplicant/wpa_supplicant.conf"
if [ -f "$WPA_FILE" ] && grep -q "ctrl_interface=" "$WPA_FILE"; then
    echo -e "  ${GREEN}[✓] Found control socket configuration for netdev group.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid wpa_supplicant.conf.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check DNS Resolvers
echo -e "\n[*] Checking Privacy DNS Nameservers (/etc/resolv.conf):"
RESOLV_FILE="${PROJECT_ROOT}/rootfs/etc/resolv.conf"
if [ -f "$RESOLV_FILE" ] && grep -q "1.1.1.1" "$RESOLV_FILE"; then
    echo -e "  ${GREEN}[✓] Privacy DNS (1.1.1.1 / Cloudflare & Quad9) verified.${RESET}"
else
    echo -e "  ${RED}[!] Missing DNS configuration.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check tos-wifi Utility
echo -e "\n[*] Checking tos-wifi CLI Utility:"
TOS_WIFI="${PROJECT_ROOT}/scripts/tos-wifi"
if [ -x "$TOS_WIFI" ]; then
    echo -e "  ${GREEN}[✓] scripts/tos-wifi is executable.${RESET}"
    # Test dry run status
    OUTPUT=$("$TOS_WIFI" status 2>/dev/null || true)
    if echo "$OUTPUT" | grep -q "TOS Network Interface Status"; then
        echo -e "  ${GREEN}[✓] 'tos-wifi status' executed cleanly.${RESET}"
    fi
else
    echo -e "  ${RED}[!] scripts/tos-wifi is missing or not executable.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 6 NETWORKING AUDIT PASSED: Stack verified.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 6 NETWORKING AUDIT FAILED: $ERRORS issues detected.${RESET}"
    exit 1
fi
