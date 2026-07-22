import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const SELECT = "*, imovel:imoveis(id, codigo, titulo, edificio, status)";
const EDITABLE = [
  "imovel_id",
  "rede",
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

  if (update.status === "aprovado") {
    await logAudit({ postId: data.id, actor: session.label, action: "aprovado" });
  } else if (update.status === "reprovado") {
    await logAudit({ postId: data.id, actor: session.label, action: "reprovado", detail: data.motivo_reprovacao });
  } else {
    await logAudit({ postId: data.id, actor: session.label, action: "editado" });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: post } = await supabase.from("posts").select(SELECT).eq("id", params.id).maybeSingle();

  if (post) {
    await logAudit({
      postId: post.id,
      actor: session.label,
      action: "excluido",
      detail: `Post excluído (${post.tipo}), imóvel ${post.imovel?.codigo ?? "não vinculado"}`,
    });
  }

  const { error } = await getSupabaseAdmin().from("posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
