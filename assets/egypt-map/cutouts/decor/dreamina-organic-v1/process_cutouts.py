#!/usr/bin/env python3
"""Fast rembg + white-outline peel for desert decor cutouts."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove

RAW = Path(__file__).resolve().parent / "raw"
OUT = Path(__file__).resolve().parent.parent / "runtime-v1"


def peel_white_outline_fast(arr: np.ndarray, passes: int = 12) -> np.ndarray:
    """Remove light sticker stroke on exterior using numpy erosion border."""
    for _ in range(passes):
        a = arr[:, :, 3] >= 10
        if not a.any():
            break
        # neighbors: if any 4-neighbor is transparent → border
        up = np.pad(a[:-1, :], ((1, 0), (0, 0)), constant_values=False)
        down = np.pad(a[1:, :], ((0, 1), (0, 0)), constant_values=False)
        left = np.pad(a[:, :-1], ((0, 0), (1, 0)), constant_values=False)
        right = np.pad(a[:, 1:], ((0, 0), (0, 1)), constant_values=False)
        border = a & ~(up & down & left & right)

        rgb = arr[:, :, :3].astype(np.float32)
        L = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
        mx = rgb.max(axis=2)
        mn = rgb.min(axis=2)
        S = np.where(mx <= 0, 0, (mx - mn) / np.maximum(mx, 1e-6))
        bch, rch, gch = rgb[:, :, 2], rgb[:, :, 0], rgb[:, :, 1]

        kill = border & (
            ((L >= 155) & (S <= 0.34))
            | ((L >= 145) & (S <= 0.18))
            | ((bch >= rch - 2) & (bch >= gch - 8) & (L >= 140) & (S <= 0.35))
            | ((L >= 225) & (S <= 0.14))
        )
        if not kill.any():
            break
        arr[kill] = 0
    return arr


def wipe_bottom_band(arr: np.ndarray, frac: float) -> np.ndarray:
    a = arr[:, :, 3] >= 10
    if not a.any():
        return arr
    ys, xs = np.where(a)
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    bh = max(1, y1 - y0)
    cut_y = y1 - int(bh * frac)
    cx = (x0 + x1) / 2.0
    half = max(4, int((x1 - x0) * 0.05))
    band = arr[cut_y:y1, x0:x1]
    if band.size == 0:
        return arr
    rgb = band[:, :, :3].astype(np.float32)
    L = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    g, r, b = rgb[:, :, 1], rgb[:, :, 0], rgb[:, :, 2]
    green = (g > r + 12) & (g > b + 10)
    xx = np.arange(x0, x1)[None, :]
    yy = np.arange(cut_y, y1)[:, None]
    trunk = (np.abs(xx - cx) <= half) & (L < 170) & (yy < cut_y + max(4, int(bh * 0.05)))
    opaque = band[:, :, 3] >= 10
    wipe = opaque & ~green & ~trunk
    band[wipe] = 0
    soft = opaque & trunk
    band[:, :, 3] = np.where(soft, np.minimum(band[:, :, 3], 140), band[:, :, 3])
    arr[cut_y:y1, x0:x1] = band
    return arr


def process_one(src: Path, dest: Path, pedestal: float = 0.0, is_rock: bool = False) -> None:
    img = Image.open(src).convert("RGBA")
    arr0 = np.array(img)
    # force near-white bg
    rgb = arr0[:, :, :3].astype(np.float32)
    L = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    S = np.where(mx <= 0, 0, (mx - mn) / np.maximum(mx, 1e-6))
    white = (L >= 248) & (S <= 0.05)
    arr0[white] = (255, 255, 255, 255)
    img = Image.fromarray(arr0)

    cut = remove(img).convert("RGBA")
    r, g, b, a = cut.split()
    a = ImageEnhance.Brightness(a.filter(ImageFilter.SHARPEN)).enhance(1.15)
    cut = Image.merge("RGBA", (r, g, b, a))
    arr = np.array(cut)
    arr = peel_white_outline_fast(arr, 14)
    if pedestal > 0:
        arr = wipe_bottom_band(arr, pedestal)
        arr = peel_white_outline_fast(arr, 6)
    if is_rock:
        arr = peel_white_outline_fast(arr, 8)
        h = arr.shape[0]
        bot = arr[int(h * 0.62) :, :, :]
        rgb = bot[:, :, :3].astype(np.float32)
        L = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
        mx = rgb.max(axis=2)
        mn = rgb.min(axis=2)
        S = np.where(mx <= 0, 0, (mx - mn) / np.maximum(mx, 1e-6))
        kill = (bot[:, :, 3] >= 10) & (((L >= 190) & (S <= 0.22)) | ((L >= 175) & (S <= 0.12)))
        bot[kill] = 0
        arr[int(h * 0.62) :, :, :] = bot
        arr = peel_white_outline_fast(arr, 4)

    cut = Image.fromarray(arr)
    bbox = cut.getbbox()
    if not bbox:
        print("EMPTY", src.name)
        return
    c = cut.crop(bbox)
    pad = 40 if is_rock else 24
    side = max(c.size) + pad
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(c, ((side - c.size[0]) // 2, side - c.size[1] - pad // 2), c)
    canvas.thumbnail((900, 900), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, "WEBP", lossless=True, method=6)
    print("OK", dest.name, canvas.size, dest.stat().st_size)


def main() -> None:
    rocks = [
        "27-small-pebble",
        "28-pebble-trio",
        "29-flat-skipping-stone",
        "30-jagged-shard-rock",
        "31-two-pebbles",
        "32-gravel-scatter",
    ]
    for slug in rocks:
        src = RAW / f"{slug}.png"
        if src.exists():
            process_one(src, OUT / f"{slug}.webp", pedestal=0.10, is_rock=True)

    fix_map = {
        "17-broken-amphora": 0.0,
        "18-woven-basket": 0.0,
        "19-mudbrick-stack": 0.16,
        "16-sandstone-block": 0.10,
        "22-rope-coil": 0.0,
        "23-water-skin": 0.0,
        "24-scarab-relief": 0.08,
        "26-cracked-pottery-shards": 0.10,
        "13-date-palm-sapling": 0.22,
        "14-acacia-umbrella-tree": 0.18,
        "15-fallen-palm-frond": 0.0,
        "20-desert-bloom": 0.16,
        "21-wooden-signpost": 0.16,
        "25-dune-grass-tuft": 0.22,
    }
    for slug, ped in fix_map.items():
        src = RAW / f"{slug}.png"
        if src.exists():
            process_one(src, OUT / f"{slug}.webp", pedestal=ped, is_rock=False)

    # peel white outline on older runtime assets that often keep sticker rims
    for slug in [
        "01-cactus-cluster",
        "03-rock-pile",
        "04-terracotta-jar",
        "09-dry-bush",
        "11-stone-tablet",
        "12-wooden-crate",
        "02-dry-grass-clump",
        "05-column-fragment",
        "06-obelisk-fragment",
        "07-ruined-wall",
        "08-sandstone-archway",
        "10-reed-grass",
    ]:
        p = OUT / f"{slug}.webp"
        if not p.exists():
            continue
        arr = np.array(Image.open(p).convert("RGBA"))
        arr = peel_white_outline_fast(arr, 12)
        im = Image.fromarray(arr)
        bbox = im.getbbox()
        if not bbox:
            continue
        c = im.crop(bbox)
        side = max(c.size) + 24
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        canvas.paste(c, ((side - c.size[0]) // 2, side - c.size[1] - 12), c)
        canvas.thumbnail((900, 900), Image.Resampling.LANCZOS)
        canvas.save(p, "WEBP", lossless=True, method=6)
        print("PEEL-OLD", p.name)

    # process any new cactus_* raws
    for src in sorted(RAW.glob("3[3-9]-*.png")) + sorted(RAW.glob("4[0-9]-*.png")):
        process_one(src, OUT / f"{src.stem}.webp", pedestal=0.14, is_rock=False)

    print("done")


if __name__ == "__main__":
    main()
