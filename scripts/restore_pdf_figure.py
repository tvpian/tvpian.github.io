#!/usr/bin/env python3
"""Restore a PDF-extracted figure by applying its soft-mask image.

Poppler's ``pdfimages`` exports an image and its transparency mask separately.
Compositing the color layer without that mask can turn transparent regions black
and hide dark labels or connectors. This utility reconstructs the intended image
on a configurable paper-colored background.
"""

from pathlib import Path
import argparse

from PIL import Image


def restore(color_path: Path, mask_path: Path, output_path: Path, paper: str) -> None:
    color = Image.open(color_path).convert("RGB")
    mask = Image.open(mask_path).convert("L")
    if color.size != mask.size:
        raise ValueError(f"Color and mask dimensions differ: {color.size} != {mask.size}")

    rgb = tuple(int(paper[index:index + 2], 16) for index in (1, 3, 5))
    restored = Image.new("RGB", color.size, rgb)
    restored.paste(color, (0, 0), mask)
    restored.save(output_path, format="WEBP", quality=94, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("color", type=Path)
    parser.add_argument("mask", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--paper", default="#f7f5ef")
    args = parser.parse_args()
    restore(args.color, args.mask, args.output, args.paper)


if __name__ == "__main__":
    main()
