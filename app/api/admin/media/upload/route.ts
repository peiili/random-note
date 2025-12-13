import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        continue; // 跳过非图片文件
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${extension}`;
      const filePath = `/uploads/${fileName}`;
      const fullPath = join(uploadDir, fileName);

      // 保存文件
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(fullPath, buffer);

      // 保存到数据库
      const media = await prisma.media.create({
        data: {
          filename: file.name,
          filePath,
          fileType: file.type.split('/')[0], // 'image', 'video', etc.
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: parseInt(session.user.id),
        },
      });

      uploadedFiles.push(media);
    }

    return NextResponse.json({
      message: '上传成功',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Failed to upload files:', error);
    return NextResponse.json({ error: '上传文件失败' }, { status: 500 });
  }
}
