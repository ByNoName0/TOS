# TOS Applications Architecture (apps/)

## 1. File Manager (apps/file-manager/)
- Package: **PCManFM**
- Features: Home, Desktop, Documents, Downloads, Music, Pictures, Videos, Trash
- Light memory footprint (~18 MB RAM)
- Fast file operations, search, archive integration, and disk usage inspection

## 2. Terminal (apps/terminal/)
- Package: **LXTerminal**
- Clean UTF-8 shell emulator with low CPU overhead
- Pre-configured with TOS electric-blue color scheme and default `bash` prompt:
  `tos@tos-pc:~$ `
- Pre-loaded with custom commands in `/usr/local/bin`:
  `tos-info`, `tos-size`, `tos-performance`, `tos-install`, `tos-remove`, `tos-update`

## 3. System Info (apps/system-info/)
- Command: `tos-info`
- Real hardware detection from `/proc/cpuinfo`, `/proc/meminfo`, and Linux kernel APIs
