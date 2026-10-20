#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Phase 5 First Boot & Userspace Audit
# ==============================================================================
set -e

GREEN="\033[38;2;52;211;153m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;248;113;113m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${CYAN}             TOS Phase 5: First Boot & Userspace Audit               ${RESET}"
echo -e "${CYAN}======================================================================${RESET}"

ERRORS=0

# 1. Check Login Banner in /etc/issue
echo "[*] Checking TOS Login Banner (/etc/issue):"
ISSUE_FILE="${PROJECT_ROOT}/rootfs/etc/issue"
if [ -f "$ISSUE_FILE" ] && grep -q "TOS login:" "$ISSUE_FILE"; then
    echo -e "  ${GREEN}[✓] Found clean ASCII banner and 'TOS login:' prompt.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid /etc/issue banner.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Getty Auto-Login Configuration
echo -e "\n[*] Checking Getty TTY1 Autologin Override:"
AUTOLOGIN_FILE="${PROJECT_ROOT}/rootfs/etc/systemd/system/getty@tty1.service.d/autologin.conf"
if [ -f "$AUTOLOGIN_FILE" ] && grep -q -- "--autologin tos" "$AUTOLOGIN_FILE"; then
    echo -e "  ${GREEN}[✓] Found getty@tty1.service autologin configured for user 'tos'.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid getty autologin configuration.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check Shell Login Welcome Banner
echo -e "\n[*] Checking Interactive Shell Welcome Hook:"
WELCOME_FILE="${PROJECT_ROOT}/rootfs/etc/profile.d/tos-welcome.sh"
if [ -f "$WELCOME_FILE" ] && grep -q "tos-info" "$WELCOME_FILE"; then
    echo -e "  ${GREEN}[✓] /etc/profile.d/tos-welcome.sh configured to execute 'tos-info'.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid welcome hook.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check Sudo Privileges Configuration
echo -e "\n[*] Checking Sudoers Permissions for 'tos':"
SUDOERS_FILE="${PROJECT_ROOT}/rootfs/etc/sudoers.d/tos"
if [ -f "$SUDOERS_FILE" ] && grep -q "tos ALL=(ALL) NOPASSWD: ALL" "$SUDOERS_FILE"; then
    echo -e "  ${GREEN}[✓] /etc/sudoers.d/tos correctly grants passwordless administrative privileges.${RESET}"
else
    echo -e "  ${RED}[!] Missing or invalid sudoers configuration.${RESET}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${CYAN}----------------------------------------------------------------------${RESET}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}[✓] PHASE 5 FIRST BOOT AUDIT PASSED: System ready to reach login & shell.${RESET}"
    exit 0
else
    echo -e "${RED}[!] PHASE 5 FIRST BOOT AUDIT FAILED: $ERRORS issues detected.${RESET}"
    exit 1
fi
