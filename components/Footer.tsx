export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} 数字集合. All rights reserved.</p>
          <p className="mt-2">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              豫ICP备2024050061号-2
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
