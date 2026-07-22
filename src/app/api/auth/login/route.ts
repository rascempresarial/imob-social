import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  if (!key) {
    return NextResponse.json({ error: "Informe a chave de acesso." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("access_keys")
    .select("id, label, active")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: `Erro ao conectar com o banco de dados: ${error.message}` }, { status: 500 });
  }
  if (!data || !data.active) {
    return NextResponse.json({ error: "Chave inválida ou desativada." }, { status: 401 });
  }

  await supabase.from("access_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);

  const token = await createSession({ label: data.label, keyId: data.id });
  const res = NextResponse.json({ ok: true, label: data.label });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
