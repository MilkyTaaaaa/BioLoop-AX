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

## Endpoint pendukung Frontend

- `GET /api/merchants` — daftar semua merchant, diurutkan berdasarkan nama, untuk dropdown demo.
- `GET /api/merchants/{merchant_id}/summary` — ringkasan kontribusi merchant: `merchant_name`, total liter jelantah, biodiesel, CO2, cashback, serta `recent_submissions` (maksimal 10 data terbaru).
- `GET /api/history/{merchant_id}` — seluruh riwayat submission merchant, terbaru lebih dulu. Respons berisi metadata `merchant` dan array `submissions`.
- `PATCH /api/submissions/{submission_id}/request-pickup` — menandai submission untuk dijemput. Respons: `{ "submission_id": "...", "pickup_requested": true }`.

Semua ID pada path harus UUID valid. ID merchant atau submission yang tidak ditemukan akan menghasilkan `404`; UUID yang tidak valid menghasilkan `400`.

## Deploy (Hari 3)
Railway/Render: start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
isi semua env dari `.env.example`, set `CORS_ORIGINS` ke URL Vercel FE.

## Pembagian BE1 / BE2
- BE1: `services/vision.py`, `main.py` (submit-waste), deploy
- BE2: `services/mrv.py` (verifikasi faktor), `GET /api/history/{merchant_id}`, `GET /api/merchants`, error handling
