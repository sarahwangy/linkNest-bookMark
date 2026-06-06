import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/demo"];
const PUBLIC_API = ["/api/auth", "/api/sync", "/api/health", "/api/inngest"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p);
  const isPublicApi = PUBLIC_API.some((p) => pathname.startsWith(p));

  if (isPublicPath || isPublicApi) return NextResponse.next();

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
