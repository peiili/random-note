import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const mediaId = parseInt(id);

    // 检查文件是否存在
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 删除物理文件
    const filePath = join(process.cwd(), 'public', media.filePath);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error('Failed to delete physical file:', error);
        // 即使物理文件删除失败，也继续删除数据库记录
      }
    }

    // 删除数据库记录
    await prisma.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ message: '文件删除成功' });
  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json({ error: '删除文件失败' }, { status: 500 });
  }
}
