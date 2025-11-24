import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Security: Only allow in development or with a secret token
    const authHeader = req.headers.get('authorization');
    const secretToken = process.env.ADMIN_CREATE_SECRET || 'change-this-secret-in-production';

    if (authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name: name || 'Admin',
      },
      create: {
        email,
        password: hashedPassword,
        name: name || 'Admin',
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created/updated',
      email: user.email,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

