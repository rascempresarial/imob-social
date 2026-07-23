import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "imob_session";
const PUBLIC_PATHS = ["/login"];

async function checkSession(token: string | undefined): Promise<{ authed: boolean; isAdmin: boolean }> {
  if (!token) return { authed: false, isAdmin: false };
  const secret = process.env.SESSION_SECRET;
  if (!secret) return { authed: false, isAdmin: false };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return { authed: true, isAdmin: Boolean(payload.isAdmin) };
  } catch {
    return { authed: false, isAdmin: false };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const { authed, isAdmin } = await checkSession(token);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (pathname === "/login" && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isPublic) {
    return NextResponse.next();
  }
  if (!authed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/dashboard/configuracoes") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
