import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - 更新用户信息
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
    const userId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    // 验证状态值
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 不允许修改自己的状态
    if (session.user.id === userId.toString()) {
      return NextResponse.json({ error: '不能修改自己的账号状态' }, { status: 400 });
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(status && { status }),
      },
    });

    return NextResponse.json({ message: '用户信息更新成功', user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}

// DELETE - 删除用户（软删除或硬删除）
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
    const userId = parseInt(id);

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            articles: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 不允许删除自己
    if (session.user.id === userId.toString()) {
      return NextResponse.json({ error: '不能删除自己的账号' }, { status: 400 });
    }

    // 检查是否有相关内容
    if (user._count.articles > 0 || user._count.comments > 0) {
      return NextResponse.json(
        { error: '该用户还有文章或评论，无法删除' },
        { status: 400 }
      );
    }

    // 删除用户
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 });
  }
}
