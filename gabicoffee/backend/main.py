from fastapi import FastAPI, HTTPException, Header, Depends, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime
import os, uuid, secrets, time
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="Gabriel's Coffee API")

# ─── CORS ─────────────────────────────────────────────────────────────────────

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3002")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "x-admin-password", "x-admin-token"],
)

# ─── Security headers middleware ───────────────────────────────────────────────

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ─── Rate limiting ────────────────────────────────────────────────────────────

_rate_store: dict[str, list] = defaultdict(list)

def _check_rate_limit(key: str, max_requests: int = 10, window_seconds: int = 60):
    now = time.time()
    _rate_store[key] = [t for t in _rate_store[key] if now - t < window_seconds]
    if len(_rate_store[key]) >= max_requests:
        raise HTTPException(status_code=429, detail="יותר מדי בקשות, נסה שוב מאוחר יותר")
    _rate_store[key].append(now)

def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# ─── Paths ────────────────────────────────────────────────────────────────────

UPLOADS_DIR = Path(__file__).parent.parent / "frontend" / "public" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB

# ─── Supabase ─────────────────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ─── Admin auth ───────────────────────────────────────────────────────────────

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
if not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD environment variable must be set")

# In-memory session tokens: token -> expiry timestamp
_sessions: dict[str, float] = {}
SESSION_TTL = 8 * 60 * 60  # 8 hours

def _create_session() -> str:
    token = secrets.token_hex(32)
    _sessions[token] = time.time() + SESSION_TTL
    # Clean expired tokens
    expired = [t for t, exp in _sessions.items() if time.time() > exp]
    for t in expired:
        del _sessions[t]
    return token

def _valid_session(token: str) -> bool:
    exp = _sessions.get(token)
    return exp is not None and time.time() < exp

def require_admin(x_admin_token: str = Header(...)):
    if not _valid_session(x_admin_token):
        raise HTTPException(status_code=401, detail="לא מורשה — נא להתחבר מחדש")

# ─── Models ───────────────────────────────────────────────────────────────────

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("השם חייב להכיל בין 1 ל-100 תווים")
        return v

    @field_validator("message")
    @classmethod
    def message_length(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 2000:
            raise ValueError("ההודעה חייבת להכיל בין 1 ל-2000 תווים")
        return v

class OrderItem(BaseModel):
    item_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_range(cls, v: int) -> int:
        if v < 1 or v > 50:
            raise ValueError("כמות חייבת להיות בין 1 ל-50")
        return v

class Order(BaseModel):
    customer_name: str
    items: List[OrderItem]
    notes: Optional[str] = None

    @field_validator("customer_name")
    @classmethod
    def name_length(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("שם לקוח חייב להכיל בין 1 ל-100 תווים")
        return v

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list) -> list:
        if not v or len(v) > 50:
            raise ValueError("ההזמנה חייבת להכיל בין 1 ל-50 פריטים")
        return v

    @field_validator("notes")
    @classmethod
    def notes_length(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 500:
            raise ValueError("הערות לא יכולות לעלות על 500 תווים")
        return v

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    popular: bool = False
    image: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("שם חייב להכיל בין 1 ל-100 תווים")
        return v

    @field_validator("description")
    @classmethod
    def desc_length(cls, v: str) -> str:
        if len(v) > 500:
            raise ValueError("תיאור לא יכול לעלות על 500 תווים")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v <= 0 or v > 10000:
            raise ValueError("מחיר חייב להיות בין 0.01 ל-10000")
        return v

    @field_validator("category")
    @classmethod
    def category_length(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("קטגוריה חייבת להכיל בין 1 ל-100 תווים")
        return v

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    popular: Optional[bool] = None
    image: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v.strip() or len(v) > 100):
            raise ValueError("שם חייב להכיל בין 1 ל-100 תווים")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v <= 0 or v > 10000):
            raise ValueError("מחיר חייב להיות בין 0.01 ל-10000")
        return v

class SiteSettings(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hours: Optional[list] = None

class AdminLogin(BaseModel):
    password: str

# ─── Image validation ─────────────────────────────────────────────────────────

def _validate_image_bytes(content: bytes, ext: str) -> bool:
    if ext in {'.jpg', '.jpeg'} and content[:3] == b'\xff\xd8\xff':
        return True
    if ext == '.png' and content[:8] == b'\x89PNG\r\n\x1a\n':
        return True
    if ext == '.gif' and content[:4] in (b'GIF8', b'GIF9'):
        return True
    if ext == '.webp' and content[:4] == b'RIFF' and content[8:12] == b'WEBP':
        return True
    return False

# ─── Public routes ────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "ברוכים הבאים ל-gabriels' coffee API"}

@app.get("/settings")
def get_settings():
    try:
        result = supabase.table("site_content").select("value").eq("key", "settings").execute()
        return result.data[0]["value"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.get("/menu")
def get_menu():
    try:
        result = supabase.table("menu_items").select("*").order("id").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.get("/menu/popular")
def get_popular():
    try:
        result = supabase.table("menu_items").select("*").eq("popular", True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.get("/menu/category/{category}")
def get_by_category(category: str):
    try:
        result = supabase.table("menu_items").select("*").eq("category", category).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    if not result.data:
        raise HTTPException(status_code=404, detail="קטגוריה לא נמצאה")
    return result.data

@app.get("/menu/{item_id}")
def get_item(item_id: int):
    try:
        result = supabase.table("menu_items").select("*").eq("id", item_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    if not result.data:
        raise HTTPException(status_code=404, detail="פריט לא נמצא")
    return result.data[0]

@app.post("/contact", status_code=201)
def submit_contact(msg: ContactMessage, request: Request):
    ip = _get_client_ip(request)
    _check_rate_limit(f"contact:{ip}", max_requests=5, window_seconds=300)
    try:
        supabase.table("messages").insert({
            "name": msg.name,
            "email": msg.email,
            "message": msg.message,
            "timestamp": datetime.now().isoformat(),
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return {"success": True, "message": "ההודעה נשלחה בהצלחה!"}

@app.post("/orders", status_code=201)
def create_order(order: Order, request: Request):
    ip = _get_client_ip(request)
    _check_rate_limit(f"orders:{ip}", max_requests=10, window_seconds=60)

    # Fetch all needed menu items in one query
    item_ids = [oi.item_id for oi in order.items]
    try:
        menu_result = supabase.table("menu_items").select("*").in_("id", item_ids).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

    menu_map = {item["id"]: item for item in menu_result.data}

    total = 0.0
    line_items = []
    for oi in order.items:
        item = menu_map.get(oi.item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"פריט {oi.item_id} לא נמצא")
        sub = float(item["price"]) * oi.quantity
        total += sub
        line_items.append({"name": item["name"], "quantity": oi.quantity, "subtotal": sub})

    try:
        result = supabase.table("orders").insert({
            "customer_name": order.customer_name,
            "items": line_items,
            "total": total,
            "notes": order.notes,
            "status": "התקבלה",
            "timestamp": datetime.now().isoformat(),
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

    order_id = result.data[0]["id"]
    return {"success": True, "order_id": order_id, "total": total, "message": "ההזמנה התקבלה!"}

# ─── Admin: auth ──────────────────────────────────────────────────────────────

@app.post("/admin/login")
def admin_login(body: AdminLogin, request: Request):
    ip = _get_client_ip(request)
    _check_rate_limit(f"login:{ip}", max_requests=5, window_seconds=300)
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="סיסמה שגויה")
    token = _create_session()
    return {"success": True, "token": token}

# ─── Admin: image upload ──────────────────────────────────────────────────────

@app.post("/admin/upload-image", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        raise HTTPException(status_code=400, detail="סוג קובץ לא נתמך")
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="הקובץ גדול מדי (מקסימום 5MB)")
    if not _validate_image_bytes(contents, ext):
        raise HTTPException(status_code=400, detail="תוכן הקובץ אינו תואם לסוג הקובץ שצוין")

    filename = f"{uuid.uuid4().hex}{ext}"
    mime_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    mime_type = mime_map.get(ext, "image/jpeg")

    try:
        supabase.storage.from_("images").upload(
            filename,
            contents,
            file_options={"content-type": mime_type},
        )
        public_url = supabase.storage.from_("images").get_public_url(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאה בהעלאת הקובץ")

    return {"url": public_url}

# ─── Admin: menu ──────────────────────────────────────────────────────────────

@app.post("/admin/menu", status_code=201, dependencies=[Depends(require_admin)])
def admin_add_item(item: MenuItemCreate):
    try:
        result = supabase.table("menu_items").insert({
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "category": item.category,
            "popular": item.popular,
            "image": item.image,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]

@app.put("/admin/menu/{item_id}", dependencies=[Depends(require_admin)])
def admin_update_item(item_id: int, updates: MenuItemUpdate):
    try:
        existing = supabase.table("menu_items").select("*").eq("id", item_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    if not existing.data:
        raise HTTPException(status_code=404, detail="פריט לא נמצא")

    update_data = updates.model_dump(exclude_none=True)
    try:
        result = supabase.table("menu_items").update(update_data).eq("id", item_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]

@app.delete("/admin/menu/{item_id}", dependencies=[Depends(require_admin)])
def admin_delete_item(item_id: int):
    try:
        existing = supabase.table("menu_items").select("id").eq("id", item_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    if not existing.data:
        raise HTTPException(status_code=404, detail="פריט לא נמצא")

    try:
        supabase.table("menu_items").delete().eq("id", item_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return {"success": True, "message": "הפריט נמחק"}

# ─── Admin: settings ──────────────────────────────────────────────────────────

@app.put("/admin/settings", dependencies=[Depends(require_admin)])
def admin_update_settings(updates: SiteSettings):
    try:
        current = supabase.table("site_content").select("value").eq("key", "settings").execute()
        merged = {**current.data[0]["value"], **updates.model_dump(exclude_none=True)}
        supabase.table("site_content").update({"value": merged}).eq("key", "settings").execute()
        result = supabase.table("site_content").select("value").eq("key", "settings").execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]["value"]

# ─── About content ────────────────────────────────────────────────────────────

@app.get("/about-content")
def get_about_content():
    try:
        result = supabase.table("site_content").select("value").eq("key", "about_content").execute()
        return result.data[0]["value"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.put("/admin/about-content", dependencies=[Depends(require_admin)])
def admin_update_about(updates: dict):
    try:
        current = supabase.table("site_content").select("value").eq("key", "about_content").execute()
        current_value = current.data[0]["value"]
        merged = {**current_value, **{k: v for k, v in updates.items() if k in current_value}}
        supabase.table("site_content").update({"value": merged}).eq("key", "about_content").execute()
        result = supabase.table("site_content").select("value").eq("key", "about_content").execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]["value"]

# ─── Home content ─────────────────────────────────────────────────────────────

@app.get("/home-content")
def get_home_content():
    try:
        result = supabase.table("site_content").select("value").eq("key", "home_content").execute()
        return result.data[0]["value"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.put("/admin/home-content", dependencies=[Depends(require_admin)])
def admin_update_home(updates: dict):
    try:
        current = supabase.table("site_content").select("value").eq("key", "home_content").execute()
        current_value = current.data[0]["value"]
        merged = {**current_value, **{k: v for k, v in updates.items() if k in current_value}}
        supabase.table("site_content").update({"value": merged}).eq("key", "home_content").execute()
        result = supabase.table("site_content").select("value").eq("key", "home_content").execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]["value"]

# ─── Menu page content ────────────────────────────────────────────────────────

@app.get("/menu-content")
def get_menu_content():
    try:
        result = supabase.table("site_content").select("value").eq("key", "menu_page_content").execute()
        return result.data[0]["value"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.put("/admin/menu-content", dependencies=[Depends(require_admin)])
def admin_update_menu_content(updates: dict):
    try:
        current = supabase.table("site_content").select("value").eq("key", "menu_page_content").execute()
        current_value = current.data[0]["value"]
        merged = {**current_value, **{k: v for k, v in updates.items() if k in current_value}}
        supabase.table("site_content").update({"value": merged}).eq("key", "menu_page_content").execute()
        result = supabase.table("site_content").select("value").eq("key", "menu_page_content").execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]["value"]

# ─── Contact page content ─────────────────────────────────────────────────────

@app.get("/contact-content")
def get_contact_content():
    try:
        result = supabase.table("site_content").select("value").eq("key", "contact_content").execute()
        return result.data[0]["value"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.put("/admin/contact-content", dependencies=[Depends(require_admin)])
def admin_update_contact_content(updates: dict):
    try:
        current = supabase.table("site_content").select("value").eq("key", "contact_content").execute()
        current_value = current.data[0]["value"]
        merged = {**current_value, **{k: v for k, v in updates.items() if k in current_value}}
        supabase.table("site_content").update({"value": merged}).eq("key", "contact_content").execute()
        result = supabase.table("site_content").select("value").eq("key", "contact_content").execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
    return result.data[0]["value"]

# ─── Admin: view messages & orders ───────────────────────────────────────────

@app.get("/admin/messages", dependencies=[Depends(require_admin)])
def admin_get_messages():
    try:
        result = supabase.table("messages").select("*").order("timestamp", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")

@app.get("/admin/orders", dependencies=[Depends(require_admin)])
def admin_get_orders():
    try:
        result = supabase.table("orders").select("*").order("timestamp", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="שגיאת מסד נתונים")
