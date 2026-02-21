# גבריאלס' קפה — Gabriel's Coffee Website

Hebrew coffee shop website with a FastAPI backend and Next.js frontend.

## Structure

```
gabicoffee/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   └── requirements.txt
└── frontend/         # Next.js 14 frontend (Hebrew / RTL)
    ├── app/
    │   ├── page.tsx          # Home
    │   ├── menu/page.tsx     # Menu
    │   ├── about/page.tsx    # About
    │   └── contact/page.tsx  # Contact
    └── components/
        ├── Navbar.tsx
        ├── Footer.tsx
        └── MenuCard.tsx
```

## Running

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API will be at http://localhost:8000
Swagger docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Site will be at http://localhost:3000

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /menu | All menu items |
| GET | /menu/popular | Popular items |
| GET | /menu/category/{cat} | Items by category (קפה / מאפים / ארוחות) |
| GET | /menu/{id} | Single item |
| POST | /contact | Submit contact message |
| POST | /orders | Place an order |
| GET | /orders/{id} | Get order status |
