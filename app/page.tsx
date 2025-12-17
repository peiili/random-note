import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-dynamic';

const ARTICLES_PER_PAGE = 10;

async function getArticles(page: number = 1) {
  const skip = (page - 1) * ARTICLES_PER_PAGE;

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: 'published',
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
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
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: ARTICLES_PER_PAGE,
    }),
    prisma.article.count({
      where: {
        status: 'published',
      },
    }),
  ]);

  return {
    articles: articles.map(article => ({
      ...article,
      tags: article.tags.map(at => at.tag),
    })),
    totalPages: Math.ceil(totalCount / ARTICLES_PER_PAGE),
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { articles, totalPages } = await getArticles(currentPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">最新文章</h1>
        <p className="text-gray-600">探索精彩内容，分享技术见解</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">暂无文章</h2>
          <p className="text-gray-500">敬请期待精彩内容</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/"
          />
        </>
      )}
    </div>
  );
}
