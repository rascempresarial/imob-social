"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    spotlightRef.current?.style.setProperty("--x", `${e.clientX - rect.left}px`);
    spotlightRef.current?.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-navy-900 flex items-center justify-center px-4"
    >
      <div ref={spotlightRef} className="spotlight" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            <span className="typewriter">Social Media</span>
          </h1>
          <p className="text-white/50 text-sm mt-3 fade-in-delayed">Gestão de rede e anúncios</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-navy-700/20 shadow-xl p-6 space-y-4 fade-in-delayed"
        >
          <div>
            <label className="block text-xs font-medium text-navy-800 mb-1">Chave de acesso</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                autoFocus
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="XXX-XXX-XXX"
                className="inp pr-16"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-navy-500 hover:text-navy-800 px-2 py-1"
                tabIndex={-1}
              >
                {showKey ? "ocultar" : "mostrar"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !key}
            className="w-full rounded-lg bg-navy-800 text-white py-2 text-sm font-medium hover:bg-navy-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
