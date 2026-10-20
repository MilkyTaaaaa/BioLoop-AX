import logging
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from google.genai import errors as genai_errors

from app import db
from app.config import get_settings
from app.schemas import (
    HistoryResponse,
    MerchantResponse,
    MerchantSummaryResponse,
    PickupRequestResponse,
    SubmitWasteResponse,
)
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


def validate_uuid(value: str, field_name: str) -> str:
    """Return UUID canonical agar query Supabase konsisten dan error pengguna jelas."""
    try:
        return str(uuid.UUID(value.strip()))
    except ValueError:
        raise HTTPException(400, f"Format {field_name} tidak valid (harus berupa UUID)")


@app.get("/api/merchants", response_model=list[MerchantResponse])
async def get_merchants():
    """Daftar merchant untuk dropdown atau pemilihan akun demo."""
    return await run_in_threadpool(db.list_merchants)


@app.get("/api/merchants/{merchant_id}/summary", response_model=MerchantSummaryResponse)
async def get_merchant_summary(merchant_id: str):
    merchant_id = validate_uuid(merchant_id, "merchant_id")
    merchant = await run_in_threadpool(db.get_merchant, merchant_id)
    if merchant is None:
        raise HTTPException(404, "Merchant tidak ditemukan")

    # Ambil sekali untuk total akurat; 10 item pertama sudah berurutan terbaru.
    submissions = await run_in_threadpool(db.list_submissions, merchant_id)
    total_oil = sum(
        float(item["estimated_volume_liters"] or 0)
        for item in submissions
        if item["is_waste_detected"] and item["waste_type"] == "used_cooking_oil"
    )
    return {
        "merchant_id": merchant["id"],
        "merchant_name": merchant["name"],
        "total_used_cooking_oil_liters": round(total_oil, 2),
        "total_biodiesel_liters": round(sum(float(item["biodiesel_liters"] or 0) for item in submissions), 2),
        "total_co2_saved_kg": round(sum(float(item["co2_saved_kg"] or 0) for item in submissions), 2),
        "total_cashback_idr": sum(int(item["cashback_idr"] or 0) for item in submissions),
        "recent_submissions": submissions[:10],
    }


@app.get("/api/history/{merchant_id}", response_model=HistoryResponse)
async def get_history(merchant_id: str):
    merchant_id = validate_uuid(merchant_id, "merchant_id")
    merchant = await run_in_threadpool(db.get_merchant, merchant_id)
    if merchant is None:
        raise HTTPException(404, "Merchant tidak ditemukan")
    submissions = await run_in_threadpool(db.list_submissions, merchant_id)
    return {"merchant": merchant, "submissions": submissions}


@app.patch("/api/submissions/{submission_id}/request-pickup", response_model=PickupRequestResponse)
async def request_pickup(submission_id: str):
    submission_id = validate_uuid(submission_id, "submission_id")
    submission = await run_in_threadpool(db.get_submission, submission_id)
    if submission is None:
        raise HTTPException(404, "Submission tidak ditemukan")
    updated = await run_in_threadpool(db.request_pickup, submission_id)
    return {"submission_id": updated["id"], "pickup_requested": updated["pickup_requested"]}


@app.post("/api/submit-waste", response_model=SubmitWasteResponse)
async def submit_waste(merchant_id: str = Form(...), image: UploadFile = File(...)):
    s = get_settings()

    # 1. Validasi format UUID merchant_id agar Supabase tidak crash Error 500
    valid_merchant_uuid = validate_uuid(merchant_id, "merchant_id")

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
