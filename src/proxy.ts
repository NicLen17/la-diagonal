import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/services/session";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (!isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
