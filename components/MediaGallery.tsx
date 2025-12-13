'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface Media {
  id: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  uploader: {
    displayName: string;
  } | null;
}

interface MediaGalleryProps {
  media: Media[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm('确定要删除这个文件吗？此操作不可恢复！')) {
      return;
    }

    setLoading(mediaId);
    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('删除失败，请重试');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('复制失败');
    }
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>暂无图片，请先上传</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {media.map((item) => (
          <div key={item.id} className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <div className="relative w-full h-full">
              <Image
                src={item.filePath}
                alt={item.filename}
                fill
                className="object-cover cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(item.filePath)}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                  title="复制链接"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={loading === item.id}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  title="删除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">图片详情</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedMedia.filePath}
                    alt={selectedMedia.filename}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">文件名：</span>
                    <span className="text-gray-900">{selectedMedia.filename}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">大小：</span>
                    <span className="text-gray-900">{formatFileSize(selectedMedia.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">上传者：</span>
                    <span className="text-gray-900">{selectedMedia.uploader?.displayName || '未知'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">上传时间：</span>
                    <span className="text-gray-900">{formatDate(selectedMedia.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600 text-sm">文件链接：</span>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={selectedMedia.filePath}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedMedia.filePath)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
