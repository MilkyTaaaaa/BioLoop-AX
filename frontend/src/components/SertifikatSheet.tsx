// components/SertifikatSheet.tsx
"use client";

import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export type Sertifikat = {
  usaha: string;
  periode: string;
  co2e: string;
  totalJelantah: string;
  faktorEmisi: string;
  metode: string;
  noSertifikat: string;
  tanggalTerbit: string;
  penerbit: string;
  pdfUrl: string;
};

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{nilai}</span>
    </div>
  );
}

export function SertifikatSheet({ data, trigger }: { data: Sertifikat; trigger: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[92vh] max-w-md overflow-y-auto rounded-t-3xl bg-slate-50">
        <SheetTitle className="text-center text-base font-bold">Sertifikat ESG</SheetTitle>

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Logo />
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              TERBIT
            </span>
          </div>

          <p className="mt-4 text-xs font-semibold tracking-wider text-slate-500">SERTIFIKAT DAMPAK ESG</p>
          <h2 className="text-2xl font-extrabold text-slate-900">{data.usaha}</h2>
          <p className="text-sm text-slate-500">Periode {data.periode}</p>

          <div className="my-4 flex items-center gap-3 rounded-2xl bg-lime-50 p-4">
            <Leaf className="size-8 text-emerald-500" />
            <div>
              <p className="text-4xl font-extrabold text-slate-900">{data.co2e} kg</p>
              <p className="text-xs text-slate-500">CO2e terhindarkan</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Baris label="Total jelantah" nilai={data.totalJelantah} />
            <Baris label="Faktor emisi" nilai={data.faktorEmisi} />
            <Baris label="Metode" nilai={data.metode} />
            <Baris label="No. sertifikat" nilai={data.noSertifikat} />
            <Baris label="Tanggal terbit" nilai={data.tanggalTerbit} />
            <Baris label="Penerbit" nilai={data.penerbit} />
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Laporan dampak berbasis faktor emisi, bukan kredit karbon tersertifikasi.
          </p>
        </div>

        <Button asChild className="mt-5 h-14 w-full rounded-full bg-slate-900 text-base font-semibold hover:bg-slate-800">
          <a href={data.pdfUrl} download>Unduh PDF</a>
        </Button>
      </SheetContent>
    </Sheet>
  );
}