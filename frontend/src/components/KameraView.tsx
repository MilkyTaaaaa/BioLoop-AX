"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, House, ImageIcon, Sun, X } from "lucide-react";
import { Jeriken } from "@/components/Jeriken";
import { ViewfinderCorners } from "@/components/ViewfinderCorners";
import { GagalSheet } from "@/components/GagalSheet";

export function KameraView({ gagal }: { gagal: boolean }) {
  const router = useRouter();
  const [showGagal, setShowGagal] = useState(gagal);

  function handleRetry() {
    setShowGagal(false);
    router.replace("/foto");
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-107.5 flex-col overflow-hidden bg-night px-5 pb-6 pt-5 text-white">
      <header className="flex items-center justify-between">
        <Link
          href="/beranda"
          aria-label="Tutup"
          className="grid size-11 place-items-center rounded-full bg-white/10"
        >
          <X className="size-5" />
        </Link>
        <Link
          href="/beranda"
          aria-label="Beranda"
          className="grid size-11 place-items-center rounded-full bg-white/10"
        >
          <House className="size-5" />
        </Link>
      </header>

      <p className="mx-auto mt-2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
        <Sun className="size-4" />
        Foto dari samping, lampu menyala
      </p>

      <div className="relative mx-auto mt-10 grid h-80 w-64 place-items-center">
        <Jeriken tone="dark" level={0.75} className="h-44 w-36" />
        <ViewfinderCorners colorClass="border-white" />
      </div>

      <div className="mt-auto flex flex-col items-center gap-6">
        <div className="flex rounded-full bg-white/10 p-1 text-sm font-semibold">
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-ink">
            <Camera className="size-4" />
            Foto
          </span>
          <span className="flex items-center gap-2 px-4 py-2">
            <ImageIcon className="size-4" />
            Galeri
          </span>
        </div>

        <Link
          href="/analisis"
          aria-label="Ambil foto"
          className="grid size-20 place-items-center rounded-full border-4 border-white transition active:scale-95"
        >
          <span className="size-14 rounded-full bg-white" />
        </Link>

        <p className="text-center text-sm text-white/70">
          Izin kamera hanya dipakai untuk memotret jeriken.
        </p>
      </div>

      {showGagal && <GagalSheet onRetry={handleRetry} />}
    </main>
  );
}