#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start the Zippy API on port 3001
cd "$ROOT/backend"
npm run dev &
BACKEND_PID=$!

# Start the standalone admin console on port 3002
cd "$ROOT"
npm run dev:admin &
ADMIN_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Start the customer storefront on the exposed preview port
cd "$ROOT"
npm run dev
