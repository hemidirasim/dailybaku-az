import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role, avatar, bioAz, bioEn } = body;
    const { id } = await params;

    if (!email) {
      return NextResponse.json(
        { error: 'Email tələb olunur' },
        { status: 400 }
      );
    }

    // Email artıq başqa istifadəçi tərəfindən istifadə olunurmu yoxla
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json(
        { error: 'Bu email artıq istifadə olunur' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: name || null,
      email,
      role: role || 'editor',
      avatar: avatar || null,
      bioAz: bioAz || null,
      bioEn: bioEn || null,
    };

    // Şifrə dəyişdirilərsə hash et
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Şifrəni cavabdan çıxar
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Özünü silməyə icazə vermə
    if (id === (session.user as any).id) {
      return NextResponse.json(
        { error: 'Öz hesabınızı silə bilməzsiniz' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}
