import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rede = searchParams.get("rede");

  let query = getSupabaseAdmin().from("copy_templates").select("*").order("created_at", { ascending: false });
  if (rede) query = query.eq("rede", rede);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rede = typeof body?.rede === "string" ? body.rede.trim() : "";
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  if (!rede || !titulo || !texto) {
    return NextResponse.json({ error: "Rede, título e texto são obrigatórios." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin().from("copy_templates").insert({ rede, titulo, texto }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
