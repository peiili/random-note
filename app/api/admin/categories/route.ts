import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取所有分类
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

// POST - 创建新分类
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, parentId } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json({ error: '名称和别名为必填项' }, { status: 400 });
    }

    // 检查别名是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json({ error: '该别名已被使用' }, { status: 400 });
    }

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
      },
    });

    return NextResponse.json({ message: '分类创建成功', category });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}
