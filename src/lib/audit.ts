import { getSupabaseAdmin } from "./supabase";
import { AuditAction } from "./types";

export async function logAudit(params: {
  postId: string | null;
  actor: string;
  action: AuditAction;
  detail?: string | null;
}) {
  await getSupabaseAdmin().from("audit_log").insert({
    post_id: params.postId,
    actor: params.actor,
    action: params.action,
    detail: params.detail ?? null,
  });
}
