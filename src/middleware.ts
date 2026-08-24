import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "ld_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const passcode = process.env.ADMIN_PASSCODE ?? "diagonal2026";
  const cookie = request.cookies.get(COOKIE)?.value;
  if (cookie !== passcode) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
