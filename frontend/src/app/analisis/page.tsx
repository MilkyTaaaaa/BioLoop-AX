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
import { getPendingPhoto, submitWastePhoto } from "@/lib/api";

const steps = [
  { label: "Foto disiapkan", doneAt: 20 },
  { label: "Foto terunggah", doneAt: 50 },
  { label: "AI menghitung isi jeriken", doneAt: 100 },
];

type Status = "loading" | "timeout" | "offline";

export default function AnalisisPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(10);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("22.14");

  // Set waktu saat komponen sudah mounting di client (mencegah prerender error)
  useEffect(() => {
    const timeFormatted = new Date()
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      .replace(":", ".");
    setCurrentTimeStr(timeFormatted);
  }, []);

  // Animasi progress bar berjalan sampai 90% sambil menunggu API selesai
  useEffect(() => {
    if (status !== "loading") return;
    const id = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 4 : prev));
    }, 250);
    return () => clearInterval(id);
  }, [status, attempt]);

  // Eksekusi panggilan API POST /api/submit-waste ke Backend FastAPI
  useEffect(() => {
    if (status !== "loading") return;
    let isCancelled = false;

    const photo = getPendingPhoto();
    if (!photo) {
      router.replace("/foto");
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!isCancelled) setStatus("timeout");
    }, 15000);

    async function runAnalysis() {
      try {
        const res = await submitWastePhoto(photo!);
        if (isCancelled) return;
        clearTimeout(timeoutId);

        if (!res.vision.is_waste_detected || res.vision.purity_grade === "REJECT") {
          toast.error(res.vision.notes || "Jeriken tidak terlihat jelas");
          router.replace("/foto?gagal=1");
          return;
        }

        sessionStorage.setItem(
          "last_submission",
          JSON.stringify({
            ...res,
            savedAt: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }).replace(":", "."),
          })
        );

        setProgress(100);
        setTimeout(() => {
          if (!isCancelled) router.replace("/laporan");
        }, 300);
      } catch (err: any) {
        if (isCancelled) return;
        clearTimeout(timeoutId);
        if (!navigator.onLine) {
          setStatus("offline");
        } else {
          toast.error(err?.response?.data?.detail || "Gagal menganalisis foto, silakan coba lagi");
          setStatus("timeout");
        }
      }
    }

    runAnalysis();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [router, status, attempt]);

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
    setProgress(10);
    setAttempt((a) => a + 1);
    setStatus("loading");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 px-4 pb-8 pt-4">
      <header className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-full bg-white"
          onClick={() => router.replace("/foto")}
          aria-label="Batal"
        >
          <X />
        </Button>
        <h1 className="text-base font-semibold text-slate-900">Menganalisis</h1>
        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-full bg-white"
          onClick={() => router.push("/beranda")}
          aria-label="Beranda"
        >
          <Home />
        </Button>
      </header>

      {/* Ilustrasi + progress */}
      <div className="mt-5 flex h-96 items-center justify-center rounded-3xl bg-emerald-50">
        <div className="relative">
          <Jeriken className="h-52 w-44" level={Math.max(0.2, progress / 100)} />
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
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                      ? "bg-emerald-50 text-emerald-500"
                      : "bg-slate-100"
                  }`}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : active ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
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
        takenAt={currentTimeStr}
        onResend={retry}
        onHome={() => router.push("/beranda")}
      />
    </main>
  );
}