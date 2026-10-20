import time
from google.genai import errors
from google import genai
from google.genai import types

from app.config import get_settings
from app.schemas import VisionResult

SYSTEM_PROMPT = """\
Kamu adalah inspektur limbah dapur untuk platform BioLoop AX di Yogyakarta.
Tugasmu: menilai SATU foto wadah limbah dari kafe/restoran/katering.

Aturan:
1. Jika foto BUKAN limbah atau wadah limbah (selfie, pemandangan, dsb), set is_waste_detected=false,
   estimated_volume_liters=0, fill_percentage=0, purity_grade="REJECT", waste_type="other".
2. waste_type: used_cooking_oil (minyak jelantah), coffee_grounds (ampas kopi),
   mixed_organic (sisa makanan campur), atau other.
3. Perkirakan ukuran wadah dari petunjuk visual (jeriken 5/10/20 L, galon, botol, tong, kantong).
   Hitung estimated_volume_liters = kapasitas_perkiraan * fill_percentage / 100.
4. purity_grade untuk jelantah:
   A = jernih/kuning-cokelat, tanpa endapan banyak, tanpa air;
   B = keruh atau ada endapan sedang;
   REJECT = bercampur air, sisa makanan, atau kontaminan jelas.
   Untuk jenis lain, nilai tingkat pemilahan/kebersihan dengan skala yang sama.
5. confidence 0-1 mencerminkan kejelasan foto. Jika gelap/buram/wadah tidak terlihat, turunkan (<0.5).
6. Jangan mengarang. Jika ukuran wadah tidak bisa ditebak, pakai estimasi konservatif dan turunkan confidence.
7. notes: satu kalimat Bahasa Indonesia yang menjelaskan dasar penilaianmu.
Keluarkan HANYA JSON sesuai skema.
"""

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=get_settings().gemini_api_key)
    return _client


RETRYABLE = {429, 500, 503, 504}


def _call_model(model: str, image_bytes: bytes, mime_type: str) -> VisionResult:
    resp = _get_client().models.generate_content(
        model=model,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            "Analisis foto limbah ini.",
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=VisionResult,
            temperature=0.2,
        ),
    )
    if resp.parsed is not None:
        return resp.parsed  # type: ignore[return-value]
    return VisionResult.model_validate_json(resp.text)


def analyze_waste_image(image_bytes: bytes, mime_type: str) -> VisionResult:
    s = get_settings()
    models = [s.gemini_model] + [
        m.strip() for m in s.gemini_fallback_model.split(",") if m.strip()
    ]
    last_exc: Exception | None = None

    for model in models:
        for attempt in range(3):
            try:
                return _call_model(model, image_bytes, mime_type)
            except errors.APIError as e:
                last_exc = e
                if e.code not in RETRYABLE:
                    raise          # error lain (key salah, dll): jangan diulang
                if attempt < 2:
                    time.sleep(2 ** attempt)   # tunggu 1s, lalu 2s
        # model ini gagal 3x, lanjut ke model cadangan

    raise last_exc  # type: ignore[misc]