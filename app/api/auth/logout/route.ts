import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function handleLogout() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil dan cookie telah dibersihkan",
  });

  // Hapus cookie auth_token secara menyeluruh
  response.cookies.delete("auth_token");
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });

  return response;
}

export async function POST() {
  return handleLogout();
}

export async function GET() {
  return handleLogout();
}

