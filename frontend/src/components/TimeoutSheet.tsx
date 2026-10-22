"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const OPTIONS = [25, 50, 75, 100];

type Props = {
  open: boolean;
  onRetry: () => void;
  onUseEstimate: (percent: number) => void;
};

export function TimeoutSheet({ open, onRetry, onUseEstimate }: Props) {
  const [percent, setPercent] = useState(75);

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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Clock className="size-6" />
          </div>
          <SheetTitle className="text-2xl font-bold leading-tight text-slate-900">
            AI butuh waktu lebih lama
          </SheetTitle>
        </SheetHeader>

        <SheetDescription className="mt-4 text-base text-slate-500">
          Sudah lewat 8 detik. Foto tetap tersimpan. Coba lagi, atau pilih perkiraan isi jeriken sendiri.
        </SheetDescription>

        <p className="mt-5 text-xs font-semibold tracking-wider text-slate-500">PERKIRAAN MANUAL</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPercent(p)}
              aria-pressed={percent === p}
              className={`h-12 rounded-xl border text-sm font-semibold transition ${
                percent === p
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        <Button onClick={onRetry} className="mt-5 h-14 w-full rounded-full bg-slate-900 text-base font-semibold hover:bg-slate-800">
          Coba lagi
        </Button>
        <Button
          variant="outline"
          onClick={() => onUseEstimate(percent)}
          className="mt-3 h-14 w-full rounded-full text-base font-semibold"
        >
          Pakai perkiraan {percent}%
        </Button>
      </SheetContent>
    </Sheet>
  );
}