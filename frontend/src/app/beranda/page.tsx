import Link from "next/link";
import { Camera, Droplet, Lightbulb } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Jeriken } from "@/components/Jeriken";
import { ViewfinderCorners } from "@/components/ViewfinderCorners";

export default function BerandaPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-107.5 px-4 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-sm">
          <Droplet className="size-4 text-brand" />
          Jeriken 20 L
        </span>
      </header>

      <p className="mt-5 text-sm text-muted">Kafe Sendowo · Sel, 20 Okt</p>
      <h1 className="text-2xl font-extrabold">Halo, Mas Budi</h1>

      <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wider text-brand">
              JERIKEN HARI INI
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">Belum difoto</h2>
            <p className="mt-1 text-[13px] font-semibold text-muted">
              Terakhir dijemput 18 Okt · 18 L
            </p>
          </div>
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-mint">
            <Jeriken level={0.4} className="h-12 w-10" />
          </div>
        </div>

        <p className="mt-4 flex items-start gap-3 rounded-2xl bg-mint p-4 text-sm">
          <Droplet className="mt-0.5 size-5 shrink-0 text-brand" />
          Berapa pun isinya, bisa langsung diajukan untuk dijemput.
        </p>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex h-52 flex-col rounded-2xl bg-mint p-3">
            <span className="flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                <Lightbulb className="size-3.5 text-brand" />
                Foto dari samping
            </span>

            <div className="grid flex-1 place-items-center">
                <div className="relative grid size-28 place-items-center">
                    <Jeriken level={0.4} className="h-20 w-16" />
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