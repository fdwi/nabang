"use client";

import { logout } from "@/actions/auth";
import { updateDisplayName, type ProfileActionState } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { LogOut, Monitor, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useActionState, useEffect, useState } from "react";

type SettingsViewProps = {
  userEmail: string | null;
  initialDisplayName: string;
  currency: string;
  timezone: string;
};

const initialActionState: ProfileActionState = {};

export function SettingsView({
  userEmail,
  initialDisplayName,
  currency,
  timezone,
}: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileState, profileAction, isPending] = useActionState(
    updateDisplayName,
    initialActionState
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      {/* Profil Akun */}
      <section
        aria-labelledby="profile-heading"
        className="rounded-xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
            <User aria-hidden="true" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" id="profile-heading">
              Profil Pemilik Akun
            </h2>
            <p className="text-sm text-muted-foreground">
              Informasi akun yang digunakan untuk mengelola data keuangan.
            </p>
          </div>
        </div>

        <form action={profileAction} className="mt-6 max-w-xl space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="email-display">
              Alamat Email
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
              disabled
              id="email-display"
              type="email"
              value={userEmail ?? "Belum terautentikasi"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="displayName">
              Nama Tampilan
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] dark:focus-visible:outline-[#ffb9c3]"
              defaultValue={initialDisplayName}
              id="displayName"
              name="displayName"
              placeholder="Contoh: Dwi"
              required
              type="text"
            />
          </div>

          {profileState.error ? (
            <p className="text-sm text-[#963647] dark:text-[#ffb9c3]" role="alert">
              {profileState.error}
            </p>
          ) : null}

          {profileState.success ? (
            <p className="text-sm text-[#2d7a4d] dark:text-[#7ee2a6]" role="status">
              Nama profil berhasil diperbarui.
            </p>
          ) : null}

          <div className="pt-2">
            <Button disabled={isPending} type="submit">
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </section>

      {/* Preferensi Tampilan & Regional */}
      <section
        aria-labelledby="preference-heading"
        className="rounded-xl border border-border bg-card p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold" id="preference-heading">
          Preferensi Regional dan Tema
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Konfigurasi tampilan dan format penanggalan aplikasi.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Tema Aplikasi</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] ${
                  mounted && theme === "light"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setTheme("light")}
                type="button"
              >
                <Sun aria-hidden="true" size={16} />
                Terang
              </button>
              <button
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] ${
                  mounted && theme === "dark"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setTheme("dark")}
                type="button"
              >
                <Moon aria-hidden="true" size={16} />
                Gelap
              </button>
              <button
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] ${
                  mounted && theme === "system"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setTheme("system")}
                type="button"
              >
                <Monitor aria-hidden="true" size={16} />
                Sistem
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium">Mata Uang</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {currency} (Rupiah Indonesia)
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium">Zona Waktu</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {timezone} (Waktu Indonesia Barat)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keamanan & Sesi */}
      <section
        aria-labelledby="security-heading"
        className="rounded-xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
            <ShieldCheck aria-hidden="true" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" id="security-heading">
              Keamanan dan Akses
            </h2>
            <p className="text-sm text-muted-foreground">
              Status proteksi privasi data finansial Anda.
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#2d7a4d] dark:bg-[#7ee2a6]" />
            <span>Pendaftaran publik dinonaktifkan (akses khusus pemilik).</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#2d7a4d] dark:bg-[#7ee2a6]" />
            <span>Row Level Security (RLS) aktif pada seluruh tabel database.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#2d7a4d] dark:bg-[#7ee2a6]" />
            <span>Sesi aman dikelola melalui cookie HTTP-only Supabase Auth.</span>
          </li>
        </ul>

        <div className="mt-8 border-t border-border pt-6">
          <form action={logout}>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#963647]/30 bg-transparent px-4 text-sm font-medium text-[#963647] transition-colors hover:bg-[#f9e1e1]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#963647] dark:border-[#ffb9c3]/30 dark:text-[#ffb9c3] dark:hover:bg-[#542d35]/50"
              type="submit"
            >
              <LogOut aria-hidden="true" size={16} />
              Keluar dari Akun
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
