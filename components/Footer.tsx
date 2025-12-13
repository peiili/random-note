export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} 简约博客. All rights reserved.</p>
          <p className="mt-2">基于 Next.js 构建的现代化博客系统</p>
        </div>
      </div>
    </footer>
  );
}
