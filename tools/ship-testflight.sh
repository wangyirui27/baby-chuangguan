#!/usr/bin/env bash
# 嗨洛塔 → TestFlight 一键发船（需完整 Xcode + 已登录 Apple ID + Team）
# 用法:
#   bash tools/ship-testflight.sh                  # 检查 + 引导
#   bash tools/ship-testflight.sh --archive        # Archive
#   bash tools/ship-testflight.sh --upload         # Archive + 导出上传
#   DEVELOPMENT_TEAM=XXXXXXXX bash tools/ship-testflight.sh --upload
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS="$ROOT/ios"
PROJ="$IOS/BabyEnglishIsland.xcodeproj"
SCHEME="BabyEnglishIsland"
ARCHIVE_PATH="${ARCHIVE_PATH:-/tmp/hirota-BabyEnglishIsland.xcarchive}"
EXPORT_DIR="${EXPORT_DIR:-/tmp/hirota-tf-export}"
EXPORT_OPTS="$IOS/ExportOptions-TestFlight.plist"
TEAM_FILE="$IOS/Config/Team.xcconfig"
SHELL_CFG="$IOS/BabyEnglishIsland/shell-config.json"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
ylw() { printf '\033[33m%s\033[0m\n' "$*"; }

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
    ylw "xcode-select 未指向 Xcode，尝试切换…"
    sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
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

write_team() {
  local t="$1"
  cat >"$TEAM_FILE" <<EOF
// Filled by tools/ship-testflight.sh — do not commit real secrets if policy requires.
DEVELOPMENT_TEAM = $t
EOF
  # ExportOptions teamID
  /usr/bin/plutil -replace teamID -string "$t" "$EXPORT_OPTS" 2>/dev/null || true
  grn "DEVELOPMENT_TEAM=$t → Team.xcconfig + ExportOptions"
}

preflight() {
  echo "=== A 内容 ==="
  (cd "$ROOT" && node tools/audit-readiness.mjs)
  echo "=== 签名身份 ==="
  security find-identity -v -p codesigning || true
  local tid
  tid="$(team_id)"
  echo "Team: ${tid:-EMPTY}"
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
  need_xcode
  local tid
  tid="$(team_id)"
  [[ -n "$tid" ]] || { red "无 Team ID"; exit 1; }
  write_team "$tid"
  rm -rf "$ARCHIVE_PATH"
  grn "Archive → $ARCHIVE_PATH"
  xcodebuild \
    -project "$PROJ" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE_PATH" \
    DEVELOPMENT_TEAM="$tid" \
    archive | /usr/bin/tee /tmp/hirota-archive.log | tail -30
  grn "Archive OK"
}

do_upload() {
  do_archive
  rm -rf "$EXPORT_DIR"
  mkdir -p "$EXPORT_DIR"
  local tid
  tid="$(team_id)"
  /usr/bin/plutil -replace teamID -string "$tid" "$EXPORT_OPTS"
  grn "Export+Upload (app-store-connect)…"
  xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_DIR" \
    -exportOptionsPlist "$EXPORT_OPTS" | /usr/bin/tee /tmp/hirota-export.log | tail -40
  grn "若上传成功：打开 App Store Connect → TestFlight → 处理完成后加内测组"
  ls -la "$EXPORT_DIR" || true
}

open_xcode() {
  open "$PROJ"
  grn "已打开 Xcode 工程。手动路径: Signing 选 Team → Product → Archive → Distribute App → App Store Connect → Upload"
}

cmd="${1:-check}"
case "$cmd" in
  check|--check|"")
    need_xcode || true
    preflight || true
    echo ""
    ylw "内容包已就绪。本机还差: 完整 Xcode + Apple 登录证书 + Team ID（apiBase 建议生产 HTTPS，内容内测可暂空）。"
    ;;
  --archive|archive) do_archive ;;
  --upload|upload) do_upload ;;
  --open|open) open_xcode ;;
  *)
    echo "usage: $0 [--check|--archive|--upload|--open]"
    exit 2
    ;;
esac
