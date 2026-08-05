#!/usr/bin/env bash
# Pack H5 shell + the iPad seed assets for the native www bundle.
# Full map/video packs stay outside the IPA and are downloaded by the native shell.
set -euo pipefail
shopt -s nullglob
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-}"
if [[ -z "$OUT" ]]; then
  echo "usage: $0 <out-www-dir>" >&2
  exit 2
fi
rm -rf "$OUT"
mkdir -p "$OUT"
cp "$ROOT/index.html" "$ROOT/script.js" "$ROOT/style.css" "$ROOT/sw.js" "$OUT/"
for f in manifest.webmanifest app-release.json asset-packs.json; do
  [[ -f "$ROOT/$f" ]] && cp "$ROOT/$f" "$OUT/"
done

copy_dir() {
  local rel="$1"
  [[ -d "$ROOT/$rel" ]] || return 0
  mkdir -p "$OUT/$(dirname "$rel")"
  rsync -a --delete \
    --exclude '*.before-*' \
    --exclude '*.bak-*' \
    --exclude '__pycache__/' \
    "$ROOT/$rel/" "$OUT/$rel/"
}

copy_file() {
  local rel="$1"
  [[ -f "$ROOT/$rel" ]] || return 0
  mkdir -p "$OUT/$(dirname "$rel")"
  cp "$ROOT/$rel" "$OUT/$rel"
}

copy_glob() {
  local pattern="$1"
  local file rel
  for file in "$ROOT"/$pattern; do
    [[ -f "$file" ]] || continue
    rel="${file#$ROOT/}"
    copy_file "$rel"
  done
}

# Shared runtime assets used before any downloaded map pack is installed.
mkdir -p "$OUT/assets"
copy_dir "assets/audio"
copy_dir "assets/brand"
copy_dir "assets/icons"
copy_dir "assets/lottie"
copy_dir "assets/math-map"
copy_dir "assets/vendor"
copy_dir "assets/islands-v1/runtime"
copy_file "assets/islands-v1/catalog.csv"
copy_file "assets/ocean/covers/ocean-world-cover-v1.webp"
copy_glob "assets/ocean/*.webp"
copy_file "assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4"
copy_file "assets/egypt-map/background/egypt-desert-infinite-clean-bg-dreamina-v2.png"
copy_file "assets/egypt-map/background/egypt-desert-infinite-bg-libtv-v4.mp4"
copy_file "assets/egypt-map/covers/desert-world-cover-v1.webp"
copy_dir "assets/egypt-map/cutouts/buildings/v6-sand-blend"
copy_dir "assets/egypt-map/cutouts/decor/runtime-v2"
copy_file "assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png"
copy_file "assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.mov"
copy_file "assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.webm"
copy_file "assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.mov"
copy_file "assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.webm"
copy_glob "assets/video/free-levels/level-0[1-9]-*.mp4"
copy_glob "assets/video/free-levels/level-10-*.mp4"

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

for level in 01 02 03 04 05 06 07 08 09 10; do
  if ! find "$OUT/assets/video/free-levels" -maxdepth 1 -type f -name "level-${level}-*.mp4" 2>/dev/null | grep -q .; then
    echo "[pack-app-www] FAIL: seed video level-${level} missing in bundle" >&2
    exit 8
  fi
done

# fail if downloaded-course or raw production assets leaked in
if find "$OUT/assets/video" -type f 2>/dev/null | grep -Ev '/free-levels/level-(0[1-9]|10)-[^/]+\.mp4$' | head -1 | grep -q .; then
  echo "[pack-app-www] FAIL: non-seed course video found in bundle" >&2
  exit 3
fi
for banned in \
  "assets/video/paid-levels" \
  "assets/video/free-levels-libtv-downloads" \
  "assets/video/free-levels-libtv-preview" \
  "assets/egypt-map/cutouts/decor/raw-v2" \
  "assets/egypt-map/cutouts/decor/candidates" \
  "assets/egypt-map/cutouts/decor/dreamina" \
  "assets/egypt-map/.venv-rembg" \
  "assets/ocean/front-ocean-v1-video"; do
  if [[ -e "$OUT/$banned" ]]; then
    echo "[pack-app-www] FAIL: banned heavy asset path included: $banned" >&2
    exit 9
  fi
done
if find "$OUT/assets" -name '*.before-*' -o -name '*.bak-*' -o -name '__pycache__' | head -1 | grep -q .; then
  echo "[pack-app-www] FAIL: backup or cache asset leaked in bundle" >&2
  exit 10
fi
echo "[pack-app-www] OK -> $OUT"
du -sh "$OUT" "$OUT/assets" 2>/dev/null || true
echo "[pack-app-www] seed videos included; downloadable map packs excluded"
