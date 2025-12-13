'use client';

import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  articleId: number;
  articleTitle: string;
}

export default function DeleteArticleButton({ articleId, articleTitle }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`确定要删除文章"${articleTitle}"吗？此操作不可恢复！`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900"
    >
      删除
    </button>
  );
}
