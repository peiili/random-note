import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - 更新分类
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
    const categoryId = parseInt(id);
    const body = await request.json();
    const { name, slug, description, parentId } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json({ error: '名称和别名为必填项' }, { status: 400 });
    }

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // 检查别名是否被其他分类使用
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== categoryId) {
      return NextResponse.json({ error: '该别名已被使用' }, { status: 400 });
    }

    // 如果设置了父分类，检查是否会造成循环引用
    if (parentId && parentId === categoryId) {
      return NextResponse.json({ error: '不能将分类设为自己的子分类' }, { status: 400 });
    }

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        parentId,
      },
    });

    return NextResponse.json({ message: '分类更新成功', category: updatedCategory });
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

// DELETE - 删除分类
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
    const categoryId = parseInt(id);

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // 检查是否有文章使用该分类
    if (category._count.articles > 0) {
      return NextResponse.json(
        { error: '该分类下还有文章，无法删除' },
        { status: 400 }
      );
    }

    // 检查是否有子分类
    const childCategories = await prisma.category.findMany({
      where: { parentId: categoryId },
    });

    if (childCategories.length > 0) {
      return NextResponse.json(
        { error: '该分类下还有子分类，无法删除' },
        { status: 400 }
      );
    }

    // 删除分类
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}
