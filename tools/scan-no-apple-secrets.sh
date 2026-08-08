#!/usr/bin/env bash
# Fail fast if Apple signing material was accidentally committed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[scan-no-apple-secrets] skip: not inside a git worktree"
  exit 0
fi

failures=0

flag() {
  echo "[scan-no-apple-secrets] FAIL: $*" >&2
  failures=1
}

for pattern in \
  'ios/Config/Team.xcconfig' \
  '*.p8' \
  'AuthKey_*.p8' \
  '*.mobileprovision' \
  '*.p12' \
  '*.cer' \
  '*.ipa' \
  '*.xcarchive' \
  '.env' \
  '.env.*' \
  '.secrets/**'
do
  while IFS= read -r file; do
    case "$file" in
      .env.example|*.example) continue ;;
    esac
    flag "forbidden tracked signing/secret path: $file"
  done < <(git ls-files -- "$pattern")
done

private_key_hits="$(
  git grep -nIE -e '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|-----BEGIN PRIVATE KEY-----' -- . \
    ':(exclude)tools/scan-no-apple-secrets.sh' || true
)"
if [[ -n "$private_key_hits" ]]; then
  echo "$private_key_hits" >&2
  flag "private key material appears in tracked files"
fi

team_hits="$(
  git grep -nIE 'DEVELOPMENT_TEAM[[:space:]]*=[[:space:]]*[A-Z0-9]{10}([[:space:];]|$)' -- . || true
)"
team_hits="$(printf '%s\n' "$team_hits" | grep -Ev 'YOUR_TEAM_ID|XXXXXXXXXX' || true)"
if [[ -n "$team_hits" ]]; then
  echo "$team_hits" >&2
  flag "real-looking DEVELOPMENT_TEAM value appears in tracked files"
fi

if [[ "$failures" != "0" ]]; then
  exit 21
fi

echo "[scan-no-apple-secrets] OK"
