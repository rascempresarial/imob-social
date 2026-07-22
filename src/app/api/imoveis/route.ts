import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : null;
  const pageSize = Number(searchParams.get("pageSize") || 20);

  let query = getSupabaseAdmin()
    .from("imoveis")
    .select("*", page ? { count: "exact" } : undefined)
    .order("created_at", { ascending: false });

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
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim() : "";
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  if (!codigo || !titulo) {
    return NextResponse.json({ error: "Código e título são obrigatórios." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("imoveis")
    .insert({
      codigo,
      titulo,
      edificio: body?.edificio || null,
      status: body?.status || "disponivel",
      endereco: body?.endereco || null,
      valor: body?.valor ? Number(body.valor) : null,
      link_site: body?.link_site || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
