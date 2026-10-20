#!/usr/bin/env bash
# ==============================================================================
# TOS Automated Test: Storage Size Audit (< 10 GB Target)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Running TOS Storage Audit Test ==="
chmod +x "${PROJECT_ROOT}/scripts/tos-size"
OUTPUT=$("${PROJECT_ROOT}/scripts/tos-size")

echo "$OUTPUT"

if echo "$OUTPUT" | grep -q "PASS"; then
    echo
    echo "[✓] TEST PASSED: TOS filesystem conforms to the <= 10 GB limit."
    exit 0
else
    echo
    echo "[!] TEST FAILED: TOS filesystem exceeds storage budget!"
    exit 1
fi
