'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Media {
  id: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchMedia();
      } else {
        alert('上传失败');
      }
    } catch (error) {
      console.error('Failed to upload:', error);
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">选择图片</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              id="media-picker-upload"
              disabled={uploading}
            />
            <label
              htmlFor="media-picker-upload"
              className={`block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <span className="text-gray-600">上传中...</span>
              ) : (
                <span className="text-gray-600">点击上传新图片</span>
              )}
            </label>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无图片</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer hover:ring-2 hover:ring-blue-500"
                  onClick={() => onSelect(item.filePath)}
                >
                  <Image
                    src={item.filePath}
                    alt={item.filename}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
