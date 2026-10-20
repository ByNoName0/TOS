#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 8 Desktop Environment Audit
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 8: Desktop Environment Audit                   ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# 1. Check Openbox rc.xml & Super Key
echo "[*] Checking Openbox Configuration (rc.xml):"
RC_XML="${PROJECT_ROOT}/desktop/desktop/rc.xml"
if [ -f "$RC_XML" ]; then
    if grep -q "Super_L" "$RC_XML" && grep -q "tos-launcher" "$RC_XML"; then
        echo -e "  ${GREEN}[✓] Super Key (Super_L) correctly mapped to 'tos-launcher'.${RESET}"
    else
        echo -e "  ${RED}[!] Super key binding missing in rc.xml.${RESET}"
        ERRORS=$((ERRORS + 1))
    fi
    if grep -q "tos-electric-dark" "$RC_XML"; then
        echo -e "  ${GREEN}[✓] Window theme set to 'tos-electric-dark'.${RESET}"
    fi
else
    echo -e "  ${RED}[!] Missing desktop/desktop/rc.xml!${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Tint2 Taskbar Layout
echo -e "\n[*] Checking Tint2 Panel Configuration (tint2rc):"
TINT2_FILE="${PROJECT_ROOT}/desktop/panel/tint2rc"
if [ -f "$TINT2_FILE" ]; then
    for item in "tos-launcher" "taskbar_mode" "systray" "time1_format" "tos-power"; do
        printf "  %-30s " "$item"
        if grep -q "$item" "$TINT2_FILE"; then
            echo -e "${GREEN}[OK]${RESET}"
        else
            echo -e "${RED}[MISSING]${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "  ${RED}[!] Missing desktop/panel/tint2rc!${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check Rofi Launcher Theme
echo -e "\n[*] Checking Rofi Application Launcher Theme (config.rasi):"
ROFI_FILE="${PROJECT_ROOT}/desktop/launcher/config.rasi"
if [ -f "$ROFI_FILE" ] && grep -q "#1683FF" "$ROFI_FILE"; then
    echo -e "  ${GREEN}[✓] Rofi theme configured with electric blue accents (#1683FF).${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid config.rasi.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check Power Menu Script
echo -e "\n[*] Checking Power Menu Script (scripts/tos-power):"
POWER_SCRIPT="${PROJECT_ROOT}/scripts/tos-power"
if [ -x "$POWER_SCRIPT" ]; then
    for action in "Power Off" "Restart" "Sleep" "Log Out"; do
        printf "  Action: %-25s " "$action"
        if grep -q "$action" "$POWER_SCRIPT"; then
            echo -e "${GREEN}[OK]${RESET}"
        else
            echo -e "${RED}[MISSING]${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "  ${RED}[!] scripts/tos-power is missing or not executable.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 8 DESKTOP AUDIT PASSED: Environment ready for user login.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 8 DESKTOP AUDIT FAILED: $ERRORS issues detected.${RESET}"
    exit 1
fi
