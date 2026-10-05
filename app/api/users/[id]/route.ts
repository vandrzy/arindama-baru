import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken, hashPassword } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Helper for checking if request is from ADMIN
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyJwtToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}

const updateUserSchema = z.object({
  nip: z.string().length(18, "NIP harus terdiri dari 18 digit"),
  email: z.string().email("Email tidak valid"),
  password: z.string().optional().or(z.literal("")),
  nama: z.string().min(3, "Nama wajib diisi"),
  role: z.enum(["ADMIN", "OPERATOR"]).default("OPERATOR"),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
  kabupatenKota: z.string().min(3, "Kabupaten/Kota wajib diisi"),
  instansi: z.string().min(2, "Instansi wajib diisi"),
  nomorTelepon: z.string().optional().default(""),
});

// GET /api/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak. Membutuhkan hak akses Admin." },
        { status: 403 }
      );
    }

    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nip: true,
        email: true,
        nama: true,
        role: true,
        jabatan: true,
        kabupatenKota: true,
        instansi: true,
        nomorTelepon: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mengambil detail akun." },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak. Membutuhkan hak akses Admin." },
        { status: 403 }
      );
    }

    const { id } = params;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Akun yang akan diedit tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { nip, email, password, nama, role, jabatan, kabupatenKota, instansi, nomorTelepon } = validation.data;

    // Check duplicate username/email among other users
    const duplicate = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ nip }, { email }] },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            duplicate.nip === nip
              ? "NIP sudah digunakan oleh akun lain."
              : "Email sudah digunakan oleh akun lain.",
        },
        { status: 409 }
      );
    }

    const updateData: any = {
      nip,
      email,
      nama,
      role,
      jabatan,
      kabupatenKota,
      instansi,
      nomorTelepon: nomorTelepon || "",
    };

    if (password && password.trim().length > 0) {
      if (password.trim().length < 8) {
        return NextResponse.json(
          { error: "Password baru minimal 8 karakter." },
          { status: 400 }
        );
      }
      updateData.password = await hashPassword(password.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nip: true,
        email: true,
        nama: true,
        role: true,
        jabatan: true,
        kabupatenKota: true,
        instansi: true,
        nomorTelepon: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "Ubah Pengguna",
        entity: "User",
        entityId: id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { updatedUser: updatedUser.nip },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mengedit akun." },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak. Membutuhkan hak akses Admin." },
        { status: 403 }
      );
    }

    const { id } = params;

    if (admin.id === id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "Hapus Pengguna",
        entity: "User",
        entityId: id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { deletedUser: existingUser.nip },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menghapus akun." },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user role or password directly
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak. Membutuhkan hak akses Admin." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan." },
        { status: 404 }
      );
    }

    if (body.password) {
      if (typeof body.password !== "string" || body.password.length < 8) {
        return NextResponse.json(
          { error: "Password minimal 8 karakter." },
          { status: 400 }
        );
      }
      const hashedPassword = await hashPassword(body.password);
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: "Reset Sandi",
          entity: "User",
          entityId: id,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          details: { resetUser: user.nip },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Password pengguna "${user.nama}" berhasil diperbarui.`,
      });
    }

    if (body.role) {
      if (!["ADMIN", "OPERATOR"].includes(body.role)) {
        return NextResponse.json(
          { error: "Role tidak valid (harus ADMIN atau OPERATOR)." },
          { status: 400 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: body.role },
        select: {
          id: true,
          nip: true,
          email: true,
          nama: true,
          role: true,
          jabatan: true,
          kabupatenKota: true,
          instansi: true,
          nomorTelepon: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Role pengguna "${updatedUser.nama}" berhasil diperbarui menjadi ${updatedUser.role}.`,
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { error: "Payload tidak valid. Sediakan 'password' atau 'role'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui akun." },
      { status: 500 }
    );
  }
}

