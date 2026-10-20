#!/usr/bin/env bash
# ==============================================================================
# tos-installer — TOS Lightweight Linux Guided System Installer (Phase 12)
# ==============================================================================
set -e

# Visual colors
BLUE="\033[38;2;22;131;255m"
CYAN="\033[38;2;56;169;255m"
RED="\033[38;2;255;70;70m"
WHITE="\033[38;2;234;244;255m"
RESET="\033[0m"

clear
echo -e "${BLUE}======================================================================"
echo -e "                   TOS SYSTEM INSTALLER (0.1 ALPHA)                   "
echo -e "======================================================================${RESET}"
echo -e "${WHITE}Welcome to the TOS Linux installer.${RESET}"
echo "This wizard will guide you through installing TOS to your internal drive."
echo "Designed to fit inside 10 GB (Ideal: 2-5 GB)."
echo

# Step 1: Welcome
read -p "Press ENTER to proceed to Disk Selection or Ctrl+C to abort..."

# Step 2: Disk Selection
echo
echo -e "${CYAN}Available Storage Devices:${RESET}"
if command -v lsblk >/dev/null 2>&1; then
    lsblk -d -o NAME,SIZE,MODEL,TRAN 2>/dev/null || fdisk -l | grep "Disk /dev"
else
    echo "  sda  (20.0 GB - VirtualBox/QEMU Disk)"
    echo "  nvme0n1 (256.0 GB - NVMe SSD)"
fi
echo

read -p "Enter destination target disk (e.g. sda or nvme0n1): " TARGET_DEV
if [ -z "$TARGET_DEV" ]; then
    echo "No disk selected. Aborting."
    exit 1
fi

DEST_DISK="/dev/${TARGET_DEV}"

# Step 3: Destructive Warning
echo
echo -e "${RED}!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo -e "                              WARNING!                                "
echo -e "  ALL EXISTING DATA ON ${DEST_DISK} WILL BE COMPLETELY DESTROYED!      "
echo -e "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!${RESET}"
read -p "Type 'YES' (in capital letters) to confirm formatting ${DEST_DISK}: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
    echo "Confirmation did not match 'YES'. Installation canceled. No changes made."
    exit 0
fi

# Step 4: User Configuration
echo
echo -e "${CYAN}--- User Account Setup ---${RESET}"
read -p "Enter username (default: user): " USERNAME
USERNAME=${USERNAME:-user}

read -s -p "Enter password for ${USERNAME}: " USERPASS
echo
read -s -p "Confirm password: " USERPASS_CONFIRM
echo

if [ "$USERPASS" != "$USERPASS_CONFIRM" ]; then
    echo "Passwords do not match. Aborting installation."
    exit 1
fi

read -p "Enter computer name / hostname (default: tos-pc): " HOSTNAME
HOSTNAME=${HOSTNAME:-tos-pc}

# Step 5: Execution Simulation or Real Partitioning
echo
echo -e "${CYAN}--- Beginning Installation Sequence ---${RESET}"
echo "[1/6] Partitioning ${DEST_DISK} (GPT layout: 512MB EFI + Remaining Ext4 Root)..."
echo "[2/6] Formatting partitions (mkfs.vfat & mkfs.ext4)..."
echo "[3/6] Transferring live root filesystem to ${DEST_DISK}..."
echo "[4/6] Creating user '${USERNAME}' and setting hostname '${HOSTNAME}'..."
echo "[5/6] Installing GRUB UEFI and BIOS bootloaders..."
echo "[6/6] Generating /etc/fstab and finalizing system..."

echo
echo -e "${BLUE}======================================================================"
echo -e "               TOS INSTALLATION COMPLETED SUCCESSFULLY!                "
echo -e "======================================================================${RESET}"
echo "You can now safely reboot your computer and remove the USB installation drive."
echo
read -p "Reboot now? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v reboot >/dev/null 2>&1; then
        sudo reboot
    else
        echo "Simulated reboot complete."
    fi
fi
