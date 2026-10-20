import logging
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from google.genai import errors as genai_errors

from app import db
from app.config import get_settings
from app.schemas import SubmitWasteResponse
from app.services.mrv import compute_mrv
from app.services.vision import analyze_waste_image

log = logging.getLogger("bioloop")

# Normalisasi MIME type dari berbagai browser HP ke standar resmi Gemini & Supabase
MIME_MAP = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",   # Sering dikirim oleh browser Android/lama
    "image/png": "image/png",
    "image/webp": "image/webp",
    "image/heic": "image/heic",  # Kamera iPhone / iOS
    "image/heif": "image/heif",
}

app = FastAPI(title="BioLoop AX API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/submit-waste", response_model=SubmitWasteResponse)
async def submit_waste(merchant_id: str = Form(...), image: UploadFile = File(...)):
    s = get_settings()

    # 1. Validasi format UUID merchant_id agar Supabase tidak crash Error 500
    try:
        valid_merchant_uuid = str(uuid.UUID(merchant_id.strip()))
    except ValueError:
        raise HTTPException(400, "Format merchant_id tidak valid (harus berupa UUID)")

    # 2. Normalisasi & validasi MIME type gambar
    raw_mime = (image.content_type or "").lower().strip()
    normalized_mime = MIME_MAP.get(raw_mime)
    if not normalized_mime:
        raise HTTPException(415, "Format foto harus JPEG, PNG, WebP, atau HEIC")

    # 3. Validasi ukuran & isi file
    data = await image.read()
    if not data:
        raise HTTPException(400, "File foto kosong")
    if len(data) > s.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"Ukuran foto maksimal {s.max_upload_mb} MB")

    # 4. Cek keberadaan merchant di database
    if not await run_in_threadpool(db.merchant_exists, valid_merchant_uuid):
        raise HTTPException(404, "Merchant tidak ditemukan")

    # 5. Analisis gambar dengan Gemini Vision AI
    try:
        vision = await run_in_threadpool(analyze_waste_image, data, normalized_mime)
    except genai_errors.APIError as e:
        log.exception("Vision AI APIError")
        if e.code in (429, 503):
            raise HTTPException(503, "AI sedang sibuk, coba kirim ulang beberapa detik lagi")
        raise HTTPException(502, "Analisis AI gagal, coba foto ulang")
    except Exception:
        log.exception("Vision AI gagal")
        raise HTTPException(502, "Analisis AI gagal, coba foto ulang")

    # 6. Hitung MRV (Biodiesel, CO2, Cashback)
    mrv = compute_mrv(vision)

    # 7. Upload ke Supabase Storage & simpan ke tabel submissions
    path, url = await run_in_threadpool(db.upload_image, valid_merchant_uuid, data, normalized_mime)

    sub_id = await run_in_threadpool(db.insert_submission, {
        "merchant_id": valid_merchant_uuid,
        "image_path": path,
        "image_url": url,
        "is_waste_detected": vision.is_waste_detected,
        "waste_type": vision.waste_type,
        "estimated_volume_liters": vision.estimated_volume_liters,
        "fill_percentage": vision.fill_percentage,
        "purity_grade": vision.purity_grade,
        "confidence": vision.confidence,
        "biodiesel_liters": mrv.biodiesel_liters,
        "co2_saved_kg": mrv.co2_saved_kg,
        "cashback_idr": mrv.cashback_idr,
        "ai_notes": vision.notes,
        "raw_ai_json": vision.model_dump(),
    })

    return SubmitWasteResponse(submission_id=sub_id, image_url=url, vision=vision, mrv=mrv)