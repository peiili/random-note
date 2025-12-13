import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const articleId = parseInt(id);

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: { displayName: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

// PUT - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const articleId = parseInt(id);

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

    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 检查 slug 是否与其他文章冲突
    const conflictArticle = await prisma.article.findFirst({
      where: {
        slug,
        id: { not: articleId },
      },
    });

    if (conflictArticle) {
      return NextResponse.json({ error: 'URL别名已被其他文章使用' }, { status: 400 });
    }

    // 判断是否需要更新发布时间
    const shouldUpdatePublishedAt =
      status === 'published' && existingArticle.status !== 'published';

    // 更新文章
    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        status: status || 'draft',
        commentStatus: commentStatus || 'open',
        keywords: keywords || null,
        description: description || null,
        publishedAt: shouldUpdatePublishedAt ? new Date() : existingArticle.publishedAt,
      },
    });

    // 更新标签关联
    if (tags && Array.isArray(tags)) {
      // 删除现有标签关联
      await prisma.articleTag.deleteMany({
        where: { articleId },
      });

      // 创建新的标签关联
      if (tags.length > 0) {
        await prisma.articleTag.createMany({
          data: tags.map((tagId: number) => ({
            articleId,
            tagId,
          })),
        });
      }
    }

    return NextResponse.json({ message: '文章更新成功', article });
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 });
  }
}

// DELETE - 删除文章
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
    const articleId = parseInt(id);

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 删除文章（级联删除会自动处理关联的标签、评论等）
    await prisma.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}
