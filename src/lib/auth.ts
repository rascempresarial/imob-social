import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "imob_session";
const ALG = "HS256";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não configurado no ambiente.");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  label: string;
  keyId: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { label: String(payload.label), keyId: String(payload.keyId) };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  // Modo de teste temporário: pula a checagem de login enquanto depuramos
  // o fluxo de autenticação. Só funciona se DEV_BYPASS_AUTH estiver setado
  // no .env.local — remover essa variável (e este bloco) antes de ir pra produção.
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return { label: "Modo de teste", keyId: "dev-bypass" };
  }
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
