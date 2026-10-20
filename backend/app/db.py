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