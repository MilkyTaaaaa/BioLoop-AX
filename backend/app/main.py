import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from app import db
from app.config import get_settings
from app.schemas import SubmitWasteResponse
from app.services.mrv import compute_mrv
from app.services.vision import analyze_waste_image

from google.genai import errors as genai_errors

log = logging.getLogger("bioloop")
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}

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

    if image.content_type not in ALLOWED_MIME:
        raise HTTPException(415, "Format harus JPEG/PNG/WebP")
    data = await image.read()
    if len(data) > s.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"Ukuran foto maksimal {s.max_upload_mb} MB")
    if not data:
        raise HTTPException(400, "File kosong")

    if not await run_in_threadpool(db.merchant_exists, merchant_id):
        raise HTTPException(404, "Merchant tidak ditemukan")

    try:
        vision = await run_in_threadpool(analyze_waste_image, data, image.content_type)
    except genai_errors.APIError as e:
        log.exception("Vision AI gagal")
        if e.code in (429, 503):
            raise HTTPException(503, "AI sedang sibuk, coba kirim ulang beberapa detik lagi")
        raise HTTPException(502, "Analisis AI gagal, coba foto ulang")
    except Exception:
        log.exception("Vision AI gagal")
        raise HTTPException(502, "Analisis AI gagal, coba foto ulang")

    mrv = compute_mrv(vision)
    path, url = await run_in_threadpool(db.upload_image, merchant_id, data, image.content_type)

    sub_id = await run_in_threadpool(db.insert_submission, {
        "merchant_id": merchant_id,
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
