from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

WasteType = Literal["used_cooking_oil", "coffee_grounds", "mixed_organic", "other"]
PurityGrade = Literal["A", "B", "REJECT"]


class VisionResult(BaseModel):
    """Skema output yang DIPAKSA ke Gemini (structured output)."""
    is_waste_detected: bool = Field(description="False jika foto bukan limbah/jeriken/wadah sampah")
    waste_type: WasteType
    estimated_volume_liters: float = Field(ge=0, description="Perkiraan isi dalam liter")
    fill_percentage: int = Field(ge=0, le=100, description="Perkiraan persen wadah terisi (0-100)")
    purity_grade: PurityGrade
    confidence: float = Field(ge=0, le=1)
    notes: str = Field(description="Alasan singkat (1 kalimat, Bahasa Indonesia)")

    @field_validator("fill_percentage", mode="before")
    @classmethod
    def clamp_fill_percentage(cls, v: float | int) -> int:
        # Cegah crash jika AI mengeluarkan float atau angka > 100
        return max(0, min(100, int(round(float(v)))))

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: float | int) -> float:
        return max(0.0, min(1.0, round(float(v), 2)))


class MRVResult(BaseModel):
    biodiesel_liters: float
    co2_saved_kg: float
    cashback_idr: int


class SubmitWasteResponse(BaseModel):
    submission_id: str
    image_url: Optional[str]
    vision: VisionResult
    mrv: MRVResult