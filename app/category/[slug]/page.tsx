import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ARTICLES_PER_PAGE = 10;

async function getCategoryWithArticles(slug: string, page: number = 1) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return null;
  }

  const skip = (page - 1) * ARTICLES_PER_PAGE;

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: {
        categoryId: category.id,
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
        categoryId: category.id,
        status: 'published',
      },
    }),
  ]);

  return {
    category,
    articles: articles.map(article => ({
      ...article,
      tags: article.tags.map(at => at.tag),
    })),
    totalPages: Math.ceil(totalCount / ARTICLES_PER_PAGE),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCategoryWithArticles(slug);

  if (!data) {
    return {
      title: '分类未找到',
    };
  }

  return {
    title: `${data.category.name} - 分类 - 数字集合`,
    description: data.category.description || `浏览${data.category.name}分类下的所有文章`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const data = await getCategoryWithArticles(slug, currentPage);

  if (!data) {
    notFound();
  }

  const { category, articles, totalPages } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/" className="hover:text-blue-600">首页</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-blue-600">分类</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">该分类下暂无文章</h2>
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
            basePath={`/category/${category.slug}`}
          />
        </>
      )}
    </div>
  );
}
