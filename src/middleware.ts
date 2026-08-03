import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tp_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);

  const isDashboard = pathname.startsWith("/app");
  const isAuthPage = pathname.startsWith("/iniciar-sesion") || pathname.startsWith("/registro");

  if (isDashboard && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/iniciar-sesion";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/iniciar-sesion", "/registro"],
};
