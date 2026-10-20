# TOS Kernel Architecture

TOS uses the Debian upstream Long Term Support (LTS) kernel (`linux-image-amd64`) for default builds to maximize hardware compatibility across Intel and AMD x86_64 processors, SATA/NVMe storage controllers, and common wireless cards.

For custom monolithic low-latency builds, a stripped configuration (`config-tos-6.6.x`) is provided in this directory.

## Target Constraints
- Kernel binary size: < 15 MB
- Stripped initramfs: < 45 MB
- Total /boot footprint: < 65 MB (Allocated: 90 MB)
