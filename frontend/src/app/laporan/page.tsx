"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Pencil,
  ChevronRight,
  Info,
  Coins,
  Leaf,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Jeriken } from "@/components/Jeriken";
import { Dampak, DampakSheet } from "@/components/DampakSheet";
import { TimeoutSheet } from "@/components/TimeoutSheet";
import { toast } from "sonner";
import {
  fetchMerchantSummary,
  getActiveMerchantName,
  requestSubmissionPickup,
  SubmitWasteResponse,
} from "@/lib/api";

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const manualPercentParam = searchParams.get("persen");

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState("Kafe Sendowo");
  const [liters, setLiters] = useState(12);
  const [jerikenSize, setJerikenSize] = useState(20);
  const [percent, setPercent] = useState(60);
  const [cashback, setCashback] = useState(60000);
  const [co2e, setCo2e] = useState(27.6);
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState("22.14");
  const [pickupRequested, setPickupRequested] = useState(false);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [openManualSheet, setOpenManualSheet] = useState(false);

  // State untuk DampakSheet (akumulasi bulan ini dari API summary)
  const [totalMonthlyLiters, setTotalMonthlyLiters] = useState(51);
  const [totalMonthlyCo2, setTotalMonthlyCo2] = useState(117.3);
  const [totalPickupCount, setTotalPickupCount] = useState(3);

  // Helper kalkulasi MRV sesuai standar EU RED II/III (2.3 kg CO2e/L, Rp 5.000/L)
  function applyPercentageOverride(newPct: number, capacity = 20) {
    const newLiters = Math.round(((newPct / 100) * capacity) * 10) / 10;
    const newCo2 = Math.round(newLiters * 2.3 * 10) / 10;
    const newCashback = Math.round((newLiters * 5000) / 500) * 500;
    setPercent(newPct);
    setLiters(newLiters);
    setCo2e(newCo2);
    setCashback(newCashback);
  }

  useEffect(() => {
    setMerchantName(getActiveMerchantName());

    // 1. Baca hasil scan terakhir dari sessionStorage
    const raw = sessionStorage.getItem("last_submission");
    if (raw) {
      try {
        const parsed: SubmitWasteResponse & { savedAt?: string } = JSON.parse(raw);
        setSubmissionId(parsed.submission_id);
        const estLiters = parsed.vision.estimated_volume_liters || 12;
        const fillPct = parsed.vision.fill_percentage || 60;
        const inferredCap =
          fillPct > 0 ? Math.max(5, Math.round(estLiters / (fillPct / 100))) : 20;

        setLiters(estLiters);
        setPercent(fillPct);
        setJerikenSize(inferredCap);
        setCashback(parsed.mrv.cashback_idr);
        setCo2e(parsed.mrv.co2_saved_kg);
        setAiNotes(parsed.vision.notes);
        if (parsed.savedAt) setSavedAt(parsed.savedAt);
      } catch {
        // Gunakan nilai default jika gagal parse
      }
    }

    // Jika masuk lewat fallback manual ?persen=...
    if (manualPercentParam) {
      const p = Number(manualPercentParam);
      if (!isNaN(p) && p > 0) applyPercentageOverride(p, 20);
    }

    // 2. Ambil data akumulasi nyata dari Backend Summary
    fetchMerchantSummary()
      .then((summary) => {
        setMerchantName(summary.merchant_name);
        if (summary.total_used_cooking_oil_liters > 0) {
          setTotalMonthlyLiters(summary.total_used_cooking_oil_liters);
          setTotalMonthlyCo2(summary.total_co2_saved_kg);
          setTotalPickupCount(Math.max(1, summary.recent_submissions.length));
        }
      })
      .catch(() => {});
  }, [manualPercentParam]);

  async function handleRequestPickup() {
    if (pickupRequested) {
      router.push("/home");
      return;
    }
    setLoadingPickup(true);
    try {
      if (submissionId) {
        await requestSubmissionPickup(submissionId);
      }
      setPickupRequested(true);
      toast.success(
        "Permintaan jemput terkirim ke Mitra Pengepul terdekat (Pak Joko · 2,1 km)!"
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Gagal mengajukan penjemputan");
    } finally {
      setLoadingPickup(false);
    }
  }

  const dampak: Dampak = {
    usaha: merchantName,
    co2e: totalMonthlyCo2,
    periode: "Oktober 2026 (bulanan)",
    totalLiter: totalMonthlyLiters,
    totalPickup: totalPickupCount,
    menungguLiter: liters,
    menungguLaporan: savedAt,
    faktorEmisi: "1 L = 2,3 kg CO2e",
    metode: "EU RED II/III",
    noSertifikat: "BLX-2026-10-0001",
    penerbit: "BioLoop AX",
    tanggalPdf: "31 Okt",
    terbit: false,
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 px-4 pb-8 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Button asChild variant="outline" size="icon" className="size-12 rounded-full bg-white">
          <Link href="/foto" aria-label="Kembali">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">Hasil laporan</h1>
        <Button asChild variant="outline" size="icon" className="size-12 rounded-full bg-white">
          <Link href="/home" aria-label="Beranda">
            <Home />
          </Link>
        </Button>
      </header>

      {/* Kartu utama */}
      <Card className="mt-5 rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <Jeriken className="h-16 w-14" level={percent / 100} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-500">PERKIRAAN AI</p>
              <p className="text-5xl font-extrabold tracking-tight text-slate-900">
                ±{liters} L
              </p>
              <p className="text-sm text-slate-500">
                {percent}% dari jeriken {jerikenSize} L
              </p>
            </div>
          </div>

          <Progress value={percent} className="h-2.5 bg-slate-200 [&>div]:bg-emerald-500" />
          <p className="text-sm text-slate-500">
            {aiNotes ? aiNotes : "Berapa pun isinya, bisa langsung diajukan"}
          </p>

          <hr />
          <button
            type="button"
            onClick={() => setOpenManualSheet(true)}
            className="flex w-full items-center justify-between font-semibold text-emerald-600"
          >
            <span className="flex items-center gap-2">
              <Pencil className="size-4" /> Angka kurang pas? Ubah persen
            </span>
            <ChevronRight className="size-4" />
          </button>
        </CardContent>
      </Card>

      {/* Dua kartu statistik */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sky-500">
              <Coins className="size-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              Rp{cashback.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-slate-500">Est. cashback dari pengepul</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-lime-50 text-lime-600">
              <Leaf className="size-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {co2e.toLocaleString("id-ID", { minimumFractionDigits: 1 })} kg
            </p>
            <p className="text-sm text-slate-500">CO2e terhindarkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <p className="mt-4 flex gap-2 text-sm text-slate-500">
        <Info className="mt-0.5 size-4 shrink-0" />
        Tersimpan otomatis {savedAt}. Angka final mengikuti volume saat dijemput.
      </p>

      {/* Tombol aksi */}
      <div className="mt-auto space-y-3 pt-10">
        <Button
          onClick={handleRequestPickup}
          disabled={loadingPickup}
          className={`h-14 w-full rounded-full text-base font-semibold ${
            pickupRequested
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {loadingPickup ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" /> Mengajukan...
            </>
          ) : pickupRequested ? (
            <>
              <CheckCircle2 className="mr-2 size-5" /> Sudah Diajukan · Lihat Beranda
            </>
          ) : (
            "Ajukan penjemputan"
          )}
        </Button>
        <DampakSheet data={dampak} />
      </div>

      {/* Modal Ubah Persen Manual */}
      <TimeoutSheet
        open={openManualSheet}
        onRetry={() => setOpenManualSheet(false)}
        onUseEstimate={(p) => {
          applyPercentageOverride(p, jerikenSize);
          setOpenManualSheet(false);
          toast.success(`Perkiraan diubah ke ${p}%`);
        }}
      />
    </main>
  );
}

export default function LaporanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LaporanContent />
    </Suspense>
  );
}