"use client";

import { Droplet, Info, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { ReactElement } from "react";

export type Dampak = {
  usaha: string;
  co2e: number;
  periode: string;
  totalLiter: number;
  totalPickup: number;
  menungguLiter: number;
  menungguLaporan: string;
  faktorEmisi: string;
  metode: string;
  noSertifikat: string;
  penerbit: string;
  tanggalPdf: string;
  terbit: boolean;
};

export function DampakSheet({ data, trigger }: { data: Dampak; trigger?: ReactElement }) {
  const rows = [
    ["Periode", data.periode],
    ["Total jelantah", `${data.totalLiter} L (${data.totalPickup} pickup)`],
    ["Menunggu dijemput", `±${data.menungguLiter} L (laporan ${data.menungguLaporan})`],
    ["Faktor emisi", data.faktorEmisi],
    ["Metode", data.metode],
    ["No. sertifikat", data.noSertifikat],
    ["Penerbit", data.penerbit],
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-14 w-full rounded-full bg-white text-base font-semibold">
            Lihat dampak bulan ini
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[92vh] max-w-md overflow-y-auto rounded-t-3xl px-5 pb-6"
      >
        <SheetHeader className="flex-row items-center justify-between p-0 pt-6">
          <SheetTitle className="text-2xl font-bold text-slate-900">Dampak bulan ini</SheetTitle>
          <SheetDescription className="sr-only">Ringkasan dampak emisi bulan ini</SheetDescription>
          <SheetClose asChild>
            <Button variant="outline" size="icon" className="size-11 rounded-full" aria-label="Tutup">
              <X />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Kartu sertifikat */}
        <div className="relative mt-4 overflow-hidden rounded-3xl bg-emerald-900 p-5 text-white">
          {/* hiasan lingkaran */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full border-[14px] border-emerald-800" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500">
                <Droplet className="size-5 fill-white" />
              </div>
              <span className="text-lg font-bold">BioLoop</span>
              <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-xs font-bold">AX</span>
            </div>
            <span className="rounded-full border border-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-300">
              {data.terbit ? "TERBIT" : "BELUM TERBIT"}
            </span>
          </div>

          <p className="relative mt-5 text-xs font-semibold tracking-wider text-emerald-200">
            SERTIFIKAT DAMPAK ESG
          </p>
          <p className="relative text-2xl font-bold">{data.usaha}</p>

          <div className="relative mt-3 flex items-end gap-3">
            <span className="text-6xl font-extrabold tracking-tight text-emerald-400">
              {data.co2e.toLocaleString("id-ID", { minimumFractionDigits: 1 })}
            </span>
            <span className="pb-2 text-sm">kg CO2e terhindarkan</span>
          </div>

          <dl className="relative mt-4 space-y-2.5 border-t border-white/20 pt-4 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-emerald-100/80">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-4 flex gap-2 text-sm text-slate-500">
          <Info className="mt-0.5 size-4 shrink-0" />
          Laporan dampak berbasis faktor emisi, bukan kredit karbon tersertifikasi. Laporan hari
          ini (±{data.menungguLiter} L) masuk setelah dijemput.
        </p>

        <Button
          disabled
          className="mt-4 h-14 w-full rounded-full bg-slate-200 text-base font-semibold text-slate-500 disabled:opacity-100"
        >
          PDF terbit {data.tanggalPdf}
        </Button>
      </SheetContent>
    </Sheet>
  );
}