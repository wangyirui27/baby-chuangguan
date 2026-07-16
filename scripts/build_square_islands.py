#!/usr/bin/env python3
"""Build the approved first island batch as lightweight transparent WebP assets."""

from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "islands-v1"
RUNTIME = ASSETS / "runtime"
SOURCES = {
    1: ROOT / "assets/island-tier-natural-study-20260715/t1/dad36499-26c5-4920-813d-9e01722fc194_image_1.png",
    2: ROOT / "assets/island-tier-natural-study-20260715/t2/59b09db4-3071-4f44-af00-548bd0dc00de_image_1.png",
    3: ROOT / "assets/island-tier-natural-study-20260715/t3/c554226a-4d80-45f3-8490-12bf56be9602_image_1.png",
    4: ROOT / "assets/island-tier-natural-study-20260715/t4/16ab2636-eeb5-422e-8e86-55c23aa71036_image_1.png",
    5: ROOT / "assets/island-tier-natural-study-20260715/t5/597bc5e8-1ef1-4c4e-a552-b75166fbedab_image_1.png",
    **{
        number: ASSETS / f"source-v6/{number:03d}"
        for number in range(6, 11)
    },
}


def source_for(number: int) -> Path:
    source = SOURCES[number]
    if source.is_file():
        return source
    matches = sorted(source.glob("*_image_1.png"))
    if len(matches) != 1:
        raise RuntimeError(f"expected one source for island {number:03d}, found {len(matches)}")
    return matches[0]


def build(number: int, session) -> Path:
    output = RUNTIME / f"island-{number:03d}.webp"
    with Image.open(source_for(number)) as source:
        rgb = source.convert("RGB").resize((1536, 1536), Image.Resampling.LANCZOS)

    matte = remove(rgb, session=session)
    cutout_rgba = np.asarray(matte).copy()
    if number <= 5:
        alpha = cutout_rgba[:, :, 3]
        alpha[alpha < 16] = 0
        alpha[alpha > 239] = 255
        Image.fromarray(cutout_rgba).save(
            output, "WEBP", quality=88, method=6, exact=True
        )
        return output

    source_rgba = np.asarray(rgb.convert("RGBA")).copy()
    hsv = np.asarray(rgb.convert("HSV"))
    dark_water = (
        (hsv[:, :, 0] >= 115)
        & (hsv[:, :, 0] <= 190)
        & (hsv[:, :, 1] >= 55)
        & (hsv[:, :, 2] <= 205)
    )
    row_coverage = dark_water.mean(axis=1)
    rows = np.flatnonzero(
        (np.arange(rgb.height) >= int(rgb.height * 0.55))
        & (row_coverage >= 0.38)
    )
    if len(rows) < 8:
        raise RuntimeError(f"island {number:03d} has no complete rectangular water base")

    top, bottom = int(rows[0]), int(rows[-1])
    base_pixels = dark_water[top:bottom + 1]
    columns = np.flatnonzero(base_pixels.mean(axis=0) >= 0.45)
    if len(columns) < int(rgb.width * 0.45):
        raise RuntimeError(f"island {number:03d} rectangular base is too narrow")
    left, right = int(columns[0]), int(columns[-1])

    base = Image.new("L", rgb.size, 0)
    ImageDraw.Draw(base).rounded_rectangle((left, top, right, bottom), radius=12, fill=255)
    base_alpha = np.asarray(base)
    alpha = np.asarray(
        Image.fromarray(cutout_rgba[:, :, 3]).filter(ImageFilter.MinFilter(3))
    ).copy()
    alpha[alpha < 32] = 0
    alpha[alpha > 223] = 255
    fill = base_alpha > alpha
    cutout_rgba[fill, :3] = source_rgba[fill, :3]
    cutout_rgba[:, :, 3] = np.maximum(alpha, base_alpha)
    cutout = Image.fromarray(cutout_rgba)

    opaque_base = np.asarray(cutout.getchannel("A"))[top:bottom + 1, left:right + 1]
    if (opaque_base >= 245).mean() < 0.985:
        raise RuntimeError(f"island {number:03d} rectangular base alpha is incomplete")
    cutout.save(output, "WEBP", quality=88, method=6, exact=True)
    return output


def main():
    RUNTIME.mkdir(parents=True, exist_ok=True)
    requested = [int(value) for value in sys.argv[1:]] or list(range(1, 11))
    session = new_session("u2net")
    for number in requested:
        output = build(number, session)
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
