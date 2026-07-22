import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "imob_session";
const PUBLIC_PATHS = ["/login"];

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await isValid(token);
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
