#!/usr/bin/env bash
# TestFlight content/native handoff preflight. Does not require Xcode or Apple credentials.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-}"
TMP=""

if [[ -z "$OUT" ]]; then
  TMP="$(mktemp -d)"
  OUT="$TMP/www"
fi

cleanup() {
  if [[ -n "$TMP" ]]; then
    rm -rf "$TMP"
  fi
}
trap cleanup EXIT

cd "$ROOT"

for bin in node npm rsync python3; do
  command -v "$bin" >/dev/null 2>&1 || {
    echo "[testflight-preflight] missing command: $bin" >&2
    exit 2
  }
done

npm test
node tools/audit-readiness.mjs
bash tools/pack-app-www.sh "$OUT"

ocean_count="$(find "$OUT/assets/video/free-levels" -maxdepth 1 -type f -name 'level-*.mp4' | wc -l | tr -d ' ')"
desert_count="$(find "$OUT/assets/video/desert-levels" -maxdepth 1 -type f -name 'level-*.mp4' | wc -l | tr -d ' ')"
math_story_count="$(find "$OUT/assets/video/math-story" -maxdepth 1 -type f -name '*.mp4' | wc -l | tr -d ' ')"
test "$ocean_count" = "10"
test "$desert_count" = "10"
test "$math_story_count" = "31"

if command -v plutil >/dev/null 2>&1; then
  plutil -lint \
    ios/ExportOptions-TestFlight.plist \
    ios/BabyEnglishIsland/Info.plist \
    ios/BabyEnglishIsland/PrivacyInfo.xcprivacy
fi

if command -v sips >/dev/null 2>&1; then
  icon_alpha="$(sips -g hasAlpha ios/BabyEnglishIsland/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png 2>/dev/null | awk '/hasAlpha:/ {print $2}')"
  if [[ "$icon_alpha" == "yes" ]]; then
    echo "[testflight-preflight] AppIcon-1024.png must not contain alpha" >&2
    exit 14
  fi
fi

if command -v ruby >/dev/null 2>&1; then
  ruby -e "require 'rexml/document'; REXML::Document.new(File.read('ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme'))"
fi

du -sh "$OUT" "$OUT/assets/video/math-story"
echo "[testflight-preflight] seeds ocean=$ocean_count desert=$desert_count math=$math_story_count"
echo "[testflight-preflight] OK"
