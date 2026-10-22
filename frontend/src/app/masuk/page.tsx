"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";

// Daftar akun resmi untuk demo MVP (bisa ditambah kapan saja)
const DEMO_ACCOUNTS: Record<
  string,
  { password: string; role: "kafe" | "pengepul"; merchantId?: string; name: string }
> = {
  "budi@kafesendowo.com": {
    password: "bioloop123",
    role: "kafe",
    merchantId: "11111111-1111-4111-8111-111111111111",
    name: "Kafe Sendowo",
  },
  "klebengan@bioloop.id": {
    password: "bioloop123",
    role: "kafe",
    merchantId: "22222222-2222-4222-8222-222222222222",
    name: "Kopi Klebengan",
  },
  "pogung@bioloop.id": {
    password: "bioloop123",
    role: "kafe",
    merchantId: "33333333-3333-4333-8333-333333333333",
    name: "Warung Pogung",
  },
  "joko@bioloop.id": {
    password: "bioloop123",
    role: "pengepul",
    name: "Pak Joko",
  },
};

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const inputEmail = email.toLowerCase().trim();
    const account = DEMO_ACCOUNTS[inputEmail];

    // 1. Jika email terdaftar di DEMO_ACCOUNTS, cek kecocokan password-nya
    if (account) {
      if (password !== account.password) {
        setErrorMsg("Kata sandi salah. Gunakan: bioloop123");
        return;
      }

      localStorage.setItem("bioloop_role", account.role);
      localStorage.setItem("user_name", account.name);

      if (account.role === "pengepul") {
        router.push("/pengepul");
        return;
      }

      localStorage.setItem("merchant_id", account.merchantId!);
      localStorage.setItem("merchant_name", account.name);
      router.push("/beranda");
      return;
    }

    // 2. Fallback fleksibel: jika ketik email lain tapi password minimal "bioloop123" / "123456"
    if (password !== "bioloop123" && password !== "123456") {
      setErrorMsg("Email atau kata sandi tidak valid (Demo password: bioloop123)");
      return;
    }

    if (inputEmail.includes("joko") || inputEmail.includes("pengepul")) {
      localStorage.setItem("bioloop_role", "pengepul");
      router.push("/pengepul");
      return;
    }

    localStorage.setItem("bioloop_role", "kafe");
    localStorage.setItem("merchant_id", "11111111-1111-4111-8111-111111111111");
    localStorage.setItem("merchant_name", "Kafe Sendowo");
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

        {/* Pesan Error kalau password salah */}
        {errorMsg && (
          <p className="mt-3 text-sm font-semibold text-red-600">
            {errorMsg}
          </p>
        )}

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