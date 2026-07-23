import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ANUNCIO_STATUSES = ["aprovado", "agendado", "publicado"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const [{ data: corretores, error: e1 }, { data: imoveis, error: e2 }, { data: posts, error: e3 }] = await Promise.all([
    supabase.from("corretores").select("*").order("nome", { ascending: true }),
    supabase.from("imoveis").select("id, corretor_id"),
    supabase.from("posts").select("imovel_id, anunciado, status"),
  ]);
  const error = e1 || e2 || e3;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const imovelCorretor = new Map<string, string>();
  const imoveisCount = new Map<string, number>();
  for (const im of imoveis ?? []) {
    if (!im.corretor_id) continue;
    imovelCorretor.set(im.id, im.corretor_id);
    imoveisCount.set(im.corretor_id, (imoveisCount.get(im.corretor_id) ?? 0) + 1);
  }

  const anunciosCount = new Map<string, number>();
  for (const p of posts ?? []) {
    if (!p.anunciado || !ANUNCIO_STATUSES.includes(p.status) || !p.imovel_id) continue;
    const corretorId = imovelCorretor.get(p.imovel_id);
    if (!corretorId) continue;
    anunciosCount.set(corretorId, (anunciosCount.get(corretorId) ?? 0) + 1);
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
