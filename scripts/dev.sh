#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

missing_tools=()
if ! command -v go >/dev/null 2>&1; then
  missing_tools+=("go")
fi
if ! command -v bun >/dev/null 2>&1; then
  missing_tools+=("bun")
fi
if [[ "${#missing_tools[@]}" -gt 0 ]]; then
  echo "[dev] missing required tool(s): ${missing_tools[*]}"
  if command -v brew >/dev/null 2>&1; then
    echo "[dev] install via Homebrew:"
    if printf '%s\n' "${missing_tools[@]}" | grep -qx "go"; then
      echo "      brew install go"
    fi
    if printf '%s\n' "${missing_tools[@]}" | grep -qx "bun"; then
      echo "      brew tap oven-sh/bun && brew install oven-sh/bun/bun"
    fi
  else
    echo "[dev] please install required tool(s) and retry"
  fi
  exit 1
fi

backend_cmd=(go run main.go)
if command -v air >/dev/null 2>&1; then
  backend_cmd=(air)
fi

echo "[dev] root: $ROOT_DIR"
echo "[dev] backend: ${backend_cmd[*]} (http://localhost:3000)"
echo "[dev] frontend: bun run dev (http://localhost:$FRONTEND_PORT)"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

echo "[dev] syncing frontend dependencies with bun install..."
(
  cd "$WEB_DIR"
  bun install
)

if [[ ! -f "$ROOT_DIR/web/dist/index.html" ]]; then
  echo "[dev] web/dist missing, building once for backend go:embed..."
  (
    cd "$WEB_DIR"
    DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION="$(cat "$ROOT_DIR/VERSION")" bun run build
  )
fi

(
  cd "$ROOT_DIR"
  exec "${backend_cmd[@]}"
) &
BACKEND_PID=$!

cd "$WEB_DIR"
bun run dev
