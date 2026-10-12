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

function parseSafeDate(dateStr: string | null | undefined, isEndOfDay: boolean = false): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  let parsed: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const timePart = isEndOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
    parsed = new Date(`${trimmed}${timePart}`);
  } else {
    parsed = new Date(trimmed);
    if (isEndOfDay && !isNaN(parsed.getTime())) {
      parsed.setUTCHours(23, 59, 59, 999);
    }
  }

  return isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const singleDate = searchParams.get("date") || "";
    const startDateParam = searchParams.get("startDate") || (singleDate ? singleDate : "");
    const endDateParam = searchParams.get("endDate") || (singleDate ? singleDate : "");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (action && action !== "Semua Aksi") {
      where.action = action;
    }

    // Filter Tanggal yang Aman
    const startDate = parseSafeDate(startDateParam, false);
    const endDate = parseSafeDate(endDateParam, true);

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entityId: { contains: search } },
        {
          user: {
            OR: [
              { nama: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { nama: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
