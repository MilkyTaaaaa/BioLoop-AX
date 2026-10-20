"""Kalkulator MRV sederhana.

PENTING: semua angka di bawah adalah ASUMSI AWAL (dari diskusi tim), bukan angka resmi.
Sebelum masuk esai/pitch, verifikasi ke sumber (mis. IPCC, KLHK, jurnal biodiesel UCO)
dan cantumkan sumbernya. BE2 mengambil alih file ini di Hari 2.
"""
from app.schemas import MRVResult, VisionResult

BIODIESEL_YIELD_PER_L_UCO = 0.88      # ASUMSI: liter biodiesel per liter jelantah
CO2_SAVED_KG_PER_L = {                # ASUMSI: kg CO2e dicegah per liter
    "used_cooking_oil": 2.3,
    "coffee_grounds": 0.6,
    "mixed_organic": 0.5,
    "other": 0.0,
}
CASHBACK_IDR_PER_L = {                # ASUMSI harga beli per liter (grade A)
    "used_cooking_oil": 5000,
    "coffee_grounds": 500,
    "mixed_organic": 0,
    "other": 0,
}
GRADE_MULTIPLIER = {"A": 1.0, "B": 0.7, "REJECT": 0.0}


def compute_mrv(v: VisionResult) -> MRVResult:
    if not v.is_waste_detected:
        return MRVResult(biodiesel_liters=0, co2_saved_kg=0, cashback_idr=0)

    liters = v.estimated_volume_liters
    mult = GRADE_MULTIPLIER[v.purity_grade]
    biodiesel = liters * BIODIESEL_YIELD_PER_L_UCO * mult if v.waste_type == "used_cooking_oil" else 0.0
    co2 = liters * CO2_SAVED_KG_PER_L[v.waste_type] * mult
    cashback = liters * CASHBACK_IDR_PER_L[v.waste_type] * mult
    return MRVResult(
        biodiesel_liters=round(biodiesel, 2),
        co2_saved_kg=round(co2, 2),
        cashback_idr=int(round(cashback / 500) * 500),  # bulatkan ke Rp500
    )
