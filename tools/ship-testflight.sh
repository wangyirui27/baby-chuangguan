#!/usr/bin/env bash
# 嗨洛塔 → TestFlight 一键发船（需完整 Xcode + 已登录 Apple ID + Team）
# 用法:
#   bash tools/ship-testflight.sh                  # 检查 + 引导
#   bash tools/ship-testflight.sh --static-check   # 无 Xcode 静态检查
#   bash tools/ship-testflight.sh --archive        # Archive
#   bash tools/ship-testflight.sh --upload         # Archive + 导出上传
#   DEVELOPMENT_TEAM=XXXXXXXX bash tools/ship-testflight.sh --upload
#   ASC_KEY_ID=... ASC_ISSUER_ID=... ASC_KEY_PATH=/tmp/AuthKey.p8 bash tools/ship-testflight.sh --upload
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS="$ROOT/ios"
PROJ="$IOS/BabyEnglishIsland.xcodeproj"
SCHEME="BabyEnglishIsland"
ARCHIVE_PATH="${ARCHIVE_PATH:-/tmp/hirota-BabyEnglishIsland.xcarchive}"
EXPORT_DIR="${EXPORT_DIR:-/tmp/hirota-tf-export}"
EXPORT_OPTS_TEMPLATE="$IOS/ExportOptions-TestFlight.plist"
EXPORT_OPTS_WORK="${EXPORT_OPTS_WORK:-/tmp/hirota-ExportOptions-TestFlight.plist}"
ASC_KEY_TMP="${ASC_KEY_TMP:-/tmp/hirota-asc/AuthKey.p8}"
TEAM_FILE="$IOS/Config/Team.xcconfig"
SHELL_CFG="$IOS/BabyEnglishIsland/shell-config.json"
ASC_KEY_TMP_CREATED=0

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
ylw() { printf '\033[33m%s\033[0m\n' "$*"; }
team_label() {
  [[ -n "$1" ]] && echo "CONFIGURED" || echo "EMPTY"
}

cleanup_asc_key_tmp() {
  if [[ "$ASC_KEY_TMP_CREATED" == "1" && -f "$ASC_KEY_TMP" ]]; then
    rm -f "$ASC_KEY_TMP"
  fi
}
trap cleanup_asc_key_tmp EXIT

asc_key_id() {
  echo "${ASC_KEY_ID:-${APP_STORE_CONNECT_API_KEY_ID:-}}"
}

asc_issuer_id() {
  echo "${ASC_ISSUER_ID:-${APP_STORE_CONNECT_ISSUER_ID:-}}"
}

asc_key_path() {
  if [[ -n "${ASC_KEY_PATH:-${APP_STORE_CONNECT_API_KEY_PATH:-}}" ]]; then
    echo "${ASC_KEY_PATH:-${APP_STORE_CONNECT_API_KEY_PATH:-}}"
    return
  fi
  local key_b64="${ASC_KEY_P8_BASE64:-${APP_STORE_CONNECT_API_KEY_P8_BASE64:-}}"
  if [[ -z "$key_b64" ]]; then
    echo ""
    return
  fi
  mkdir -p "$(dirname "$ASC_KEY_TMP")"
  if ! printf '%s' "$key_b64" | base64 --decode >"$ASC_KEY_TMP" 2>/dev/null; then
    printf '%s' "$key_b64" | base64 -D >"$ASC_KEY_TMP"
  fi
  chmod 600 "$ASC_KEY_TMP"
  ASC_KEY_TMP_CREATED=1
  echo "$ASC_KEY_TMP"
}

asc_key_status() {
  local key_id issuer_id raw_path key_b64
  key_id="$(asc_key_id)"
  issuer_id="$(asc_issuer_id)"
  raw_path="${ASC_KEY_PATH:-${APP_STORE_CONNECT_API_KEY_PATH:-}}"
  key_b64="${ASC_KEY_P8_BASE64:-${APP_STORE_CONNECT_API_KEY_P8_BASE64:-}}"
  if [[ -z "$key_id$issuer_id$raw_path$key_b64" ]]; then
    echo "EMPTY"
    return
  fi
  if [[ -z "$key_id" || -z "$issuer_id" || -z "$raw_path$key_b64" ]]; then
    echo "INCOMPLETE"
    return
  fi
  if [[ -n "$raw_path" && ! -f "$raw_path" ]]; then
    echo "MISSING_FILE"
    return
  fi
  echo "CONFIGURED"
}

build_xcode_auth_args() {
  XCODE_AUTH_ARGS=()
  local key_id issuer_id key_path
  key_id="$(asc_key_id)"
  issuer_id="$(asc_issuer_id)"
  key_path="$(asc_key_path)"
  if [[ -n "$key_id$key_path$issuer_id" ]]; then
    [[ -n "$key_id" && -n "$issuer_id" && -n "$key_path" ]] || {
      red "ASC API Key 需要同时提供 ASC_KEY_ID、ASC_ISSUER_ID、ASC_KEY_PATH（或 ASC_KEY_P8_BASE64）"
      exit 1
    }
    [[ -f "$key_path" ]] || {
      red "ASC_KEY_PATH 不存在: $key_path"
      exit 1
    }
    XCODE_AUTH_ARGS+=(
      -authenticationKeyPath "$key_path"
      -authenticationKeyID "$key_id"
      -authenticationKeyIssuerID "$issuer_id"
    )
  fi
  if provisioning_updates_enabled; then
    XCODE_AUTH_ARGS+=(-allowProvisioningUpdates)
  fi
}

provisioning_updates_enabled() {
  case "${ALLOW_PROVISIONING_UPDATES:-}" in
    0|false|FALSE|no|NO) return 1 ;;
    1|true|TRUE|yes|YES) return 0 ;;
  esac
  [[ "$(asc_key_status)" == "CONFIGURED" ]]
}

need_xcode() {
  if [[ ! -d /Applications/Xcode.app ]]; then
    red "未找到 /Applications/Xcode.app"
    echo "请先从 App Store 安装完整 Xcode，打开一次并同意协议，然后执行:"
    echo "  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    echo "  sudo xcodebuild -license accept"
    return 1
  fi
  local dev
  dev="$(xcode-select -p 2>/dev/null || true)"
  if [[ "$dev" != *Xcode.app* ]]; then
    red "xcode-select 未指向完整 Xcode: ${dev:-EMPTY}"
    echo "请在本机执行:"
    echo "  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    return 1
  fi
  xcodebuild -version
}

team_id() {
  if [[ -n "${DEVELOPMENT_TEAM:-}" ]]; then
    echo "$DEVELOPMENT_TEAM"
    return
  fi
  if [[ -f "$TEAM_FILE" ]]; then
    local t
    t="$(sed -n 's/^DEVELOPMENT_TEAM[[:space:]]*=[[:space:]]*//p' "$TEAM_FILE" | tr -d '[:space:]' | head -1)"
    if [[ -n "$t" && "$t" != "YOUR_TEAM_ID" ]]; then
      echo "$t"
      return
    fi
  fi
  echo ""
}

marketing_version() {
  sed -n 's/^MARKETING_VERSION[[:space:]]*=[[:space:]]*//p' "$IOS/Config/Shared.xcconfig" | tr -d '[:space:]' | head -1
}

current_build_number() {
  sed -n 's/^CURRENT_PROJECT_VERSION[[:space:]]*=[[:space:]]*//p' "$IOS/Config/Shared.xcconfig" | tr -d '[:space:]' | head -1
}

next_build_number() {
  local build
  build="$(current_build_number)"
  [[ "$build" =~ ^[0-9]+$ ]] || return 1
  echo $((build + 1))
}

resolve_build_number() {
  local repo_build effective
  repo_build="$(current_build_number)"
  effective="${BUILD_NUMBER:-$repo_build}"
  [[ "$effective" =~ ^[1-9][0-9]*$ ]] || {
    red "BUILD_NUMBER/repo build 必须是正整数，当前: ${effective:-EMPTY}" >&2
    exit 2
  }
  echo "$effective"
}

make_export_options() {
  local t="$1"
  mkdir -p "$(dirname "$EXPORT_OPTS_WORK")"
  cp "$EXPORT_OPTS_TEMPLATE" "$EXPORT_OPTS_WORK"
  /usr/bin/plutil -replace teamID -string "$t" "$EXPORT_OPTS_WORK"
  echo "$EXPORT_OPTS_WORK"
}

run_handoff_preflight() {
  grn "GitHub handoff preflight..."
  (cd "$ROOT" && npm run testflight:preflight)
}

preflight() {
  echo "=== A 内容 ==="
  (cd "$ROOT" && node tools/audit-readiness.mjs)
  echo "=== 签名身份 ==="
  security find-identity -v -p codesigning || true
  local tid
  tid="$(team_id)"
  echo "Team: $(team_label "$tid")"
  echo "ASC API Key: $(asc_key_status)"
  echo "Build: $(marketing_version) ($(current_build_number))"
  if next="$(next_build_number)"; then
    echo "Next retry: DEVELOPMENT_TEAM=你的ID BUILD_NUMBER=$next bash tools/ship-testflight.sh --upload"
  fi
  echo "apiBase: $(python3 -c "import json;print(json.load(open('$SHELL_CFG')).get('apiBase') or 'EMPTY')")"
  if [[ -z "$tid" ]]; then
    red "Team 为空。请:"
    echo "  1) Xcode → Settings → Accounts 登录 Apple ID"
    echo "  2) 打开 Membership 复制 Team ID"
    echo "  3) DEVELOPMENT_TEAM=你的ID bash tools/ship-testflight.sh --upload"
    return 1
  fi
  local n
  n="$(security find-identity -v -p codesigning 2>/dev/null | grep -c 'Apple Development\|Apple Distribution\|iPhone' || true)"
  if [[ "${n:-0}" -lt 1 ]]; then
    ylw "钥匙串无 Apple 签名证书。打开 Xcode 工程勾选 Automatically manage signing 会自动拉证书。"
  fi
  return 0
}

do_archive() {
  local effective_build
  effective_build="$(resolve_build_number)"
  need_xcode
  run_handoff_preflight
  local tid
  tid="$(team_id)"
  [[ -n "$tid" ]] || { red "无 Team ID"; exit 1; }
  rm -rf "$ARCHIVE_PATH"
  grn "Archive → $ARCHIVE_PATH (Team configured)"
  build_xcode_auth_args
  local build_setting_args=()
  if [[ -n "${BUILD_NUMBER:-}" ]]; then
    ylw "Build number override: $BUILD_NUMBER"
  else
    ylw "Using repo build number: $effective_build"
  fi
  build_setting_args+=(CURRENT_PROJECT_VERSION="$effective_build")
  xcodebuild \
    -project "$PROJ" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE_PATH" \
    DEVELOPMENT_TEAM="$tid" \
    "${build_setting_args[@]}" \
    "${XCODE_AUTH_ARGS[@]}" \
    archive | /usr/bin/tee /tmp/hirota-archive.log | tail -30
  grn "Archive OK"
}

do_upload() {
  do_archive
  rm -rf "$EXPORT_DIR"
  mkdir -p "$EXPORT_DIR"
  local tid
  tid="$(team_id)"
  local export_opts
  export_opts="$(make_export_options "$tid")"
  grn "Export+Upload (app-store-connect)…"
  build_xcode_auth_args
  xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_DIR" \
    -exportOptionsPlist "$export_opts" \
    "${XCODE_AUTH_ARGS[@]}" | /usr/bin/tee /tmp/hirota-export.log | tail -40
  grn "若上传成功：打开 App Store Connect → TestFlight → 处理完成后加内测组"
  ls -la "$EXPORT_DIR" || true
}

open_xcode() {
  open "$PROJ"
  grn "已打开 Xcode 工程。手动路径: Signing 选 Team → Product → Archive → Distribute App → App Store Connect → Upload"
}

static_check() {
  grn "Static TestFlight handoff check..."
  (cd "$ROOT" && bash tools/scan-no-apple-secrets.sh)
  (cd "$ROOT" && node tools/assert-ios-archive-contract.mjs)
  local asc_status
  asc_status="$(asc_key_status)"
  case "$asc_status" in
    INCOMPLETE|MISSING_FILE)
      red "ASC API Key 配置不完整: $asc_status"
      exit 2
      ;;
  esac
  echo "ASC API Key: $asc_status"
  echo "Build: $(marketing_version) ($(current_build_number))"
  grn "Static check OK"
}

cmd="${1:-check}"
case "$cmd" in
  check|--check|"")
    need_xcode || true
    preflight || true
    echo ""
    if [[ -n "$(team_id)" ]]; then
      ylw "内容包已就绪。本机还差: 完整 Xcode + Apple 登录证书（apiBase 建议生产 HTTPS，内容内测可暂空）。"
    else
      ylw "内容包已就绪。本机还差: 完整 Xcode + Apple 登录证书 + Team ID（apiBase 建议生产 HTTPS，内容内测可暂空）。"
    fi
    ;;
  --static-check|static-check) static_check ;;
  --archive|archive) do_archive ;;
  --upload|upload) do_upload ;;
  --open|open) open_xcode ;;
  *)
    echo "usage: $0 [--check|--static-check|--archive|--upload|--open]"
    exit 2
    ;;
esac
