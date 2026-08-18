#!/usr/bin/env bash
# Sync repo to ECS, install backend deps, optional migrate, restart, health-check.
# No cloud secrets in this script. Pass ECS_SSH_KEY_PATH (file) or ECS_SSH_KEY (PEM body).
set -euo pipefail

ECS_HOST="${ECS_HOST:-}"
ECS_USER="${ECS_USER:-}"
ECS_SSH_KEY_PATH="${ECS_SSH_KEY_PATH:-}"
APP_DIR="${APP_DIR:-}"
REMOTE_HEALTH_URL="${REMOTE_HEALTH_URL:-}"
RUN_MIGRATE="${RUN_MIGRATE:-0}"

[[ -z "${ECS_USER}" ]] && ECS_USER="baobao"
[[ -z "${APP_DIR}" ]] && APP_DIR="/opt/apps/baobao/backend"
[[ -z "${REMOTE_HEALTH_URL}" ]] && REMOTE_HEALTH_URL="http://127.0.0.1:3000/api/health"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
_ECS_KEY_TMP=""

cleanup_deploy_tmp() {
  if [[ -n "${_ECS_KEY_TMP}" && -f "${_ECS_KEY_TMP}" ]]; then
    rm -f "${_ECS_KEY_TMP}"
  fi
}
trap cleanup_deploy_tmp EXIT

# GitHub Actions passes the private key body as ECS_SSH_KEY.
if [[ -z "${ECS_SSH_KEY_PATH}" && -n "${ECS_SSH_KEY:-}" ]]; then
  _ECS_KEY_TMP="$(mktemp)"
  (
    umask 077
    printf '%s' "${ECS_SSH_KEY}" > "${_ECS_KEY_TMP}"
    if [[ -s "${_ECS_KEY_TMP}" && "$(tail -c 1 "${_ECS_KEY_TMP}" | wc -l)" -eq 0 ]]; then
      printf '\n' >> "${_ECS_KEY_TMP}"
    fi
  )
  chmod 600 "${_ECS_KEY_TMP}"
  ECS_SSH_KEY_PATH="${_ECS_KEY_TMP}"
  unset ECS_SSH_KEY
fi

missing=()
[[ -z "${ECS_HOST}" ]] && missing+=("ECS_HOST")
[[ -z "${ECS_SSH_KEY_PATH}" ]] && missing+=("ECS_SSH_KEY_PATH or ECS_SSH_KEY")
if ((${#missing[@]} > 0)); then
  echo "Missing required env: ${missing[*]}" >&2
  echo "Example: ECS_HOST=<host> ECS_SSH_KEY_PATH=~/.ssh/id_ed25519 ECS_USER=baobao $0" >&2
  echo "CI: set GitHub Secrets ECS_HOST + ECS_SSH_KEY (and optional ECS_USER)." >&2
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
  -o BatchMode=yes
  -o ConnectTimeout=20
)
REMOTE="${ECS_USER}@${ECS_HOST}"
RSYNC_RSH="ssh ${SSH_OPTS[*]}"

ssh_remote() {
  ssh "${SSH_OPTS[@]}" "${REMOTE}" "$@"
}

echo "==> rsync → ${REMOTE}:${APP_DIR}"
rsync -az --delete -e "${RSYNC_RSH}" \
  --exclude node_modules \
  --exclude .git \
  --exclude .github \
  --exclude .cursor \
  --exclude android \
  --exclude ios \
  --exclude graphify-out \
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
ssh_remote bash -s <<'EOF'
set -euo pipefail
if ! sudo -n systemctl restart baobao-backend; then
  echo "sudo needs a password — GitHub Actions cannot type it." >&2
  echo "On the server, install NOPASSWD (once):" >&2
  echo "  sudo install -m 440 /opt/apps/baobao/backend/deploy/first-install/sudoers.baobao /etc/sudoers.d/baobao-backend" >&2
  echo "  sudo visudo -c -f /etc/sudoers.d/baobao-backend" >&2
  exit 1
fi
sudo -n systemctl is-active baobao-backend
EOF

if [[ -z "${REMOTE_HEALTH_URL}" ]]; then
  remote_port="$(ssh_remote bash -s <<'EOF'
set -euo pipefail
file=/etc/baobao-backend.env
port=""
if [[ -r "$file" ]]; then
  port="$(grep -E '^PORT=' "$file" | tail -1 | cut -d= -f2- | tr -cd '0-9')"
elif sudo -n test -r "$file" 2>/dev/null; then
  port="$(sudo -n grep -E '^PORT=' "$file" | tail -1 | cut -d= -f2- | tr -cd '0-9')"
fi
if [[ ! "$port" =~ ^[0-9]+$ ]]; then
  port=3000
fi
echo "$port"
EOF
)"
  REMOTE_HEALTH_URL="http://127.0.0.1:${remote_port}/api/health"
fi

echo "==> health acceptance ${REMOTE_HEALTH_URL}"
# 验收脚本只打印四个 backend 标识和 HTTP 状态，不打印生产响应体或凭据。
if ! ssh_remote "bash '${APP_DIR}/deploy/pipeline/verify-ecs.sh' '${REMOTE_HEALTH_URL}'"; then
  echo "HEALTH failed — remote unit/journal (no secrets):" >&2
  ssh_remote bash -s <<EOF || true
set -euo pipefail
echo "UNIT=\$(systemctl is-active baobao-backend 2>/dev/null || echo unknown)"
echo "LISTEN=\$(ss -ltn 2>/dev/null | awk 'NR==1 || /:3999 |:3000 |:8080 /')"
curl -sS -m 5 -o /tmp/baobao-healthz.body -w 'HEALTHZ_HTTP=%{http_code}\\n' '${REMOTE_HEALTH_URL%/api/health}/healthz' || echo 'HEALTHZ_CURL_FAIL'
sudo -n journalctl -u baobao-backend -n 20 --no-pager -o cat | grep -E 'INFO|FATAL|Error|listening' || true
EOF
  exit 1
fi

echo "PIPELINE_DEPLOY_OK"
