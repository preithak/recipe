#!/usr/bin/env python3
"""
Scrape specific recipes and add them as Staff Picks.
Does NOT delete existing recipes.
"""

import json
import os
import re
import sys
import time
import requests
from bs4 import BeautifulSoup
from pathlib import Path

BASE_URL = "http://localhost:3000"
MEDIA_DIR = Path(__file__).parent.parent / "public" / "media"

RECIPE_URLS = [
    "https://www.allrecipes.com/strawberry-barbecue-beef-recipe-11686484",
    "https://www.allrecipes.com/sheet-pan-lemon-artichoke-chicken-thighs-recipe-11784655",
    "https://www.allrecipes.com/recipe/11808/creamy-pesto-shrimp/",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_page(url: str) -> str:
    print(f"  Fetching: {url}")
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.text


def is_recipe_type(type_val) -> bool:
    """Check if @type is or contains 'Recipe'."""
    if isinstance(type_val, str):
        return type_val == "Recipe"
    if isinstance(type_val, list):
        return "Recipe" in type_val
    return False


def extract_jsonld_recipe(html: str) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
        except (json.JSONDecodeError, TypeError):
            continue

        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and is_recipe_type(item.get("@type")):
                    return item
        elif isinstance(data, dict):
            if is_recipe_type(data.get("@type")):
                return data
            if "@graph" in data:
                for item in data["@graph"]:
                    if isinstance(item, dict) and is_recipe_type(item.get("@type")):
                        return item
    return None


def download_image(url: str, filename: str) -> str | None:
    try:
        MEDIA_DIR.mkdir(parents=True, exist_ok=True)
        resp = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("content-type", "")
        ext = ".jpg"
        if "png" in content_type:
            ext = ".png"
        elif "webp" in content_type:
            ext = ".webp"

        filepath = MEDIA_DIR / f"{filename}{ext}"
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

        print(f"  Downloaded image: {filepath.name}")
        return str(filepath)
    except Exception as e:
        print(f"  Failed to download image: {e}")
        return None


def parse_duration(iso_dur) -> int | None:
    if not iso_dur:
        return None
    if isinstance(iso_dur, list):
        iso_dur = iso_dur[0] if iso_dur else None
    if not isinstance(iso_dur, str):
        return None
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", iso_dur)
    if not match:
        return None
    hours = int(match.group(1) or 0)
    mins = int(match.group(2) or 0)
    return hours * 60 + mins


def parse_yield(recipe_yield) -> int | None:
    if isinstance(recipe_yield, list):
        recipe_yield = recipe_yield[0] if recipe_yield else None
    if not recipe_yield:
        return None
    match = re.search(r"(\d+)", str(recipe_yield))
    return int(match.group(1)) if match else None


def get_image_url(recipe_data: dict) -> str | None:
    img = recipe_data.get("image")
    if isinstance(img, str):
        return img
    if isinstance(img, list):
        # AllRecipes often provides multiple sizes
        for item in img:
            if isinstance(item, dict):
                return item.get("url")
            if isinstance(item, str):
                return item
        return None
    if isinstance(img, dict):
        return img.get("url")
    return None


def make_rich_text(text: str) -> dict:
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    return {
        "root": {
            "type": "root",
            "children": [
                {
                    "type": "paragraph",
                    "children": [
                        {
                            "type": "text",
                            "text": p,
                            "format": 0,
                            "detail": 0,
                            "mode": "normal",
                            "style": "",
                            "version": 1,
                        }
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                }
                for p in paragraphs
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "version": 1,
        }
    }


def parse_instructions(instructions) -> list[dict]:
    steps = []
    if isinstance(instructions, str):
        for line in instructions.split("\n"):
            line = line.strip()
            if line:
                steps.append({"instruction": make_rich_text(line)})
    elif isinstance(instructions, list):
        for item in instructions:
            if isinstance(item, str):
                steps.append({"instruction": make_rich_text(item)})
            elif isinstance(item, dict):
                if item.get("@type") == "HowToStep" or is_recipe_type(item.get("@type", "")):
                    text = item.get("text", "")
                    if text:
                        steps.append({"instruction": make_rich_text(text)})
                elif item.get("@type") == "HowToSection":
                    sub_items = item.get("itemListElement", [])
                    for sub in sub_items:
                        if isinstance(sub, dict) and sub.get("text"):
                            steps.append({"instruction": make_rich_text(sub["text"])})
    return steps


def parse_ingredients(ingredients: list) -> list[dict]:
    parsed = []
    for ing in ingredients:
        if not isinstance(ing, str):
            continue
        ing = ing.strip()
        if not ing:
            continue

        match = re.match(
            r"^([\d½¼¾⅓⅔⅛⅜⅝⅞/.\s]+)?\s*(cups?|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|cloves?|cans?|pieces?|slices?|medium|large|small|pinch|dash|bunch|heads?|stalks?|sprigs?)?\s*(.+)$",
            ing,
            re.IGNORECASE,
        )

        if match and match.group(1):
            qty = match.group(1).strip()
            unit = (match.group(2) or "").strip()
            item = match.group(3).strip()
            parsed.append({"quantity": qty, "unit": unit, "item": item})
        else:
            parsed.append({"quantity": "", "unit": "", "item": ing})

    return parsed


def slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug.strip("-")


def login_to_payload() -> str:
    resp = requests.post(
        f"{BASE_URL}/api/users/login",
        json={"email": "admin@recipe.com", "password": "admin123"},
    )
    data = resp.json()
    token = data.get("token")
    if not token:
        print(f"Login failed: {data}")
        sys.exit(1)
    print("Logged in to Payload CMS")
    return token


def upload_image(filepath: str, alt: str, token: str) -> int | None:
    try:
        with open(filepath, "rb") as f:
            resp = requests.post(
                f"{BASE_URL}/api/media",
                headers={"Authorization": f"JWT {token}"},
                files={"file": (os.path.basename(filepath), f)},
                data={"alt": alt},
            )
        data = resp.json()
        if "doc" in data:
            print(f"  Uploaded media: {data['doc']['id']}")
            return data["doc"]["id"]
        else:
            print(f"  Upload failed: {data}")
            return None
    except Exception as e:
        print(f"  Upload error: {e}")
        return None


def create_recipe(recipe_data: dict, token: str) -> bool:
    headers = {
        "Authorization": f"JWT {token}",
        "Content-Type": "application/json",
    }
    resp = requests.post(
        f"{BASE_URL}/api/recipes",
        headers=headers,
        json=recipe_data,
    )
    data = resp.json()
    if "doc" in data:
        print(f"  Created recipe: {data['doc'].get('title')} (ID: {data['doc']['id']})")
        return True
    else:
        print(f"  Failed: {json.dumps(data.get('errors', data), indent=2)[:500]}")
        return False


def main():
    print("\n=== Adding Featured Recipes (Staff Picks) ===\n")

    token = login_to_payload()

    # Get existing categories
    headers = {"Authorization": f"JWT {token}"}
    cats_resp = requests.get(f"{BASE_URL}/api/categories?limit=100", headers=headers)
    categories = {c["name"]: c["id"] for c in cats_resp.json().get("docs", [])}
    print(f"Categories: {list(categories.keys())}")

    # Check for existing recipes to avoid duplicates
    existing_resp = requests.get(f"{BASE_URL}/api/recipes?limit=100", headers=headers)
    existing_slugs = {r["slug"] for r in existing_resp.json().get("docs", [])}
    print(f"Existing recipe slugs: {existing_slugs}")

    print("\nScraping recipes...\n")
    for url in RECIPE_URLS:
        print(f"\n--- {url} ---")
        try:
            html = fetch_page(url)
            recipe = extract_jsonld_recipe(html)

            if not recipe:
                print("  No JSON-LD recipe data found, skipping")
                continue

            title = recipe.get("name", "Untitled")
            slug = slugify(title)
            print(f"  Title: {title}")
            print(f"  Slug: {slug}")

            if slug in existing_slugs:
                print(f"  Already exists, skipping")
                continue

            description = recipe.get("description", "")
            if len(description) > 200:
                description = description[:197] + "..."

            prep_time = parse_duration(recipe.get("prepTime"))
            cook_time = parse_duration(recipe.get("cookTime"))
            servings = parse_yield(recipe.get("recipeYield"))

            total = (prep_time or 0) + (cook_time or 0)
            difficulty = "easy"
            if total > 60:
                difficulty = "medium"
            if total > 120:
                difficulty = "hard"

            raw_ingredients = recipe.get("recipeIngredient", [])
            ingredients = parse_ingredients(raw_ingredients)

            steps = parse_instructions(recipe.get("recipeInstructions", []))

            image_url = get_image_url(recipe)
            media_id = None
            if image_url:
                img_path = download_image(image_url, slug)
                if img_path:
                    media_id = upload_image(img_path, title, token)

            # Guess category
            cat_id = None
            recipe_cat = recipe.get("recipeCategory", "")
            if isinstance(recipe_cat, list):
                recipe_cat = recipe_cat[0] if recipe_cat else ""

            cat_lower = str(recipe_cat).lower()
            if "dessert" in cat_lower or "bread" in cat_lower:
                cat_id = categories.get("Desserts")
            elif "breakfast" in cat_lower or "brunch" in cat_lower:
                cat_id = categories.get("Breakfast")
            elif "lunch" in cat_lower or "salad" in cat_lower:
                cat_id = categories.get("Lunch")
            elif "snack" in cat_lower or "appetizer" in cat_lower:
                cat_id = categories.get("Snacks")
            else:
                cat_id = categories.get("Dinner")

            payload_recipe = {
                "title": title,
                "slug": slug,
                "description": description,
                "metadata": {
                    "prepTime": prep_time,
                    "cookTime": cook_time,
                    "servings": servings,
                    "difficulty": difficulty,
                    "cuisine": str(recipe.get("recipeCuisine", "")) or None,
                },
                "ingredientGroups": [
                    {
                        "groupName": "",
                        "ingredients": ingredients,
                    }
                ],
                "steps": steps,
                "showNutrition": False,
                "staffPick": True,
                "category": cat_id,
                "_status": "published",
                "publishedAt": "2026-03-23T00:00:00.000Z",
            }

            if media_id:
                payload_recipe["featuredImage"] = media_id

            create_recipe(payload_recipe, token)
            time.sleep(1)

        except Exception as e:
            print(f"  Error: {e}")
            import traceback
            traceback.print_exc()
            continue

    print("\n=== Done! ===\n")


if __name__ == "__main__":
    main()
