import Link from "next/link";
import { ArrowLeft, Home, Pencil, ChevronRight, Info, Coins, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Jeriken} from "@/components/Jeriken";
import { Dampak, DampakSheet } from "@/components/DampakSheet";

// Data contoh, nanti ganti dengan hasil dari API
const report = {
  liters: 17,
  JerikenSize: 20,
  percent: 85,
  cashback: 85000,
  co2e: 39.1,
  savedAt: "22.14",
};

const dampak: Dampak = {
  usaha: "Kafe Sendowo",
  co2e: 117.3,
  periode: "Oktober 2026 (bulanan)",
  totalLiter: 51,
  totalPickup: 3,
  menungguLiter: 17,
  menungguLaporan: "22.14",
  faktorEmisi: "1 L = 2,3 kg CO2e",
  metode: "EU RED II/III",
  noSertifikat: "BLX-2026-10-0001",
  penerbit: "BioLoop AX",
  tanggalPdf: "31 Okt",
  terbit: false,
};


export default function LaporanPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 px-4 pb-8 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Button asChild variant="outline" size="icon" className="size-12 rounded-full bg-white">
          <Link href="/" aria-label="Kembali"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">Hasil laporan</h1>
        <Button asChild variant="outline" size="icon" className="size-12 rounded-full bg-white">
          <Link href="/home " aria-label="Beranda"><Home /></Link>
        </Button>
      </header>

      {/* Kartu utama */}
      <Card className="mt-5 rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <Jeriken className="h-16 w-14" level={report.percent / 100} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-500">PERKIRAAN AI</p>
              <p className="text-5xl font-extrabold tracking-tight text-slate-900">±{report.liters} L</p>
              <p className="text-sm text-slate-500">
                {report.percent}% dari jeriken {report.JerikenSize} L
              </p>
            </div>
          </div>

          <Progress value={report.percent} className="h-2.5 bg-slate-200 [&>div]:bg-emerald-500" />
          <p className="text-sm text-slate-500">Berapa pun isinya, bisa diajukan</p>

          <hr />
          <Link
            href="/laporan/ubah"
            className="flex items-center justify-between font-semibold text-emerald-600"
          >
            <span className="flex items-center gap-2">
              <Pencil className="size-4" /> Angka kurang pas? Ubah persen
            </span>
            <ChevronRight className="size-4" />
          </Link>
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
              Rp{report.cashback.toLocaleString("id-ID")}
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
              {report.co2e.toLocaleString("id-ID", { minimumFractionDigits: 1 })} kg
            </p>
            <p className="text-sm text-slate-500">CO2e terhindarkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <p className="mt-4 flex gap-2 text-sm text-slate-500">
        <Info className="mt-0.5 size-4 shrink-0" />
        Tersimpan otomatis {report.savedAt}. Angka final mengikuti volume saat dijemput.
      </p>

      {/* Tombol aksi */}
      <div className="mt-auto space-y-3 pt-10">
        <Button className="h-14 w-full rounded-full bg-slate-900 text-base font-semibold hover:bg-slate-800">
          Ajukan penjemputan
        </Button>
        <DampakSheet data={dampak} />
      </div>
    </main>
  );
}