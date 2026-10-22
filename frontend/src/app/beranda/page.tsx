"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, ChevronRight, Droplet, Lightbulb } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Jeriken } from "@/components/Jeriken";
import { ViewfinderCorners } from "@/components/ViewfinderCorners";
import {
  fetchMerchantSummary,
  getActiveMerchantName,
  MerchantSummaryResponse,
} from "@/lib/api";

export default function BerandaPage() {
  const [merchantName, setMerchantName] = useState("Kafe Sendowo");
  const [userName, setUserName] = useState("Mas Budi");
  const [summary, setSummary] = useState<MerchantSummaryResponse | null>(null);

  useEffect(() => {
    const activeName = getActiveMerchantName();
    setMerchantName(activeName);

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user_name");
      if (storedUser) {
        setUserName(storedUser);
      } else {
        // Fallback sapaan otomatis berdasarkan nama kafe jika user_name kosong
        setUserName(activeName.includes("Klebengan") ? "Mbak Rara" : activeName.includes("Pogung") ? "Mas Joko" : "Mas Budi");
      }
    }

    fetchMerchantSummary()
      .then((data) => {
        setSummary(data);
        setMerchantName(data.merchant_name);
      })
      .catch(() => {});
  }, []);

  const latest = summary?.recent_submissions?.[0];
  const latestLevel = latest?.fill_percentage ? latest.fill_percentage / 100 : 0.4;
  const lastPickupText =
    summary && summary.total_used_cooking_oil_liters > 0
      ? `Total tercatat ${summary.total_used_cooking_oil_liters} L · ${summary.total_co2_saved_kg} kg CO2e`
      : "Terakhir dijemput · Siap di-on-demand";

  return (
    <main className="mx-auto min-h-dvh max-w-107.5 px-4 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-sm">
          <Droplet className="size-4 text-brand" />
          Jeriken 20 L
        </span>
      </header>

      {/* Teks atas: Nama Kafe yang benar */}
      <p className="mt-5 text-sm text-muted">{merchantName} · Oktober 2026</p>
      {/* Teks bawah: Sapaan User */}
      <h1 className="text-2xl font-extrabold">Halo, {userName}</h1>

      <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wider text-brand">
              JERIKEN HARI INI
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">
              {latest
                ? `${latest.fill_percentage ?? 60}% (±${latest.estimated_volume_liters ?? 12} L)`
                : "Belum difoto"}
            </h2>
            <p className="mt-1 text-[13px] font-semibold text-muted">
              {lastPickupText}
            </p>
          </div>
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-mint">
            <Jeriken level={latestLevel} className="h-12 w-10" />
          </div>
        </div>

        <p className="mt-4 flex items-start gap-3 rounded-2xl bg-mint p-4 text-sm">
          <Droplet className="mt-0.5 size-5 shrink-0 text-brand" />
          Berapa pun isinya, bisa langsung diajukan untuk dijemput.
        </p>

        <Link
          href="/home"
          className="mt-3 flex items-center justify-between rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:bg-surface"
        >
          <span>Lihat dashboard lengkap & Sertifikat ESG</span>
          <ChevronRight className="size-4 text-muted" />
        </Link>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex h-52 flex-col rounded-2xl bg-mint p-3">
          <span className="flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
            <Lightbulb className="size-3.5 text-brand" />
            Foto dari samping
          </span>

          <div className="grid flex-1 place-items-center">
            <div className="relative grid size-28 place-items-center">
              <Jeriken level={latestLevel} className="h-20 w-16" />
              <ViewfinderCorners />
            </div>
          </div>
        </div>

        <Link
          href="/foto"
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink font-bold text-white transition active:scale-[0.98]"
        >
          <Camera className="size-5" />
          Foto Jeriken
        </Link>
      </section>
    </main>
  );
}