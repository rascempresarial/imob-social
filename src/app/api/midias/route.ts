import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "midia-imoveis";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const imovelId = searchParams.get("imovel_id");

  const supabase = getSupabaseAdmin();
  let query = supabase.from("midias").select("*").order("created_at", { ascending: false });
  if (imovelId) query = query.eq("imovel_id", imovelId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const withUrls = await Promise.all(
    (data ?? []).map(async (m) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(m.storage_path, 3600);
      return { ...m, url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ data: withUrls });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const imovelId = form?.get("imovel_id");
  const postId = form?.get("post_id");
  const tipo = form?.get("tipo");

  if (!(file instanceof File) || typeof imovelId !== "string" || !imovelId) {
    return NextResponse.json({ error: "Arquivo e imóvel são obrigatórios." }, { status: 400 });
  }

  const inferredTipo = typeof tipo === "string" && tipo ? tipo : file.type.startsWith("video") ? "video" : "foto";
  const path = `${imovelId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await supabase
    .from("midias")
    .insert({
      imovel_id: imovelId,
      post_id: typeof postId === "string" && postId ? postId : null,
      tipo: inferredTipo,
      storage_path: path,
      nome_arquivo: file.name,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return NextResponse.json({ data: { ...data, url: signed?.signedUrl ?? null } });
}
