import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取所有标签
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 });
  }
}

// POST - 创建新标签
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json({ error: '名称和别名为必填项' }, { status: 400 });
    }

    // 检查别名是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return NextResponse.json({ error: '该别名已被使用' }, { status: 400 });
    }

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json({ message: '标签创建成功', tag });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: '创建标签失败' }, { status: 500 });
  }
}
