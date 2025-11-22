import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// GET - Bütün media şəkillərini qaytar
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await prisma.article.findMany({
      include: {
        images: true,
      },
    });

    const allImages = articles.flatMap((article: typeof articles[0]) => article.images);

    return NextResponse.json({
      images: allImages,
      count: allImages.length,
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

// DELETE - Şəkil sil
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Şəkil ID-si tələb olunur' },
        { status: 400 }
      );
    }

    // Şəkli databazada tap
    const image = await prisma.articleImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Şəkil tapılmadı' },
        { status: 404 }
      );
    }

    // Fayl yolunu təmizlə
    const imageUrl = image.url;
    let filePath: string | null = null;

    // URL-dən fayl yolunu çıxar
    if (imageUrl.startsWith('/uploads/')) {
      filePath = path.join(process.cwd(), 'public', imageUrl);
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Remote URL - faylı silmə
      filePath = null;
    } else {
      filePath = path.join(process.cwd(), 'public', 'uploads', imageUrl);
    }

    // Faylı sil (əgər lokal fayldırsa)
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Fayl silindi:', filePath);
      } catch (fsError) {
        console.error('Fayl silinmədi:', fsError);
        // Fayl silinməsə də, databazadan silməyə davam et
      }
    }

    // Databazadan sil
    await prisma.articleImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
      message: 'Şəkil uğurla silindi',
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error.message || 'Şəkil silinərkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
