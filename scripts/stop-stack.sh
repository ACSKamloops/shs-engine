#!/bin/bash
# stop-stack.sh - Stop all Pukaist Engine services
set -e

echo "Stopping Pukaist Engine stack..."

# Stop in reverse order (workers first, then API, then vLLM)
systemctl --user stop pukaist-worker-3 2>/dev/null || true
systemctl --user stop pukaist-worker-2 2>/dev/null || true
systemctl --user stop pukaist-worker 2>/dev/null || true
systemctl --user stop pukaist-frontend 2>/dev/null || true
systemctl --user stop pukaist-api 2>/dev/null || true
systemctl --user stop pukaist-hunyuan 2>/dev/null || true

systemctl --user reset-failed 2>/dev/null || true

echo "✓ All services stopped"

# Show final status
echo ""
echo "Service status:"
systemctl --user list-units 'pukaist-*' --no-pager 2>/dev/null || echo "  (no pukaist services running)"
