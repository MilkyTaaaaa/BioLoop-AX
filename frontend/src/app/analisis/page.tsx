"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Home, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Jeriken } from "@/components/Jeriken";
import { ProgressRing } from "@/components/ProgressRing";
import { toast } from "sonner";
import { TimeoutSheet } from "@/components/TimeoutSheet";
import { KoneksiSheet } from "@/components/KoneksiSheet";

const DURATION_MS = 6000; // lama simulasi

const steps = [
  { label: "Foto disiapkan", doneAt: 20 },
  { label: "Foto terunggah", doneAt: 45 },
  { label: "AI menghitung isi jeriken", doneAt: 100 },
];

type Status = "loading" | "timeout" | "offline";

export default function AnalisisPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0); // naik tiap "coba lagi"

  // Progres simulasi (berhenti saat modal muncul)
  useEffect(() => {
    if (status !== "loading") return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / DURATION_MS) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        router.replace("/laporan");
      }
    }, 100);
    return () => clearInterval(id);
  }, [router, status, attempt]);

  // Timeout > 8 detik
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => setStatus("timeout"), 8000);
    return () => clearTimeout(t);
  }, [status, attempt]);

  // Deteksi koneksi putus
  useEffect(() => {
    const goOffline = () => setStatus("offline");
    window.addEventListener("offline", goOffline);
    if (!navigator.onLine) goOffline();
    return () => window.removeEventListener("offline", goOffline);
  }, []);

  const retry = () => {
    if (!navigator.onLine) {
      toast.error("Masih belum ada sinyal");
      return;
    }
    setProgress(0);
    setAttempt((a) => a + 1);
    setStatus("loading");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 px-4 pb-8 pt-4">
      <header className="flex items-center justify-between">
        <Button variant="outline" size="icon" className="size-12 rounded-full bg-white"
          onClick={() => router.back()} aria-label="Batal">
          <X />
        </Button>
        <h1 className="text-base font-semibold text-slate-900">Menganalisis</h1>
        <Button variant="outline" size="icon" className="size-12 rounded-full bg-white"
          onClick={() => router.push("/")} aria-label="Beranda">
          <Home />
        </Button>
      </header>

      {/* Ilustrasi + progress */}
      <div className="mt-5 flex h-96 items-center justify-center rounded-3xl bg-emerald-50">
        <div className="relative">
          <Jeriken className="h-52 w-44" level={0.4} />
          <div className="absolute inset-0 flex items-center justify-center">
            <ProgressRing value={progress} />
          </div>
        </div>
      </div>

      {/* Kartu status */}
      <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Membaca isi jeriken…</h2>
        <p className="mt-2 text-slate-500">Biasanya selesai kurang dari 10 detik.</p>

        <ul className="mt-5 space-y-4">
          {steps.map((s, i) => {
            const prevDone = i === 0 || progress >= steps[i - 1].doneAt;
            const done = progress >= s.doneAt;
            const active = prevDone && !done;
            return (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${
                    done ? "bg-emerald-500 text-white" : active ? "bg-emerald-50 text-emerald-500" : "bg-slate-100"
                  }`}
                >
                  {done ? <Check className="size-4" /> : active ? <Loader2 className="size-4 animate-spin" /> : null}
                </span>
                <span className={active ? "font-semibold text-slate-900" : "text-slate-500"}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <TimeoutSheet
        open={status === "timeout"}
        onRetry={retry}
        onUseEstimate={(p) => router.replace(`/laporan?persen=${p}`)}
      />
      <KoneksiSheet
        open={status === "offline"}
        takenAt="22.14"
        onResend={retry}
        onHome={() => router.push("/")}
      />
    </main>
    
  );
}