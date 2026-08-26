import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
            数字集合
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
              首页
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition">
              分类
            </Link>
            <Link href="/tags" className="text-gray-600 hover:text-gray-900 transition">
              标签
            </Link>
            <Link href="/search" className="text-gray-600 hover:text-gray-900 transition">
              搜索
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
