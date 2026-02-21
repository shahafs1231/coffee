from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="Gabriel's Coffee API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Admin auth ───────────────────────────────────────────────────────────────

ADMIN_PASSWORD = "gabriel2024"

def require_admin(x_admin_password: str = Header(...)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="סיסמה שגויה")

# ─── Site settings (editable via admin) ───────────────────────────────────────

site_settings = {
    "address": "רוטשילד 55, תל אביב",
    "phone": "052-5961616",
    "email": "hello@gabrielscoffee.co.il",
    "hours": [
        {"days": "ראשון – חמישי", "hours": "07:00 – 22:00"},
        {"days": "שישי",          "hours": "07:00 – 17:00"},
        {"days": "שבת",           "hours": "08:00 – 20:00"},
    ],
}

# ─── Home page content ────────────────────────────────────────────────────────

home_content = {
    "hero_subtitle": "כי כל כוס קפה טובה מספרת סיפור",
    "hero_description": "קפה איכותי, מאפים טריים מהתנור ואווירה חמימה שתגרום לכם לחזור שוב ושוב. ברוכים הבאים למשפחה.",
    "hero_btn_primary": "לצפייה במוצרים",
    "hero_btn_secondary": "מצאו אותנו",
    "features": [
        {"icon": "🌱", "title": "פולים מובחרים",  "desc": "אנחנו מייבאים פולי קפה ספיישלטי ממיטב המטעים בעולם"},
        {"icon": "👨‍🍳", "title": "מאפים טריים",   "desc": "כל הפסטריות נאפות אצלנו מדי בוקר עם חומרי גלם איכותיים"},
        {"icon": "🤝", "title": "אווירה חמימה",  "desc": "מקום שבו כולם מרגישים בבית — עם חיוך ומוזיקה טובה"},
    ],
    "cta_title": "בואו לבקר אותנו",
    "cta_desc": "רוטשילד 55, תל אביב. חנייה חינם בסביבה ועגלה ידידותית.",
}

# ─── About page content ───────────────────────────────────────────────────────

about_content = {
    "story_title": "הסיפור שלנו",
    "story_paragraphs": [
        "גבריאלס' קפה נולד מתוך אהבה עמוקה לקפה. גבריאל, המייסד, התחיל את מסעו בבתי קפה קטנים ברחבי אירופה, שם גילה שקפה טוב הוא הרבה יותר ממשקה — הוא חוויה, תרבות, קהילה.",
        "בשנת 2018 פתח גבריאל את בית הקפה הראשון שלו בלב תל אביב עם חלום פשוט: ליצור מקום שבו כולם מרגישים בבית ומקבלים כוס קפה מושלמת בכל ביקור.",
        "היום, עם צוות של ברייסטות מיומנים ומאפים שנאפים מדי בוקר, אנחנו ממשיכים לשמור על אותה מסירות לאיכות ולאהבה לקהילה שלנו.",
    ],
    "values": [
        {"icon": "🌱", "title": "קיימות",            "desc": "אנחנו עובדים עם מגדלי קפה שמשתמשים בשיטות גידול בנות קיימא ומשלמים מחיר הוגן."},
        {"icon": "✨", "title": "איכות ללא פשרות",   "desc": "מהפול ועד לכוס — כל שלב בתהליך עובר בקרת איכות קפדנית."},
        {"icon": "❤️", "title": "קהילה",             "desc": "אנחנו לא רק בית קפה, אנחנו מרחב קהילתי — מארחים אירועים, תערוכות וסדנאות."},
    ],
    "team": [
        {"name": "גבריאל כהן", "role": "מייסד וברייסטה ראשי", "emoji": "👨‍🍳"},
        {"name": "מיה לוי",    "role": "שפית הפסטריות",        "emoji": "👩‍🍳"},
        {"name": "ניר שמואל", "role": "מנהל קפה",              "emoji": "☕"},
    ],
}

# ─── Menu data ────────────────────────────────────────────────────────────────

MENU_ITEMS: List[dict] = [
    {"id": 1,  "name": "אספרסו",         "description": "שוט אספרסו כפול בעל גוף עשיר וארומה עמוקה",              "price": 12.0, "category": "קפה",    "popular": True  },
    {"id": 2,  "name": "קפוצ'ינו",       "description": "אספרסו עם קצף חלב קטיפתי וניחוח שוקולד",                 "price": 18.0, "category": "קפה",    "popular": True  },
    {"id": 3,  "name": "לאטה",           "description": "אספרסו עם הרבה חלב מוקצף וטעם עדין",                     "price": 19.0, "category": "קפה",    "popular": False },
    {"id": 4,  "name": "אמריקנו",        "description": "אספרסו מדולל במים חמים לטעם עדין ומרענן",                "price": 14.0, "category": "קפה",    "popular": False },
    {"id": 5,  "name": "מוקה",           "description": "אספרסו עם שוקולד, חלב מוקצף וקרם שנטי",                  "price": 22.0, "category": "קפה",    "popular": True  },
    {"id": 6,  "name": "קפה קר",         "description": "קפה קר מוגש על קרח עם חלב שקדים",                        "price": 20.0, "category": "קפה",    "popular": True  },
    {"id": 7,  "name": "קרואסון חמאה",   "description": "קרואסון טרי עם חמאה צרפתית, פריך ורך מבפנים",            "price": 16.0, "category": "ליד הקפה",  "popular": True  },
    {"id": 8,  "name": "מאפה גבינה",     "description": "מאפה בצק עלים עם גבינה בולגרית ועשבי תיבול",             "price": 18.0, "category": "ליד הקפה",  "popular": False },
    {"id": 9,  "name": "עוגת שוקולד",    "description": "עוגת שוקולד בלגי עשירה עם גנאש שוקולד מריר",             "price": 24.0, "category": "ליד הקפה",  "popular": True  },
    {"id": 10, "name": "מאפה שמרים",     "description": "שמרים טריים עם קינמון, צימוקים וציפוי סוכר",              "price": 15.0, "category": "ליד הקפה",  "popular": False },
    {"id": 11, "name": "סנדוויץ' גבריאל","description": "לחם מחמצת עם גבינת ברי, עגבניה מיובשת ובזיליקום",        "price": 38.0, "category": "מכונות קפה וציוד נלווה", "popular": True  },
    {"id": 12, "name": "סלט ים תיכוני",  "description": "ירקות עונתיים, זיתים, גבינת פטה ורוטב לימון-שום",        "price": 42.0, "category": "מכונות קפה וציוד נלווה", "popular": False },
    {"id": 13, "name": "ביצים ברנדיקט",  "description": "ביצים עלומות על אנגלישׁ מאפין עם רוטב הולנדז",            "price": 48.0, "category": "מכונות קפה וציוד נלווה", "popular": True  },
]

_next_id = 14
orders_db: List[dict] = []
contact_messages: List[dict] = []

# ─── Models ───────────────────────────────────────────────────────────────────

class ContactMessage(BaseModel):
    name: str
    email: str
    message: str

class OrderItem(BaseModel):
    item_id: int
    quantity: int

class Order(BaseModel):
    customer_name: str
    items: List[OrderItem]
    notes: Optional[str] = None

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    popular: bool = False

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    popular: Optional[bool] = None

class SiteSettings(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hours: Optional[list] = None

class AdminLogin(BaseModel):
    password: str

# ─── Public routes ────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "ברוכים הבאים ל-gabriels' coffee API"}

@app.get("/settings")
def get_settings():
    return site_settings

@app.get("/menu")
def get_menu():
    return MENU_ITEMS

@app.get("/menu/popular")
def get_popular():
    return [i for i in MENU_ITEMS if i["popular"]]

@app.get("/menu/category/{category}")
def get_by_category(category: str):
    items = [i for i in MENU_ITEMS if i["category"] == category]
    if not items:
        raise HTTPException(status_code=404, detail="קטגוריה לא נמצאה")
    return items

@app.get("/menu/{item_id}")
def get_item(item_id: int):
    item = next((i for i in MENU_ITEMS if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="פריט לא נמצא")
    return item

@app.post("/contact", status_code=201)
def submit_contact(msg: ContactMessage):
    entry = {"id": len(contact_messages) + 1, **msg.model_dump(), "timestamp": datetime.now().isoformat()}
    contact_messages.append(entry)
    return {"success": True, "message": "ההודעה נשלחה בהצלחה!"}

@app.post("/orders", status_code=201)
def create_order(order: Order):
    global _next_id
    total = 0.0
    line_items = []
    for oi in order.items:
        item = next((i for i in MENU_ITEMS if i["id"] == oi.item_id), None)
        if not item:
            raise HTTPException(status_code=404, detail=f"פריט {oi.item_id} לא נמצא")
        sub = item["price"] * oi.quantity
        total += sub
        line_items.append({"name": item["name"], "quantity": oi.quantity, "subtotal": sub})
    entry = {"id": len(orders_db) + 1, "customer_name": order.customer_name,
             "items": line_items, "total": total, "notes": order.notes,
             "status": "התקבלה", "timestamp": datetime.now().isoformat()}
    orders_db.append(entry)
    return {"success": True, "order_id": entry["id"], "total": total, "message": "ההזמנה התקבלה!"}

# ─── Admin: auth ──────────────────────────────────────────────────────────────

@app.post("/admin/login")
def admin_login(body: AdminLogin):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="סיסמה שגויה")
    return {"success": True, "token": ADMIN_PASSWORD}

# ─── Admin: menu ──────────────────────────────────────────────────────────────

@app.post("/admin/menu", status_code=201, dependencies=[Depends(require_admin)])
def admin_add_item(item: MenuItemCreate):
    global _next_id
    new_item = {"id": _next_id, **item.model_dump()}
    _next_id += 1
    MENU_ITEMS.append(new_item)
    return new_item

@app.put("/admin/menu/{item_id}", dependencies=[Depends(require_admin)])
def admin_update_item(item_id: int, updates: MenuItemUpdate):
    item = next((i for i in MENU_ITEMS if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="פריט לא נמצא")
    for field, value in updates.model_dump(exclude_none=True).items():
        item[field] = value
    return item

@app.delete("/admin/menu/{item_id}", dependencies=[Depends(require_admin)])
def admin_delete_item(item_id: int):
    item = next((i for i in MENU_ITEMS if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="פריט לא נמצא")
    MENU_ITEMS.remove(item)
    return {"success": True, "message": "הפריט נמחק"}

# ─── Admin: settings ──────────────────────────────────────────────────────────

@app.put("/admin/settings", dependencies=[Depends(require_admin)])
def admin_update_settings(updates: SiteSettings):
    for field, value in updates.model_dump(exclude_none=True).items():
        site_settings[field] = value
    return site_settings

# ─── About content ────────────────────────────────────────────────────────────

@app.get("/about-content")
def get_about_content():
    return about_content

@app.put("/admin/about-content", dependencies=[Depends(require_admin)])
def admin_update_about(updates: dict):
    for field, value in updates.items():
        if field in about_content:
            about_content[field] = value
    return about_content

# ─── Home content ──────────────────────────────────────────────────────────────

@app.get("/home-content")
def get_home_content():
    return home_content

@app.put("/admin/home-content", dependencies=[Depends(require_admin)])
def admin_update_home(updates: dict):
    for field, value in updates.items():
        if field in home_content:
            home_content[field] = value
    return home_content

# ─── Menu page content ─────────────────────────────────────────────────────────

menu_page_content = {
    "title": "המוצרים שלנו",
    "subtitle": "כל מה שצריך לרגע מושלם — קפה, מאפה ואוכל טוב",
}

@app.get("/menu-content")
def get_menu_content():
    return menu_page_content

@app.put("/admin/menu-content", dependencies=[Depends(require_admin)])
def admin_update_menu_content(updates: dict):
    for field, value in updates.items():
        if field in menu_page_content:
            menu_page_content[field] = value
    return menu_page_content

# ─── Contact page content ──────────────────────────────────────────────────────

contact_content = {
    "title": "צרו קשר",
    "subtitle": "נשמח לשמוע מכם",
    "info_title": "מצאו אותנו",
    "form_title": "שלחו לנו הודעה",
}

@app.get("/contact-content")
def get_contact_content():
    return contact_content

@app.put("/admin/contact-content", dependencies=[Depends(require_admin)])
def admin_update_contact_content(updates: dict):
    for field, value in updates.items():
        if field in contact_content:
            contact_content[field] = value
    return contact_content

# ─── Admin: view messages & orders ────────────────────────────────────────────

@app.get("/admin/messages", dependencies=[Depends(require_admin)])
def admin_get_messages():
    return contact_messages

@app.get("/admin/orders", dependencies=[Depends(require_admin)])
def admin_get_orders():
    return orders_db
