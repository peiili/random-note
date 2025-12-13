import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - 更新标签
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
    const tagId = parseInt(id);
    const body = await request.json();
    const { name, slug } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json({ error: '名称和别名为必填项' }, { status: 400 });
    }

    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 检查别名是否被其他标签使用
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag && existingTag.id !== tagId) {
      return NextResponse.json({ error: '该别名已被使用' }, { status: 400 });
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json({ message: '标签更新成功', tag: updatedTag });
  } catch (error) {
    console.error('Failed to update tag:', error);
    return NextResponse.json({ error: '更新标签失败' }, { status: 500 });
  }
}

// DELETE - 删除标签
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
    const tagId = parseInt(id);

    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 检查是否有文章使用该标签
    if (tag._count.articles > 0) {
      return NextResponse.json(
        { error: '该标签下还有文章，无法删除' },
        { status: 400 }
      );
    }

    // 删除标签
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ message: '标签删除成功' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json({ error: '删除标签失败' }, { status: 500 });
  }
}
