import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { POST_STATUSES, postStatusMeta } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { IconEye, IconHeart, IconHome } from "@/components/icons";

export const revalidate = 30;

function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface PostRow {
  id: string;
  status: string;
  data_publicacao: string | null;
  updated_at: string;
  alcance: number | null;
  curtidas: number | null;
  imovel: { id: string; codigo: string; titulo: string; status: string } | null;
  corretor: { nome: string } | null;
}

export default async function DashboardPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: posts }, { data: imoveis }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, status, data_publicacao, updated_at, alcance, curtidas, imovel:imoveis(id, codigo, titulo, status), corretor:corretores(nome)"
      ),
    supabase.from("imoveis").select("id, status"),
  ]);

  const allPosts = (posts ?? []) as unknown as PostRow[];
  const allImoveis = imoveis ?? [];

  const countByStatus = POST_STATUSES.map((s) => ({
    ...s,
    count: allPosts.filter((p) => p.status === s.value).length,
  }));

  const imoveisDisponiveis = allImoveis.filter((i) => i.status === "disponivel").length;

  const today = ymd(new Date());
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

  const postsHoje = allPosts.filter(
    (p) => p.data_publicacao && ymd(new Date(p.data_publicacao)) === today && p.status !== "publicado"
  );
  const revisaoAntiga = allPosts.filter((p) => p.status === "em_revisao" && new Date(p.updated_at).getTime() < twoDaysAgo);
  const imovelIndisponivel = allPosts.filter(
    (p) => p.imovel && p.imovel.status !== "disponivel" && !["publicado", "reprovado"].includes(p.status)
  );

  const temAvisos = postsHoje.length > 0 || revisaoAntiga.length > 0 || imovelIndisponivel.length > 0;

  const topPosts = allPosts
    .filter((p) => p.alcance != null)
    .sort((a, b) => (b.alcance ?? 0) - (a.alcance ?? 0))
    .slice(0, 5);

  return (
    <div>
      <PageHeader icon={<IconHome className="w-full h-full" />} title="Visão geral" subtitle="Panorama do calendário e alertas em tempo real" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {countByStatus.map((s) => (
          <div key={s.value} className="rounded-xl border border-navy-100 bg-white p-4">
            <div className="text-2xl font-semibold" style={{ color: s.color }}>
              {s.count}
            </div>
            <div className="text-xs text-navy-500 mt-1">{s.label}</div>
          </div>
        ))}
        <div className="rounded-xl border border-navy-100 bg-navy-800 p-4">
          <div className="text-2xl font-semibold text-white">
            {imoveisDisponiveis}/{allImoveis.length}
          </div>
          <div className="text-xs text-white/60 mt-1">Imóveis disponíveis</div>
        </div>
      </div>

      <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-900 mb-3">
        Avisos
        {temAvisos && <span className="pulse-dot" style={{ color: "#B3261E" }} />}
      </h2>
      {!temAvisos && <p className="text-sm text-navy-400 mb-8">Nenhum aviso no momento.</p>}

      <div className="space-y-3 mb-8">
        {postsHoje.map((p) => (
          <AvisoRow
            key={p.id}
            color="#2C5AA0"
            text={`Post de ${p.imovel ? p.imovel.codigo : "imóvel não vinculado"} está agendado para hoje e ainda não foi publicado.`}
          />
        ))}
        {revisaoAntiga.map((p) => (
          <AvisoRow
            key={p.id}
            color="#B98900"
            text={`Post de ${p.imovel ? p.imovel.codigo : "imóvel não vinculado"} está em revisão há mais de 2 dias.`}
          />
        ))}
        {imovelIndisponivel.map((p) => (
          <AvisoRow
            key={p.id}
            color="#B3261E"
            text={`Post ${postStatusMeta(p.status).label.toLowerCase()} referencia o imóvel ${p.imovel?.codigo}, que está "${p.imovel?.status}", reveja antes de publicar.`}
          />
        ))}
      </div>

      {topPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-navy-900 mb-3">Top posts por alcance</h2>
          <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
            {topPosts.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-navy-100 last:border-0">
                <div>
                  <p className="text-sm text-navy-900">{p.imovel ? `${p.imovel.codigo}, ${p.imovel.titulo}` : "Sem imóvel"}</p>
                  <p className="text-xs text-navy-500">{p.corretor?.nome ?? "sem corretor"}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-navy-600">
                  <span className="flex items-center gap-1">
                    <IconEye className="w-3.5 h-3.5 text-navy-400" />
                    {p.alcance}
                  </span>
                  {p.curtidas != null && (
                    <span className="flex items-center gap-1">
                      <IconHeart className="w-3.5 h-3.5 text-navy-400" />
                      {p.curtidas}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/dashboard/posts" className="text-sm text-navy-700 hover:text-navy-900 font-medium">
        Ver todos os posts →
      </Link>
    </div>
  );
}

function AvisoRow({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-navy-100 bg-white px-4 py-3">
      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
      <p className="text-sm text-navy-700">{text}</p>
    </div>
  );
}
