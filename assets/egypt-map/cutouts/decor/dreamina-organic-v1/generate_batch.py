#!/usr/bin/env python3
"""Batch generate organic desert decor via Dreamina CLI + rembg cutout."""
from __future__ import annotations

import json
import os
import re
import subprocess
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
OUT = ROOT / "cutouts"
RUNTIME = ROOT.parent / "runtime-v1"
DREAMINA = os.path.expanduser("~/.local/bin/dreamina")

STYLE = (
    "Miyazaki Studio Ghibli watercolor illustration style, soft hand-painted kids game asset, "
    "warm pastel desert palette (sand cream, dusty terracotta, muted sage), "
    "single isolated object only, centered composition, clean sharp silhouette edges, "
    "pure solid white background #FFFFFF, absolutely no ground shadow, no soft oval glow, "
    "no sand mound pedestal, no base disc, no contact shadow, object appears planted not floating sticker, "
    "no text, no watermark, no frame, no border"
)

# slug -> prompt core (no style suffix)
PROMPTS = [
    ("13-date-palm-sapling", "one small young date palm sapling with a few green fronds, short trunk"),
    ("14-acacia-umbrella-tree", "one small flat-top acacia umbrella tree, sparse green canopy, thin trunk"),
    ("15-fallen-palm-frond", "one dried fallen palm frond leaf, curved, beige-brown"),
    ("16-sandstone-block", "one single weathered sandstone building block, rough cube-ish stone"),
    ("17-broken-amphora", "one broken terracotta amphora pot lying on its side, cracked ancient jar"),
    ("18-woven-basket", "one small woven reed basket, empty, desert market prop"),
    ("19-mudbrick-stack", "a small stack of three sun-dried mud bricks, adobe blocks"),
    ("20-desert-bloom", "one tiny desert wildflower plant with a few soft pink-lavender blooms and sparse leaves"),
    ("21-wooden-signpost", "one simple wooden trail signpost stake with blank board, weathered wood"),
    ("22-rope-coil", "one coil of thick hemp rope, desert camp prop"),
    ("23-water-skin", "one traditional leather water skin gourd bottle, desert traveler prop"),
    ("24-scarab-relief", "one small carved scarab beetle stone relief plaque, pale sandstone"),
    ("25-dune-grass-tuft", "one dense tuft of golden dune beach grass, clump of blades only"),
    ("26-cracked-pottery-shards", "a small pile of two or three terracotta pottery shards only"),
]


def run_text2image(prompt: str) -> dict:
    cmd = [
        DREAMINA,
        "text2image",
        f"--prompt={prompt}",
        "--ratio=1:1",
        "--model_version=4.6",
        "--resolution_type=2k",
        "--generate_num=1",
        "--poll=120",
    ]
    env = os.environ.copy()
    env["PATH"] = os.path.expanduser("~/.local/bin") + ":" + env.get("PATH", "")
    env.pop("PYTHONPATH", None)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=200, env=env)
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout)
    # stdout may contain trailing logs; find last JSON object
    text = result.stdout.strip()
    # try whole parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}\s*$", text)
        if not m:
            raise RuntimeError(f"no json in output: {text[:400]}")
        return json.loads(m.group(0))


def download(url: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, path)


def cutout(src: Path, dst: Path) -> None:
    from rembg import remove
    from PIL import Image, ImageFilter, ImageEnhance, ImageChops

    img = Image.open(src).convert("RGBA")
    # If already near-white bg, rembg still helps
    out = remove(img).convert("RGBA")
    r, g, b, a = out.split()
    a = a.filter(ImageFilter.SHARPEN)
    a = ImageEnhance.Brightness(a).enhance(1.15)
    # Kill residual pale sand base connected to bottom
    px = out.load()
    w, h = out.size
    # rebuild with cleaned alpha
    out = Image.merge("RGBA", (r, g, b, a))
    px = out.load()

    def lum(rr, gg, bb):
        return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb

    def sat(rr, gg, bb):
        mx, mn = max(rr, gg, bb), min(rr, gg, bb)
        return 0 if mx == 0 else (mx - mn) / float(mx)

    # flood pale bottom base
    from collections import deque

    sand = [[False] * w for _ in range(h)]
    for y in range(int(h * 0.55), h):
        yr = y / max(1, h - 1)
        for x in range(w):
            rr, gg, bb, aa = px[x, y]
            if aa < 8:
                continue
            L, S = lum(rr, gg, bb), sat(rr, gg, bb)
            if (aa < 90 and L >= 150) or (L >= 200 and S <= 0.28) or (L >= 185 and S <= 0.18 and yr >= 0.62):
                sand[y][x] = True

    vis = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in range(h - 1, max(h - 4, -1), -1):
            if sand[y][x] and not vis[y][x]:
                vis[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not vis[ny][nx] and sand[ny][nx] and ny >= int(h * 0.45):
                vis[ny][nx] = True
                q.append((nx, ny))
    for y in range(h):
        for x in range(w):
            if vis[y][x]:
                px[x, y] = (0, 0, 0, 0)

    # trim transparent borders with small pad
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
        # pad to square
        side = max(out.size) + 16
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        ox = (side - out.size[0]) // 2
        oy = side - out.size[1] - 8  # bottom-heavy for ground anchor
        canvas.paste(out, (ox, oy), out)
        out = canvas

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, "WEBP", lossless=True, method=6)


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    RUNTIME.mkdir(parents=True, exist_ok=True)

    summary = []
    for slug, core in PROMPTS:
        raw_path = RAW / f"{slug}.png"
        cut_path = OUT / f"{slug}.webp"
        run_path = RUNTIME / f"{slug}.webp"
        print(f"==> {slug}")
        if not raw_path.exists() or raw_path.stat().st_size < 10000:
            prompt = f"{core}, {STYLE}"
            data = run_text2image(prompt)
            status = data.get("gen_status")
            images = (data.get("result_json") or {}).get("images") or []
            if status != "success" or not images:
                print(f"  FAIL status={status}")
                summary.append((slug, "fail", status))
                continue
            download(images[0]["image_url"], raw_path)
            print(f"  downloaded {raw_path.name} {raw_path.stat().st_size}")
        else:
            print(f"  reuse raw {raw_path.name}")

        cutout(raw_path, cut_path)
        # copy into runtime
        run_path.write_bytes(cut_path.read_bytes())
        print(f"  cutout -> {run_path}")
        summary.append((slug, "ok", run_path.stat().st_size))

    print("\nSUMMARY")
    for row in summary:
        print(row)


if __name__ == "__main__":
    main()
