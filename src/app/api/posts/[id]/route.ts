import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const SELECT = "*, imovel:imoveis(id, codigo, titulo, edificio, status), corretor:corretores(id, nome)";
const EDITABLE = [
  "imovel_id",
  "corretor_id",
  "tipo",
  "link_criativo",
  "copy",
  "data_publicacao",
  "anunciado",
  "status",
  "motivo_reprovacao",
  "alcance",
  "curtidas",
  "comentarios",
  "salvamentos",
];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const update: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) update[key] = body[key] === "" ? null : body[key];
  }

  // aprovado_por/aprovado_em nunca vêm do cliente — o servidor carimba
  // com a sessão autenticada no momento em que o status muda para
  // aprovado/reprovado, garantindo um registro de auditoria confiável.
  if (update.status === "aprovado" || update.status === "reprovado") {
    update.aprovado_por = session.label;
    update.aprovado_em = new Date().toISOString();
  }

  const { data, error } = await getSupabaseAdmin().from("posts").update(update).eq("id", params.id).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { error } = await getSupabaseAdmin().from("posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
