import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const [{ data: corretores, error: e1 }, { data: imoveis, error: e2 }] = await Promise.all([
    supabase.from("corretores").select("*").order("nome", { ascending: true }),
    supabase.from("imoveis").select("corretor_id, patrocinado"),
  ]);
  const error = e1 || e2;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const imoveisCount = new Map<string, number>();
  const anunciosCount = new Map<string, number>();
  for (const im of imoveis ?? []) {
    if (!im.corretor_id) continue;
    imoveisCount.set(im.corretor_id, (imoveisCount.get(im.corretor_id) ?? 0) + 1);
    if (im.patrocinado) anunciosCount.set(im.corretor_id, (anunciosCount.get(im.corretor_id) ?? 0) + 1);
  }

  const data = (corretores ?? []).map((c) => ({
    ...c,
    imoveis_count: imoveisCount.get(c.id) ?? 0,
    anuncios_rodando: anunciosCount.get(c.id) ?? 0,
  }));

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  if (!nome) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("corretores")
    .insert({ nome, telefone: body?.telefone || null, ativo: body?.ativo ?? true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
