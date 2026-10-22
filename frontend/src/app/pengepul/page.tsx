"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck, LocateFixed, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Jeriken } from "@/components/Jeriken";
import { MapBackdrop } from "@/components/MapBackdrop";
import { Button } from "@/components/ui/button";

const cafes = [
  { id: 1, level: 20, x: 70, y: 17 },
  { id: 2, level: 85, x: 30, y: 37 },
  { id: 3, level: 90, x: 56, y: 47 },
  { id: 4, level: 95, x: 84, y: 69 },
  { id: 5, level: 45, x: 40, y: 76 },
];

function Pin({ level, x, y }: { level: number; x: number; y: number }) {
  return (
    <button
      onClick={() => toast.info(`Kafe terisi ${level}%`)}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[13px] font-bold text-white shadow-md ring-2 ring-white transition-transform hover:scale-105"
    >
      <Jeriken className="size-3.5" />
      {level}%
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col px-4 pb-6 pt-3">
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#dfe7ee] py-2 text-[13px] text-ink/80">
        <Lock className="size-3" /> bioloop-ax.app
      </div>

      <header className="mt-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] text-muted">Pengepul</span>
          <span className="grid size-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">
            PJ
          </span>
        </div>
      </header>

      <section className="mt-5">
        <p className="text-[13px] text-muted">Rab, 21 Okt · Sleman</p>
        <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight">
          Halo, Pak Joko
        </h1>
      </section>

      <section className="relative mt-4 aspect-[296/373] w-full overflow-hidden rounded-[28px] shadow-sm">
        <MapBackdrop />

        <span className="absolute left-[14%] top-[10%] grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-sky text-white shadow-md">
          <Truck className="size-5" />
        </span>

        {cafes.map((c) => (
          <Pin key={c.id} level={c.level} x={c.x} y={c.y} />
        ))}

        <Button
          variant="outline"
          aria-label="Lokasi saya"
          onClick={() => toast.success("Lokasi diperbarui")}
          className="absolute bottom-3 right-3 size-10 rounded-full bg-white p-0 shadow-md"
        >
          <LocateFixed className="size-5" />
        </Button>
      </section>

      <section className="mt-5 flex items-baseline justify-between">
        <p className="text-[15px] font-bold">{cafes.length} kafe siap dijemput</p>
        <p className="text-[15px] font-bold text-brand">Total ±67 L</p>
      </section>
      <p className="mt-2 text-[13px] text-muted">
        Pilih satu, beberapa, atau semua kafe, lalu buat rute.
      </p>

      <div className="mt-auto pt-6">
        <Button
          onClick={() => router.push("/pilih-cafe")}
          className="h-14 w-full rounded-full bg-ink text-[15px] font-semibold text-white hover:bg-ink/90"
        >
          Pilih kafe untuk dijemput
        </Button>
      </div>
    </main>
  );
}