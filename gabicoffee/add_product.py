#!/usr/bin/env python3
"""
Add a product to gabriels' coffee by name only.
Usage:
    python add_product.py "שם המוצר"
    python add_product.py "שם המוצר" --dry-run   # preview without saving
"""

import sys, json, os, argparse
import anthropic
import urllib.request

BACKEND = "http://localhost:8001"
ADMIN_PASSWORD = "gabriel2024"
CATEGORIES = ["קפה", "ליד הקפה", "מכונות קפה וציוד נלווה"]

def generate_product(name: str) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌  חסר ANTHROPIC_API_KEY. הוסף בקובץ .env או הגדר את המשתנה בסביבה.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""אתה עוזר לבית קפה ישראלי בשם "גבריאלס' קפה".
הוסף מוצר חדש לתפריט בשם: "{name}"

הקטגוריות האפשריות הן בלבד: {CATEGORIES}

החזר JSON בלבד (ללא טקסט נוסף) עם השדות הבאים:
{{
  "name": "שם המוצר",
  "description": "תיאור קצר ומפתה של המוצר עד 15 מילים בעברית",
  "price": מחיר מספרי סביר בשקלים,
  "category": "אחת מהקטגוריות שציינתי",
  "popular": false
}}"""

    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text.strip()
    # strip markdown code block if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def add_to_backend(product: dict) -> dict:
    data = json.dumps(product).encode()
    req = urllib.request.Request(
        f"{BACKEND}/admin/menu",
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-admin-password": ADMIN_PASSWORD,
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("name", help="שם המוצר להוספה")
    parser.add_argument("--dry-run", action="store_true", help="הצג בלבד, אל תשמור")
    args = parser.parse_args()

    print(f"🤖  מייצר פרטים עבור: {args.name}...")
    product = generate_product(args.name)

    print("\n📦  המוצר שנוצר:")
    print(f"   שם:       {product['name']}")
    print(f"   תיאור:    {product['description']}")
    print(f"   מחיר:     ₪{product['price']}")
    print(f"   קטגוריה:  {product['category']}")
    print(f"   פופולרי:  {'כן' if product['popular'] else 'לא'}")

    if args.dry_run:
        print("\n⚠️  מצב תצוגה — המוצר לא נשמר.")
        return

    result = add_to_backend(product)
    print(f"\n✅  המוצר נוסף לאתר! מזהה: #{result['id']}")


if __name__ == "__main__":
    main()
