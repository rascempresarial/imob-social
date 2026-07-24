import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rede = searchParams.get("rede");

  let query = getSupabaseAdmin().from("rede_metricas").select("*").order("mes", { ascending: true });
  if (rede) query = query.eq("rede", rede);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const rede = typeof body?.rede === "string" ? body.rede.trim() : "";
  const mes = typeof body?.mes === "string" ? body.mes.trim() : "";
  const metrica = typeof body?.metrica === "string" ? body.metrica.trim() : "";
  const valor = Number(body?.valor);
  if (!rede || !mes || !metrica || Number.isNaN(valor)) {
    return NextResponse.json({ error: "Rede, mês, métrica e valor são obrigatórios." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("rede_metricas")
    .upsert({ rede, mes, metrica, valor }, { onConflict: "rede,mes,metrica" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
