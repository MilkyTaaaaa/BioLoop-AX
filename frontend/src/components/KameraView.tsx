"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, House, ImageIcon, Sun, X } from "lucide-react";
import { Jeriken } from "@/components/Jeriken";
import { ViewfinderCorners } from "@/components/ViewfinderCorners";
import { GagalSheet } from "@/components/GagalSheet";
import { setPendingPhoto } from "@/lib/api";

export function KameraView({ gagal }: { gagal: boolean }) {
  const router = useRouter();
  const [showGagal, setShowGagal] = useState(gagal);

  // Dua input file: satu untuk kamera langsung (environment), satu untuk galeri bebas
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  function handleRetry() {
    setShowGagal(false);
    router.replace("/foto");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    router.push("/analisis");
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-107.5 flex-col overflow-hidden bg-night px-5 pb-6 pt-5 text-white">
      {/* Input File Tersembunyi */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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

      <div
        onClick={() => cameraInputRef.current?.click()}
        className="relative mx-auto mt-10 grid h-80 w-64 cursor-pointer place-items-center"
      >
        <Jeriken tone="dark" level={0.75} className="h-44 w-36" />
        <ViewfinderCorners colorClass="border-white" />
      </div>

      <div className="mt-auto flex flex-col items-center gap-6">
        <div className="flex rounded-full bg-white/10 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-ink transition active:scale-95"
          >
            <Camera className="size-4" />
            Foto
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-white transition active:scale-95"
          >
            <ImageIcon className="size-4" />
            Galeri
          </button>
        </div>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          aria-label="Ambil foto"
          className="grid size-20 place-items-center rounded-full border-4 border-white transition active:scale-95"
        >
          <span className="size-14 rounded-full bg-white" />
        </button>

        <p className="text-center text-sm text-white/70">
          Izin kamera hanya dipakai untuk memotret jeriken.
        </p>
      </div>

      {showGagal && <GagalSheet onRetry={handleRetry} />}
    </main>
  );
}