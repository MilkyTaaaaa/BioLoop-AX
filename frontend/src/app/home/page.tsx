"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CalendarDays,
  Camera,
  Download,
  Droplet,
  FileText,
  Leaf,
  LogOut,
  MapPin,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Jeriken } from "@/components/Jeriken";
import { Logo } from "@/components/Logo";
import { DampakSheet, type Dampak } from "@/components/DampakSheet";
import { useAuthStore } from "@/stores/auth.store";
import { SertifikatSheet, type Sertifikat } from "@/components/SertifikatSheet";
import {
  fetchMerchantSummary,
  getActiveMerchantName,
  MerchantSummaryResponse,
  requestSubmissionPickup,
} from "@/lib/api";
import { toast } from "sonner";

const STEPS = ["Terkumpul", "Diajukan", "Jalan", "Selesai"] as const;
type Status = (typeof STEPS)[number];

const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const desimal = (n: number) =>
  n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function StatusBadge({ status }: { status: Status }) {
  const selesai = status === "Selesai";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        selesai ? "bg-emerald-900 text-white" : "bg-sky-50 text-sky-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          selesai ? "bg-emerald-400" : "bg-sky-500"
        }`}
      />
      {status}
    </span>
  );
}

function Ring({ value }: { value: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          className="stroke-slate-200"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="stroke-emerald-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Droplet className="size-6 text-emerald-500" />
      </div>
    </div>
  );
}

function Corners() {
  const base = "absolute size-6 border-emerald-500";
  return (
    <>
      <span className={`${base} left-0 top-0 rounded-tl-lg border-l-4 border-t-4`} />
      <span className={`${base} right-0 top-0 rounded-tr-lg border-r-4 border-t-4`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-lg border-b-4 border-l-4`} />
      <span className={`${base} bottom-0 right-0 rounded-br-lg border-b-4 border-r-4`} />
    </>
  );
}

const card = "rounded-3xl bg-white p-5 shadow-sm";

export default function HomePage() {
  const router = useRouter();
  const logout = useAuthStore((state: any) => state.logout);
  const [summary, setSummary] = useState<MerchantSummaryResponse | null>(null);
  const [usaha, setUsaha] = useState("Kafe Sendowo");
  const [userName, setUserName] = useState("Mas Budi");
  const [loadingPickup, setLoadingPickup] = useState(false);

  useEffect(() => {
    const activeName = getActiveMerchantName();
    setUsaha(activeName);
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user_name");
      if (storedUser) {
        setUserName(storedUser);
      } else {
        setUserName(
          activeName.includes("Klebengan")
            ? "Mbak Rara"
            : activeName.includes("Pogung")
            ? "Mas Joko"
            : "Mas Budi"
        );
      }
    }

    fetchMerchantSummary()
      .then((data) => {
        setSummary(data);
        setUsaha(data.merchant_name);
      })
      .catch(() => {});
  }, []);

  const latest = summary?.recent_submissions?.[0];
  const jerikenL = 20;
  const percent = latest?.fill_percentage ?? 85;
  const liter = latest?.estimated_volume_liters ?? Math.round((percent / 100) * jerikenL);
  const currentStatus: Status = latest
    ? latest.pickup_requested
      ? "Diajukan"
      : "Terkumpul"
    : "Diajukan";
  const stepIndex = STEPS.indexOf(currentStatus);

  const totalLiter =
    summary && summary.total_used_cooking_oil_liters > 0
      ? summary.total_used_cooking_oil_liters
      : 51;
  const co2e =
    summary && summary.total_co2_saved_kg > 0 ? summary.total_co2_saved_kg : 117.3;
  const totalCashback =
    summary && summary.total_cashback_idr > 0 ? summary.total_cashback_idr : 255000;
  const pickupSelesai =
    summary && summary.recent_submissions.length > 0
      ? summary.recent_submissions.length
      : 3;

  const laporJam = latest?.created_at
    ? new Date(latest.created_at)
        .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        .replace(":", ".")
    : "22.14";

  async function handleQuickRequestPickup() {
    if (!latest) return;
    setLoadingPickup(true);
    try {
      await requestSubmissionPickup(latest.id);
      toast.success("Penjemputan berhasil diajukan ke Pak Joko!");
      const refreshed = await fetchMerchantSummary();
      setSummary(refreshed);
    } catch {
      toast.error("Gagal mengajukan penjemputan");
    } finally {
      setLoadingPickup(false);
    }
  }

  const dampak: Dampak = {
    usaha,
    co2e,
    periode: "Oktober 2026 (bulanan)",
    totalLiter,
    totalPickup: pickupSelesai,
    menungguLiter: liter,
    menungguLaporan: laporJam,
    faktorEmisi: "1 L = 2,3 kg CO2e",
    metode: "EU RED II/III",
    noSertifikat: "BLX-2026-10-0001",
    penerbit: "BioLoop AX",
    tanggalPdf: "31 Okt",
    terbit: false,
  };

  const sertifikatLalu: Sertifikat = {
    usaha,
    periode: "September 2026",
    co2e: desimal(96.6),
    totalJelantah: "42 L (3 pickup)",
    faktorEmisi: "1 L = 2,3 kg CO2e",
    metode: "EU RED II/III",
    noSertifikat: "BLX-2026-09-0001",
    tanggalTerbit: "30 Sep 2026",
    penerbit: "BioLoop AX",
    pdfUrl: "#",
  };

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-4 bg-slate-50 px-4 pb-10 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Logo />
        <span className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm font-semibold text-slate-900">
          <Droplet className="size-4 text-emerald-500" />
          Jeriken {jerikenL} L
        </span>
      </header>

      <div>
        <p className="text-sm text-slate-500">{usaha} · Oktober 2026</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Halo, {userName}
        </h1>
      </div>

      {/* Isi jeriken + status penjemputan */}
      <section className={card}>
        <p className="text-xs font-semibold tracking-wider text-slate-500">
          ISI JERIKEN TERAKHIR
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <p className="text-6xl font-extrabold tracking-tight text-slate-900">
              {percent}%
            </p>
            <p className="text-sm text-slate-500">
              ±{liter} L dari {jerikenL} L
            </p>
          </div>
          <Ring value={percent} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <StatusBadge status={currentStatus} />
          <span className="text-sm text-slate-500">Lapor {laporJam}</span>
        </div>

        <hr className="my-4" />
        <p className="text-xs font-semibold tracking-wider text-slate-500">
          STATUS PENJEMPUTAN
        </p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s}>
              <div
                className={`h-1.5 rounded-full ${
                  i <= stepIndex ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
              <p
                className={`mt-1.5 text-xs ${
                  i === stepIndex ? "font-bold text-slate-900" : "text-slate-500"
                }`}
              >
                {s}
              </p>
            </div>
          ))}
        </div>

        {latest && !latest.pickup_requested ? (
          <Button
            onClick={handleQuickRequestPickup}
            disabled={loadingPickup}
            className="mt-4 h-12 w-full rounded-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {loadingPickup ? "Mengajukan..." : "Ajukan Penjemputan Sekarang"}
          </Button>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600">
              <CalendarDays className="size-5" />
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">
                Dijemput 14.00–16.00
              </span>{" "}
              oleh Pak Joko.
            </p>
          </div>
        )}
      </section>

      {/* Kamera (Diperbaiki ke /foto) */}
      <section className="rounded-3xl bg-emerald-50 p-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <MapPin className="size-3.5 text-emerald-500" /> Foto dari samping
        </span>
        <div className="relative mx-auto my-4 flex h-40 w-44 items-center justify-center">
          <Corners />
          <Jeriken className="h-24 w-20" level={percent / 100} />
        </div>
        <Button
          asChild
          className="h-14 w-full rounded-full bg-slate-900 text-base font-semibold hover:bg-slate-800"
        >
          <Link href="/foto">
            <Camera /> Foto Jeriken
          </Link>
        </Button>
      </section>

      {/* Dampak bulan ini */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-slate-900">Dampak bulan ini</h2>
          <span className="text-sm text-slate-500">Oktober 2026</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Droplet,
              tone: "bg-emerald-50 text-emerald-500",
              nilai: `${totalLiter} L`,
              label: "Jelantah tercatat",
            },
            {
              icon: Leaf,
              tone: "bg-lime-50 text-lime-600",
              nilai: `${desimal(co2e)} kg`,
              label: "CO2e terhindarkan",
            },
            {
              icon: Truck,
              tone: "bg-slate-100 text-slate-600",
              nilai: `${pickupSelesai}x`,
              label: "Laporan tercatat",
            },
          ].map(({ icon: Icon, tone, nilai, label }) => (
            <div key={label} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className={`flex size-9 items-center justify-center rounded-full ${tone}`}>
                <Icon className="size-4" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">{nilai}</p>
              <p className="text-xs leading-tight text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saldo cashback */}
      <section className={card}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Estimasi saldo cashback</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {rp(totalCashback)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">Harga standar</p>
            <p className="font-bold text-emerald-800">Rp5.000 / L</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-xs text-amber-700">Laporan terakhir</p>
            <p className="font-bold text-amber-800">
              {rp(latest?.cashback_idr ?? 85000)}
            </p>
          </div>
        </div>
      </section>

      {/* Sertifikat ESG */}
      <section className="rounded-3xl bg-emerald-900 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-300">
            <Award className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-emerald-200">
              SERTIFIKAT ESG
            </p>
            <p className="text-2xl font-bold">Oktober 2026</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-emerald-100">
          Terbit 31 Okt. Sejauh ini {desimal(co2e)} kg CO2e.
        </p>

        <DampakSheet
          data={dampak}
          trigger={
            <Button className="mt-4 h-12 w-full rounded-full bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-400">
              Lihat dampak bulan ini
            </Button>
          }
        />

        <hr className="my-4 border-white/20" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-emerald-300" />
            <div>
              <p className="text-sm font-semibold">September 2026 · terbit</p>
              <p className="text-xs text-emerald-200">42 L · 96,6 kg CO2e</p>
            </div>
          </div>
          <SertifikatSheet
            data={sertifikatLalu}
            trigger={
              <Button
                size="sm"
                className="rounded-full bg-white text-slate-900 hover:bg-slate-100"
              >
                <Download /> PDF
              </Button>
            }
          />
        </div>
      </section>

      {/* Riwayat laporan real-time dari Supabase */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Riwayat laporan</h2>
        <div className="divide-y rounded-3xl bg-white px-5 shadow-sm">
          {summary && summary.recent_submissions.length > 0 ? (
            summary.recent_submissions.map((item) => {
              const tgl = new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              const pct = item.fill_percentage ?? 60;
              const st: Status = item.pickup_requested ? "Diajukan" : "Terkumpul";
              return (
                <div key={item.id} className="flex items-center gap-3 py-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Jeriken className="h-8 w-7" level={pct / 100} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{tgl}</p>
                    <p className="text-sm text-slate-500">
                      {pct}% · ±{item.estimated_volume_liters ?? 0} L ·{" "}
                      {rp(item.cashback_idr ?? 0)}
                    </p>
                  </div>
                  <StatusBadge status={st} />
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-slate-500">
              Belum ada riwayat laporan. Yuk foto jeriken pertamamu!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="space-y-3 pt-2 text-center">
        <p className="text-xs text-slate-500">
          Laporan dampak berbasis faktor emisi 2,3 kg CO2e/L, bukan kredit karbon
          tersertifikasi.
        </p>
        <button
          type="button"
          onClick={() => {
            logout();
            localStorage.removeItem("merchant_id");
            localStorage.removeItem("merchant_name");
            localStorage.removeItem("user_name");
            router.replace("/masuk");
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <LogOut className="size-4" /> Keluar
        </button>
      </footer>
    </main>
  );
}