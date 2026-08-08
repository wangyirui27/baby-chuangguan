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

need_node_modules() {
  local dir="$1"
  local command_hint="$2"
  if [[ ! -d "$dir/node_modules" ]]; then
    echo "[testflight-preflight] missing dependencies in $dir: run $command_hint" >&2
    exit 2
  fi
}

need_node_modules "." "npm ci"
need_node_modules "backend" "npm ci --prefix backend"
need_node_modules "apps/backend" "npm ci --prefix apps/backend"
need_node_modules "apps/frontend" "npm ci --prefix apps/frontend"

npm test
node tools/audit-readiness.mjs
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  check_git_count() {
    local label="$1"
    local actual="$2"
    local expected="$3"
    if [[ "$actual" != "$expected" ]]; then
      echo "[testflight-preflight] $label git-tracked count=$actual want=$expected" >&2
      exit 15
    fi
  }
  git_ocean_count="$(git ls-files 'assets/video/free-levels/*.mp4' | wc -l | tr -d ' ')"
  git_desert_count="$(git ls-files 'assets/video/desert-levels/*.mp4' | wc -l | tr -d ' ')"
  git_math_story_count="$(git ls-files 'assets/video/math-story/*.mp4' | wc -l | tr -d ' ')"
  git_math_theme_audio_count="$(git ls-files 'assets/audio/math-story-theme/*.mp3' | wc -l | tr -d ' ')"
  check_git_count ocean "$git_ocean_count" 10
  check_git_count desert "$git_desert_count" 10
  check_git_count math-story "$git_math_story_count" 31
  check_git_count math-theme-audio "$git_math_theme_audio_count" 31
  echo "[testflight-preflight] git-tracked assets ocean=$git_ocean_count desert=$git_desert_count math=$git_math_story_count mathThemeAudio=$git_math_theme_audio_count"
fi
node <<'JS'
const fs = require('node:fs');
const path = require('node:path');
const root = 'ios/BabyEnglishIsland/Assets.xcassets';
const emailLike = /[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z][A-Za-z0-9.-]*\.[A-Za-z]{2,}/;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    if (!entry.isFile() || entry.name !== 'Contents.json') continue;
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const image of json.images || []) {
      if (!image.filename) continue;
      if (emailLike.test(image.filename)) {
        throw new Error(`[testflight-preflight] email-like asset filename: ${file} -> ${image.filename}`);
      }
      const target = path.join(path.dirname(file), image.filename);
      if (!fs.existsSync(target)) {
        throw new Error(`[testflight-preflight] missing asset filename: ${file} -> ${image.filename}`);
      }
    }
  }
};
walk(root);
JS
bash tools/pack-app-www.sh "$OUT"

ocean_count="$(find "$OUT/assets/video/free-levels" -maxdepth 1 -type f -name 'level-*.mp4' | wc -l | tr -d ' ')"
desert_count="$(find "$OUT/assets/video/desert-levels" -maxdepth 1 -type f -name 'level-*.mp4' | wc -l | tr -d ' ')"
math_story_count="$(find "$OUT/assets/video/math-story" -maxdepth 1 -type f -name '*.mp4' | wc -l | tr -d ' ')"
math_theme_audio_count="$(find "$OUT/assets/audio/math-story-theme" -maxdepth 1 -type f -name '*.mp3' | wc -l | tr -d ' ')"
test "$ocean_count" = "10"
test "$desert_count" = "10"
test "$math_story_count" = "31"
test "$math_theme_audio_count" = "31"

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
echo "[testflight-preflight] seeds ocean=$ocean_count desert=$desert_count math=$math_story_count mathThemeAudio=$math_theme_audio_count"
echo "[testflight-preflight] OK"
