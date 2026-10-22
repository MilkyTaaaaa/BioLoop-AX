// src/lib/api.ts
import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const DEFAULT_MERCHANT_ID =
  process.env.NEXT_PUBLIC_DEFAULT_MERCHANT_ID ||
  "11111111-1111-4111-8111-111111111111";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

// Tipe Data Sesuai Schemas Backend FastAPI
export interface VisionResult {
  is_waste_detected: boolean;
  waste_type: "used_cooking_oil" | "coffee_grounds" | "mixed_organic" | "other";
  estimated_volume_liters: number;
  fill_percentage: number;
  purity_grade: "A" | "B" | "REJECT";
  confidence: number;
  notes: string;
}

export interface MRVResult {
  biodiesel_liters: number;
  co2_saved_kg: number;
  cashback_idr: number;
}

export interface SubmitWasteResponse {
  submission_id: string;
  image_url: string | null;
  vision: VisionResult;
  mrv: MRVResult;
}

export interface SubmissionHistoryItem {
  id: string;
  merchant_id: string;
  image_url?: string | null;
  is_waste_detected: boolean;
  waste_type?: string | null;
  estimated_volume_liters?: number | null;
  fill_percentage?: number | null;
  purity_grade?: string | null;
  confidence?: number | null;
  biodiesel_liters?: number | null;
  co2_saved_kg?: number | null;
  cashback_idr?: number | null;
  ai_notes?: string | null;
  pickup_requested: boolean;
  created_at: string;
}

export interface MerchantSummaryResponse {
  merchant_id: string;
  merchant_name: string;
  total_used_cooking_oil_liters: number;
  total_biodiesel_liters: number;
  total_co2_saved_kg: number;
  total_cashback_idr: number;
  recent_submissions: SubmissionHistoryItem[];
}

// Memory buffer untuk menyimpan foto yang baru dipilih dari halaman /foto ke /analisis
let pendingPhotoFile: File | null = null;

export function setPendingPhoto(file: File | null) {
  pendingPhotoFile = file;
}

export function getPendingPhoto(): File | null {
  return pendingPhotoFile;
}

// Helper ambil merchant_id dari localStorage (hasil login)
export function getActiveMerchantId(): string {
  if (typeof window === "undefined") return DEFAULT_MERCHANT_ID;
  return localStorage.getItem("merchant_id") || DEFAULT_MERCHANT_ID;
}

export function getActiveMerchantName(): string {
  if (typeof window === "undefined") return "Kafe Sendowo";
  return localStorage.getItem("merchant_name") || "Kafe Sendowo";
}

// Kompresi gambar di browser agar ukuran < 800KB (aman dari limit 4.5MB Vercel)
export async function compressImageFile(file: File, maxWidth = 1280, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    // Jika file bukan gambar standar atau sudah kecil (< 600KB) dan berformat JPEG/PNG/WebP
    if (file.size < 600 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], "jeriken.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

// 1. GET /api/merchants/{merchant_id}/summary
export async function fetchMerchantSummary(
  merchantId?: string
): Promise<MerchantSummaryResponse> {
  const id = merchantId || getActiveMerchantId();
  const res = await api.get<MerchantSummaryResponse>(`/api/merchants/${id}/summary`);
  return res.data;
}

// 2. POST /api/submit-waste
export async function submitWastePhoto(
  file: File,
  merchantId?: string
): Promise<SubmitWasteResponse> {
  const id = merchantId || getActiveMerchantId();
  const compressed = await compressImageFile(file);

  const formData = new FormData();
  formData.append("merchant_id", id);
  formData.append("image", compressed);

  const res = await api.post<SubmitWasteResponse>("/api/submit-waste", formData);
  return res.data;
}

// 3. PATCH /api/submissions/{submission_id}/request-pickup
export async function requestSubmissionPickup(
  submissionId: string
): Promise<{ submission_id: string; pickup_requested: boolean }> {
  const res = await api.patch(`/api/submissions/${submissionId}/request-pickup`);
  return res.data;
}