#!/usr/bin/env bash
# First-boot on Ubuntu ECS. No cloud secrets in this script.
set -euo pipefail

APP_DIR="/opt/apps/baobao/backend"
APP_USER="baobao"
ENV_FILE="/etc/baobao-backend.env"
UNIT_DST="/etc/systemd/system/baobao-backend.service"
SUDOERS_DST="/etc/sudoers.d/baobao-backend"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${APP_USER}"
  echo "Created user ${APP_USER}. Add SSH pubkey to /home/${APP_USER}/.ssh/authorized_keys"
fi

install -d -o "${APP_USER}" -g "${APP_USER}" -m 755 "${APP_DIR}"
install -d -o "${APP_USER}" -g "${APP_USER}" -m 755 "${APP_DIR}/data"

if [[ ! -f "${ENV_FILE}" ]]; then
  install -o root -g "${APP_USER}" -m 640 "${SCRIPT_DIR}/env.production.example" "${ENV_FILE}"
  echo "Wrote ${ENV_FILE} from template. FILL secrets before start."
else
  echo "Keep existing ${ENV_FILE} (not overwritten)"
fi

install -o root -g root -m 644 "${SCRIPT_DIR}/baobao-backend.service" "${UNIT_DST}"
install -o root -g root -m 440 "${SCRIPT_DIR}/sudoers.baobao" "${SUDOERS_DST}"
if ! visudo -c -f "${SUDOERS_DST}"; then
  rm -f "${SUDOERS_DST}"
  echo "sudoers check failed; removed ${SUDOERS_DST}" >&2
  exit 1
fi

systemctl daemon-reload
systemctl enable baobao-backend

echo "APP_DIR=${APP_DIR}"
echo "Unit enabled. Do not start until code + env are in place:"
echo "  1) edit ${ENV_FILE}"
echo "  2) rsync/GitHub Actions into ${APP_DIR}"
echo "  3) systemctl start baobao-backend"
echo "FIRST_INSTALL_OK"
