#!/usr/bin/env bash
# Pack H5 shell + in-app assets for native www bundle.
# Course videos (assets/video/**) are EXCLUDED — load from COURSE_VIDEO_BASE / CDN / OSS.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-}"
if [[ -z "$OUT" ]]; then
  echo "usage: $0 <out-www-dir>" >&2
  exit 2
fi
rm -rf "$OUT"
mkdir -p "$OUT"
cp "$ROOT/index.html" "$ROOT/script.js" "$ROOT/style.css" "$ROOT/sw.js" "$OUT/"
for f in manifest.webmanifest app-release.json; do
  [[ -f "$ROOT/$f" ]] && cp "$ROOT/$f" "$OUT/"
done
# assets except course videos
mkdir -p "$OUT/assets"
if [[ -d "$ROOT/assets" ]]; then
  rsync -a --delete \
    --exclude 'video/' \
    --exclude 'video/**' \
    "$ROOT/assets/" "$OUT/assets/"
fi
# brand pack guard: if source has brand assets, packed bundle must keep them
if [[ -d "$ROOT/assets/brand" ]]; then
  if [[ ! -d "$OUT/assets/brand" ]]; then
    echo "[pack-app-www] FAIL: assets/brand missing in bundle" >&2
    exit 4
  fi
  if ! find "$OUT/assets/brand" -type f 2>/dev/null | grep -q .; then
    echo "[pack-app-www] FAIL: assets/brand empty in bundle" >&2
    exit 5
  fi
fi
# splash brand voice hard check (required by iPad startup experience)
if [[ -f "$ROOT/assets/brand/audio/xingyuan-shaer-yingyu-peiqi.mp3" ]] && [[ ! -f "$OUT/assets/brand/audio/xingyuan-shaer-yingyu-peiqi.mp3" ]]; then
  echo "[pack-app-www] FAIL: brand splash voice missing in bundle" >&2
  exit 6
fi
# splash melody hard check (required by splash end melody experience)
if [[ -f "$ROOT/assets/brand/audio/splash-melody-end.mp3" ]] && [[ ! -f "$OUT/assets/brand/audio/splash-melody-end.mp3" ]]; then
  echo "[pack-app-www] FAIL: splash melody end missing in bundle" >&2
  exit 7
fi
# auth static helpers if any
if [[ -d "$ROOT/auth" ]]; then
  rsync -a --delete "$ROOT/auth/" "$OUT/auth/" --exclude 'node_modules' --exclude '*.test.*' || true
fi
echo "[pack-app-www] OK -> $OUT"
du -sh "$OUT" "$OUT/assets" 2>/dev/null || true
# fail if course videos leaked in
if find "$OUT/assets" -path '*/video/*' -type f 2>/dev/null | head -1 | grep -q .; then
  echo "[pack-app-www] FAIL: course video found in bundle" >&2
  exit 3
fi
echo "[pack-app-www] course videos excluded (assets/video)"
