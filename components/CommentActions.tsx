'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CommentActionsProps {
  commentId: number;
  currentStatus: string;
}

export default function CommentActions({ commentId, currentStatus }: CommentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || '操作失败');
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要永久删除这条评论吗？此操作不可恢复！')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus === 'pending' && (
        <button
          onClick={() => handleStatusChange('approved')}
          disabled={loading}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          title="批准"
        >
          ✓ 批准
        </button>
      )}

      {currentStatus === 'approved' && (
        <button
          onClick={() => handleStatusChange('pending')}
          disabled={loading}
          className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50"
          title="取消批准"
        >
          ⟳ 待审核
        </button>
      )}

      {currentStatus !== 'spam' && (
        <button
          onClick={() => handleStatusChange('spam')}
          disabled={loading}
          className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:opacity-50"
          title="标记为垃圾评论"
        >
          🚫 垃圾
        </button>
      )}

      {currentStatus !== 'trash' && (
        <button
          onClick={() => handleStatusChange('trash')}
          disabled={loading}
          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
          title="移到回收站"
        >
          🗑️ 回收
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        title="永久删除"
      >
        ✕ 删除
      </button>
    </div>
  );
}
