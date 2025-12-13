import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { displayName: true },
        },
        category: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 });
  }
}

// POST - 创建文章
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      categoryId,
      status,
      commentStatus,
      keywords,
      description,
      tags,
    } = body;

    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json({ error: '标题、URL别名和内容为必填项' }, { status: 400 });
    }

    // 检查 slug 是否已存在
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      return NextResponse.json({ error: 'URL别名已存在，请使用其他别名' }, { status: 400 });
    }

    // 获取当前用户ID
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 创建文章
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        authorId: user.id,
        categoryId: categoryId || null,
        status: status || 'draft',
        commentStatus: commentStatus || 'open',
        keywords: keywords || null,
        description: description || null,
        publishedAt: status === 'published' ? new Date() : null,
      },
    });

    // 关联标签
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await prisma.articleTag.createMany({
        data: tags.map((tagId: number) => ({
          articleId: article.id,
          tagId,
        })),
      });
    }

    return NextResponse.json({ message: '文章创建成功', article }, { status: 201 });
  } catch (error) {
    console.error('Failed to create article:', error);
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 });
  }
}
