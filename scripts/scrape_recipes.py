#!/usr/bin/env python3
"""
Scrape recipes from AllRecipes and SimplyRecipes for local testing.
Uses JSON-LD structured data (schema.org/Recipe) that sites publish for SEO.
Downloads images and seeds into Payload CMS via the local API.
"""

import json
import os
import re
import sys
import time
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urlparse

BASE_URL = "http://localhost:3000"
MEDIA_DIR = Path(__file__).parent.parent / "public" / "media"

RECIPE_URLS = [
    # Minimalist Baker
    "https://minimalistbaker.com/easy-vegan-fried-rice/",
    "https://minimalistbaker.com/1-pot-red-lentil-chili/",
    "https://minimalistbaker.com/easy-grillable-veggie-burgers/",
    # Cookie and Kate
    "https://cookieandkate.com/best-lentil-soup-recipe/",
    "https://cookieandkate.com/vegetarian-chili-recipe/",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_page(url: str) -> str:
    """Fetch HTML content from a URL."""
    print(f"  Fetching: {url}")
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.text


def extract_jsonld_recipe(html: str) -> dict | None:
    """Extract schema.org/Recipe JSON-LD from HTML."""
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
        except (json.JSONDecodeError, TypeError):
            continue

        # Handle both direct Recipe and @graph arrays
        if isinstance(data, list):
            for item in data:
                if item.get("@type") == "Recipe":
                    return item
        elif isinstance(data, dict):
            if data.get("@type") == "Recipe":
                return data
            if "@graph" in data:
                for item in data["@graph"]:
                    if isinstance(item, dict) and item.get("@type") == "Recipe":
                        return item
    return None


def download_image(url: str, filename: str) -> str | None:
    """Download an image and save to public/media."""
    try:
        MEDIA_DIR.mkdir(parents=True, exist_ok=True)
        resp = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        resp.raise_for_status()

        # Determine extension
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


def parse_duration(iso_dur: str | None) -> int | None:
    """Parse ISO 8601 duration (PT1H30M) to minutes."""
    if not iso_dur:
        return None
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", iso_dur)
    if not match:
        return None
    hours = int(match.group(1) or 0)
    mins = int(match.group(2) or 0)
    return hours * 60 + mins


def parse_yield(recipe_yield) -> int | None:
    """Extract servings number from yield field."""
    if isinstance(recipe_yield, list):
        recipe_yield = recipe_yield[0] if recipe_yield else None
    if not recipe_yield:
        return None
    match = re.search(r"(\d+)", str(recipe_yield))
    return int(match.group(1)) if match else None


def get_image_url(recipe_data: dict) -> str | None:
    """Extract the best image URL from recipe data."""
    img = recipe_data.get("image")
    if isinstance(img, str):
        return img
    if isinstance(img, list):
        # Prefer larger images (usually later in the list)
        return img[-1] if img else None
    if isinstance(img, dict):
        return img.get("url")
    return None


def make_rich_text(text: str) -> dict:
    """Convert plain text to Payload Lexical rich text format."""
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
    """Parse schema.org instructions into step objects."""
    steps = []
    if isinstance(instructions, str):
        # Plain text instructions
        for line in instructions.split("\n"):
            line = line.strip()
            if line:
                steps.append({"instruction": make_rich_text(line)})
    elif isinstance(instructions, list):
        for item in instructions:
            if isinstance(item, str):
                steps.append({"instruction": make_rich_text(item)})
            elif isinstance(item, dict):
                if item.get("@type") == "HowToStep":
                    text = item.get("text", "")
                    if text:
                        steps.append({"instruction": make_rich_text(text)})
                elif item.get("@type") == "HowToSection":
                    # Nested sections
                    sub_items = item.get("itemListElement", [])
                    for sub in sub_items:
                        if isinstance(sub, dict) and sub.get("text"):
                            steps.append({"instruction": make_rich_text(sub["text"])})
    return steps


def parse_ingredients(ingredients: list) -> list[dict]:
    """Parse ingredient strings into structured format."""
    parsed = []
    for ing in ingredients:
        if not isinstance(ing, str):
            continue
        ing = ing.strip()
        if not ing:
            continue

        # Try to split quantity/unit from item
        # Pattern: "1 1/2 cups flour" or "2 tablespoons butter"
        match = re.match(
            r"^([\d½¼¾⅓⅔⅛/.\s]+)?\s*(cups?|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|cloves?|cans?|pieces?|slices?|medium|large|small|pinch|dash|bunch|heads?|stalks?|sprigs?)?\s*(.+)$",
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
    """Convert text to URL slug."""
    slug = text.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug.strip("-")


def login_to_payload() -> str:
    """Login and return auth token."""
    resp = requests.post(
        f"{BASE_URL}/api/users/login",
        json={"email": "admin@reciepie.com", "password": "admin123"},
    )
    data = resp.json()
    token = data.get("token")
    if not token:
        print(f"Login failed: {data}")
        sys.exit(1)
    print("Logged in to Payload CMS")
    return token


def upload_image(filepath: str, alt: str, token: str) -> int | None:
    """Upload an image to Payload media collection."""
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


def delete_existing_recipes(token: str):
    """Delete all existing recipes and blog posts."""
    headers = {"Authorization": f"JWT {token}"}

    # Delete recipes
    resp = requests.get(f"{BASE_URL}/api/recipes?limit=100", headers=headers)
    recipes = resp.json().get("docs", [])
    for r in recipes:
        requests.delete(f"{BASE_URL}/api/recipes/{r['id']}", headers=headers)
        print(f"  Deleted recipe: {r.get('title', r['id'])}")

    # Delete blog posts
    resp = requests.get(f"{BASE_URL}/api/blog-posts?limit=100", headers=headers)
    posts = resp.json().get("docs", [])
    for p in posts:
        requests.delete(f"{BASE_URL}/api/blog-posts/{p['id']}", headers=headers)
        print(f"  Deleted blog post: {p.get('title', p['id'])}")


def create_recipe(recipe_data: dict, token: str) -> bool:
    """Create a recipe in Payload CMS."""
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
        print(f"  Created recipe: {data['doc'].get('title')}")
        return True
    else:
        print(f"  Failed: {json.dumps(data.get('errors', data), indent=2)[:300]}")
        return False


def scrape_and_seed():
    """Main function: scrape recipes and seed into Payload."""
    print("\n=== Recipe Scraper for Reciepie ===\n")

    # Login
    token = login_to_payload()

    # Delete existing
    print("\nDeleting existing recipes...")
    delete_existing_recipes(token)

    # Ensure a dinner category exists
    headers = {"Authorization": f"JWT {token}"}
    cats_resp = requests.get(f"{BASE_URL}/api/categories?limit=100", headers=headers)
    categories = {c["name"]: c["id"] for c in cats_resp.json().get("docs", [])}

    tags_resp = requests.get(f"{BASE_URL}/api/tags?limit=100", headers=headers)
    tags = {t["name"]: t["id"] for t in tags_resp.json().get("docs", [])}

    print(f"\nFound categories: {list(categories.keys())}")
    print(f"Found tags: {list(tags.keys())}")

    # Scrape each recipe
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
            print(f"  Title: {title}")

            # Get description
            description = recipe.get("description", "")
            if len(description) > 200:
                description = description[:197] + "..."

            # Parse times
            prep_time = parse_duration(recipe.get("prepTime"))
            cook_time = parse_duration(recipe.get("cookTime"))
            servings = parse_yield(recipe.get("recipeYield"))

            # Determine difficulty based on total time
            total = (prep_time or 0) + (cook_time or 0)
            difficulty = "easy"
            if total > 60:
                difficulty = "medium"
            if total > 120:
                difficulty = "hard"

            # Parse ingredients
            raw_ingredients = recipe.get("recipeIngredient", [])
            ingredients = parse_ingredients(raw_ingredients)

            # Parse instructions
            steps = parse_instructions(recipe.get("recipeInstructions", []))

            # Download image
            image_url = get_image_url(recipe)
            media_id = None
            if image_url:
                slug = slugify(title)
                img_path = download_image(image_url, slug)
                if img_path:
                    media_id = upload_image(img_path, title, token)

            # Guess category
            cat_id = None
            cuisine = recipe.get("recipeCuisine", "")
            recipe_cat = recipe.get("recipeCategory", "")
            if isinstance(recipe_cat, list):
                recipe_cat = recipe_cat[0] if recipe_cat else ""

            cat_lower = str(recipe_cat).lower()
            if "dessert" in cat_lower or "bread" in cat_lower or "baking" in cat_lower:
                cat_id = categories.get("Desserts")
            elif "breakfast" in cat_lower or "brunch" in cat_lower:
                cat_id = categories.get("Breakfast")
            elif "lunch" in cat_lower or "salad" in cat_lower:
                cat_id = categories.get("Lunch")
            elif "dinner" in cat_lower or "main" in cat_lower or "stew" in cat_lower:
                cat_id = categories.get("Dinner")
            elif "snack" in cat_lower or "appetizer" in cat_lower or "sauce" in cat_lower or "condiment" in cat_lower:
                cat_id = categories.get("Snacks")
            else:
                cat_id = categories.get("Dinner")  # Default

            # Build Payload recipe
            payload_recipe = {
                "title": title,
                "slug": slugify(title),
                "description": description,
                "metadata": {
                    "prepTime": prep_time,
                    "cookTime": cook_time,
                    "servings": servings,
                    "difficulty": difficulty,
                    "cuisine": str(cuisine) if cuisine else None,
                },
                "ingredientGroups": [
                    {
                        "groupName": "",
                        "ingredients": ingredients,
                    }
                ],
                "steps": steps,
                "showNutrition": False,
                "category": cat_id,
                "_status": "published",
                "publishedAt": "2026-03-22T00:00:00.000Z",
            }

            if media_id:
                payload_recipe["featuredImage"] = media_id

            create_recipe(payload_recipe, token)
            time.sleep(1)  # Be polite

        except Exception as e:
            print(f"  Error: {e}")
            continue

    print("\n=== Done! ===\n")


if __name__ == "__main__":
    scrape_and_seed()
