"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, LocateFixed, Lock, Truck } from "lucide-react";
import { Jeriken } from "@/components/Jeriken";
import { MapBackdrop } from "@/components/MapBackdrop";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Cafe = {
  id: number;
  nama: string;
  alamat: string;
  level: number; // persen terisi
  liter: number;
  lapor: string;
  x: number; // posisi pin di peta (%)
  y: number;
};

// Diurutkan dari yang paling penuh
const cafes: Cafe[] = [
  { id: 1, nama: "Dapur Seturan", alamat: "Jl. Seturan Raya, Caturtunggal", level: 95, liter: 19, lapor: "21.05", x: 85, y: 78 },
  { id: 2, nama: "Kopi Klebengan", alamat: "Jl. Klebengan, Caturtunggal", level: 90, liter: 18, lapor: "21.40", x: 55, y: 42 },
  { id: 3, nama: "Kafe Sendowo", alamat: "Jl. Sendowo, Sinduadi, Mlati", level: 85, liter: 17, lapor: "22.14", x: 31, y: 32 },
  { id: 4, nama: "Warung Pogung", alamat: "Pogung Baru, Sinduadi", level: 45, liter: 9, lapor: "22.30", x: 42, y: 85 },
  { id: 5, nama: "Kopi Gejayan", alamat: "Jl. Affandi, Gejayan, Depok", level: 20, liter: 4, lapor: "06.55", x: 71, y: 16 },
];

function Pin({ cafe, selected, onClick }: { cafe: Cafe; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`${cafe.nama} ${cafe.level}%`}
      style={{ left: `${cafe.x}%`, top: `${cafe.y}%` }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md ring-2 ring-white ${
        selected ? "bg-brand text-white" : "bg-white text-ink"
      }`}
    >
      {selected && <Jeriken className="size-3" />}
      {cafe.level}%
    </button>
  );
}

export default function PilihKafePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  const allSelected = selected.size === cafes.length;
  const totalLiter = useMemo(
    () => cafes.filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.liter, 0),
    [selected]
  );

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(cafes.map((c) => c.id)));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col">
      <div className="flex flex-col px-4 pt-3">
        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#dfe7ee] py-2 text-[13px] text-ink/80">
          <Lock className="size-3" /> bioloop-ax.app
        </div>

        <header className="relative mt-4 flex h-10 items-center justify-center">
          <Button
            variant="outline"
            aria-label="Kembali"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-[16px] font-bold">Pilih kafe</h1>
        </header>

        {/* peta mini */}
        <section className="relative mt-4 aspect-[212/161] w-full overflow-hidden rounded-2xl">
          <MapBackdrop />
          <span className="absolute left-[14%] top-[14%] grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-sky text-white shadow-md">
            <Truck className="size-4" />
          </span>
          {cafes.map((c) => (
            <Pin key={c.id} cafe={c} selected={selected.has(c.id)} onClick={() => toggle(c.id)} />
          ))}
          <Button
            variant="outline"
            aria-label="Lokasi saya"
            onClick={() => toast.success("Lokasi diperbarui")}
            className="absolute bottom-2 right-2 size-8"
          >
            <LocateFixed className="size-4" />
          </Button>
        </section>

        <div className="mt-5 flex items-start justify-between">
          <div>
            <p className="text-[16px] font-bold">{cafes.length} kafe siap dijemput</p>
            <p className="mt-0.5 text-[12px] text-muted">Urut dari yang paling penuh</p>
          </div>
          <button onClick={toggleAll} className="text-[13px] font-bold text-brand">
            {allSelected ? "Batal semua" : "Pilih semua"}
          </button>
        </div>
      </div>

      {/* daftar kafe */}
      <ul className="mt-3 flex flex-1 flex-col gap-3 px-4 pb-4">
        {cafes.map((c) => {
          const on = selected.has(c.id);
          return (
            <li key={c.id}>
              <button
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(c.id)}
                className={`flex w-full gap-3 rounded-2xl border-[1.5px] p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  on ? "border-brand bg-[#eef9f3]" : "border-[#e1e7e5] bg-white"
                }`}
              >
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-[1.5px] ${
                    on ? "border-brand bg-brand text-white" : "border-[#c9d2d0] bg-white"
                  }`}
                >
                  {on && <Check className="size-4" strokeWidth={3} />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[15px] font-bold">{c.nama}</span>
                    <span className="shrink-0 text-[12px] text-muted">Lapor {c.lapor}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-muted">{c.alamat}</span>
                  <span className="mt-2.5 flex items-center gap-3">
                    <span className="w-12 shrink-0 text-[13px] font-bold">±{c.liter} L</span>
                    <Progress value={c.level} />
                    <span className="w-9 shrink-0 text-right text-[13px] font-bold">{c.level}%</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* footer */}
      <footer className="sticky bottom-0 border-t border-[#e1e7e5] bg-white px-4 pb-5 pt-3">
        <div className="mb-3 flex items-center justify-between text-[13px]">
          <span className="font-bold">{selected.size} kafe dipilih</span>
          <span className="text-muted">±{totalLiter} L · perkiraan AI</span>
        </div>
        <Button
          disabled={selected.size === 0}
          onClick={() => toast.success(`Rute untuk ${selected.size} kafe dibuat`)}
        >
          Buat rute · {selected.size} kafe
        </Button>
      </footer>
    </main>
  );
}