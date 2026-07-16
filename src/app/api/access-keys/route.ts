import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateAccessKey } from "@/lib/keygen";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("access_keys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  if (!label) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

  const key = typeof body?.key === "string" && body.key.trim() ? body.key.trim() : generateAccessKey();

  const { data, error } = await getSupabaseAdmin().from("access_keys").insert({ label, key }).select().single();
  if (error) {
    const message = error.code === "23505" ? "Essa chave já está em uso, tente gerar outra." : error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
