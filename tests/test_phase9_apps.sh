#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 9 Default Applications Audit
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APPS_DIR="${PROJECT_ROOT}/rootfs/usr/share/applications"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 9: Default Applications Audit                  ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# 1. Check Required Applications Desktop Entries
echo "[*] Auditing Required Default Application Entries:"
APPS=(
    "tos-filemanager.desktop:File Manager (PCManFM)"
    "tos-terminal.desktop:TOS Terminal (LXTerminal)"
    "tos-settings.desktop:TOS Settings Control Center"
    "tos-sysinfo.desktop:System Information Utility"
    "tos-texteditor.desktop:Text Editor (Mousepad)"
    "tos-calculator.desktop:Calculator (Galculator)"
    "tos-taskmanager.desktop:Task Manager (Process Viewer)"
)

for item in "${APPS[@]}"; do
    desktop_file="${item%%:*}"
    desc="${item#*:}"
    printf "  %-32s " "$desktop_file"
    if [ -f "${APPS_DIR}/${desktop_file}" ]; then
        echo -e "${GREEN}[OK]${RESET} - $desc"
    else
        echo -e "${RED}[MISSING]${RESET} - $desc"
        ERRORS=$((ERRORS + 1))
    fi
done

# 2. Check tos-settings Modules
echo -e "\n[*] Checking tos-settings Control Center Modules:"
SETTINGS_SCRIPT="${PROJECT_ROOT}/scripts/tos-settings"
if [ -x "$SETTINGS_SCRIPT" ]; then
    for module in "Appearance" "Display" "Sound" "Network" "Users" "System"; do
        printf "  Module: %-20s " "$module"
        if grep -q "$module" "$SETTINGS_SCRIPT"; then
            echo -e "${GREEN}[OK]${RESET}"
        else
            echo -e "${RED}[MISSING]${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${RED}[!] scripts/tos-settings is missing or not executable.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check PCManFM & LXTerminal Configs
echo -e "\n[*] Checking Application Configs:"
if [ -f "${PROJECT_ROOT}/rootfs/etc/xdg/pcmanfm/default/pcmanfm.conf" ]; then
    echo -e "  ${GREEN}[✓] PCManFM configuration verified.${RESET}"
else
    echo -e "  ${RED}[!] PCManFM configuration missing.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "${PROJECT_ROOT}/rootfs/etc/xdg/lxterminal/lxterminal.conf" ] && grep -q "#05070A" "${PROJECT_ROOT}/rootfs/etc/xdg/lxterminal/lxterminal.conf"; then
    echo -e "  ${GREEN}[✓] LXTerminal Electric Dark palette verified.${RESET}"
else
    echo -e "  ${RED}[!] LXTerminal configuration missing or invalid.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 9 APPLICATIONS AUDIT PASSED: Zero-bloat app stack ready.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 9 APPLICATIONS AUDIT FAILED: $ERRORS issues detected.${RESET}"
    exit 1
fi
