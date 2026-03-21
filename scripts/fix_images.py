#!/usr/bin/env python3
"""Fix images: download og:image from source pages and upload to Payload."""

import json
import os
import requests
from bs4 import BeautifulSoup
from pathlib import Path

BASE_URL = "http://localhost:3000"
MEDIA_DIR = Path(__file__).parent.parent / "public" / "media"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

RECIPE_SOURCES = {
    "easy-vegan-fried-rice": "https://minimalistbaker.com/easy-vegan-fried-rice/",
    "1-pot-red-lentil-chili": "https://minimalistbaker.com/1-pot-red-lentil-chili/",
    "easy-grillable-veggie-burgers": "https://minimalistbaker.com/easy-grillable-veggie-burgers/",
    "best-lentil-soup": "https://cookieandkate.com/best-lentil-soup-recipe/",
    "homemade-vegetarian-chili": "https://cookieandkate.com/vegetarian-chili-recipe/",
}


def login():
    resp = requests.post(f"{BASE_URL}/api/users/login", json={"email": "admin@reciepie.com", "password": "admin123"})
    return resp.json().get("token")


def get_og_image(page_url):
    r = requests.get(page_url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")
    og = soup.find("meta", property="og:image")
    return og.get("content") if og else None


def download_image(url, name):
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    ct = r.headers.get("content-type", "")
    ext = ".jpg"
    if "png" in ct: ext = ".png"
    elif "webp" in ct: ext = ".webp"
    path = MEDIA_DIR / f"{name}{ext}"
    with open(path, "wb") as f:
        f.write(r.content)
    print(f"  Downloaded: {path.name} ({len(r.content)//1024}KB)")
    return str(path)


def upload_image(filepath, alt, token):
    with open(filepath, "rb") as f:
        # Payload expects _payload as JSON string alongside the file
        payload_data = json.dumps({"alt": alt})
        resp = requests.post(
            f"{BASE_URL}/api/media",
            headers={"Authorization": f"JWT {token}"},
            files={"file": (os.path.basename(filepath), f, "image/jpeg")},
            data={"_payload": payload_data},
        )
    data = resp.json()
    if "doc" in data:
        print(f"  Uploaded media ID: {data['doc']['id']}")
        return data["doc"]["id"]
    print(f"  Upload failed: {data.get('errors', data)}")
    return None


def main():
    token = login()
    print("Logged in\n")

    # Get all recipes
    headers = {"Authorization": f"JWT {token}"}
    resp = requests.get(f"{BASE_URL}/api/recipes?limit=100", headers=headers)
    recipes = resp.json().get("docs", [])

    for recipe in recipes:
        slug = recipe.get("slug", "")
        title = recipe.get("title", "")
        source_url = RECIPE_SOURCES.get(slug)
        if not source_url:
            print(f"No source for: {slug}")
            continue

        print(f"\n--- {title} ---")

        # Get og:image
        img_url = get_og_image(source_url)
        if not img_url:
            print("  No og:image found")
            continue

        # Download
        filepath = download_image(img_url, slug)

        # Upload to Payload
        media_id = upload_image(filepath, title, token)
        if not media_id:
            continue

        # Update recipe with image
        resp = requests.patch(
            f"{BASE_URL}/api/recipes/{recipe['id']}",
            headers={**headers, "Content-Type": "application/json"},
            json={"featuredImage": media_id},
        )
        if resp.json().get("doc"):
            print(f"  Updated recipe with image!")
        else:
            print(f"  Failed to update: {resp.json()}")

    print("\nDone!")


if __name__ == "__main__":
    main()
