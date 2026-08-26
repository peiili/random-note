import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return tags.map(tag => ({
    ...tag,
    articleCount: tag._count.articles,
  }));
}

export const metadata = {
  title: '标签 - 数字集合',
  description: '浏览所有文章标签',
};

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">文章标签</h1>
        <p className="text-gray-600">按标签浏览文章</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="inline-flex flex-col bg-white rounded-lg border px-6 py-4 hover:shadow-md transition-shadow"
          >
            <span className="text-lg font-semibold text-gray-900 mb-1">
              #{tag.name}
            </span>
            <span className="text-sm text-gray-500">
              {tag.articleCount} 篇文章
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
