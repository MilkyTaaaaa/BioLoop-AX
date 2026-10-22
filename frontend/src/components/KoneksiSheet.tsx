"use client";

import { WifiOff } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Jeriken } from "@/components/Jeriken";

type Props = {
  open: boolean;
  takenAt: string; // contoh: "22.14"
  onResend: () => void;
  onHome: () => void;
};

export function KoneksiSheet({ open, takenAt, onResend, onHome }: Props) {
  return (
    <Sheet open={open}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="mx-auto max-w-md rounded-t-3xl px-5 pb-6 pt-3"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        <SheetHeader className="flex-row items-center gap-3 p-0">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <WifiOff className="size-6" />
          </div>
          <SheetTitle className="text-2xl font-bold text-slate-900">Koneksi terputus</SheetTitle>
        </SheetHeader>

        <SheetDescription className="mt-4 text-base text-slate-500">
          Foto jeriken tidak hilang, tersimpan di HP ini. Kirim ulang saat sinyal kembali.
        </SheetDescription>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-100 p-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Jeriken className="h-8 w-7" level={0.5} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">1 foto menunggu dikirim</p>
            <p className="text-sm text-slate-500">Diambil {takenAt}</p>
          </div>
        </div>

        <Button onClick={onResend} className="mt-5 h-14 w-full rounded-full bg-slate-900 text-base font-semibold hover:bg-slate-800">
          Kirim ulang
        </Button>
        <Button variant="outline" onClick={onHome} className="mt-3 h-14 w-full rounded-full text-base font-semibold">
          Kembali ke beranda
        </Button>
      </SheetContent>
    </Sheet>
  );
}