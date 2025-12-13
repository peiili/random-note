'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CategoryForm from './CategoryForm';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
}

interface CategoryActionsProps {
  category: Category;
  categories: Category[];
  hasArticles: boolean;
}

export default function CategoryActions({ category, categories, hasArticles }: CategoryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    if (hasArticles) {
      alert('该分类下还有文章，无法删除。请先移除或重新分配这些文章。');
      return;
    }

    if (!confirm(`确定要删除分类"${category.name}"吗？此操作不可恢复！`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={loading}
          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
        >
          编辑
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
          删除
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">编辑分类</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CategoryForm
              categories={categories}
              editCategory={category}
              onSuccess={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
