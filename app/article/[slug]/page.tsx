import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { markdownToHtml, formatDate } from '@/lib/utils';
import Link from 'next/link';
import CommentList from '@/components/CommentList';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: {
      slug,
      status: 'published',
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!article) {
    return null;
  }

  // 增加浏览次数
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    ...article,
    tags: article.tags.map(at => at.tag),
  };
}

async function getComments(articleId: number) {
  const comments = await prisma.comment.findMany({
    where: {
      articleId,
      status: 'approved',
    },
    include: {
      user: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 构建层级结构
  const commentMap = new Map();
  const rootComments: any[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    const commentData = commentMap.get(comment.id);
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentData);
      }
    } else {
      rootComments.push(commentData);
    }
  });

  return rootComments;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: `${article.title} - 简约博客`,
    description: article.description || article.excerpt || '',
    keywords: article.keywords || '',
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const contentHtml = await markdownToHtml(article.content);
  const comments = await getComments(article.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 文章头部 */}
      <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
            <span className="flex items-center gap-2">
              {article.author.avatarUrl && (
                <Image
                  src={article.author.avatarUrl}
                  alt={article.author.displayName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{article.author.displayName}</span>
            </span>

            <span>•</span>

            <span>{formatDate(article.publishedAt || article.createdAt)}</span>

            {article.category && (
              <>
                <span>•</span>
                <Link
                  href={`/category/${article.category.slug}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {article.category.name}
                </Link>
              </>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {article.tags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-gray-500 text-sm mt-4 pt-4 border-t">
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.viewCount} 浏览
            </span>

            <span className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {article.commentCount} 评论
            </span>

            <span className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {article.likeCount} 点赞
            </span>
          </div>
        </header>

        {/* 文章内容 */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* 评论区域 */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6">评论</h2>
        <CommentList articleId={article.id} initialComments={comments} />
      </div>
    </div>
  );
}
