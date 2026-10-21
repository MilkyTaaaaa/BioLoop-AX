"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function MasukPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/beranda");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-107.5 flex-col px-5 pb-6 pt-8">
      <Logo />

      <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
        Masuk ke BioLoop
      </h1>
      <p className="mt-2 text-muted">Satu akun untuk kafe dan pengepul.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-1 flex-col">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <div className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4">
          <Mail className="size-5 text-muted" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            className="w-full bg-transparent outline-none placeholder:text-ink"
          />
        </div>

        <label htmlFor="password" className="mt-5 text-sm font-medium">
          Kata sandi
        </label>
        <div className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4">
          <Lock className="size-5 text-muted" />
         <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            className="w-full bg-transparent outline-none placeholder:text-ink"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="text-muted"
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setRemember((v) => !v)}
          role="checkbox"
          aria-checked={remember}
          className="mt-5 flex items-center gap-3 self-start text-left font-medium"
        >
          <span
            className={`grid size-6 place-items-center rounded-md ${
              remember ? "bg-brand text-white" : "border border-line bg-white"
            }`}
          >
            {remember && <Check className="size-4" strokeWidth={3} />}
          </span>
          Tetap masuk di HP ini
        </button>

        <div className="mt-auto pt-10">
          <button
            type="submit"
            className="h-14 w-full rounded-full bg-ink text-base font-bold text-white transition active:scale-[0.98]"
          >
            Masuk
          </button>
          <p className="mt-4 text-center text-sm text-muted">
            Cukup masuk sekali, tidak perlu masuk lagi tiap malam.
          </p>
        </div>
      </form>
    </main>
  );
}