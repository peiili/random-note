import { prisma } from '@/lib/prisma';
import MediaGallery from '@/components/MediaGallery';
import MediaUploader from '@/components/MediaUploader';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: {
        select: {
          displayName: true,
        },
      },
    },
  });

  const stats = {
    total: media.length,
    images: media.filter(m => m.mimeType.startsWith('image/')).length,
    totalSize: media.reduce((sum, m) => sum + m.fileSize, 0),
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">图床管理</h1>
        <p className="mt-2 text-gray-600">上传和管理您的图片资源</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">总文件数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">图片数量</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.images}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">总容量</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{formatFileSize(stats.totalSize)}</div>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">上传图片</h2>
        <MediaUploader />
      </div>

      {/* 图片库 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">图片库</h2>
        <MediaGallery media={media} />
      </div>
    </div>
  );
}
