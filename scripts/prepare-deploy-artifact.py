#!/usr/bin/env python3
"""Create a deployable static artifact without repository internals."""

from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / "deploy-artifact"

STATIC_FILES = [
    "index.html",
    "robots.txt",
    "llms.txt",
    "wishlist-products.json",
    "wishlist-content.json",
]

STATIC_DIRECTORIES = [
    "assets",
    "js",
    "styles",
]


def copy_file(relative_path: str) -> None:
    source = ROOT / relative_path
    target = ARTIFACT_DIR / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def copy_directory(relative_path: str) -> None:
    source = ROOT / relative_path
    target = ARTIFACT_DIR / relative_path
    shutil.copytree(source, target, dirs_exist_ok=True)


def main() -> None:
    if ARTIFACT_DIR.exists():
        shutil.rmtree(ARTIFACT_DIR)

    ARTIFACT_DIR.mkdir(parents=True)

    for relative_path in STATIC_FILES:
        copy_file(relative_path)

    for relative_path in STATIC_DIRECTORIES:
        copy_directory(relative_path)

    print(f"prepared deploy artifact at {ARTIFACT_DIR}")


if __name__ == "__main__":
    main()
