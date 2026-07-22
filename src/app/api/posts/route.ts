import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const SELECT = "*, imovel:imoveis(id, codigo, titulo, edificio, status), corretor:corretores(id, nome)";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const imovelId = searchParams.get("imovel_id");
  const corretorId = searchParams.get("corretor_id");
  const q = searchParams.get("q");
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : null;
  const pageSize = Number(searchParams.get("pageSize") || 20);

  let query = getSupabaseAdmin()
    .from("posts")
    .select(SELECT, page ? { count: "exact" } : undefined)
    .order("data_publicacao", { ascending: true, nullsFirst: false });

  if (status) query = query.eq("status", status);
  if (from) query = query.gte("data_publicacao", from);
  if (to) query = query.lte("data_publicacao", to);
  if (imovelId) query = query.eq("imovel_id", imovelId);
  if (corretorId) query = query.eq("corretor_id", corretorId);
  if (q) query = query.ilike("copy", `%${q}%`);
  if (page) {
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count: count ?? undefined });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .insert({
      imovel_id: body.imovel_id || null,
      corretor_id: body.corretor_id || null,
      tipo: body.tipo || "feed",
      link_criativo: body.link_criativo || null,
      copy: body.copy || null,
      data_publicacao: body.data_publicacao || null,
      anunciado: body.anunciado ?? false,
      status: body.status || "rascunho",
      created_by: session.label,
    })
    .select(SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit({
    postId: data.id,
    actor: session.label,
    action: "criado",
    detail: `Post criado (${data.tipo}), imóvel ${data.imovel?.codigo ?? "não vinculado"}`,
  });

  return NextResponse.json({ data });
}
