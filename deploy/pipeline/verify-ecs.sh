#!/usr/bin/env bash
# Remote/local health acceptance. Prints HTTP status + four backend identifiers.
# Never prints the full response body, cookies, tokens, or cloud secrets.
set -euo pipefail

URL="${1:-${REMOTE_HEALTH_URL:-http://127.0.0.1:3000/api/health}}"
HEALTH_FILE="$(mktemp)"
trap 'rm -f "${HEALTH_FILE}"' EXIT

retries="${HEALTH_RETRIES:-10}"
sleep_s="${HEALTH_RETRY_SLEEP:-2}"
http_code="000"

for ((i = 1; i <= retries; i++)); do
  http_code="$(curl -sS -m 20 -o "${HEALTH_FILE}" -w '%{http_code}' "${URL}" || true)"
  if [[ "${http_code}" == "200" ]]; then
    break
  fi
  echo "HEALTH_RETRY ${i}/${retries} HTTP=${http_code}" >&2
  sleep "${sleep_s}"
done
export HEALTH_FILE
export HEALTH_HTTP="${http_code}"

node <<'NODE'
const fs = require('fs');

const http = process.env.HEALTH_HTTP || '000';
const file = process.env.HEALTH_FILE;
const raw = fs.readFileSync(file, 'utf8');

function out(line) {
  process.stdout.write(`${line}\n`);
}
function err(line) {
  process.stderr.write(`${line}\n`);
}

out(`HEALTH_HTTP=${http}`);
if (http !== '200') {
  err('HEALTH_FAIL: want HTTP 200');
  process.exit(1);
}

let body;
try {
  body = JSON.parse(raw);
} catch {
  err('HEALTH_FAIL: response is not JSON');
  process.exit(1);
}

const fields = {
  status: body.status,
  learningBackend: body.learningBackend,
  learningConfigured: body.learningConfigured,
  smsProvider: body.smsProvider,
  nodeEnv: body.nodeEnv,
};

out(`HEALTH_status=${fields.status ?? ''}`);
out(`HEALTH_learningBackend=${fields.learningBackend ?? ''}`);
out(`HEALTH_learningConfigured=${fields.learningConfigured ?? ''}`);
out(`HEALTH_smsProvider=${fields.smsProvider ?? ''}`);
out(`HEALTH_nodeEnv=${fields.nodeEnv ?? ''}`);

const expect = {
  status: process.env.EXPECT_STATUS || 'ok',
  nodeEnv: process.env.EXPECT_NODE_ENV || '',
  learningBackend: process.env.EXPECT_LEARNING_BACKEND || '',
  smsProvider: process.env.EXPECT_SMS_PROVIDER || '',
  learningConfigured: process.env.EXPECT_LEARNING_CONFIGURED || '',
};

let failed = false;
function check(name, got, want) {
  if (want === '' || want == null) return;
  const gotStr = String(got ?? '');
  if (gotStr !== String(want)) {
    err(`HEALTH_MISMATCH ${name}: want=${want} got=${gotStr}`);
    failed = true;
  }
}

check('status', fields.status, expect.status);
check('nodeEnv', fields.nodeEnv, expect.nodeEnv);
check('learningBackend', fields.learningBackend, expect.learningBackend);
check('smsProvider', fields.smsProvider, expect.smsProvider);
check('learningConfigured', fields.learningConfigured, expect.learningConfigured);

if (failed) {
  err('HEALTH_FAIL');
  process.exit(1);
}

out('HEALTH_OK');
NODE

if [[ "${RUN_AUTH_LEARNING:-0}" != "1" ]]; then
  exit 0
fi

if [[ -z "${AUTH_TOKEN:-}" ]]; then
  echo "AUTH_LEARNING_SKIP: RUN_AUTH_LEARNING=1 but AUTH_TOKEN unset" >&2
  exit 0
fi

session_code="$(curl -sS -m 20 -o /dev/null -w '%{http_code}' \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  "${URL%/api/health}/api/auth/session" || true)"
echo "AUTH_SESSION_HTTP=${session_code}"
if [[ "${session_code}" != "200" ]]; then
  echo "AUTH_LEARNING_FAIL: /api/auth/session want 200" >&2
  exit 1
fi
echo "AUTH_LEARNING_OK"
