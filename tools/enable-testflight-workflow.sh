#!/usr/bin/env bash
# Copy the GitHub Actions template into the real workflow path.
# Commit/push of .github/workflows still requires a GitHub token with workflow scope.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/docs/testflight-github-actions-template.yml"
TARGET="$ROOT/.github/workflows/testflight-preflight.yml"

mkdir -p "$(dirname "$TARGET")"

if [[ -f "$TARGET" ]] && ! cmp -s "$SOURCE" "$TARGET"; then
  echo "[enable-testflight-workflow] target exists and differs: $TARGET" >&2
  echo "Review it manually, then replace with: cp \"$SOURCE\" \"$TARGET\"" >&2
  exit 1
fi

cp "$SOURCE" "$TARGET"
echo "[enable-testflight-workflow] wrote $TARGET"
echo "[enable-testflight-workflow] next: git add .github/workflows/testflight-preflight.yml && git commit"
echo "[enable-testflight-workflow] push must use GitHub credentials with workflow scope."
