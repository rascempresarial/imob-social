export type ImovelStatus = "disponivel" | "reservado" | "vendido" | "alugado" | "indisponivel";
export type PostTipo = "feed" | "reels" | "story";
export type PostStatus = "em_revisao" | "aprovado" | "reprovado" | "agendado" | "publicado";
export type PostRede = "instagram_facebook" | "linkedin" | "youtube" | "blog";

export interface AccessKey {
  id: string;
  label: string;
  key: string;
  active: boolean;
  is_admin: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface Corretor {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  created_at: string;
}

export interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  edificio: string | null;
  status: ImovelStatus;
  endereco: string | null;
  valor: number | null;
  link_site: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  imovel_id: string | null;
  rede: PostRede;
  tipo: PostTipo;
  link_criativo: string | null;
  copy: string | null;
  data_publicacao: string | null;
  anunciado: boolean;
  status: PostStatus;
  aprovado_por: string | null;
  aprovado_em: string | null;
  motivo_reprovacao: string | null;
  alcance: number | null;
  curtidas: number | null;
  comentarios: number | null;
  salvamentos: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // preenchido via join na listagem
  imovel?: Pick<Imovel, "id" | "codigo" | "titulo" | "edificio" | "status"> | null;
}

export interface Nota {
  id: string;
  titulo: string | null;
  conteudo: string;
  fixado: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type AuditAction = "criado" | "editado" | "aprovado" | "reprovado" | "excluido";

export interface AuditLog {
  id: string;
  post_id: string | null;
  actor: string;
  action: AuditAction;
  detail: string | null;
  created_at: string;
}

export const AUDIT_ACTIONS: { value: AuditAction; label: string; color: string }[] = [
  { value: "criado", label: "Criado", color: "#2C5AA0" },
  { value: "editado", label: "Editado", color: "#6B7280" },
  { value: "aprovado", label: "Aprovado", color: "#1B8A5A" },
  { value: "reprovado", label: "Reprovado", color: "#B3261E" },
  { value: "excluido", label: "Excluído", color: "#B3261E" },
];

export function auditActionMeta(value: string) {
  return AUDIT_ACTIONS.find((a) => a.value === value) ?? AUDIT_ACTIONS[0];
}

export const IMOVEL_STATUSES: { value: ImovelStatus; label: string; color: string }[] = [
  { value: "disponivel", label: "Disponível", color: "#1B8A5A" },
  { value: "reservado", label: "Reservado", color: "#B98900" },
  { value: "vendido", label: "Vendido", color: "#B3261E" },
  { value: "alugado", label: "Alugado", color: "#2C5AA0" },
  { value: "indisponivel", label: "Indisponível", color: "#6B7280" },
];

export function imovelStatusMeta(value: string) {
  return IMOVEL_STATUSES.find((s) => s.value === value) ?? IMOVEL_STATUSES[0];
}

export const POST_TIPOS: { value: PostTipo; label: string }[] = [
  { value: "feed", label: "Feed" },
  { value: "reels", label: "Reels" },
  { value: "story", label: "Story" },
];

export const POST_REDES: { value: PostRede; label: string; color: string }[] = [
  { value: "instagram_facebook", label: "Instagram/Facebook", color: "#8B3D97" },
  { value: "linkedin", label: "LinkedIn", color: "#1D6FB8" },
  { value: "youtube", label: "YouTube", color: "#C4291C" },
  { value: "blog", label: "Blog", color: "#B2701E" },
];

export function postRedeMeta(value: string) {
  return POST_REDES.find((r) => r.value === value) ?? POST_REDES[0];
}

export const POST_STATUSES: { value: PostStatus; label: string; color: string }[] = [
  { value: "em_revisao", label: "Em revisão", color: "#B98900" },
  { value: "aprovado", label: "Aprovado", color: "#1B8A5A" },
  { value: "reprovado", label: "Reprovado", color: "#B3261E" },
  { value: "agendado", label: "Agendado", color: "#2C5AA0" },
  { value: "publicado", label: "Publicado", color: "#173262" },
];

export function postStatusMeta(value: string) {
  return POST_STATUSES.find((s) => s.value === value) ?? POST_STATUSES[0];
}
