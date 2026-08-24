#!/usr/bin/env python3
"""Resize and watermark a dated Fuego gallery image batch."""

import argparse
import re
from pathlib import Path

from PIL import Image, ImageOps


def natural_key(path: Path) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--date", required=True)
    parser.add_argument("--logo", required=True, type=Path)
    args = parser.parse_args()

    sources = sorted(args.source.glob("*.jpg"), key=natural_key)
    if not sources:
        raise SystemExit("No JPEG images found in the source folder.")

    args.destination.mkdir(parents=True, exist_ok=True)
    watermark_source = Image.open(args.logo).convert("RGBA")

    for index, source in enumerate(sources, start=1):
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")

        long_edge = max(image.size)
        if long_edge > 2400:
            scale = 2400 / long_edge
            image = image.resize(
                (round(image.width * scale), round(image.height * scale)),
                Image.Resampling.LANCZOS,
            )

        watermark_height = round(image.height * 0.24)
        watermark_width = round(watermark_source.width * watermark_height / watermark_source.height)
        watermark = watermark_source.resize(
            (watermark_width, watermark_height),
            Image.Resampling.LANCZOS,
        )
        margin = round(image.height * 0.02)
        position = ((image.width - watermark.width) // 2, image.height - watermark.height - margin)

        composite = image.convert("RGBA")
        composite.alpha_composite(watermark, position)
        output = args.destination / f"{args.date}-{index:02d}.jpg"
        composite.convert("RGB").save(output, quality=95, optimize=True, subsampling=0)
        print(f"{source.name} -> {output.name} ({image.width}x{image.height})")


if __name__ == "__main__":
    main()
