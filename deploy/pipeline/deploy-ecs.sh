#!/usr/bin/env bash
# Sync repo to ECS, install backend deps, optional migrate, restart, health-check.
# No cloud secrets in this script — pass SSH key path via env only.
set -euo pipefail

ECS_HOST="${ECS_HOST:-}"
ECS_USER="${ECS_USER:-baobao}"
ECS_SSH_KEY_PATH="${ECS_SSH_KEY_PATH:-}"
APP_DIR="${APP_DIR:-/opt/baobao-chuangguan}"
REMOTE_HEALTH_URL="${REMOTE_HEALTH_URL:-http://127.0.0.1:3000/api/health}"
RUN_MIGRATE="${RUN_MIGRATE:-0}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

missing=()
[[ -z "${ECS_HOST}" ]] && missing+=("ECS_HOST")
[[ -z "${ECS_SSH_KEY_PATH}" ]] && missing+=("ECS_SSH_KEY_PATH")
if ((${#missing[@]} > 0)); then
  echo "Missing required env: ${missing[*]}" >&2
  echo "Example: ECS_HOST=<host> ECS_SSH_KEY_PATH=~/.ssh/id_ed25519 ECS_USER=baobao $0" >&2
  exit 2
fi

if [[ ! -f "${ECS_SSH_KEY_PATH}" ]]; then
  echo "ECS_SSH_KEY_PATH not a file: ${ECS_SSH_KEY_PATH}" >&2
  exit 2
fi

SSH_OPTS=(
  -i "${ECS_SSH_KEY_PATH}"
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
)
REMOTE="${ECS_USER}@${ECS_HOST}"

ssh_remote() {
  ssh "${SSH_OPTS[@]}" "${REMOTE}" "$@"
}

echo "==> rsync → ${REMOTE}:${APP_DIR}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude data \
  --exclude .env \
  --exclude '.env.*' \
  --exclude '*.log' \
  "${REPO_ROOT}/" \
  "${REMOTE}:${APP_DIR}/"

echo "==> npm ci --omit=dev"
ssh_remote "cd '${APP_DIR}/backend' && npm ci --omit=dev"

if [[ "${RUN_MIGRATE}" == "1" ]]; then
  echo "==> optional MySQL migrate (RUN_MIGRATE=1)"
  ssh_remote bash -s <<EOF
set -euo pipefail
cd '${APP_DIR}/backend'
if [[ ! -f scripts/mysql-apply-migration.js ]]; then
  echo "Skip migrate: scripts/mysql-apply-migration.js not found"
  exit 0
fi
# Prefer systemd EnvironmentFile if present; else require MYSQL_* already in shell.
if [[ -f /etc/baobao-backend.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /etc/baobao-backend.env
  set +a
fi
if [[ -z "\${MYSQL_HOST:-}" && -z "\${MYSQL_URL:-}" && -z "\${DATABASE_URL:-}" ]]; then
  echo "Skip migrate: no MYSQL_HOST / MYSQL_URL / DATABASE_URL on remote" >&2
  exit 0
fi
node scripts/mysql-apply-migration.js
EOF
else
  echo "==> skip migrate (set RUN_MIGRATE=1 to apply)"
fi

echo "==> restart baobao-backend"
ssh_remote bash -s <<EOF
set -euo pipefail
if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files baobao-backend.service >/dev/null 2>&1; then
  sudo systemctl restart baobao-backend || systemctl restart baobao-backend || true
else
  echo "No systemd unit baobao-backend — restart manually (see deploy/ecs/README.md)" >&2
fi
EOF

echo "==> health acceptance ${REMOTE_HEALTH_URL}"
# 验收脚本只打印四个 backend 标识和 HTTP 状态，不打印生产响应体或凭据。
ssh_remote "bash '${APP_DIR}/deploy/pipeline/verify-ecs.sh' '${REMOTE_HEALTH_URL}'"

echo "PIPELINE_DEPLOY_OK"
