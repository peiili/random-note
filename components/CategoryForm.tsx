'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
}

interface CategoryFormProps {
  categories: Category[];
  editCategory?: Category;
  onSuccess?: () => void;
}

export default function CategoryForm({ categories, editCategory, onSuccess }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
  });

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name,
        slug: editCategory.slug,
        description: editCategory.description || '',
        parentId: editCategory.parentId?.toString() || '',
      });
    }
  }, [editCategory]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name.trim()) {
      alert('请输入分类名称');
      return;
    }

    if (!formData.slug.trim()) {
      alert('请输入分类别名');
      return;
    }

    setLoading(true);
    try {
      const url = editCategory
        ? `/api/admin/categories/${editCategory.id}`
        : '/api/admin/categories';

      const method = editCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          parentId: formData.parentId ? parseInt(formData.parentId) : null,
        }),
      });

      if (response.ok) {
        setFormData({ name: '', slug: '', description: '', parentId: '' });
        router.refresh();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        alert(error.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // Filter out current category and its children when editing (prevent circular reference)
  const availableParentCategories = editCategory
    ? categories.filter(c => c.id !== editCategory.id && c.parentId !== editCategory.id)
    : categories;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="例如：技术分享"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类别名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="tech-sharing"
          required
        />
        <p className="mt-1 text-xs text-gray-500">用于 URL，会自动生成</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          父分类
        </label>
        <select
          value={formData.parentId}
          onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="">无（顶级分类）</option>
          {availableParentCategories
            .filter(c => !c.parentId)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={3}
          placeholder="分类描述（可选）"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? '保存中...' : editCategory ? '更新分类' : '添加分类'}
      </button>
    </form>
  );
}
