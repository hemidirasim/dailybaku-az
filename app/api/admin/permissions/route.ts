import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(permissions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, name, category, description } = body;

    if (!key || !name || !category) {
      return NextResponse.json(
        { error: 'Açar, ad və kateqoriya tələb olunur' },
        { status: 400 }
      );
    }

    // Check if permission key already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { key },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: 'Bu icazə açarı artıq istifadə olunur' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        key,
        name,
        category,
        description: description || null,
      },
    });

    return NextResponse.json(permission);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}
