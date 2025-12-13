export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  authorId: number;
  categoryId: number | null;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  keywords: string | null;
  description: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface Comment {
  id: number;
  content: string;
  articleId: number;
  userId: number | null;
  parentId: number | null;
  authorName: string | null;
  authorEmail: string | null;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  likeCount: number;
  createdAt: Date;
  user: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
  replies?: Comment[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  articleCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  articleCount?: number;
}
