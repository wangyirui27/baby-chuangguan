#!/usr/bin/env bash
# Pack H5 shell + runtime seed assets for the native www / IPA bundle.
#
# 包体铁律（产品确认）：
# 1) 非视频的基本运行时素材必须打进 App（音频、图标、地图 UI 图、数学道具、Lottie、品牌…）
# 2) 课程闯关教学 mp4：仅种子 L01–L10 进包；付费/后续关走下载或 CDN（不塞整库）
# 3) 数学地图 31 条 story waypoint mp4：当前播放路径是包内 assets/video/math-story，必须进包
# 4) 地图氛围 loop（海洋/沙漠背景循环、骆驼 alpha）算「壳层体验」仍进包（体积可控）
# 5) 生成草稿 / raw / candidates / _dreamina / _gen 等绝不准进包
#
# Full optional map/course packs may still download later; basics must work offline at first launch.
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

# Shared rsync excludes: drafts / raw / tooling never ship
RSYNC_EXCLUDES=(
  --exclude '*.before-*'
  --exclude '*.bak-*'
  --exclude '__pycache__/'
  --exclude '.venv*/'
  --exclude '_gen/'
  --exclude '_gen*/'
  --exclude '_dreamina*/'
  --exclude '_cut/'
  --exclude '_picked/'
  --exclude '_prompts/'
  --exclude '_qa-*'
  --exclude '_preview-*'
  --exclude 'raw-*/'
  --exclude 'candidates/'
  --exclude 'dreamina/'
  --exclude 'generated/'
  --exclude 'free-levels-libtv-downloads/'
  --exclude 'free-levels-libtv-preview/'
  --exclude 'paid-levels/'
)

copy_dir() {
  local rel="$1"
  [[ -d "$ROOT/$rel" ]] || return 0
  mkdir -p "$OUT/$(dirname "$rel")"
  rsync -a --delete "${RSYNC_EXCLUDES[@]}" \
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

# ── 非视频基本运行时素材：必须进包 ──────────────────────────────
mkdir -p "$OUT/assets"
copy_dir "assets/audio"
copy_dir "assets/brand"
copy_dir "assets/icons"
copy_dir "assets/lottie"
copy_dir "assets/math-map"
copy_dir "assets/vendor"
copy_dir "assets/islands-v1/runtime"
copy_file "assets/islands-v1/catalog.csv"

# 海洋 / 沙漠壳层（封面 + 运行时抠图 + 氛围 loop）
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

# 课程种子视频 only（其余课程 mp4 不进包；L11+ 走 asset-packs OSS）
# 海岛 ocean free L01–L10
copy_glob "assets/video/free-levels/level-0[1-9]-*.mp4"
copy_glob "assets/video/free-levels/level-10-*.mp4"
# 沙漠 desert free L001–L010（包内定稿，与 script.js DESERT_FREE_LEVEL_VIDEOS 对齐）
copy_glob "assets/video/desert-levels/level-00[1-9]-*.mp4"
copy_glob "assets/video/desert-levels/level-010-*.mp4"
# 数学 story waypoint 短片（31 条；script.js 使用本地相对路径播放）
copy_glob "assets/video/math-story/*.mp4"
copy_file "assets/video/math-story/math-story-video-manifest.json"

# brand pack guard
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
if [[ -f "$ROOT/assets/brand/audio/xingyuan-shaer-yingyu-peiqi.mp3" ]] && [[ ! -f "$OUT/assets/brand/audio/xingyuan-shaer-yingyu-peiqi.mp3" ]]; then
  echo "[pack-app-www] FAIL: brand splash voice missing in bundle" >&2
  exit 6
fi
if [[ -f "$ROOT/assets/brand/audio/splash-melody-end.mp3" ]] && [[ ! -f "$OUT/assets/brand/audio/splash-melody-end.mp3" ]]; then
  echo "[pack-app-www] FAIL: splash melody end missing in bundle" >&2
  exit 7
fi

# auth static helpers
if [[ -d "$ROOT/auth" ]]; then
  rsync -a --delete "$ROOT/auth/" "$OUT/auth/" --exclude 'node_modules' --exclude '*.test.*' || true
fi

# seed course videos present (ocean + desert free 10)
for level in 01 02 03 04 05 06 07 08 09 10; do
  if ! find "$OUT/assets/video/free-levels" -maxdepth 1 -type f -name "level-${level}-*.mp4" 2>/dev/null | grep -q .; then
    echo "[pack-app-www] FAIL: ocean seed video level-${level} missing in bundle" >&2
    exit 8
  fi
done
for level in 001 002 003 004 005 006 007 008 009 010; do
  if ! find "$OUT/assets/video/desert-levels" -maxdepth 1 -type f -name "level-${level}-*.mp4" 2>/dev/null | grep -q .; then
    echo "[pack-app-www] FAIL: desert seed video level-${level} missing in bundle" >&2
    exit 8
  fi
done
math_story_count="$(find "$OUT/assets/video/math-story" -maxdepth 1 -type f -name '*.mp4' 2>/dev/null | wc -l | tr -d ' ')"
if [[ "$math_story_count" != "31" ]]; then
  echo "[pack-app-www] FAIL: math-story mp4 count=$math_story_count want=31" >&2
  exit 13
fi

# fail if non-seed course video leaked (free ocean L01-10 + desert L001-010 + math-story allowed)
if find "$OUT/assets/video" -type f 2>/dev/null \
  | grep -Ev '/free-levels/level-(0[1-9]|10)-[^/]+\.mp4$' \
  | grep -Ev '/desert-levels/level-(00[1-9]|010)-[^/]+\.mp4$' \
  | grep -Ev '/math-story/level-[0-9]{3}-[^/]+\.mp4$' \
  | grep -Ev '/math-story/math-story-video-manifest\.json$' \
  | head -1 | grep -q .; then
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
  "assets/ocean/front-ocean-v1-video" \
  "assets/math-map/quiz/_gen" \
  "assets/math-map/quiz/wood-digits/_dreamina-raw" \
  "assets/math-map/props/_gen-eraser"; do
  if [[ -e "$OUT/$banned" ]]; then
    echo "[pack-app-www] FAIL: banned heavy/draft path included: $banned" >&2
    exit 9
  fi
done

if find "$OUT/assets" \( -name '*.before-*' -o -name '*.bak-*' -o -name '__pycache__' \) | head -1 | grep -q .; then
  echo "[pack-app-www] FAIL: backup or cache asset leaked in bundle" >&2
  exit 10
fi

# ── 运行时非视频引用必须在包内（对照 script.js / style.css / index.html）──
python3 - "$ROOT" "$OUT" <<'PY'
import re, sys
from pathlib import Path
root, out = Path(sys.argv[1]), Path(sys.argv[2])
texts = []
for name in ("script.js", "style.css", "index.html"):
    p = root / name
    if p.exists():
        texts.append(p.read_text(errors="ignore"))
blob = "\n".join(texts)
refs = set()
for m in re.finditer(r"""['"`](assets/[^'"`?#\s]+)""", blob):
    p = m.group(1).split("?")[0]
    if "${" in p or "{" in p:
        continue
    refs.add(p)
for m in re.finditer(r"url\(([^)]+)\)", blob):
    u = m.group(1).strip("'\"")
    if u.startswith("assets/"):
        refs.add(u.split("?")[0])

# Course teaching videos under free/desert/paid are allowed missing beyond seeds;
# only check non-course-video runtime basics (+ shell loops already copied).
def is_course_teaching_video(rel: str) -> bool:
    if not rel.startswith("assets/video/"):
        return False
    return True

def seed_required(rel: str) -> bool:
    """Ocean free L1-10 and desert free L1-10 must ship in the bundle."""
    m = re.search(r"/free-levels/level-(\d+)-", rel)
    if m:
        return int(m.group(1)) <= 10
    m = re.search(r"/desert-levels/level-(\d+)-", rel)
    if m:
        return int(m.group(1)) <= 10
    return False

missing = []
for rel in sorted(refs):
    if is_course_teaching_video(rel):
        if not seed_required(rel):
            continue
    src = root / rel
    dst = out / rel
    if not src.exists():
        continue  # source-side missing is a content bug elsewhere
    if not dst.exists():
        missing.append(rel)

if missing:
    print("[pack-app-www] FAIL: runtime non-seed assets missing from bundle:", file=sys.stderr)
    for rel in missing[:40]:
        print(f"  - {rel}", file=sys.stderr)
    if len(missing) > 40:
        print(f"  ... +{len(missing)-40} more", file=sys.stderr)
    sys.exit(11)

# hard-require math wood digits v7 (dynamic path)
for key in list(range(0, 11)) + ["q"]:
    rel = f"assets/math-map/quiz/wood-digits/wood-digit-{key}-v7.webp"
    if (root / rel).exists() and not (out / rel).exists():
        print(f"[pack-app-www] FAIL: required math digit missing: {rel}", file=sys.stderr)
        sys.exit(12)

print(f"[pack-app-www] runtime asset gate OK ({len(refs)} static refs checked)")
PY

echo "[pack-app-www] OK -> $OUT"
du -sh "$OUT" "$OUT/assets" 2>/dev/null || true
echo "[pack-app-www] basics(non-video)+shell loops+ocean L01-10+desert L001-010+math-story x31 in; L11+ OSS/asset-packs; drafts/raw out"
