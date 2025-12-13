import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - 更新评论状态
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
    const commentId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    // 验证状态值
    const validStatuses = ['pending', 'approved', 'spam', 'trash'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    // 检查评论是否存在
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    // 更新评论状态
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });

    return NextResponse.json({ message: '评论状态更新成功', comment: updatedComment });
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json({ error: '更新评论失败' }, { status: 500 });
  }
}

// DELETE - 永久删除评论
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
    const commentId = parseInt(id);

    // 检查评论是否存在
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    // 删除评论（级联删除会自动处理点赞等关联数据）
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ error: '删除评论失败' }, { status: 500 });
  }
}
