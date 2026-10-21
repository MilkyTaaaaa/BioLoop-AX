import Link from "next/link";
import { Check, House, LoaderCircle, X } from "lucide-react";
import { Jeriken } from "@/components/Jeriken";
import { ProgressRing } from "@/components/ProgressRing";

const steps = [
  { label: "Foto disiapkan", done: true },
  { label: "Foto terunggah", done: true },
  { label: "AI menghitung isi jeriken", done: false },
];

export default function AnalisisPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-107.5 px-5 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <Link
          href="/beranda"
          aria-label="Tutup"
          className="grid size-11 place-items-center rounded-full bg-white shadow-sm"
        >
          <X className="size-5" />
        </Link>
        <h1 className="font-bold">Menganalisis</h1>
        <Link
          href="/beranda"
          aria-label="Beranda"
          className="grid size-11 place-items-center rounded-full bg-white shadow-sm"
        >
          <House className="size-5" />
        </Link>
      </header>

      <div className="relative mt-5 grid h-80 place-items-center rounded-3xl bg-mint">
        <Jeriken level={0.5} className="h-44 w-36" />
        <div className="absolute">
          <ProgressRing value={60} />
        </div>
      </div>

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-extrabold">Membaca isi jeriken…</h2>
        <p className="mt-2 text-muted">Biasanya selesai kurang dari 10 detik.</p>

        <ul className="mt-5 space-y-4">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span
                className={`grid size-7 place-items-center rounded-full ${
                  s.done ? "bg-brand text-white" : "bg-mint text-brand"
                }`}
              >
                {s.done ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
              </span>
              <span className={s.done ? "text-muted" : "font-bold"}>
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}