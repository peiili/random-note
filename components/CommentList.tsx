'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import type { Comment } from '@/lib/types';

interface CommentListProps {
  articleId: number;
  initialComments: Comment[];
}

export default function CommentList({ articleId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();

    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) {
      alert('请填写所有必填项');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          content: newComment,
          authorName,
          authorEmail,
          parentId,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        // 重新加载评论列表
        window.location.reload();
      } else {
        alert('评论提交失败');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('评论提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4' : 'mt-6'}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {(comment.user?.displayName || comment.authorName || 'A')[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {comment.user?.displayName || comment.authorName || '匿名用户'}
                </div>
                <div className="text-xs text-gray-500">
                  {formatRelativeTime(comment.createdAt)}
                </div>
              </div>
            </div>
            {comment.status === 'approved' && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                回复
              </button>
            )}
          </div>

          <div className="text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>

          {comment.likeCount > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {comment.likeCount} 人赞同
            </div>
          )}

          {replyTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '提交回复'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* 评论表单 */}
      <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8">
        <h3 className="text-lg font-semibold mb-4">发表评论</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="昵称 *"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="邮箱 *"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />

        <div className="mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? '提交中...' : '提交评论'}
          </button>
        </div>
      </form>

      {/* 评论列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          全部评论 ({comments.filter(c => c.status === 'approved').length})
        </h3>

        {comments.filter(c => c.status === 'approved' && !c.parentId).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            还没有评论，快来发表第一条评论吧！
          </div>
        ) : (
          <div>
            {comments
              .filter(c => c.status === 'approved' && !c.parentId)
              .map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
}
