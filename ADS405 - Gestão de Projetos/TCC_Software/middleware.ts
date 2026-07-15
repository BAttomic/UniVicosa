import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const buyerPrefixes = ["/tickets", "/orders", "/buyer", "/perfil"];
const organizerPrefixes = ["/organizer"];
const checkinPrefixes = ["/checkin"];
const adminPrefixes = ["/admin"];

function addSecurityHeaders(response: NextResponse, requestId: string) {
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export default auth(function middleware(req) {
  const session = req.auth;
  const path = req.nextUrl.pathname;
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  const isBuyerArea = buyerPrefixes.some((prefix) => path.startsWith(prefix));
  const isOrganizerArea = organizerPrefixes.some((prefix) => path.startsWith(prefix));
  const isCheckinArea = checkinPrefixes.some((prefix) => path.startsWith(prefix));
  const isAdminArea = adminPrefixes.some((prefix) => path.startsWith(prefix));

  const userRole = session?.user?.role as string | undefined;

  if (isBuyerArea && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Anyone authenticated can organize events (and becomes the owner of the ones
  // they create); per-event ownership is enforced in the actions/pages.
  if (isOrganizerArea && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check-in: requer autenticação. Admin (valida qualquer evento), organizador
  // (dono) e operador têm acesso; a autorização por evento é feita na página/API.
  if (isCheckinArea && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && userRole !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return addSecurityHeaders(NextResponse.next(), requestId);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/auth).*)"],
};
