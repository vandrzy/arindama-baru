import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "arindama-secret-key-2026";

/**
 * Edge-compatible JWT verification using standard Web Crypto API.
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    // Check payload expiration
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    // Verify HMAC-SHA256 signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // Convert base64url signature to Uint8Array
    const sigBase64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = sigBase64.length % 4;
    const paddedSig = pad ? sigBase64 + "=".repeat(4 - pad) : sigBase64;
    const rawSig = Uint8Array.from(atob(paddedSig), (c) => c.charCodeAt(0));

    return await crypto.subtle.verify("HMAC", cryptoKey, rawSig, data);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isValid = token ? await verifyToken(token) : false;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/kuesioner") || pathname.startsWith("/validasi");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Redirect unauthenticated requests to protected pages
  if (isProtectedRoute && !isValid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated requests away from login/register
  if (isAuthRoute && isValid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/kuesioner/:path*",
    "/validasi/:path*",
    "/login",
    "/register",
  ],
};
