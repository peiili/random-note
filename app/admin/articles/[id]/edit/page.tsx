'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MediaPicker from '@/components/MediaPicker';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryId: number | null;
  status: string;
  commentStatus: string;
  keywords: string | null;
  description: string | null;
  tags: { tag: Tag }[];
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [articleId, setArticleId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isSelectingCoverImage, setIsSelectingCoverImage] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categoryId: '',
    status: 'draft',
    commentStatus: 'open',
    keywords: '',
    description: '',
  });

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // 解析 params
  useEffect(() => {
    params.then(p => {
      setArticleId(p.id);
    });
  }, [params]);

  // 加载文章数据
  useEffect(() => {
    if (articleId) {
      fetchArticle();
      fetchCategories();
      fetchTags();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/admin/articles/${articleId}`);
      if (res.ok) {
        const article: Article = await res.json();
        setFormData({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt || '',
          coverImage: article.coverImage || '',
          categoryId: article.categoryId?.toString() || '',
          status: article.status,
          commentStatus: article.commentStatus,
          keywords: article.keywords || '',
          description: article.description || '',
        });
        setSelectedTags(article.tags.map(t => t.tag.id));
      } else {
        alert('文章不存在或已被删除');
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      alert('加载文章失败');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          tags: selectedTags,
        }),
      });

      if (response.ok) {
        router.push('/admin/articles');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/articles');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('删除失败，请重试');
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载文章数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
          <p className="mt-2 text-gray-600">修改文章内容和设置</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition"
          >
            删除文章
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            返回
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="输入文章标题..."
              />
            </div>

            {/* URL别名 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL 别名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="article-url-slug"
              />
              <p className="mt-2 text-sm text-gray-500">
                修改URL别名会影响文章链接
              </p>
            </div>

            {/* 内容 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章内容 (Markdown) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono"
                placeholder="使用 Markdown 格式编写文章内容..."
              />
              <p className="mt-2 text-sm text-gray-500">
                支持 Markdown 语法
              </p>
            </div>

            {/* 摘要 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章摘要
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="简短描述文章内容..."
              />
            </div>

            {/* SEO 设置 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO 设置</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO 关键词
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="关键词1, 关键词2, 关键词3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO 描述
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="用于搜索引擎的文章描述..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/500 字符
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 发布设置 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">发布设置</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章状态
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    评论状态
                  </label>
                  <select
                    name="commentStatus"
                    value={formData.commentStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="open">开放评论</option>
                    <option value="closed">关闭评论</option>
                    <option value="logged_in_only">仅登录用户</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 分类 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">分类</h3>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">未分类</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 标签 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      selectedTags.includes(tag.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {tags.length === 0 && (
                <p className="text-sm text-gray-500">暂无标签</p>
              )}
            </div>

            {/* 封面图 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">封面图片</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="图片 URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectingCoverImage(true);
                    setShowMediaPicker(true);
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                >
                  选择图片
                </button>
              </div>
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="封面预览"
                  className="mt-4 w-full rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E无法加载%3C/text%3E%3C/svg%3E';
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              取消
            </button>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* MediaPicker Modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => {
            setFormData({ ...formData, coverImage: url });
            setShowMediaPicker(false);
            setIsSelectingCoverImage(false);
          }}
          onClose={() => {
            setShowMediaPicker(false);
            setIsSelectingCoverImage(false);
          }}
        />
      )}
    </div>
  );
}
