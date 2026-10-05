import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  
  return prisma.user.findUnique({
    where: { id: payload.id },
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    // Create an audit log for the cleanup itself
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "Bersihkan Log",
        entity: "AuditLog",
        details: { count: result.count, cutoffDate: ninetyDaysAgo },
        ipAddress: req.headers.get("x-forwarded-for") || req.ip || "",
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    return NextResponse.json({
      message: `Berhasil menghapus ${result.count} log lama.`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error cleaning up audit logs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
