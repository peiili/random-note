import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import CommentActions from '@/components/CommentActions';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [comments, totalCount] = await Promise.all([
    prisma.comment.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        status: true,
        authorName: true,
        authorEmail: true,
        likeCount: true,
        createdAt: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            displayName: true,
          },
        },
      },
    }),
    prisma.comment.count(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const stats = {
    total: totalCount,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    spam: comments.filter(c => c.status === 'spam').length,
    trash: comments.filter(c => c.status === 'trash').length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      spam: 'bg-red-100 text-red-800',
      trash: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: '待审核',
      approved: '已批准',
      spam: '垃圾评论',
      trash: '已删除',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">评论管理</h1>
        <p className="mt-2 text-gray-600">审核和管理用户评论</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">总评论数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">待审核</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">已批准</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">垃圾评论</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.spam}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">回收站</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.trash}</div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评论</h3>
            <p className="text-gray-500">还没有用户发表评论</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 评论内容 */}
                    <div className="mb-3">
                      <p className="text-gray-900 line-clamp-3">{comment.content}</p>
                    </div>

                    {/* 评论元信息 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {comment.user?.displayName || comment.authorName || '匿名用户'}
                      </span>

                      {comment.authorEmail && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {comment.authorEmail}
                        </span>
                      )}

                      <span>•</span>

                      <span>{formatDate(comment.createdAt)}</span>

                      <span>•</span>

                      <span>❤️ {comment.likeCount}</span>
                    </div>

                    {/* 关联文章 */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">评论于:</span>
                      <Link
                        href={`/article/${comment.article.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-700 hover:underline truncate"
                      >
                        {comment.article.title}
                      </Link>
                    </div>
                  </div>

                  {/* 右侧：状态和操作 */}
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(comment.status)}
                    <CommentActions commentId={comment.id} currentStatus={comment.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/admin/comments?page=${currentPage - 1}`}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? 'pointer-events-none opacity-50 bg-gray-100 text-gray-400'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            上一页
          </Link>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              })
              .map((page, index, array) => {
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <Link
                      href={`/admin/comments?page=${page}`}
                      className={`px-4 py-2 rounded-lg border ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </Link>
                  </div>
                );
              })}
          </div>

          <Link
            href={`/admin/comments?page=${currentPage + 1}`}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? 'pointer-events-none opacity-50 bg-gray-100 text-gray-400'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            下一页
          </Link>
        </div>
      )}
    </div>
  );
}
