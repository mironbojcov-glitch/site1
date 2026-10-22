"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось войти.");
      window.location.assign("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось войти.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[26px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#a995df]">MyShop</p>
        <h1 className="mt-3 text-2xl font-light">Вход владельца</h1>
        <label htmlFor="admin-password" className="mt-7 block text-xs text-white/60">Пароль</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-[#a995df]/60 focus-visible:ring-2 focus-visible:ring-[#8d77c7]/40" />
        {error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}
        <button type="submit" disabled={loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-400 text-sm font-medium disabled:opacity-60">
          {loading && <LoaderCircle size={17} className="animate-spin" />}
          Войти
        </button>
      </form>
    </main>
  );
}
