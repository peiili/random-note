'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface TagFormProps {
  editTag?: Tag;
  onSuccess?: () => void;
}

export default function TagForm({ editTag, onSuccess }: TagFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    if (editTag) {
      setFormData({
        name: editTag.name,
        slug: editTag.slug,
      });
    }
  }, [editTag]);

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
      alert('请输入标签名称');
      return;
    }

    if (!formData.slug.trim()) {
      alert('请输入标签别名');
      return;
    }

    setLoading(true);
    try {
      const url = editTag
        ? `/api/admin/tags/${editTag.id}`
        : '/api/admin/tags';

      const method = editTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
        }),
      });

      if (response.ok) {
        setFormData({ name: '', slug: '' });
        router.refresh();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        alert(error.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to save tag:', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="例如：JavaScript"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签别名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="javascript"
          required
        />
        <p className="mt-1 text-xs text-gray-500">用于 URL，会自动生成</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? '保存中...' : editTag ? '更新标签' : '添加标签'}
      </button>
    </form>
  );
}
