#!/usr/bin/env bash
# ==============================================================================
# TOS 0.1 Alpha — Interactive Shell Welcome Banner
# Executes automatically upon interactive login on TTY or terminal emulator.
# ==============================================================================

# Only execute for interactive login shells
case "$-" in
    *i*) ;;
      *) return ;;
esac

# Trigger TOS hardware and system specification inspector
if [ -x /usr/local/bin/tos-info ]; then
    /usr/local/bin/tos-info
else
    echo "Welcome to TOS Linux (0.1 Alpha) — Lightweight Linux OS"
fi

echo -e "Type \033[38;2;56;169;255mtos-help\033[0m for package management and system inspection commands."
echo -e "To launch the graphical environment manually, type: \033[38;2;56;169;255mstartx\033[0m\n"
