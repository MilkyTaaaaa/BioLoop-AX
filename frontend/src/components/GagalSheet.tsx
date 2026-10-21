import { Lightbulb, PanelLeft, Scan } from "lucide-react";
import { Jeriken } from "@/components/Jeriken";

const tips = [
  { icon: PanelLeft, label: "Foto dari samping jeriken" },
  { icon: Lightbulb, label: "Nyalakan lampu dapur" },
  { icon: Scan, label: "Masukkan seluruh jeriken ke bingkai" },
];

export function GagalSheet({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-end bg-black/50">
      <section
        role="alertdialog"
        aria-labelledby="gagal-title"
        className="w-full animate-slide-up rounded-t-[28px] bg-white p-5 pb-6 text-ink"
      >
        <div className="flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-night">
            <Jeriken tone="dark" level={0.6} className="h-12 w-10" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
              <span className="size-1.5 rounded-full bg-red-500" />
              Gagal
            </span>
            <h2
              id="gagal-title"
              className="mt-1.5 text-xl font-extrabold leading-tight"
            >
              Jeriken tidak terlihat jelas
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted">
          Foto terlalu gelap atau buram, jadi AI belum bisa membaca isi jeriken.
          Coba foto lagi:
        </p>

        <ul className="mt-4 space-y-4">
          {tips.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm font-bold">
              <span className="grid size-9 place-items-center rounded-lg bg-surface">
                <Icon className="size-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 h-14 w-full rounded-full bg-ink font-bold text-white transition active:scale-[0.98]"
        >
          Foto ulang
        </button>
      </section>
    </div>
  );
}