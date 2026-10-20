# BioLoop AX: Backend (FastAPI)

## Setup (±10 menit)
```bash
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # isi GEMINI_API_KEY + Supabase
```
1. Supabase: buat project, jalankan `schema.sql` di SQL Editor.
2. Supabase Storage: buat bucket `waste-photos` (Public).
3. Ambil `merchants.id` hasil seed untuk tes.

## Jalankan
```bash
uvicorn app.main:app --reload --port 8000
# Swagger: http://localhost:8000/docs
```

## Tes cepat
```bash
curl -X POST http://localhost:8000/api/submit-waste \
  -F merchant_id=<UUID_MERCHANT> \
  -F image=@jeriken.jpg
```

## Deploy (Hari 3)
Railway/Render: start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
isi semua env dari `.env.example`, set `CORS_ORIGINS` ke URL Vercel FE.

## Pembagian BE1 / BE2
- BE1: `services/vision.py`, `main.py` (submit-waste), deploy
- BE2: `services/mrv.py` (verifikasi faktor), `GET /api/history/{merchant_id}`, `GET /api/merchants`, error handling
