export type BlogCategory =
  | 'market'
  | 'renovation'
  | 'investment'
  | 'architecture'
  | 'tips';

export type BlogArticleStatus =
  | 'draft'
  | 'published';

export interface BlogTranslatedText {
  es: string;
  en: string;
  fr: string;
}

export interface BlogArticle {
  id: string;
  slug: string;

  title: BlogTranslatedText;
  excerpt: BlogTranslatedText;
  content: BlogTranslatedText;

  category: BlogCategory;
  author: string;
  coverImage: string;

  status: BlogArticleStatus;
  featured: boolean;

  readingTime: number;

  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBlogArticle {
  title: BlogTranslatedText;
  excerpt: BlogTranslatedText;
  content: BlogTranslatedText;

  category: BlogCategory;
  author: string;
  coverImage: string;

  status: BlogArticleStatus;
  featured: boolean;

  readingTime: number;
}

export interface UpdateBlogArticle
  extends Partial<CreateBlogArticle> {
  slug?: string;
}