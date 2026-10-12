"use client";

import { login, type LoginState } from "@/actions/auth";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useActionState, useState } from "react";

const initialState: LoginState = {};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-dvh w-full">
      {/* ============================================================== */}
      {/* 1. TAMPILAN HP (MOBILE ONLY: < lg): Livin' Pink Bersih & Rapi  */}
      {/* ============================================================== */}
      <div className="relative flex min-h-dvh w-full flex-col justify-between overflow-y-auto bg-[#fafbfc] text-slate-800 lg:hidden">
        {/* Header Bagian Atas: Badge Platinum Priority Sesuai Gambar */}
        <header className="relative z-10 flex items-center justify-center px-4 pt-6 pb-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50/90 px-3.5 py-1.5 text-xs font-medium text-pink-900 shadow-xs">
            <Sparkles className="size-3.5 text-pink-600" />
            <span>DwiSave Platinum Priority</span>
          </div>
        </header>

        {/* Area Tengah: Visual Splash 3D Pink & Logo Livin' */}
        <div className="relative my-auto flex flex-col items-center justify-center px-4 py-3">
          {/* Ilustrasi Liquid Splash 3D Livin' Pink */}
          <div className="relative flex size-64 items-center justify-center sm:size-72">
            <Image
              alt="Livin Pink Liquid Splash 3D"
              className="size-full object-contain drop-shadow-xl"
              height={288}
              priority
              src="/images/livin-pink-splash.jpg"
              unoptimized
              width={288}
            />

            {/* Logo DS (DwiSave) di Tengah Splash */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="flex size-20 items-center justify-center rounded-3xl border-2 border-white/40 bg-gradient-to-tr from-[#881337] via-[#be123c] to-[#f43f5e] shadow-2xl shadow-rose-950/50 backdrop-blur-xs">
                <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  DS
                </span>
              </div>
              <span className="mt-2 text-sm font-extrabold tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                DwiSave
              </span>
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Form Login Langsung (Bersih Tanpa Gimmick) */}
        <div className="relative z-10 rounded-t-[32px] border-t border-rose-100/80 bg-white px-6 pt-5 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              Masuk ke DwiSave
            </h2>
            <p className="mt-0.5 text-xs text-rose-600 font-medium">
              Tabungan & Keuangan Pribadi
            </p>
          </div>

          {!configured ? (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              Konfigurasi Supabase belum terpasang di file <code>.env.local</code>.
            </div>
          ) : null}

          <form action={action} className="space-y-3.5">
            {/* Input Email Mobile */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                htmlFor="livin-email-mobile"
              >
                Alamat Email
              </label>
              <div className="relative mt-1.5">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-rose-500 focus:bg-white focus-visible:outline-2 focus-visible:outline-rose-500"
                  disabled={!configured || pending}
                  id="livin-email-mobile"
                  name="email"
                  placeholder="nama@email.com"
                  required
                  spellCheck={false}
                  type="email"
                />
              </div>
            </div>

            {/* Input Password Mobile */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                htmlFor="livin-password-mobile"
              >
                Kata Sandi
              </label>
              <div className="relative mt-1.5">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-11 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-rose-500 focus:bg-white focus-visible:outline-2 focus-visible:outline-rose-500"
                  disabled={!configured || pending}
                  id="livin-password-mobile"
                  name="password"
                  placeholder="Masukkan kata sandi"
                  required
                  spellCheck={false}
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {state.error ? (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700" role="alert">
                {state.error}
              </div>
            ) : null}

            <div className="pt-1.5">
              <Button
                className="h-12 w-full rounded-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-base font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:brightness-105 active:scale-[0.99]"
                disabled={!configured || pending}
                type="submit"
              >
                <Fingerprint className="size-5 stroke-[2.2]" />
                <span>{pending ? "Memeriksa Kredensial..." : "Masuk ke DwiSave"}</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-slate-500">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>Sesi login diamankan dengan enkripsi Supabase SSR</span>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAMPILAN DESKTOP (DESKTOP ONLY: >= lg): Web Portal Penuh     */}
      {/* ============================================================== */}
      <div className="hidden min-h-dvh w-full items-center justify-center bg-gradient-to-br from-[#1c0610] via-[#12040a] to-[#0a0205] p-8 text-white lg:flex xl:p-12">
        {/* Efek Pendaran Latar Belakang */}
        <div className="pointer-events-none fixed -top-40 -left-40 size-[500px] rounded-full bg-rose-600/15 blur-[120px]" />
        <div className="pointer-events-none fixed -bottom-40 -right-40 size-[500px] rounded-full bg-pink-500/15 blur-[120px]" />

        {/* Kotak Portal Utama */}
        <div className="relative grid w-full max-w-6xl grid-cols-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/80 backdrop-blur-2xl">
          {/* Kolom Kiri: Branding & Visual Splash 3D */}
          <div className="relative flex col-span-7 flex-col justify-between border-r border-white/10 bg-gradient-to-br from-[#360918]/80 via-[#1f060f]/90 to-[#0e0207] p-12">
            <div>
              <div className="flex items-center gap-3">
                <BrandLogo className="text-[#fb7185]" />
                <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">
                  <Sparkles className="mr-1 inline-block size-3.5" />
                  DwiSave Web Portal
                </span>
              </div>

              <div className="mt-10 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
                  Portal Tabungan & Keuangan Digital DwiSave
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-pink-100/75">
                  Akses instan untuk mencatat arus kas, mengatur anggaran belanja, dan mencapai target finansial Anda secara aman.
                </p>
              </div>
            </div>

            {/* Visual Hero 3D Pink Edition */}
            <div className="relative my-8 h-72 w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
              <Image
                alt="DwiSave Hero Desktop"
                className="object-cover"
                fill
                priority
                src="/images/livin-pink-hero.jpg"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span className="font-semibold">DwiSave Finance Platform</span>
                <span className="text-pink-300">Platinum Priority</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-pink-200/80">
              <ShieldCheck className="size-5 text-emerald-400" />
              <span>Diamankan dengan PostgreSQL RLS & Autentikasi Supabase SSR</span>
            </div>
          </div>

          {/* Kolom Kanan: Form Login Langsung di Layar Desktop */}
          <div className="flex col-span-5 flex-col justify-center p-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
                Masuk ke Akun
              </h2>
              <p className="mt-2 text-sm text-pink-100/70">
                Masukkan email dan kata sandi pemilik tabungan.
              </p>
            </div>

            {!configured ? (
              <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/15 p-4 text-xs leading-relaxed text-amber-200">
                Konfigurasi Supabase belum terpasang di file <code>.env.local</code>.
              </div>
            ) : null}

            <form action={action} className="mt-8 space-y-5">
              {/* Input Email Desktop */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-pink-100"
                  htmlFor="livin-email-desktop"
                >
                  Alamat Email
                </label>
                <div className="relative mt-2">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-pink-300/70"
                    size={20}
                  />
                  <input
                    autoComplete="email"
                    className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/5 pr-4 pl-12 text-sm text-white placeholder:text-white/30 transition-all focus:border-rose-400 focus:bg-white/10 focus-visible:outline-2 focus-visible:outline-rose-400"
                    disabled={!configured || pending}
                    id="livin-email-desktop"
                    name="email"
                    placeholder="nama@email.com"
                    required
                    type="email"
                  />
                </div>
              </div>

              {/* Input Password Desktop */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-pink-100"
                  htmlFor="livin-password-desktop"
                >
                  Kata Sandi
                </label>
                <div className="relative mt-2">
                  <Lock
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-pink-300/70"
                    size={20}
                  />
                  <input
                    autoComplete="current-password"
                    className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/5 pr-12 pl-12 text-sm text-white placeholder:text-white/30 transition-all focus:border-rose-400 focus:bg-white/10 focus-visible:outline-2 focus-visible:outline-rose-400"
                    disabled={!configured || pending}
                    id="livin-password-desktop"
                    name="password"
                    placeholder="Masukkan kata sandi akun"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-pink-300/70 hover:text-white focus-visible:outline-2 focus-visible:outline-rose-400"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {state.error ? (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 p-4 text-xs text-rose-200" role="alert">
                  {state.error}
                </div>
              ) : null}

              {/* Tombol Submit Desktop */}
              <div className="pt-2">
                <Button
                  className="h-13 w-full rounded-2xl bg-gradient-to-r from-[#b31942] via-[#e11d48] to-[#fb7185] text-base font-bold text-white shadow-xl shadow-rose-950/50 transition-all hover:brightness-110 active:scale-[0.99]"
                  disabled={!configured || pending}
                  type="submit"
                >
                  {pending ? "Memeriksa Kredensial..." : "Masuk ke DwiSave"}
                </Button>
              </div>
            </form>

            <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/45">
              <p>DwiSave Mandiri &middot; Pengelolaan Keuangan & Tabungan</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


