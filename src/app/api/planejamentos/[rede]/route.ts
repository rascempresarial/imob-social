import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { rede: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("planejamentos")
    .select("*")
    .eq("rede", params.rede)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? { rede: params.rede, conteudo: "", updated_at: null } });
}

export async function PATCH(req: NextRequest, { params }: { params: { rede: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const conteudo = typeof body?.conteudo === "string" ? body.conteudo : "";

  const { data, error } = await getSupabaseAdmin()
    .from("planejamentos")
    .upsert({ rede: params.rede, conteudo }, { onConflict: "rede" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
