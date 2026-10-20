import uuid
from functools import lru_cache
from supabase import create_client, Client

from app.config import get_settings


@lru_cache
def get_supabase() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_key)


def merchant_exists(merchant_id: str) -> bool:
    res = get_supabase().table("merchants").select("id").eq("id", merchant_id).limit(1).execute()
    return bool(res.data)


def upload_image(merchant_id: str, data: bytes, mime: str) -> tuple[str, str]:
    s = get_settings()
    ext_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/heic": "heic",
        "image/heif": "heif",
    }
    ext = ext_map.get(mime, "jpg")
    path = f"{merchant_id}/{uuid.uuid4()}.{ext}"
    bucket = get_supabase().storage.from_(s.supabase_bucket)
    bucket.upload(path, data, {"content-type": mime})
    return path, bucket.get_public_url(path)


def insert_submission(row: dict) -> str:
    res = get_supabase().table("submissions").insert(row).execute()
    return res.data[0]["id"]


# Kolom ini sengaja tidak menyertakan image_path maupun raw_ai_json karena keduanya
# adalah detail internal yang tidak perlu dikirim ke aplikasi mobile.
SUBMISSION_PUBLIC_COLUMNS = (
    "id,merchant_id,image_url,is_waste_detected,waste_type,"
    "estimated_volume_liters,fill_percentage,purity_grade,confidence,"
    "biodiesel_liters,co2_saved_kg,cashback_idr,ai_notes,"
    "pickup_requested,created_at"
)


def get_merchant(merchant_id: str) -> dict | None:
    res = (
        get_supabase()
        .table("merchants")
        .select("id,name,address,lat,lng,created_at")
        .eq("id", merchant_id)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def list_merchants() -> list[dict]:
    res = (
        get_supabase()
        .table("merchants")
        .select("id,name,address,lat,lng,created_at")
        .order("name")
        .execute()
    )
    return res.data or []


def list_submissions(merchant_id: str, limit: int | None = None) -> list[dict]:
    query = (
        get_supabase()
        .table("submissions")
        .select(SUBMISSION_PUBLIC_COLUMNS)
        .eq("merchant_id", merchant_id)
        .order("created_at", desc=True)
    )
    if limit is not None:
        query = query.limit(limit)
    res = query.execute()
    return res.data or []


def get_submission(submission_id: str) -> dict | None:
    res = (
        get_supabase()
        .table("submissions")
        .select("id,pickup_requested")
        .eq("id", submission_id)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def request_pickup(submission_id: str) -> dict:
    res = (
        get_supabase()
        .table("submissions")
        .update({"pickup_requested": True})
        .eq("id", submission_id)
        .execute()
    )
    return res.data[0]


def complete_submission_pickup(submission_id: str, actual_liters: float, biodiesel: float, co2: float, cashback: int) -> dict | None:
    res = (
        get_supabase()
        .table("submissions")
        .update({
            "actual_volume_liters": actual_liters,
            "estimated_volume_liters": actual_liters,  # Sinkronkan agar summary kafe ikut terupdate
            "biodiesel_liters": biodiesel,
            "co2_saved_kg": co2,
            "cashback_idr": cashback,
            "pickup_requested": False,                 # Keluarkan dari antrean tunggu
            "pickup_status": "completed",              # Tandai selesai dijemput
        })
        .eq("id", submission_id)
        .execute()
    )
    return res.data[0] if res.data else None