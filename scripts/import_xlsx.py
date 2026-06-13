#!/usr/bin/env python3
"""Convert the client's product spreadsheet into the frontend's mock JSON.

Usage:
    python3 scripts/import_xlsx.py ["/path/to/new hot.xlsx"]

Outputs:
    src/lib/mock/products.json
    src/lib/mock/categories.json

Re-run whenever the sheet changes. The shape it emits matches src/lib/types.ts,
so it doubles as a reference for the backend response shape.
"""
import json
import os
import re
import sys

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl required:  pip3 install --break-system-packages openpyxl")

XLSX = sys.argv[1] if len(sys.argv) > 1 else "/Users/sandeep/Downloads/new hot.xlsx"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "mock")

# Raw category text (lowercased) -> (slug, label)
CATEGORY_MAP = {
    "sweet": ("sweets", "Sweets"),
    "sweets": ("sweets", "Sweets"),
    "namkeen": ("namkeen", "Namkeen"),
    "snacks": ("namkeen", "Namkeen"),
}

# Merchandising tags per product slug (drive Top Picks / Best Sellers rows)
TAGS = {
    "kaju-patisa": ["best-seller", "top-pick"],
    "agra-mixture": ["best-seller", "top-pick"],
    "junnu": ["top-pick", "new"],
    "flower-janthukulu": ["best-seller"],
    "chakidalu": ["top-pick"],
    "pellalu-vundalu": ["best-seller"],
}

# rating, reviewCount per slug
RATING = {
    "kaju-patisa": (4.9, 214),
    "agra-mixture": (4.8, 176),
    "junnu": (4.7, 92),
    "flower-janthukulu": (4.6, 64),
    "chakidalu": (4.7, 58),
    "corn-flakes": (4.5, 41),
    "pellalu-vundalu": (4.8, 73),
    "maramarala-vundalu": (4.6, 39),
}

DESCRIPTIONS = {
    "kaju-patisa": "Rich cashew patisa made with premium kaju and pure ghee — it melts in your mouth.",
    "agra-mixture": "Crunchy, savoury Agra-style mixture with the perfect balance of spice and crunch.",
    "junnu": "Traditional soft junnu, set fresh and lightly sweetened — a rare homestyle delicacy.",
    "flower-janthukulu": "Crispy flower janthukulu, a crunchy South-Indian tea-time favourite.",
    "chakidalu": "Hand-twisted chakidalu (chakli), crunchy and mildly spiced.",
    "corn-flakes": "Light, crispy spiced corn-flakes mixture — a perfect anytime snack.",
    "pellalu-vundalu": "Puffed-rice (pellalu) laddus bound with jaggery — wholesome and traditional.",
    "maramarala-vundalu": "Crunchy maramaralu laddus, lightly sweetened with jaggery.",
}


def slugify(s: str) -> str:
    # Keep existing DB slugs stable; this function is used for the mock JSON
    # generation only. Improve normalization without introducing new slug formats
    # for typical ASCII inputs.
    x = str(s or "").strip().lower()
    x = x.replace("&", " and ").replace("+", " plus ")
    x = re.sub(r"[^a-z0-9]+", "-", x)
    x = re.sub(r"-+", "-", x)
    return re.sub(r"(^-|-$)", "", x)



def clean_name(raw) -> str:
    s = str(raw or "").strip()
    s = re.sub(r"\(.*?\)", "", s)  # drop "(250grms)"
    s = re.sub(r"\b\d+\s*(grms|gms|gm|g|kg|pieces|pcs|pc)\b", "", s, flags=re.I)
    return re.sub(r"\s+", " ", s).strip().title()


def norm_variant(label, name_raw) -> str:
    lab = str(label).strip() if label else ""
    if not lab:
        m = re.search(r"\(([^)]+)\)", str(name_raw or ""))
        if m:
            lab = m.group(1).strip()
        else:
            m = re.search(r"(\d+\s*(?:grms|gms|gm|g|kg|pieces|pcs))", str(name_raw or ""), re.I)
            lab = m.group(1) if m else "1 unit"
    low = lab.lower().replace(" ", "")
    m = re.match(r"(\d+)(grms|gms|gm|g|kg)$", low)
    if m:
        n, unit = int(m.group(1)), m.group(2)
        if unit == "kg":
            return f"{n} kg"
        if n >= 1000 and n % 1000 == 0:
            return f"{n // 1000} kg"
        return f"{n} g"
    m = re.match(r"(\d+)(pieces|pcs|pc|piece)$", low)
    if m:
        return f"{int(m.group(1))} pieces"
    return lab


def main() -> None:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb.active

    products: list[dict] = []
    current: dict | None = None

    for row in ws.iter_rows(values_only=True):
        cells = list(row) + [None] * (6 - len(row))
        name_raw, vb, vc, price, _spare, cat = cells[:6]

        if name_raw is None and price is None:
            continue  # blank separator row

        has_cat = cat is not None and str(cat).strip() != ""
        if has_cat:
            cat_key = str(cat).strip().lower()
            cslug, clabel = CATEGORY_MAP.get(cat_key, (slugify(cat), str(cat).strip().title()))
            name = clean_name(name_raw)
            pslug = slugify(name)
            current = {
                "id": pslug,
                "slug": pslug,
                "name": name,
                "description": DESCRIPTIONS.get(
                    pslug, f"Freshly made {name}, prepared in pure ghee with no artificial flavouring."
                ),
                "category": cslug,
                "categoryLabel": clabel,
                "images": [f"/images/products/{cslug}-placeholder.svg"],
                "variants": [],
                "tags": TAGS.get(pslug, []),
                "rating": RATING.get(pslug, (4.6, 30))[0],
                "reviewCount": RATING.get(pslug, (4.6, 30))[1],
                "active": True,
                "badges": ["100% Pure Veg", "Pure Ghee", "No Artificial Flavour"],
            }
            products.append(current)

        if current is None:
            continue

        label = norm_variant(vb or vc, name_raw)
        p = int(price) if price is not None else 0
        variant = {
            "id": f"{current['slug']}-{slugify(label)}",
            "label": label,
            "price": p,
            "stock": 50,
        }
        if "best-seller" in current["tags"]:
            variant["mrp"] = int(round(p * 1.18))
        current["variants"].append(variant)

    # Build categories from the products we saw.
    order = {"sweets": 1, "namkeen": 2}
    descs = {
        "sweets": "Traditional ghee sweets, made fresh in small batches.",
        "namkeen": "Crunchy savoury snacks and mixtures for every tea time.",
    }
    seen: dict[str, dict] = {}
    for p in products:
        if p["category"] not in seen:
            seen[p["category"]] = {
                "id": p["category"],
                "slug": p["category"],
                "name": p["categoryLabel"],
                "description": descs.get(p["category"], ""),
                "image": f"/images/categories/{p['category']}.svg",
                "order": order.get(p["category"], 99),
            }
    categories = sorted(seen.values(), key=lambda c: c["order"])

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "products.json"), "w") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    with open(os.path.join(OUT_DIR, "categories.json"), "w") as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(products)} products and {len(categories)} categories -> {os.path.relpath(OUT_DIR)}")
    for p in products:
        v = ", ".join(f"{x['label']} ₹{x['price']}" for x in p["variants"])
        print(f"  - {p['name']:22} | {p['categoryLabel']:8} | {v}")


if __name__ == "__main__":
    main()
