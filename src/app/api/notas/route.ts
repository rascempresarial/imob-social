import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("notas")
    .select("*")
    .order("fixado", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const conteudo = typeof body?.conteudo === "string" ? body.conteudo.trim() : "";
  if (!conteudo) return NextResponse.json({ error: "Conteúdo é obrigatório." }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("notas")
    .insert({ titulo: body?.titulo || null, conteudo, created_by: session.label })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
