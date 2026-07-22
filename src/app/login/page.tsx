"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import SkylineIllustration from "@/components/SkylineIllustration";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"] });

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
    <div className="min-h-screen flex">
      <div
        onMouseMove={handleMouseMove}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-900 items-center justify-center"
      >
        <div ref={spotlightRef} className="spotlight" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <SkylineIllustration />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />

        <div className="relative z-10 text-center px-10">
          <h1 className={`${playfair.className} text-4xl text-white tracking-tight title-reveal`}>Gestão de redes e campanhas</h1>
          <div className="gold-underline mx-auto mt-4" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm fade-in-delayed">
          <div className="mb-8 flex justify-center">
            <Image src="/pedro-granado-logo.png" alt="Pedro Granado Imóveis" width={280} height={64} priority className="h-14 w-auto" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-lg bg-navy-800 text-white py-2.5 text-sm font-medium hover:bg-navy-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
