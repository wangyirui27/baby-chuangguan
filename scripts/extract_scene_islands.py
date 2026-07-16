#!/usr/bin/env python3
"""Extract approved islands without treating blue island details as water."""

from pathlib import Path
import sys

from PIL import Image
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parents[1]
OCEAN = ROOT / "assets" / "ocean"
SESSION = new_session("u2net")


def extract(number: int) -> Path:
    source = OCEAN / f"scene-island-{number:02d}.webp"
    output = OCEAN / f"scene-island-cutout-{number:02d}.webp"
    with Image.open(source) as image:
        cutout = remove(image.convert("RGB"), session=SESSION)
        cutout.resize((1280, 720), Image.Resampling.LANCZOS).save(output, "WEBP", quality=90, method=6)
    return output


if __name__ == "__main__":
    numbers = [int(value) for value in sys.argv[1:]] or list(range(1, 11))
    for number in numbers:
        path = extract(number)
        print(path.relative_to(ROOT))
