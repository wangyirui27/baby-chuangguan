#!/usr/bin/env bash
# Verify that a committed GitHub handoff clone can run the TestFlight preflight.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP=""

cleanup() {
  if [[ -n "$TMP" ]]; then
    rm -rf "$TMP"
  fi
}
trap cleanup EXIT

cd "$ROOT"

for bin in git npm node bash python3 rsync; do
  command -v "$bin" >/dev/null 2>&1 || {
    echo "[testflight-handoff] missing command: $bin" >&2
    exit 2
  }
done

if [[ -n "$(git status --short --untracked-files=no)" ]]; then
  echo "[testflight-handoff] tracked changes exist; commit or stash them before verifying handoff" >&2
  git status --short --untracked-files=no >&2
  exit 2
fi

SOURCE="${HANDOFF_CLONE_SOURCE:-$ROOT}"
EXPECTED_HEAD="${HANDOFF_EXPECTED_SHA:-$(git rev-parse HEAD)}"
TMP="$(mktemp -d)"
DEST="$TMP/repo"

echo "[testflight-handoff] source=$SOURCE"
echo "[testflight-handoff] expected_head=$EXPECTED_HEAD"
git clone --no-local "$SOURCE" "$DEST"

cd "$DEST"
if [[ -n "${HANDOFF_EXPECTED_SHA:-}" ]]; then
  git checkout --detach "$EXPECTED_HEAD"
fi
CLONE_HEAD="$(git rev-parse HEAD)"
echo "[testflight-handoff] clone_head=$CLONE_HEAD"

if [[ "$CLONE_HEAD" != "$EXPECTED_HEAD" ]]; then
  echo "[testflight-handoff] clone HEAD mismatch" >&2
  exit 2
fi

npm ci
npm ci --prefix backend
npm ci --prefix apps/backend
npm ci --prefix apps/frontend
npm run testflight:preflight

echo "[testflight-handoff] OK"
