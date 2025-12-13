import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, content, authorName, authorEmail, parentId } = body;

    if (!articleId || !content || !authorName || !authorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 获取客户端IP和User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        articleId: parseInt(articleId),
        authorName,
        authorEmail,
        parentId: parentId ? parseInt(parentId) : null,
        ipAddress,
        userAgent,
        status: 'pending', // 默认待审核
      },
    });

    // 更新文章评论数
    await prisma.article.update({
      where: { id: parseInt(articleId) },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
