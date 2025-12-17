import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalComments,
    pendingComments,
    totalUsers,
    totalCategories,
    totalTags,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: 'draft' } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: 'pending' } }),
    prisma.user.count(),
    prisma.category.count(),
    prisma.tag.count(),
  ]);

  // 获取最近文章
  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      author: {
        select: { displayName: true },
      },
      category: {
        select: { name: true },
      },
    },
  });

  // 获取待审核评论
  const pendingCommentsData = await prisma.comment.findMany({
    where: { status: 'pending' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      authorName: true,
      article: {
        select: { title: true, slug: true },
      },
      user: {
        select: { displayName: true },
      },
    },
  });

  return {
    stats: {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalComments,
      pendingComments,
      totalUsers,
      totalCategories,
      totalTags,
    },
    recentArticles,
    pendingCommentsData,
  };
}

export default async function AdminDashboard() {
  const { stats, recentArticles, pendingCommentsData } = await getStats();

  const statCards = [
    {
      name: '总文章数',
      value: stats.totalArticles,
      change: `${stats.publishedArticles} 已发布`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-blue-500',
      link: '/admin/articles',
    },
    {
      name: '草稿箱',
      value: stats.draftArticles,
      change: '待发布',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      link: '/admin/articles?status=draft',
    },
    {
      name: '评论总数',
      value: stats.totalComments,
      change: `${stats.pendingComments} 待审核`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'bg-green-500',
      link: '/admin/comments',
    },
    {
      name: '用户总数',
      value: stats.totalUsers,
      change: '注册用户',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-purple-500',
      link: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-2 text-gray-600">欢迎回来，这是您的博客管理概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.name}
            href={card.link}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`${card.color} text-white p-3 rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近文章 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">最近文章</h2>
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {recentArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无文章</p>
            ) : (
              recentArticles.map((article) => (
                <div key={article.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-gray-900 font-medium hover:text-blue-600"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{article.author.displayName}</span>
                    <span>•</span>
                    <span>{article.category?.name || '未分类'}</span>
                    <span>•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 待审核评论 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              待审核评论
              {stats.pendingComments > 0 && (
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                  {stats.pendingComments}
                </span>
              )}
            </h2>
            <Link
              href="/admin/comments"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {pendingCommentsData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无待审核评论</p>
            ) : (
              pendingCommentsData.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-gray-900 text-sm line-clamp-2">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>{comment.user?.displayName || comment.authorName}</span>
                    <span>•</span>
                    <Link
                      href={`/article/${comment.article.slug}`}
                      className="text-blue-600 hover:underline truncate"
                    >
                      {comment.article.title}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/articles/new"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">新建文章</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-medium text-gray-700">管理分类</span>
          </Link>
          <Link
            href="/admin/tags"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">管理标签</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="text-sm font-medium text-gray-700">查看网站</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
