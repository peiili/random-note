import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取所有媒体文件
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return NextResponse.json({ error: '获取媒体文件失败' }, { status: 500 });
  }
}
