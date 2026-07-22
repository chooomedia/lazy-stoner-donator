#!/usr/bin/env python3
"""Validate the static wishlist runtime before deployment."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


REQUIRED_FILES = [
    "index.html",
    "robots.txt",
    "llms.txt",
    "sitemap.xml",
    "wishlist-products.json",
    "wishlist-content.json",
    "styles/main.css",
    "js/adCard.js",
    "js/card.js",
    "js/cardStack.js",
    "js/http.js",
    "js/widget.js",
    "js/wishlistProductsData.js",
    "js/wishlistContentData.js",
]

REQUIRED_DIRECTORIES = [
    "assets",
    "js",
    "styles",
]

SOCIAL_IMAGE_HOSTS = {
    "social-wish",
    "campaign-wish",
    "donation-wish",
}


def fail(message: str) -> None:
    print(f"validation failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def read_json(relative_path: str):
    path = ROOT / relative_path
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except json.JSONDecodeError as error:
        fail(f"{relative_path} is invalid JSON: {error}")


def read_fallback_assignment(relative_path: str, variable_name: str):
    path = ROOT / relative_path
    source = path.read_text(encoding="utf-8")
    pattern = rf"window\.{re.escape(variable_name)}\s*=\s*(.*?);\s*$"
    match = re.search(pattern, source, re.DOTALL)
    if not match:
        fail(f"{relative_path} does not assign window.{variable_name}")

    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as error:
        fail(f"{relative_path} fallback payload is invalid JSON: {error}")


def read_json_ld():
    index_html = (ROOT / "index.html").read_text(encoding="utf-8")
    match = re.search(
        r'<script[^>]+id="wishlist-schema"[^>]*>\s*(.*?)\s*</script>',
        index_html,
        re.DOTALL,
    )
    if not match:
        fail("index.html does not contain the wishlist-schema JSON-LD block")

    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as error:
        fail(f"wishlist-schema JSON-LD is invalid JSON: {error}")


def validate_required_paths() -> None:
    for relative_path in REQUIRED_FILES:
        path = ROOT / relative_path
        if not path.is_file():
            fail(f"missing required file: {relative_path}")

    for relative_path in REQUIRED_DIRECTORIES:
        path = ROOT / relative_path
        if not path.is_dir():
            fail(f"missing required directory: {relative_path}")


def validate_products(products, fallback_products, json_ld) -> None:
    if not isinstance(products, list):
        fail("wishlist-products.json must contain a JSON array")

    if not products:
        fail("wishlist-products.json must not be empty")

    if len(products) != len(fallback_products):
        fail("product JSON and fallback product JS have different item counts")

    json_ld_items = json_ld.get("mainEntity", {}).get("itemListElement", [])
    json_ld_count = json_ld.get("mainEntity", {}).get("numberOfItems")

    if json_ld_count != len(products):
        fail("JSON-LD numberOfItems does not match wishlist-products.json")

    if len(json_ld_items) != len(products):
        fail("JSON-LD itemListElement count does not match wishlist-products.json")

    for index, product in enumerate(products, start=1):
        for field in ("adId", "title", "url", "image"):
            if not product.get(field):
                fail(f"product #{index} is missing required field: {field}")

        expected_position = index
        actual_position = json_ld_items[index - 1].get("position")
        if actual_position != expected_position:
            fail(f"JSON-LD item position mismatch at product #{index}")

        if product.get("host") in SOCIAL_IMAGE_HOSTS:
            validate_social_image_metadata(product, index, json_ld_items[index - 1].get("item", {}))


def validate_social_image_metadata(product, index: int, json_ld_item) -> None:
    image = product.get("image", "")
    image_path = ROOT / image

    if not image.startswith("assets/images/social-wishes/"):
        fail(f"social product #{index} image must live in assets/images/social-wishes")

    if image.endswith(".svg"):
        fail(f"social product #{index} still references an SVG image")

    if not image.endswith(".webp"):
        fail(f"social product #{index} image must use WebP")

    if not image_path.is_file():
        fail(f"social product #{index} image file does not exist: {image}")

    image_alt = product.get("imageAlt", "")
    if not isinstance(image_alt, str) or not (50 <= len(image_alt) <= 140):
        fail(f"social product #{index} imageAlt must be 50-140 characters")

    image_title = product.get("imageTitle", "")
    if not isinstance(image_title, str) or not (25 <= len(image_title) <= 80):
        fail(f"social product #{index} imageTitle must be 25-80 characters")

    image_keywords = product.get("imageKeywords")
    if not isinstance(image_keywords, list) or not (3 <= len(image_keywords) <= 8):
        fail(f"social product #{index} imageKeywords must contain 3-8 strings")

    if not all(isinstance(keyword, str) and keyword.strip() for keyword in image_keywords):
        fail(f"social product #{index} imageKeywords must only contain non-empty strings")

    if not product.get("seoIntent"):
        fail(f"social product #{index} is missing seoIntent")

    if not json_ld_item.get("keywords") or not json_ld_item.get("about"):
        fail(f"social product #{index} JSON-LD is missing keywords/about metadata")


def validate_content(content, fallback_content) -> None:
    if not isinstance(content, dict):
        fail("wishlist-content.json must contain a JSON object")

    for key in ("project", "language", "hero", "wishlist", "card", "footer"):
        if key not in content:
            fail(f"wishlist-content.json is missing key: {key}")

    if content != fallback_content:
        fail("content JSON and fallback content JS differ")


def main() -> None:
    validate_required_paths()

    products = read_json("wishlist-products.json")
    content = read_json("wishlist-content.json")
    fallback_products = read_fallback_assignment(
        "js/wishlistProductsData.js",
        "birthdayWishlistProducts",
    )
    fallback_content = read_fallback_assignment(
        "js/wishlistContentData.js",
        "birthdayWishlistContent",
    )
    json_ld = read_json_ld()

    validate_products(products, fallback_products, json_ld)
    validate_content(content, fallback_content)

    print(f"validated {len(products)} products for deployment")


if __name__ == "__main__":
    main()
